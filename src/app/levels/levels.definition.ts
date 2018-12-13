import { Level } from './level';

export const LEVELS: ReadonlyArray<Level> = [
  Level.parse('SP'),
  Level.parse('S-P\nG-P'),
  Level.parse('S-P\n-P-\nP-P'),
  Level.parse('-G---G-\nG--G--G\nS-G-G-P'),
];
