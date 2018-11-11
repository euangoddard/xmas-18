export const enum LevelCell {
  Empty,
  Santa,
  Present,
  Grinch,
}

export class Level {
  static parse(levelRaw: string): Level {
    assertSingleSanta(levelRaw);
    const rowsRaw = levelRaw.split('\n');
    return new Level(
      rowsRaw.map(r =>
        r
          .trim()
          .split('')
          .map(selectCell),
      ),
    );
  }

  constructor(public readonly cells: ReadonlyArray<ReadonlyArray<LevelCell>>) {}

  get rows(): number {
    return this.cells.length;
  }

  get columns(): number {
    return this.cells.length ? this.cells[0].length : 0;
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
