import { Component, OnInit, Output, EventEmitter, Input } from '@angular/core';
import { ConnectionListenerService } from '../../services/connection.service';
import { Location, LocationStrategy, PathLocationStrategy } from '@angular/common';
import { GameService } from 'src/app/services/game.service';

@Component({
  selector: 'app-waiter',
  providers: [Location, {provide: LocationStrategy, useClass: PathLocationStrategy}],
  templateUrl: './waiter.component.html',
  styleUrls: ['./waiter.component.scss']
})
export class WaiterComponent implements OnInit {

  public flag:    boolean;
  public content: {btn: string, text: string};
  @Output() close = new EventEmitter();

  constructor(
    private Connection: ConnectionListenerService,
    private Game: GameService,
    private Location: Location
  ) {}

  setContent(): void {
    if(this.Location.path().includes('chess')) {
      this.content = {btn: 'End Game', text: `${this.Game.player2.displayName} left the game`};
    } else this.content = {btn: 'Cancel', text: 'Waiting for player to join the game'};
  }

  showWaiter(): void {
    setTimeout(() => document.getElementById('waiter').style.transform = 'translate(0)', 1);
  }

  hideWaiter(): void {
    setTimeout(() => document.getElementById('waiter').style.transform = 'translate(0, -200px)', 1);
    this.close.emit();
  }

  ngOnInit(): void {
    this.Connection.waiterFlag.subscribe((flag: boolean) => {
      this.flag = flag;
      if(!flag) return;
      this.setContent();
      this.showWaiter();
    });
  }

}