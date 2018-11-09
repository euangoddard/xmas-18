export const enum LevelCell {
  Empty,
  Santa,
  Present,
  Grinch,
}

export class Level {
  static parse(levelRaw: string): Level {
    const cellsRaw = levelRaw.split('');
    return new Level([cellsRaw.map(selectCell)]);
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

const CELL_MAP = new Map<string, LevelCell>([
  ['-', LevelCell.Empty],
  ['S', LevelCell.Santa],
  ['P', LevelCell.Present],
  ['G', LevelCell.Grinch],
]);
