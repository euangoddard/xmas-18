import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class HighScoreService {
  private static CACHE_KEY = 'highscores';

  private readonly highScores = new Map<number, number>();

  constructor() {
    this.rehydrate();
  }

  get(levelNumber: number): number | null {
    return this.highScores.get(levelNumber) || null;
  }

  set(levelNumber: number, score: number): void {
    this.highScores.set(levelNumber, score);
    this.updateStorage();
  }

  private rehydrate(): void {
    const storedScores = localStorage.getItem(HighScoreService.CACHE_KEY) || '{}';
    let scoresObject: ScoresObject;
    try {
      scoresObject = JSON.parse(storedScores);
    } catch {
      scoresObject = {};
    }

    for (const key in scoresObject) {
      if (scoresObject.hasOwnProperty(key)) {
        this.highScores.set(parseInt(key, 10), scoresObject[key]);
      }
    }
  }

  private updateStorage(): void {
    const scoresObject: ScoresObject = {};
    this.highScores.forEach((score, levelNumber) => {
      scoresObject[`${levelNumber}`] = score;
    });
    localStorage.setItem(HighScoreService.CACHE_KEY, JSON.stringify(scoresObject));
  }
}

interface ScoresObject {
  [level: string]: number;
}
