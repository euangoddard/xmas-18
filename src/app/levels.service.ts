import { Inject, Injectable } from '@angular/core';
import { Levels } from './app.tokens';
import { Level, LevelAttempt } from './levels/level';

@Injectable({
  providedIn: 'root',
})
export class LevelsService {
  private static CACHE_KEY = 'max-completed-level';

  private maxCompletedLevel = 0;

  constructor(@Inject(Levels) private levels: ReadonlyArray<Level>) {
    this.rehydrate();
  }

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

  canProgress(levelNumber: number): boolean {
    return levelNumber < this.levels.length && this.canAccess(levelNumber + 1);
  }

  canAccess(levelNumber: number): boolean {
    return levelNumber <= this.maxCompletedLevel + 1;
  }

  completeLevel(levelNumber: number): void {
    this.maxCompletedLevel = Math.max(levelNumber, this.maxCompletedLevel);
    this.updateCache();
  }

  completeAllLevels(): void {
    this.maxCompletedLevel = this.levels.length;
    this.updateCache();
  }

  get nextAvailableLevel(): number {
    return this.maxCompletedLevel + 1;
  }

  private rehydrate(): void {
    const cacheValue = localStorage.getItem(LevelsService.CACHE_KEY) || '0';
    const valueParsed = parseInt(cacheValue, 10);
    this.maxCompletedLevel = isNaN(valueParsed) ? 0 : valueParsed;
  }

  private updateCache(): void {
    localStorage.setItem(LevelsService.CACHE_KEY, `${this.maxCompletedLevel}`);
  }
}
