import { Level, LevelAttempt } from './level';
import { LevelError, LevelMoveError } from './level.errors';
import { LevelAttemptCell, LevelAttemptState, LevelCell } from './level.models';

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
        new Level([[LevelCell.Empty, LevelCell.Empty], [LevelCell.Empty, LevelCell.Present]]);
      }).toThrow(new LevelError('There can only be one Santa (found none)'));
    });

    it('should ensure there is at most one Santa', () => {
      expect(() => {
        new Level([[LevelCell.Santa, LevelCell.Present], [LevelCell.Empty, LevelCell.Santa]]);
      }).toThrow(new LevelError('There can only be one Santa (found 2)'));
    });

    it('should ensure there is at least one Present', () => {
      expect(() => {
        new Level([[LevelCell.Empty, LevelCell.Empty], [LevelCell.Empty, LevelCell.Santa]]);
      }).toThrow(new LevelError('There must be at least one present'));
    });

    it('should ensure that rows are homogeneous', () => {
      expect(() => {
        new Level([[LevelCell.Empty], [LevelCell.Present, LevelCell.Santa]]);
      }).toThrow(new LevelError('All rows must contain the same number of columns'));
    });

    it('should cater for single row levels', () => {
      // Ensure homogeneity check does not fail here
      expect(() => {
        new Level([[LevelCell.Santa, LevelCell.Present]]);
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
          Level.parse('SPXXX');
        }).toThrow(new LevelError('Cannot parse symbol X!'));
      });
    });
  });
});

