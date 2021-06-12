import 'firebase/firestore';
import { take } from 'rxjs/operators';
import { Router } from '@angular/router';
import { GameInfo } from '../interfaces/game-interfaces';
import * as firebase from 'firebase/app';
import { Injectable } from '@angular/core';
import { AuthService } from './auth.service';
import { firstPosition } from '../data/toolsPosition';
import { FierbaseService } from './firebase.service';
import { ConnectionService } from './connection.service';

@Injectable({
  providedIn: 'root'
})
export class GameCreatorService {

  public  playerColor:   boolean;
  private toolsPsition = firstPosition;

  constructor(
    private fbs:        FierbaseService,
    private Auth:       AuthService,
    private Router:     Router,
    private Connection: ConnectionService
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
  public setGameId(gameId: string) {
    localStorage['chess-game-id'] = gameId;
  }

  public removeGameId() {
    delete localStorage['chess-game-id'];
  }

  // set if player is white (true) or black (false)
  public setPlayerColor(playerColor): void {
    this.playerColor = playerColor;
  }

  public joinToGame(uid: string): void {
    if(this.playerColor && !this.gameId) this.createGame(uid);
    else if(!this.playerColor) this.addPlayerToGame(uid);
  }

  /**
   * Sets new game for the user to play.
   * @param uid String with the user id.
   * @param callback Function contains actions to do after getting the game id.
   */
  public createGame(uid: string, callback?: () => void): void {
    this.fbs.gatUserGames('white_uid',uid).valueChanges({idField: 'id'}).pipe(take(1)).subscribe(games => {
      if(!games.length) this.addGame(uid, callback);
      else {
        let emptyGame = games[games.findIndex(game => !game['black_uid'])];
        if(emptyGame) {
          this.setGameId(emptyGame.id);
          if(callback) callback();
        } else this.addGame(uid, callback);
      }
      this.Connection.startListening(uid);
    });
  }

  /**
   * Adds teh new game to db.
   * @param uid String with the user id.
   * @param callback Function contains actions to do after getting the game id.
   */
  private addGame(uid: string, callback?: () => void): void {
    this.fbs.addGame(
      { white_uid: uid, black_uid: '', white_user: JSON.stringify(this.Auth.user), black_user: ''}
    ).then(docRef => {
      this.setGameId(docRef.id);
      this.fbs.addGameConnection({[uid]: false, game_id: this.gameId});
      this.createGameInfo();
      if(callback) callback();
    });
  }

  // when user connect with game url add him directly to the game
  private addPlayerToGame(uid: string): void {
    this.fbs.getGameById(this.gameId).pipe(take(1)).subscribe(async game => {
      if(!game.black_uid && game.white_uid !== uid) {
        await this.fbs.updateGame({ black_uid: uid,black_user: JSON.stringify(this.Auth.user) }, this.gameId);
        this.fbs.updateGameInfoByGameId({start_date: this.timestamp, last_date: this.timestamp}, this.gameId);
      } else if(game.white_uid === uid) return this.Router.navigate(['/home'])
      this.Connection.startListening(uid);
      this.Connection.connectToGame(uid);
    });
  }

  private createGameInfo(): void {
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

}
