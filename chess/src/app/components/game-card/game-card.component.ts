import { Component, Input, OnInit } from '@angular/core';
import { Game } from 'src/app/interfaces/game-interfaces';
import firebase from 'firebase/app';
import { Router } from '@angular/router';

@Component({
  selector: 'app-game-card',
  templateUrl: './game-card.component.html',
  styleUrls: ['./game-card.component.scss']
})
export class GameCardComponent implements OnInit {

  @Input() game: Game;
  @Input() uid: string;
  public blackPlayer: firebase.User;
  public whitePlayer: firebase.User;

  constructor(private Router: Router) {}

  showGameDetails(): void {
    this.Router.navigate(['/game-details'], { queryParams: { gameId: this.game.id, uid: this.uid } });
  }

  ngOnInit(): void {
    this.blackPlayer = JSON.parse(this.game.black_user);
    this.whitePlayer = JSON.parse(this.game.white_user);

    if(this.uid === this.blackPlayer.uid) this.blackPlayer.displayName = 'You';
    else if(this.uid === this.whitePlayer.uid) this.whitePlayer.displayName = 'You';
  }
}
