import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { LevelAttempt } from '../levels/level';

@Component({
  selector: 'xmas-level',
  templateUrl: './level.component.html',
  styles: [],
})
export class LevelComponent implements OnInit {
  constructor(private route: ActivatedRoute) {}

  level!: LevelAttempt;

  ngOnInit() {
    this.route.data.subscribe((data: { level: LevelAttempt }) => {
      this.level = data.level;
    });
  }
}
