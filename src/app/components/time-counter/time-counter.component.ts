import { Component, Input, OnChanges, OnDestroy, OnInit } from '@angular/core';
import { ChessTableService } from 'src/app/services/chess-table.service';

@Component({
  selector: 'app-time-counter',
  templateUrl: './time-counter.component.html',
  styleUrls: ['./time-counter.component.scss']
})
export class TimeCounterComponent implements OnInit, OnChanges, OnDestroy {

  @Input() isActive:  boolean;
  @Input() startTime: number;
  @Input() color:     boolean;
  private  active:    boolean;
  public   timeCount: string;
  private  intervalId;

  constructor(private ChessTable: ChessTableService) {}

  setTimeCount(): void {
    this.timeCount = new Date(this.startTime * 1000).toUTCString().substring(17, 25);
  }

  ngOnInit(): void {
    this.active = this.ChessTable.colorTurn === this.color;
    this.intervalId = setInterval(() => {
      this.active = this.ChessTable.colorTurn === this.color;
      if(!this.active || !this.isActive) return;
      this.startTime += 1
      this.setTimeCount();
    }, 1000);
  }

  ngOnChanges(): void {
    this.setTimeCount();
  }

  ngOnDestroy(): void {
    clearInterval(this.intervalId);
  }
}
