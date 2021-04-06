import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-player',
  templateUrl: './player.component.html',
  styleUrls: ['./player.component.scss']
})
export class PlayerComponent implements OnInit {

  @Input() name:       string;
  @Input() image:      string;
  @Input() color:      boolean;
  @Input() counter:    number;
  @Input() time:       string;
  @Input() deadTools:  string[];
  public   killsScore: number;

  constructor() {}

  calcScore(tools: string[]): number {
    let reader = {['♙♟']: 1, ['♘♗♞♝']: 3, ['♖♜']: 5, ['♕♛']: 9};
    let score: number = 0;
    let ranks: string[] = Object.keys(reader);
    for(let tool of tools) ranks.forEach(rank => rank.includes(tool) ? score += reader[rank]:null);
    return score;
  }

  ngOnInit(): void {
    if(this.deadTools) this.killsScore = this.calcScore(this.deadTools);
  }

}
