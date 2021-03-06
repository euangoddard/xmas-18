import { Component, HostListener, OnInit } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { SwUpdate } from '@angular/service-worker';
import { Observable, of } from 'rxjs';
import { filter, mapTo, startWith } from 'rxjs/operators';
import { AnalyticsService } from './analytics.service';
import { LevelsService } from './levels.service';
import { SoundService, Sound } from './sound.service';

const KONAMI_PATTERN: ReadonlyArray<number> = [38, 38, 40, 40, 37, 39, 37, 39, 66, 65];

@Component({
  selector: 'xmas-card',
  templateUrl: './app.component.html',
})
export class AppComponent implements OnInit {
  readonly isNewVersionAvailable$: Observable<boolean>;

  private readonly seenKeyStrokes: number[] = [];

  constructor(
    private updates: SwUpdate,
    private analytics: AnalyticsService,
    private router: Router,
    private levelService: LevelsService,
    private soundsService: SoundService,
  ) {
    if (this.updates.isEnabled) {
      this.isNewVersionAvailable$ = this.updates.available.pipe(
        mapTo(true),
        startWith(false),
      );
    } else {
      this.isNewVersionAvailable$ = of(false);
    }
  }

  @HostListener('window:keydown', ['$event.keyCode'])
  checkForKonami(keyCode: number) {
    this.seenKeyStrokes.push(keyCode);
    if (this.seenKeyStrokes.length > KONAMI_PATTERN.length) {
      this.seenKeyStrokes.shift();
    }
    if (arraysEqual(this.seenKeyStrokes, KONAMI_PATTERN)) {
      this.soundsService.playSound(Sound.Present);
      this.levelService.completeAllLevels();
    }
  }

  ngOnInit(): void {
    if (this.updates.isEnabled) {
      this.updates.checkForUpdate();
    }

    this.router.events.pipe(filter(event => event instanceof NavigationEnd)).subscribe(event => {
      this.analytics.sendPageView((<NavigationEnd>event).urlAfterRedirects);
    });
  }

  reload(): void {
    this.updates.activateUpdate().then(() => {
      location.reload();
    });
  }
}

type ArrayLike<T> = Array<T> | ReadonlyArray<T>;

function arraysEqual<T>(a: ArrayLike<T>, b: ArrayLike<T>): boolean {
  if (a === b) {
    return true;
  }
  if (a.length !== b.length) {
    return false;
  }
  for (let i = 0; i < a.length; ++i) {
    if (a[i] !== b[i]) {
      return false;
    }
  }
  return true;
}
