export enum LevelCell {
  Empty,
  Santa,
  Present,
  Grinch,
}

export type LevelCells = ReadonlyArray<ReadonlyArray<LevelCell>>;

export enum LevelAttemptState {
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

export interface LevelCoordinate {
  row: number;
  column: number;
}
