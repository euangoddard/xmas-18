
export const enum LevelCell {
  Empty,
  Santa,
  Present,
  Grinch,
}

export class Level {
  constructor(public readonly cells: ReadonlyArray<ReadonlyArray<LevelCell>>) {
    this.assertSingleSanta();
  }

  static parse(levelRaw: string): Level {
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

  private assertSingleSanta(): void {
    const cellsFlat = this.cells.flat();
    const santaCells = cellsFlat.map(c => c === LevelCell.Santa);

    if (santaCells.length === 0) {
      throw new LevelCellError('There can only be one Santa (found none)');
    } else if (santaCells.length !== 1) {
      throw new LevelCellError(`There can only be one Santa (found ${santaCells.length})`);
    }}

  private assertHomogeneousRows(): void {}
}

export const enum LevelAttemptState {
  Untouched,
  Touched,
}

export class LevelAttempt {
  // readonly rows: number;
  // readonly columns: number;

  constructor(private level: Level) {
    // this.rows = level.rows;
    // this.columns = level.columns;
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


const SANTA_TOKEN = 'S';

const CELL_MAP = new Map<string, LevelCell>([
  ['-', LevelCell.Empty],
  [SANTA_TOKEN, LevelCell.Santa],
  ['P', LevelCell.Present],
  ['G', LevelCell.Grinch],
]);
