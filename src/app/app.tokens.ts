import { InjectionToken } from '@angular/core';
import { Level } from './levels/level';

export const Levels = new InjectionToken<ReadonlyArray<Level>>('Levels');
