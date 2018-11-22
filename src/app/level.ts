import { BehaviorSubject, Observable } from 'rxjs';
import { LevelError } from 'src/app/level.errors';
import { LevelAttemptCells, LevelAttemptState, LevelCell, LevelCells } from 'src/app/level.models';

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

  move(row: number, column: number): void {}

  private getInitialState(): LevelAttemptCells {
    return this.level.cells.map(row => {
      return row.map(cell => {
        return {
          cell,
          state: cell === LevelCell.Santa ? LevelAttemptState.Touched : LevelAttemptState.Untouched,
          isAvailable: cell !== LevelCell.Santa,
        };
      });
    });
  }
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
