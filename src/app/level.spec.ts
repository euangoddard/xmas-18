import { Level, LevelCell, LevelCellError } from 'src/app/level';

describe('Level', () => {
  describe('Dimensions', () => {
    const level = new Level([
      [LevelCell.Empty, LevelCell.Empty, LevelCell.Empty],
      [LevelCell.Empty, LevelCell.Empty, LevelCell.Empty],
    ]);

    it('should report the number of rows', () => {
      expect(level.rows).toEqual(2);
    });

    it('should report the number of columns', () => {
      expect(level.columns).toEqual(3);
    });

    it('should cater for an empty level', () => {
      const emptyLevel = new Level([]);
      expect(emptyLevel.columns).toEqual(0);
      expect(emptyLevel.rows).toEqual(0);
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
        }).toThrow(new LevelCellError('Cannot parse symbol X!'));
      });

      it('should only allow one Santa', () => {
        expect(() => {
          Level.parse('SS');
        }).toThrow(new LevelCellError('There can only be one Santa (found 2)'));

        expect(() => {
          Level.parse('X');
        }).toThrow(new LevelCellError('There can only be one Santa (found none)'));
      });
    });
  });
});
