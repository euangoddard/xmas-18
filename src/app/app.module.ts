import { LEVELS } from './levels/levels.definition';
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouterModule } from '@angular/router';
import { AppComponent } from './app.component';
import { ROUTES } from './app.routes';
import { IntroComponent } from './intro/intro.component';
import { LevelComponent } from './level/level.component';
import { Levels } from './app.tokens';
import { LevelCellsComponent } from './level/level-cells.component';
import { ServiceWorkerModule } from '@angular/service-worker';
import { environment } from '../environments/environment';

@NgModule({
  declarations: [AppComponent, IntroComponent, LevelComponent, LevelCellsComponent],
  imports: [
    BrowserModule,
    RouterModule.forRoot(ROUTES),
    ServiceWorkerModule.register('ngsw-worker.js', { enabled: environment.production }),
  ],
  providers: [
    {
      provide: Levels,
      useValue: LEVELS,
    },
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
