import { SoundService } from './../sound.service';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Data, ParamMap } from '@angular/router';
import { takeUntilDestroy } from 'take-until-destroy';
import { LevelAttempt } from '../levels/level';
import { Subscription } from 'rxjs';
import { LevelCell } from '../levels/level.models';

@Component({
  selector: 'xmas-level',
  templateUrl: './level.component.html',
  styles: [],
})
export class LevelComponent implements OnInit, OnDestroy {
  constructor(private route: ActivatedRoute, private soundService: SoundService) {}

  level!: LevelAttempt;
  levelNumber!: number;
  private santaCellSub: Subscription | null = null;

  ngOnInit() {
    this.route.data.pipe(takeUntilDestroy(this)).subscribe((data: Data) => {
      this.level = data['level'];
      if (this.santaCellSub) {
        this.santaCellSub.unsubscribe();
      }
      this.santaCellSub = this.level.santaCell$.subscribe(cell => {
        if (cell.cell === LevelCell.Present && cell.touchCount < 2) {
          this.soundService.playSound('present');
        } else if (cell.cell === LevelCell.Grinch) {
          this.soundService.playSound('grinch');
        }
      });
    });
    this.route.paramMap.pipe(takeUntilDestroy(this)).subscribe((params: ParamMap) => {
      this.levelNumber = parseInt(params.get('number') || '0', 10);
    });
  }

  ngOnDestroy(): void {}
}
