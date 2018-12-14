import { LevelResolve } from './level/level.resolve';
import { Route } from '@angular/router';
import { IntroComponent } from './intro/intro.component';
import { LevelComponent } from './level/level.component';

export const ROUTES: Route[] = [
  {
    path: '',
    component: IntroComponent,
  },
  {
    path: 'level/:number',
    component: LevelComponent,
    resolve: {
      level: LevelResolve,
    },
  },
  { path: '**', redirectTo: '/' },
];
