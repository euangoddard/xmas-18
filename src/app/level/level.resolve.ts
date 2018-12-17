import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve, Router } from '@angular/router';
import { NEVER, Observable, of } from 'rxjs';
import { LevelsService } from '../levels.service';
import { LevelAttempt } from '../levels/level';

@Injectable({
  providedIn: 'root',
})
export class LevelResolve implements Resolve<LevelAttempt> {
  constructor(private levelsService: LevelsService, private router: Router) {}
  resolve(route: ActivatedRouteSnapshot): Observable<LevelAttempt | never> {
    const levelNumber = route.paramMap.get('number');
    if (levelNumber === null) {
      this.router.navigate(['/']);
      return NEVER;
    } else {
      const index = parseInt(levelNumber, 10) - 1;
      const levelAttempt = this.levelsService.createAttempt(index);
      if (levelAttempt === null) {
        this.router.navigate(['/']);
        return NEVER;
      } else if (!this.levelsService.canAccess(index + 1)) {
        this.router.navigate(['/level', this.levelsService.nextAvailableLevel]);
        return NEVER;
      } else {
        return of(levelAttempt);
      }
    }
  }
}
