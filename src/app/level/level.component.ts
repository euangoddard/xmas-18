import { ChangeDetectionStrategy, Component, OnDestroy, OnInit, HostListener } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute, Data, ParamMap, Router } from '@angular/router';
import { ReplaySubject } from 'rxjs';
import { switchMap, tap } from 'rxjs/operators';
import { takeUntilDestroy } from 'take-until-destroy';
import { APP_TITLE } from '../app.title';
import { LevelAttempt } from '../levels/level';
import { LevelAttemptCell, LevelCell } from '../levels/level.models';
import { AnalyticsService } from './../analytics.service';
import { HighScoreService } from './../high-score.service';
import { LevelsService } from './../levels.service';
import { SoundService, Sound } from './../sound.service';

@Component({
  selector: 'xmas-level',
  templateUrl: './level.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LevelComponent implements OnInit, OnDestroy {
  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private soundService: SoundService,
    private highScoreService: HighScoreService,
    private levelsService: LevelsService,
    private analytics: AnalyticsService,
    private title: Title,
  ) {}

  level!: LevelAttempt;
  levelNumber!: number;
  highScore!: number | null;
  canProgress!: boolean;
  hasPrevious!: boolean;

  private levelSubject = new ReplaySubject<LevelAttempt>(1);

  ngOnInit() {
    this.route.data.pipe(takeUntilDestroy(this)).subscribe((data: Data) => {
      this.levelSubject.next(data['level']);
    });

    this.levelSubject
      .pipe(
        tap(level => {
          this.level = level;
        }),
        switchMap<LevelAttempt, LevelAttemptCell>(level => level.santaCell$),
        takeUntilDestroy(this),
      )
      .subscribe(cell => {
        if (cell.cell === LevelCell.Present && cell.touchCount < 2) {
          this.soundService.playSound(Sound.Present);
        } else if (cell.cell === LevelCell.Grinch) {
          this.soundService.playSound(Sound.Grinch);
          this.analytics.sendEvent('Lost level', {
            event_category: 'Game',
            value: this.levelNumber,
          });
        }

        if (this.level.isComplete) {
          this.analytics.sendEvent('Won level', {
            event_category: 'Game',
            value: this.levelNumber,
          });
          this.levelsService.completeLevel(this.levelNumber);
          this.canProgress = this.levelsService.canProgress(this.levelNumber);
          if (this.highScore === null || this.level.moves < this.highScore) {
            this.highScoreService.set(this.levelNumber, this.level.moves);
            this.highScore = this.level.moves;
          }
        }
      });
    this.route.paramMap.pipe(takeUntilDestroy(this)).subscribe((params: ParamMap) => {
      this.levelNumber = parseInt(params.get('number') || '0', 10);
      this.title.setTitle(`${APP_TITLE} – Level ${this.levelNumber}`);
      this.analytics.sendEvent('Start level', {
        event_category: 'Game',
        value: this.levelNumber,
      });
      this.canProgress = this.levelsService.canProgress(this.levelNumber);
      this.hasPrevious = this.levelsService.hasPrevious(this.levelNumber);
      this.highScore = this.highScoreService.get(this.levelNumber);
    });
  }

  ngOnDestroy(): void {}

  @HostListener('window:keydown', ['$event.keyCode', '$event.shiftKey'])
  receiveKey(keyCode: number, isShift: boolean) {
    switch (keyCode) {
      case 27:
        this.reset();
        break;
      case 13:
        if (isShift) {
          this.gotoPrevious();
        } else {
          this.gotoNext();
        }
        break;
    }
  }

  gotoPrevious() {
    if (this.hasPrevious) {
      this.gotoLevel(this.levelNumber - 1);
    }
  }

  gotoNext(): void {
    if (this.canProgress) {
      this.gotoLevel(this.levelNumber + 1);
    }
  }

  private gotoLevel(levelNumber: number): void {
    this.router.navigate(['/level', levelNumber]);
  }

  reset(): void {
    const attempt = this.levelsService.createAttempt(this.levelNumber - 1);
    if (attempt) {
      this.levelSubject.next(attempt);
    }
  }
}
