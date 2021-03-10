import { Injectable, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { take } from 'rxjs/operators';
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
    if(this.playerColor && !this.getGmaeId()) this.createGame(uid);
    else if(!this.playerColor) this.addPlayerToGame(uid);
  }

  createGame(uid: string): void {
    this.subscriptions.push(this.fbs.gatUserGames(uid).valueChanges({idField: 'id'}).subscribe(games => {
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
    });
    this.listenToPlayerJoin();
  }

  addPlayerToGame(uid: string): void {
    this.subscriptions.push(
      this.fbs.getGameById(this.gameId).pipe((take(1))).subscribe(game => {
        if(!game.black_uid) this.fbs.updateGame({black_uid: uid}, this.gameId);
        this.saveGameId(this.gameId);
      })
    );
  }

  listenToPlayerJoin() {
    this.subscriptions.push(
      this.fbs.getGameById(this.gameId).subscribe(game => {
        if(game['black_uid']) '';
        console.log(game);
        console.log(game['black_uid']);
      })
    )
  }

  saveGameId(gameId: string): void {
    localStorage['chss-game-id'] = gameId;
  }

  getGmaeId(): string | void {
    return localStorage['chss-game-id'];
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(subscription => subscription.unsubscribe());
  }

}
