import { Injectable, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { shareReplay, take } from 'rxjs/operators';
import { firstPosition } from '../data/toolsPosition';
import { AuthService } from './auth.service';
import { FierbaseService } from './fierbase.service';

@Injectable({
  providedIn: 'root'
})
export class GameService implements OnDestroy {

  public  gameId: string = '';
  public  playerColor: boolean;
  private subscriptions: Subscription[] = [];

  constructor(public fbs: FierbaseService, public AuthService: AuthService) {}

  connectToGame(): void {
    let uid = this.AuthService.user.uid
    if(this.playerColor && !this.getGameId()) this.createGame(uid);
    else if(!this.playerColor) this.addPlayerToGame(uid);
  }

  createGame(uid: string): void {
    this.subscriptions.push(this.fbs.gatUserGames(uid).valueChanges({idField: 'id'}).pipe(take(1)).subscribe(games => {
      if(!games.length) this.addGame(uid);
      else {
        let emptyGame = games[games.findIndex(game => !game['black_uid'])]
        if(emptyGame) this.gameId = emptyGame.id;
        else if(!this.gameId) this.addGame(uid);
      }
    }));
  }

  addGame(uid: string): void {
    this.fbs.addGame({white_uid: uid, black_uid: ''}).then(docRef => {
      this.saveGameId(docRef.id);
      this.gameId = docRef.id;
      this.listenToPlayerJoin();
    });
  }

  addPlayerToGame(uid: string): void {
    this.subscriptions.push(
      this.fbs.getGameById(this.gameId).pipe(take(1)).subscribe(game => {
        if(!game.black_uid) this.fbs.updateGame({black_uid: uid}, this.gameId);
        this.saveGameId(this.gameId);
      })
    );
  }

  listenToPlayerJoin() {
    this.subscriptions.push(
      this.fbs.getGameById(this.gameId).pipe(take(1)).subscribe(game => {
        if(game['black_uid']) this.createGameInfo();
      })
    )
  }

  saveGameId(gameId: string): void {
    localStorage['chss-game-id'] = gameId;
  }

  getGameId(): string | void {
    return localStorage['chss-game-id'];
  }

  createGameInfo(): void {
    let gameInfo = {
      game_id:    this.gameId,
      start_date: new Date().getTime(),
      last_date:  new Date().getTime(),
      color_turn: true,
      moves:      0,
      game_time:  '00:00',
      black_time: '00:00',
      white_time: '00:00',
      black_attacks: 0,
      white_attacks: 0,
      black_dead_tools: '',
      white_dead_tools: '',
      tools_position: JSON.stringify(firstPosition),
    }
    this.fbs.addGameInfo(gameInfo)
  }

  openGameSocket(gameId: string): void {
    this.subscriptions.push(
      this.fbs.getGameInfoByGameId(gameId).valueChanges().pipe(shareReplay(1)).subscribe(gameInfo => {
        console.log(gameInfo)
      })
    );
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(subscription => subscription.unsubscribe());
  }

}
