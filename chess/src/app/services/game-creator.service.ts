import { Injectable, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { shareReplay, take } from 'rxjs/operators';
import { firstPosition } from '../data/toolsPosition';
import { GameInfo } from '../interfaces/game-interfaces';
import { AuthService } from './auth.service';
import { FierbaseService } from './firebase.service';
import * as firebase from 'firebase/app';
import 'firebase/firestore';

@Injectable({
  providedIn: 'root'
})
export class GameCreatorService implements OnDestroy {

  private gameId:        string = '';
  public  playerColor:   boolean;
  private toolsPsition = firstPosition;
  private subscriptions: Subscription[] = [];

  constructor(
    private fbs:        FierbaseService,
    private Auth:       AuthService,
    private Router:     Router,
  ) {}

  get timestamp() {
    return firebase.default.firestore.FieldValue.serverTimestamp();
  }

  setGameId(gameId): void {
    this.gameId = gameId;
  }

  setPlayerColor(playerColor): void {
    this.playerColor = playerColor;
  }

  connectToGame(): void {
    let uid = this.Auth.user.uid;
    if(this.playerColor && !this.getGameId()) this.createGame(uid);
    else if(!this.playerColor) this.addPlayerToGame(uid);
  }

  createGame(uid: string): void {
    let subscription = this.fbs.gatUserGames(uid).valueChanges({idField: 'id'}).pipe(take(1)).subscribe(games => {
      if(!games.length) this.addGame(uid);
      else {
        let emptyGame = games[games.findIndex(game => !game['black_uid'])];
        if(emptyGame) {
          this.gameId = emptyGame.id;
          this.saveGameId(emptyGame.id);
        } else if(!this.gameId) this.addGame(uid);
      }
    });
    this.subscriptions.push(subscription);
  }

  addGame(uid: string): void {
    this.fbs.addGame({ white_uid: uid, white_user: JSON.stringify(this.Auth.user) }).then(docRef => {
      this.saveGameId(docRef.id);
      this.gameId = docRef.id;
      this.listenToPlayerJoining();
    });
  }

  addPlayerToGame(uid: string): void {
    let subscription = this.fbs.getGameById(this.gameId).pipe(take(1)).subscribe(game => {
      if(!game.black_uid) this.fbs.updateGame({ black_uid: uid,black_user: JSON.stringify(this.Auth.user) }, this.gameId);
      this.saveGameId(this.gameId);
      this.Router.navigate(['/chess'], {queryParams: {gameId: this.getGameId(), uid}});
    });
    this.subscriptions.push(subscription);
  }

  listenToPlayerJoining() {
    let subscription = this.fbs.getGameById(this.gameId).pipe(shareReplay(1)).subscribe(game => {
      if(!game['black_uid']) return;
      this.createGameInfo();
      this.createGameConnection(game.black_uid, game.white_uid);
      this.Router.navigate(['/chess'], {queryParams: {gameId: this.getGameId(), uid: game.white_uid}});
    });
    this.subscriptions.push(subscription);
  }

  saveGameId = (gameId: string) => localStorage['chess-game-id'] = gameId;
  getGameId = () => localStorage['chess-game-id'];
  removeGameId = () => delete localStorage['chess-game-id'];

  createGameInfo(): void {
    let gameInfo: GameInfo = {
      game_id:    this.gameId,
      start_date: this.timestamp,
      last_date:  this.timestamp,
      color_turn: true,
      moves:      0,
      game_time:  0,
      black_time: 0,
      white_time: 0,
      black_attacks: 0,
      white_attacks: 0,
      black_dead_tools: [],
      white_dead_tools: [],
      tools_position: this.toolsPsition,
      threts_map: [],
      game_status: 'active game'
    }
    this.fbs.addGameInfo(gameInfo);
  }

  createGameConnection(black_uid: string, white_uid: string): void {
    let connection = {
      game_id:     this.gameId,
      [black_uid]: true,
      [white_uid]: true
    };
    this.fbs.addGameConnection(connection);
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(subscription => subscription.unsubscribe());
  }

}
