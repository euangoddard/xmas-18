import { Level, LevelAttempt, LevelCell, LevelError } from 'src/app/level';

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
    it('should position Santa as per the level', () => {});
  });
});
