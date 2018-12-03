import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { LevelAttemptCells, LevelAttemptState, LevelCell } from 'src/app/levels/level.models';

@Component({
  selector: 'xmas-level-cells',
  templateUrl: './level-cells.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LevelCellsComponent {
  @Input() cells!: LevelAttemptCells;
  @Input() rows!: number;
  @Input() columns!: number;

  readonly LevelAttemptState = LevelAttemptState;
  readonly LevelCell = LevelCell;
}
