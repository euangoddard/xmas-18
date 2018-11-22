import {
  Level,
  LevelAttempt,
  } from 'src/app/level';
import { LevelError, LevelMoveError } from 'src/app/level.errors';
import { LevelAttemptCell, LevelAttemptState, LevelCell } from 'src/app/level.models';

describe('Level', () => {
  describe('Sense checking', () => {
    it('should ensure the level is not empty', () => {
      expect(() => {
        new Level([]);
      }).toThrow(new LevelError('The level cannot be empty'));

      expect(() => {
        new Level([[]]);
      }).toThrow(new LevelError('The level cannot be empty'));
    });

    it('should ensure there is at least one Santa', () => {
      expect(() => {
        new Level([[LevelCell.Empty, LevelCell.Empty], [LevelCell.Empty, LevelCell.Empty]]);
      }).toThrow(new LevelError('There can only be one Santa (found none)'));
    });

    it('should ensure there is at most one Santa', () => {
      expect(() => {
        new Level([[LevelCell.Santa, LevelCell.Empty], [LevelCell.Empty, LevelCell.Santa]]);
      }).toThrow(new LevelError('There can only be one Santa (found 2)'));
    });

    it('should ensure that rows are homogeneous', () => {
      expect(() => {
        new Level([[LevelCell.Empty], [LevelCell.Empty, LevelCell.Santa]]);
      }).toThrow(new LevelError('All rows must contain the same number of columns'));
    });

    it('should cater for single row levels', () => {
      // Ensure homogeneity check does not fail here
      expect(() => {
        new Level([[LevelCell.Santa]]);
      }).not.toThrow();
    });
  });

  describe('Parsing', () => {
    it('should interpret symbols correctly', () => {
      const level = Level.parse('-SPG');
      expect(level.cells).toEqual([
        [LevelCell.Empty, LevelCell.Santa, LevelCell.Present, LevelCell.Grinch],
      ]);
    });

    it('should recognise new lines as a row divider', () => {
      const level = Level.parse('-S\nP-');
      expect(level.cells).toEqual([
        [LevelCell.Empty, LevelCell.Santa],
        [LevelCell.Present, LevelCell.Empty],
      ]);
    });

    it('should trim extraneous whitespace from the rows', () => {
      const level = Level.parse(' -S\r\n\tP-  ');
      expect(level.cells).toEqual([
        [LevelCell.Empty, LevelCell.Santa],
        [LevelCell.Present, LevelCell.Empty],
      ]);
    });

    describe('Errors', () => {
      it('should throw an error if the symbol is not recognised', () => {
        expect(() => {
          Level.parse('SXXX');
        }).toThrow(new LevelError('Cannot parse symbol X!'));
      });
    });
  });
});

describe('Level attempt', () => {
  describe('Level sizing', () => {
    it('should reflect the rows of the underlying level', () => {
      const level = Level.parse('S\n-');
      const levelAttempt = new LevelAttempt(level);
      expect(levelAttempt.rows).toEqual(2);
    });

    it('should reflect the columns of the underlying level', () => {
      const level = Level.parse('S-G');
      const levelAttempt = new LevelAttempt(level);
      expect(levelAttempt.columns).toEqual(3);
    });
  });

  describe('Initial state', () => {
    it('should position Santa as per the level', () => {
      const level = Level.parse('S');
      const levelAttempt = new LevelAttempt(level);
      assertCellAttributes(levelAttempt.cells[0][0], LevelCell.Santa, LevelAttemptState.Touched);
    });

    it('should mark all non-Santa-cells as untouched', () => {
      const level = Level.parse('S-\nGP');
      const levelAttempt = new LevelAttempt(level);
      const cells = levelAttempt.cells;

      assertCellAttributes(cells[0][1], LevelCell.Empty, LevelAttemptState.Untouched);
      assertCellAttributes(cells[1][0], LevelCell.Grinch, LevelAttemptState.Untouched);
      assertCellAttributes(cells[1][1], LevelCell.Present, LevelAttemptState.Untouched);
    });

    describe('Available moves', () => {
      it('should allow moves to columns adjacent to Santa', () => {
        const levelAttempt = new LevelAttempt(Level.parse('-S-'));
        assertAvailableCells(levelAttempt, [[true, false, true]]);
      });

      it('should allow moves to rows adjacent to Santa', () => {
        const levelAttempt = new LevelAttempt(Level.parse('-\nS\n-'));
        assertAvailableCells(levelAttempt, [[true], [false], [true]]);
      });

      it('should disallow moves to columns which would take the user off the grid', () => {
        assertAvailableCells(new LevelAttempt(Level.parse('S-')), [[false, true]]);
        assertAvailableCells(new LevelAttempt(Level.parse('-S')), [[true, false]]);
      });

      it('should disallow moves to rows which would take the user off the grid', () => {
        assertAvailableCells(new LevelAttempt(Level.parse('S\n-')), [[false], [true]]);
        assertAvailableCells(new LevelAttempt(Level.parse('-\nS')), [[true], [false]]);
      });
    });
  });

  describe('Moving to available cells', () => {
    it('should throw an error if the move is not available', () => {
      const levelAttempt = new LevelAttempt(Level.parse('S-'));
      expect(() => {
        levelAttempt.move(0, 0);
      }).toThrow(new LevelMoveError('Cannot move to cell (0, 0) - it is not available'));
    });

    it('should throw an error if the move is illegal', () => {
      const levelAttempt = new LevelAttempt(Level.parse('S-'));
      expect(() => {
        levelAttempt.move(2, 0);
      }).toThrow(new LevelMoveError('Cannot move to cell (2, 0) - it is not a valid cell'));
    });

    it('should updated the touched state of the cell that is being moved to', () => {
      const levelAttempt = new LevelAttempt(Level.parse('S-'));
      levelAttempt.move(0, 1);
      assertCellAttributes(levelAttempt.cells[0][0], LevelCell.Empty, LevelAttemptState.Touched);
      assertCellAttributes(levelAttempt.cells[0][1], LevelCell.Santa, LevelAttemptState.Touched);
    });

    it('should update the pool of available moves', () => {
      const levelAttempt = new LevelAttempt(Level.parse('-S-\n---\n---'));
      assertAvailableCells(levelAttempt, [
        [true, false, true],
        [false, true, false],
        [false, false, false],
      ]);

      levelAttempt.move(1, 1);
      assertAvailableCells(levelAttempt, [
        [false, true, false],
        [true, false, true],
        [false, true, false],
      ]);
    });
  });

  function assertCellAttributes(
    attemptCell: LevelAttemptCell,
    expectedCell: LevelCell,
    expectedState: LevelAttemptState,
  ): void {
    expect(attemptCell.cell).toEqual(expectedCell);
    expect(attemptCell.state).toEqual(expectedState);
  }

  function assertAvailableCells(levelAttempt: LevelAttempt, availability: boolean[][]): void {
    expect(levelAttempt.rows).toEqual(
      availability.length,
      `Expected availability to have ${levelAttempt.rows} rows`,
    );
    expect(levelAttempt.columns).toEqual(
      availability[0].length,
      `Expected availability to have ${levelAttempt.columns} columns`,
    );

    for (let i = 0; i < levelAttempt.rows; i++) {
      for (let j = 0; j < levelAttempt.columns; j++) {
        const attemptCell = levelAttempt.cells[i][j];
        const expectedAvailability = availability[i][j];
        expect(attemptCell.isAvailable).toEqual(
          expectedAvailability,
          `Failed on row: ${i}, column: ${j}`,
        );
      }
    }
  }
});
