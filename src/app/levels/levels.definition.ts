import { Level } from './level';

export const LEVELS: ReadonlyArray<Level> = [
  Level.parse('SP'),
  Level.parse('SG\nPP'),
  Level.parse('S-P\nG-P'),
  Level.parse('S-P\n-P-\nP-P'),
  Level.parse('S-P-\n-P-P\nP-G-'),
  Level.parse('SPP\nPGP\nPPP'),
  Level.parse('GPG\nPSP\nGPG'),
  Level.parse('P-P\n-G-\n-G-\n-G-\nPGS'),
  Level.parse('P-P\n-G-\n-P-\n-G-\nPGS'),
  Level.parse('S---\n-GP-\n-PG-\n----'),
  Level.parse('S--P\n-PP-\n-PP-\nP--G'),
  Level.parse('S--P\nGGG-\nP--P\n-GGG\nP--P'),
  Level.parse('--P--\n-PGP-\nS-G-P'),
  Level.parse('-G---G-\nG--G--G\nS-G-G-P'),
];
