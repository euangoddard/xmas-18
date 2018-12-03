import { ChangeDetectionStrategy, Component, Input, EventEmitter, Output } from '@angular/core';
import { LevelAttemptCells, LevelAttemptState, LevelCell } from 'src/app/levels/level.models';

@Component({
  selector: 'xmas-level-cells',
  templateUrl: './level-cells.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LevelCellsComponent {
  @Input()
  cells!: LevelAttemptCells;
  @Input()
  rows!: number;
  @Input()
  columns!: number;
  @Output()
  moved = new EventEmitter<{ row: number; column: number }>();

  readonly LevelAttemptState = LevelAttemptState;
  readonly LevelCell = LevelCell;
}
