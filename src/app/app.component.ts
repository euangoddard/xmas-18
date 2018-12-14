import { AnalyticsService } from './analytics.service';
import { Component, OnInit } from '@angular/core';
import { SwUpdate } from '@angular/service-worker';
import { Observable, of } from 'rxjs';
import { mapTo, startWith, filter } from 'rxjs/operators';
import { Router, NavigationEnd } from '@angular/router';

@Component({
  selector: 'xmas-card',
  templateUrl: './app.component.html',
})
export class AppComponent implements OnInit {
  readonly isNewVersionAvailable$: Observable<boolean>;

  constructor(
    private updates: SwUpdate,
    private analytics: AnalyticsService,
    private router: Router,
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
