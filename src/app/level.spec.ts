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

    it('should throw an error if the symbol is not recognised', () => {
      expect(() => {
        Level.parse('XXX');
      }).toThrow(new LevelCellError('Cannot parse symbol X!'));
    });
  });
});
