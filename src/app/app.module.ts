import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouterModule } from '@angular/router';
import { AppComponent } from './app.component';
import { ROUTES } from './app.routes';
import { IntroComponent } from './intro/intro.component';
import { LevelComponent } from './level/level.component';

@NgModule({
  declarations: [AppComponent, IntroComponent, LevelComponent],
  imports: [BrowserModule, RouterModule.forRoot(ROUTES)],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule {}
