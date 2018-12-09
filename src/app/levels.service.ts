import { Inject, Injectable } from '@angular/core';
import { Levels } from './app.tokens';
import { Level, LevelAttempt } from './levels/level';

@Injectable({
  providedIn: 'root',
})
export class LevelsService {
  constructor(@Inject(Levels) private levels: ReadonlyArray<Level>) {}

  createAttempt(index: number): LevelAttempt | null {
    const level = this.levels[index];
    if (level) {
      return new LevelAttempt(level);
    } else {
      return null;
    }
  }

  hasPrevious(levelNumber: number): boolean {
    return levelNumber > 1;
  }

  hasNext(levelNumber: number): boolean {
    return levelNumber < this.levels.length;
  }
}
