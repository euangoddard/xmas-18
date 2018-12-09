import {
  ChangeDetectionStrategy,
  Component,
  Input,
  EventEmitter,
  Output,
  HostListener,
} from '@angular/core';
import {
  LevelAttemptCells,
  LevelAttemptState,
  LevelCell,
  LevelCoordinate,
} from 'src/app/levels/level.models';

@Component({
  selector: 'xmas-level-cells',
  templateUrl: './level-cells.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LevelCellsComponent {
  @Input() cells!: LevelAttemptCells;
  @Input() rows!: number;
  @Input() columns!: number;
  @Input() disabled!: boolean;
  @Output() moved = new EventEmitter<LevelCoordinate>();

  readonly LevelAttemptState = LevelAttemptState;
  readonly LevelCell = LevelCell;

  makeMove(row: number, column: number, isAvailable: boolean): void {
    if (this.disabled || !isAvailable) {
      return;
    }
    this.moved.emit({ row, column });
  }

  @HostListener('window:keyup', ['$event.keyCode'])
  moveWithKey(keyCode: number) {
    switch (keyCode) {
      case 38: // Up arrow
        this.moveRelative(-1, 0);
        break;
      case 40: // Down arrow
        this.moveRelative(1, 0);
        break;
      case 37: // Left arrow
        this.moveRelative(0, -1);
        break;
      case 39: // Right arrow
        this.moveRelative(0, 1);
        break;
    }
  }

  private moveRelative(dx: number, dy: number): void {
    let activeRow = -1;
    let activeColumn = -1;
    this.cells.forEach((rowCells, rowIndex) => {
      rowCells.forEach((cell, columnIndex) => {
        if (cell.state === LevelAttemptState.Santa) {
          activeRow = rowIndex;
          activeColumn = columnIndex;
        }
      });
    });
    const newRow = activeRow + dx;
    const newColumn = activeColumn + dy;
    try {
      const newCell = this.cells[newRow][newColumn];
      if (newCell && newCell.isAvailable) {
        this.makeMove(newRow, newColumn, true);
      }
    } catch {}
  }
}
