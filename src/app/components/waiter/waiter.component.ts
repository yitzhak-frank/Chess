import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { ConnectionListenerService } from '../../services/connection.service';
import { GameService } from 'src/app/services/game.service';

@Component({
  selector: 'app-waiter',
  templateUrl: './waiter.component.html',
  styleUrls: ['./waiter.component.scss']
})
export class WaiterComponent implements OnInit {

  public flag:    boolean;
  public content = { btn: '', text: '' };
  @Output() close = new EventEmitter();

  constructor(
    private Connection: ConnectionListenerService,
    private Game: GameService
  ) {}

  setContent(): void {
    if(location.pathname.includes('chess')) {
      this.content = {btn: 'Exit Game', text: `${this.Game.player2.displayName} left the game`};
    } else this.content = {btn: 'Cancel', text: 'Waiting for player to join the game'};
  }

  showWaiter(): void {
    setTimeout(() => document.getElementById('waiter').style.transform = 'translate(0)', 1);
  }

  hideWaiter(): void {
    this.Connection.stopListening();
    setTimeout(() => document.getElementById('waiter').style.transform = 'translate(0, -200px)', 1);
    this.close.emit();
    this.removeGameId();
  }

  removeGameId(): void {
    delete localStorage['chess-game-id'];
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
