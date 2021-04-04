import { ConnectionListenerService } from './connection.service';
import { Injectable, OnDestroy } from '@angular/core';
import { FierbaseService } from './firebase.service';
import { firstPosition } from '../data/toolsPosition';
import { Subscription } from 'rxjs';
import { AuthService } from './auth.service';
import { GameInfo } from '../interfaces/game-interfaces';
import { Router } from '@angular/router';
import { take } from 'rxjs/operators';
import * as firebase from 'firebase/app';
import 'firebase/firestore';

@Injectable({
  providedIn: 'root'
})
export class GameCreatorService implements OnDestroy {

  public  playerColor:   boolean;
  private toolsPsition = firstPosition;
  private subscriptions: Subscription[] = [];

  constructor(
    private fbs:        FierbaseService,
    private Auth:       AuthService,
    private Router:     Router,
    private Connection: ConnectionListenerService
  ) {}

  // get server time
  get timestamp() {
    return firebase.default.firestore.FieldValue.serverTimestamp();
  }

  // get current game id
  get gameId() {
    return localStorage['chess-game-id'];
  }

  // set current game id
  setGameId(gameId: string) {
    localStorage['chess-game-id'] = gameId;
  }

  removeGameId() {
    delete localStorage['chess-game-id'];
  }

  // set if player is white (true) or black (false)
  setPlayerColor(playerColor): void {
    this.playerColor = playerColor;
  }

  joinToGame(): void {
    let uid = this.Auth.user.uid;
    if(this.playerColor && !this.gameId) this.createGame(uid);
    else if(!this.playerColor) this.addPlayerToGame(uid);
  }

  // set the game for the user to play
  createGame(uid: string, callback?): void {
    let subscription = this.fbs.gatUserGames('white_uid',uid).valueChanges({idField: 'id'}).pipe(take(1)).subscribe(games => {
      if(!games.length) this.addGame(uid);
      else {
        let emptyGame = games[games.findIndex(game => !game['black_uid'])];
        if(emptyGame) this.setGameId(emptyGame.id);
        else if(!this.gameId) this.addGame(uid);
      }
      this.Connection.startListening(uid);
      if(callback) callback();
    });
    this.subscriptions.push(subscription);
  }

  // add game in db
  addGame(uid: string): void {
    this.fbs.addGame({ white_uid: uid, white_user: JSON.stringify(this.Auth.user)}).then(docRef => {
      this.setGameId(docRef.id);
      this.fbs.addGameConnection({[uid]: false, game_id: this.gameId});
      this.createGameInfo();
    });
  }

  // when user connect with game url add him directly to the game
  addPlayerToGame(uid: string): void {
    let subscription = this.fbs.getGameById(this.gameId).pipe(take(1)).subscribe(game => {
      if(!game.black_uid) {
        this.fbs.updateGame({ black_uid: uid,black_user: JSON.stringify(this.Auth.user) }, this.gameId);
        this.fbs.updateGameInfoByGameId({start_date: this.timestamp}, this.gameId);
      }
      this.Connection.startListening(uid);
      this.Connection.connectToGame(uid);
    });
    this.subscriptions.push(subscription);
  }

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
      black_dead_tools: [],
      white_dead_tools: [],
      tools_position: this.toolsPsition,
      threats_map: [],
      game_status: 'Active game',
      chess_table: ''
    }
    this.fbs.addGameInfo(gameInfo);
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(subscription => subscription.unsubscribe());
  }

}
