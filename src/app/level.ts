import { BehaviorSubject, Observable } from 'rxjs';
import { LevelError, LevelMoveError } from 'src/app/level.errors';
import {
  LevelAttemptCell,
  LevelAttemptCells,
  LevelAttemptState,
  LevelCell,
  LevelCells,
} from 'src/app/level.models';

export class Level {
  constructor(public readonly cells: LevelCells) {
    this.assertNotEmpty();
    this.assertSingleSanta();
    this.assertHomogeneousRows();
  }

  private static EMPTY_MESSAGE = 'The level cannot be empty';

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
    const santaCells = cellsFlat.filter(c => c === LevelCell.Santa);

    if (santaCells.length === 0) {
      throw new LevelError('There can only be one Santa (found none)');
    } else if (santaCells.length !== 1) {
      throw new LevelError(`There can only be one Santa (found ${santaCells.length})`);
    }
  }

  private assertHomogeneousRows(): void {
    const rowLengths = this.getRowLengths();
    let isHomogeneous = true;
    for (let i = 0; i < this.cells.length - 1; i++) {
      isHomogeneous = rowLengths[i] === rowLengths[i + 1];
      if (!isHomogeneous) {
        break;
      }
    }
    if (!isHomogeneous) {
      throw new LevelError('All rows must contain the same number of columns');
    }
  }

  private assertNotEmpty(): void {
    if (!this.cells.length) {
      throw new LevelError(Level.EMPTY_MESSAGE);
    }

    const rowLengths = this.getRowLengths();
    const hasEmptyRow = rowLengths.some(l => !l);
    if (hasEmptyRow) {
      throw new LevelError(Level.EMPTY_MESSAGE);
    }
  }

  private getRowLengths(): ReadonlyArray<number> {
    return this.cells.map(r => r.length);
  }
}

export class LevelAttempt {
  readonly rows: number;
  readonly columns: number;

  private readonly cellSubject: BehaviorSubject<LevelAttemptCells>;
  readonly cells$: Observable<LevelAttemptCells>;

  constructor(private level: Level) {
    this.cellSubject = new BehaviorSubject(this.getInitialState());
    this.cells$ = this.cellSubject.asObservable();

    this.rows = this.level.cells.length;
    this.columns = this.level.cells[0].length;
  }

  get cells(): LevelAttemptCells {
    return this.cellSubject.getValue();
  }

  move(row: number, column: number): void {
    const cell = this.getCellAtRowAndColumn(row, column);
    if (!cell.isAvailable) {
      throw new LevelMoveError(`Cannot move to cell (${row}, ${column}) - it is not available`);
    }

    const santaLocation = { row, column };
    const newCells = this.cells.map((oldRow, rowIndex) => {
      return oldRow.map((oldCell, columnIndex) => {
        const cellLocation = { row: rowIndex, column: columnIndex };
        const isCurrentSantaCell = rowIndex === row && columnIndex === column;
        // TODO: Refactor this disgrace!
        const newCell =
          oldCell.cell === LevelCell.Santa
            ? LevelCell.Empty
            : isCurrentSantaCell
            ? LevelCell.Santa
            : oldCell.cell;
        return {
          cell: newCell,
          state: isCurrentSantaCell ? LevelAttemptState.Touched : oldCell.state,
          isAvailable: this.isCellNextToSanta(cellLocation, santaLocation),
        };
      });
    });
    this.cellSubject.next(newCells);
  }

  private getInitialState(): LevelAttemptCells {
    const santaLocation = this.getInitialSantaLocation();
    return this.level.cells.map((row, rowIndex) => {
      return row.map((cell, columnIndex) => {
        const cellLocation = { row: rowIndex, column: columnIndex };
        return {
          cell,
          state: cell === LevelCell.Santa ? LevelAttemptState.Touched : LevelAttemptState.Untouched,
          isAvailable: this.isCellNextToSanta(cellLocation, santaLocation),
        };
      });
    });
  }

  private getCellAtRowAndColumn(row: number, column: number): LevelAttemptCell {
    const errorMessage = `Cannot move to cell (${row}, ${column}) - it is not a valid cell`;

    let cell: LevelAttemptCell;
    const rowCells = this.cells[row];
    if (typeof rowCells === 'undefined') {
      throw new LevelMoveError(errorMessage);
    }

    cell = rowCells[column];
    if (typeof cell === 'undefined') {
      throw new LevelMoveError(errorMessage);
    }

    return cell;
  }

  private getInitialSantaLocation(): LevelCellLocation {
    const santaLocation: LevelCellLocation = { row: -1, column: -1 };
    this.level.cells.forEach((row, rowIndex) => {
      row.forEach((cell, columnIndex) => {
        if (cell === LevelCell.Santa) {
          santaLocation.row = rowIndex;
          santaLocation.column = columnIndex;
        }
      });
    });
    return santaLocation;
  }

  private isCellNextToSanta(
    cellLocation: LevelCellLocation,
    santaLocation: LevelCellLocation,
  ): boolean {
    const isSameRow = cellLocation.row === santaLocation.row;
    const isAdjacentColumn =
      cellLocation.column === santaLocation.column - 1 ||
      cellLocation.column === santaLocation.column + 1;
    const isSameColumn = cellLocation.column === santaLocation.column;
    const isAdjacentRow =
      cellLocation.row === santaLocation.row - 1 || cellLocation.row === santaLocation.row + 1;
    return (isSameRow && isAdjacentColumn) || (isSameColumn && isAdjacentRow);
  }
}

interface LevelCellLocation {
  row: number;
  column: number;
}

function selectCell(cellRaw: string): LevelCell {
  const cell = CELL_MAP.get(cellRaw);
  if (typeof cell === 'undefined') {
    throw new LevelError(`Cannot parse symbol ${cellRaw}!`);
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
