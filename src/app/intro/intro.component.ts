import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { APP_TITLE } from '../app.title';

@Component({
  selector: 'xmas-intro',
  templateUrl: './intro.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class IntroComponent implements OnInit {
  constructor(private title: Title) {}
  ngOnInit(): void {
    this.title.setTitle(`${APP_TITLE} – Welcome`);
  }
}