describe('Level attempt', () => {
  describe('Level sizing', () => {
    it('should reflect the rows of the underlying level', () => {
      const level = Level.parse('S\nP');
      const levelAttempt = new LevelAttempt(level);
      expect(levelAttempt.rows).toEqual(2);
    });

    it('should reflect the columns of the underlying level', () => {
      const level = Level.parse('SPG');
      const levelAttempt = new LevelAttempt(level);
      expect(levelAttempt.columns).toEqual(3);
    });
  });

  describe('Initial state', () => {
    it('should position Santa as per the level', () => {
      const level = Level.parse('SP');
      const levelAttempt = new LevelAttempt(level);
      assertCellAttributes(levelAttempt.cells[0][0], LevelCell.Empty, LevelAttemptState.Santa);
    });

    it('should mark all non-Santa-cells as untouched', () => {
      const level = Level.parse('S-\nGP');
      const levelAttempt = new LevelAttempt(level);
      const cells = levelAttempt.cells;

      assertCellAttributes(cells[0][1], LevelCell.Empty, LevelAttemptState.Untouched);
      assertCellAttributes(cells[1][0], LevelCell.Grinch, LevelAttemptState.Untouched);
      assertCellAttributes(cells[1][1], LevelCell.Present, LevelAttemptState.Untouched);
    });

    it('should mark all cells as being touched appropraitely', () => {
      const level = Level.parse('SP');
      const levelAttempt = new LevelAttempt(level);
      assertTouchCount(levelAttempt, 0, 0, 1);
      assertTouchCount(levelAttempt, 0, 1, 0);
    });

    it('should expose the cell with Santa', () => {
      const level = Level.parse('S-\nGP');
      const levelAttempt = new LevelAttempt(level);
      expect(levelAttempt.santaCell).toEqual({
        cell: LevelCell.Empty,
        state: LevelAttemptState.Santa,
        isAvailable: false,
        touchCount: 1,
      });
    });

    describe('Available moves', () => {
      it('should allow moves to columns adjacent to Santa', () => {
        const levelAttempt = new LevelAttempt(Level.parse('P-S--'));
        assertAvailableCells(levelAttempt, [[false, true, false, true, false]]);
      });

      it('should allow moves to rows adjacent to Santa', () => {
        const levelAttempt = new LevelAttempt(Level.parse('P\n-\nS\n-\n-'));
        assertAvailableCells(levelAttempt, [[false], [true], [false], [true], [false]]);
      });

      it('should disallow moves to columns which would take the user off the grid', () => {
        assertAvailableCells(new LevelAttempt(Level.parse('SP')), [[false, true]]);
        assertAvailableCells(new LevelAttempt(Level.parse('PS')), [[true, false]]);
      });

      it('should disallow moves to rows which would take the user off the grid', () => {
        assertAvailableCells(new LevelAttempt(Level.parse('S\nP')), [[false], [true]]);
        assertAvailableCells(new LevelAttempt(Level.parse('P\nS')), [[true], [false]]);
      });
    });
  });

  describe('Moving to available cells', () => {
    it('should throw an error if the move is not available', () => {
      const levelAttempt = new LevelAttempt(Level.parse('SP'));
      expect(() => {
        levelAttempt.move(0, 0);
      }).toThrow(new LevelMoveError('Cannot move to cell (0, 0) - it is not available'));
    });

    it('should throw an error if the move is illegal', () => {
      const levelAttempt = new LevelAttempt(Level.parse('SP'));
      expect(() => {
        levelAttempt.move(2, 0);
      }).toThrow(new LevelMoveError('Cannot move to cell (2, 0) - it is not a valid cell'));
    });

    it('should updated the touched state of the cell that is being moved to', () => {
      const levelAttempt = new LevelAttempt(Level.parse('SP'));
      levelAttempt.move(0, 1);
      assertCellAttributes(levelAttempt.cells[0][0], LevelCell.Empty, LevelAttemptState.Touched);
      assertCellAttributes(levelAttempt.cells[0][1], LevelCell.Present, LevelAttemptState.Santa);
    });

    it('should update the current Santa cell', () => {
      const levelAttempt = new LevelAttempt(Level.parse('SP'));
      levelAttempt.move(0, 1);
      expect(levelAttempt.santaCell).toEqual({
        cell: LevelCell.Present,
        state: LevelAttemptState.Santa,
        isAvailable: false,
        touchCount: 1,
      });
    });

    it('should track the number of moves made on the level', () => {
      const levelAttempt = new LevelAttempt(Level.parse('SPPP'));
      expect(levelAttempt.moves).toBe(0);
      levelAttempt.move(0, 1);
      expect(levelAttempt.moves).toBe(1);
      levelAttempt.move(0, 2);
      expect(levelAttempt.moves).toBe(2);
      levelAttempt.move(0, 1);
      expect(levelAttempt.moves).toBe(3);
    });

    it('should update touch counts', () => {
      const level = Level.parse('S-P');
      const levelAttempt = new LevelAttempt(level);

      levelAttempt.move(0, 1);
      assertTouchCount(levelAttempt, 0, 0, 1);
      assertTouchCount(levelAttempt, 0, 1, 1);
      assertTouchCount(levelAttempt, 0, 2, 0);

      levelAttempt.move(0, 0);
      assertTouchCount(levelAttempt, 0, 0, 2);
      assertTouchCount(levelAttempt, 0, 1, 1);
      assertTouchCount(levelAttempt, 0, 2, 0);

      levelAttempt.move(0, 1);
      assertTouchCount(levelAttempt, 0, 0, 2);
      assertTouchCount(levelAttempt, 0, 1, 2);
      assertTouchCount(levelAttempt, 0, 2, 0);

      levelAttempt.move(0, 2);
      assertTouchCount(levelAttempt, 0, 0, 2);
      assertTouchCount(levelAttempt, 0, 1, 2);
      assertTouchCount(levelAttempt, 0, 2, 1);
    });

    it('should update the pool of available moves', () => {
      const levelAttempt = new LevelAttempt(Level.parse('-S-\n-P-\n---'));
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

    describe('The Grinch', () => {
      it('should flag the level as failed once the Grinch has been uncovered', () => {
        const levelAttempt = new LevelAttempt(Level.parse('SGP'));
        expect(levelAttempt.isFailed).toBe(false);
        levelAttempt.move(0, 1);
        expect(levelAttempt.isFailed).toBe(true);
      });

      it('should disallow moves once the Grinch has been uncovered', () => {
        const levelAttempt = new LevelAttempt(Level.parse('SGP'));
        levelAttempt.move(0, 1);
        expect(() => {
          levelAttempt.move(0, 2);
        }).toThrow(new LevelMoveError('Cannot move - the Grinch has been uncovered!'));
      });
    });

    describe('Presents', () => {
      it('should flag the level as complete when all have been uncovered', () => {
        const levelAttempt = new LevelAttempt(Level.parse('SPP'));
        expect(levelAttempt.isComplete).toBe(false);
        levelAttempt.move(0, 1);
        expect(levelAttempt.isComplete).toBe(false);
        levelAttempt.move(0, 2);
        expect(levelAttempt.isComplete).toBe(true);
      });

      it('should increment the count of found presents for each new one found', () => {
        const levelAttempt = new LevelAttempt(Level.parse('SPPP'));
        expect(levelAttempt.foundPresents).toBe(0);
        levelAttempt.move(0, 1);
        expect(levelAttempt.foundPresents).toBe(1);
        levelAttempt.move(0, 2);
        expect(levelAttempt.foundPresents).toBe(2);
        levelAttempt.move(0, 1);
        expect(levelAttempt.foundPresents).toBe(2);
        levelAttempt.move(0, 2);
        expect(levelAttempt.foundPresents).toBe(2);
        levelAttempt.move(0, 3);
        expect(levelAttempt.foundPresents).toBe(3);
      });

      it('should disallow moves once all have been uncovered', () => {
        const levelAttempt = new LevelAttempt(Level.parse('SP-'));
        levelAttempt.move(0, 1);
        expect(() => {
          levelAttempt.move(0, 2);
        }).toThrow(new LevelMoveError('Cannot move - all presents have been found!'));
      });
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

  function assertTouchCount(
    levelAttempt: LevelAttempt,
    row: number,
    column: number,
    expectedCount: number,
  ): void {
    expect(levelAttempt.cells[row][column].touchCount).toBe(expectedCount);
  }
});
