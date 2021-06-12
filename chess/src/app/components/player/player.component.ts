import { Component, Input, OnChanges, OnInit } from '@angular/core';

@Component({
  selector: 'app-player',
  templateUrl: './player.component.html',
  styleUrls: ['./player.component.scss']
})
export class PlayerComponent implements OnInit, OnChanges {

  @Input() name:       string;
  @Input() image:      string;
  @Input() color:      boolean;
  @Input() counter:    number;
  @Input() time:       string;
  @Input() deadTools:  string[];
  @Input() isActive:   boolean;
  public   killsScore: number;

  constructor() {}

  calcScore(tools: string[]): number {
    let reader = {['♙♟']: 1, ['♘♗♞♝']: 3, ['♖♜']: 5, ['♕♛']: 9};
    let score: number = 0;
    let ranks: string[] = Object.keys(reader);
    for(let tool of tools) ranks.forEach(rank => rank.includes(tool) ? score += reader[rank]:null);
    return score;
  }

  ngOnChanges(): void {
    if(this.deadTools?.length) this.killsScore = this.calcScore(this.deadTools);
  }

  ngOnInit(): void {}

}
