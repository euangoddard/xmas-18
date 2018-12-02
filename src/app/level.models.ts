export const enum LevelCell {
  Empty,
  Santa,
  Present,
  Grinch,
}

export type LevelCells = ReadonlyArray<ReadonlyArray<LevelCell>>;

export const enum LevelAttemptState {
  Untouched,
  Touched,
  Santa,
}

export interface LevelAttemptCell {
  cell: LevelCell;
  state: LevelAttemptState;
  isAvailable: boolean;
}

export type LevelAttemptCells = ReadonlyArray<ReadonlyArray<LevelAttemptCell>>;
