export const enum LevelCell {
  Empty,
  Santa,
  Present,
  Grinch,
}

interface LevelLike {
  rows: number;
  columns: number;
}

export class Level implements LevelLike {
  constructor(public readonly cells: ReadonlyArray<ReadonlyArray<LevelCell>>) {
    this.rows = this.cells.length;
    this.columns = this.cells.length ? this.cells[0].length : 0;
  }

  readonly rows: number;
  readonly columns: number;

  static parse(levelRaw: string): Level {
    // TODO: Move this assertion to the constructor
    assertSingleSanta(levelRaw);
    const rowsRaw = levelRaw.split('\n');
    return new Level(
      rowsRaw.map(row =>
        row
          .trim()
          .split('')
          .map(selectCell),
      ),
    );
  }
}

export const enum LevelAttemptState {
  Untouched,
  Touched,
}

export class LevelAttempt implements LevelLike {
  readonly rows: number;
  readonly columns: number;

  constructor(private level: Level) {
    this.rows = level.rows;
    this.columns = level.columns;
  }
}

export class LevelCellError extends Error {}

function selectCell(cellRaw: string): LevelCell {
  const cell = CELL_MAP.get(cellRaw);
  if (typeof cell === 'undefined') {
    throw new LevelCellError(`Cannot parse symbol ${cellRaw}!`);
  }
  return cell;
}

function assertSingleSanta(levelRaw: string): void {
  const matches = levelRaw.match(new RegExp(`${SANTA_TOKEN}{1}`, 'g'));
  if (matches === null) {
    throw new LevelCellError('There can only be one Santa (found none)');
  } else if (matches.length !== 1) {
    throw new LevelCellError(`There can only be one Santa (found ${matches.length})`);
  }
}

const SANTA_TOKEN = 'S';

const CELL_MAP = new Map<string, LevelCell>([
  ['-', LevelCell.Empty],
  [SANTA_TOKEN, LevelCell.Santa],
  ['P', LevelCell.Present],
  ['G', LevelCell.Grinch],
]);
