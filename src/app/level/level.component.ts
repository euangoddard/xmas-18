import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Data, ParamMap } from '@angular/router';
import { takeUntilDestroy } from 'take-until-destroy';
import { LevelAttempt } from '../levels/level';

@Component({
  selector: 'xmas-level',
  templateUrl: './level.component.html',
  styles: [],
})
export class LevelComponent implements OnInit, OnDestroy {
  constructor(private route: ActivatedRoute) {}

  level!: LevelAttempt;
  levelNumber!: number;

  ngOnInit() {
    this.route.data.pipe(takeUntilDestroy(this)).subscribe((data: Data) => {
      this.level = data['level'];
    });
    this.route.paramMap.pipe(takeUntilDestroy(this)).subscribe((params: ParamMap) => {
      this.levelNumber = parseInt(params.get('number') || '0',  10);
    });
  }

  ngOnDestroy(): void {}
}
