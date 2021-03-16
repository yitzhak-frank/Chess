import { shareReplay, switchMap } from 'rxjs/operators';
import { Subscription } from 'rxjs';
import { FierbaseService } from './firebase.service';
import { GameCreatorService } from 'src/app/services/game-creator.service';
import { Injectable, OnDestroy, OnInit, Output, EventEmitter } from '@angular/core';
import { AuthService } from './auth.service';
import { Router } from '@angular/router';
import { firstPosition } from '../data/toolsPosition';

@Injectable({
  providedIn: 'root'
})
export class GameService implements OnInit, OnDestroy {

  private userId:      string
  private playerColor: string;
  private connector;
  private toolsPosition = firstPosition;
  private subscriptions: Subscription[] = [];
  @Output() player2 = new EventEmitter();

  constructor(
    private fbs:         FierbaseService,
    private GameCreator: GameCreatorService,
    private AuthService: AuthService,
    private Route:       Router,
  ) {}

  getGameId = () => localStorage['chess-game-id'];

  openGameSocket(gameId: string): void {
    let subscription = this.fbs.getGameInfoByGameId(gameId).valueChanges().pipe(shareReplay(1)).subscribe(([gameInfo]) => {
      if(!gameInfo) return;
      this.player2.emit(gameInfo);
    });
    this.subscriptions.push(subscription);
  }

  openGameConnection(gameId: string): void {
    let subscription = this.AuthService.getUserId().pipe(
      switchMap((...[{uid}]) => {
        if(!uid) return;
        this.userId = uid;
        return this.fbs.getGameById(this.getGameId());
      }),
      switchMap((...[game]) => {
        if(!game) return;
        this.playerColor = game['black_uid'] === this.userId ? 'black_player' : 'white_player';
        this.sendConnection();
        return this.fbs.getGameConnectionByGameId(gameId).valueChanges().pipe(shareReplay(1));
      })
    ).subscribe(([connection]) => {
      if(!connection) return;
      let player2 = this.playerColor.includes('white') ? 'black_player' : 'white_player';
      // if(
      //   connection[this.playerColor] - connection[player2] > (1000 * 90) ||
      //   connection[this.playerColor] - connection[player2] < (-1000 * 90)
      // ) this.connectionFail();
      console.log(this.playerColor,connection[this.playerColor] ,player2, connection[player2]);
      console.log(
        connection[this.playerColor] - connection[player2],
        connection[this.playerColor] - connection[player2] > (1000 * 99),
        connection[this.playerColor] - connection[player2] < (-1000 * 99)
      );
    })
    this.subscriptions.push(subscription);
  }

  sendConnection(): void {
    let gameId = this.GameCreator.getGameId();
    let connectionUpdate = {[this.playerColor]: new Date().getTime()};
    this.connector = setInterval(() => {
      //this.fbs.updateGameConnectionByGameId(connectionUpdate, gameId);
    }, 1000 * 30);
  }

  connectionFail(): void {
    console.log('connection fail');
    clearInterval(this.connector);
    this.Route.navigate(['/home']);
  }

  updateGameInfo(color_turn: boolean, threts_map: string[], moves: number): void {
    let updatedInfo = {
      color_turn,
      threts_map,
      moves,
      tools_position: this.toolsPosition,
      last_date: new Date().getTime(),
      game_time: '00:00:00'
    }
    this.fbs.updateGameInfoByGameId(updatedInfo, this.getGameId());
  }

  ngOnInit() {}

  ngOnDestroy(): void {
    this.subscriptions.forEach(subscription => subscription.unsubscribe());
    clearInterval(this.connector);
  }
}
