import { Injectable } from '@angular/core';
import { Game, GameInfo } from '../interfaces/game-interfaces';
import { shareReplay, take } from 'rxjs/operators';
import { AngularFirestore, AngularFirestoreCollection } from '@angular/fire/firestore';

@Injectable({
  providedIn: 'root'
})
export class FierbaseService {

  private gamesRef:      AngularFirestoreCollection<Game>;
  private gamesInfoRef:  AngularFirestoreCollection<GameInfo>;
  private connectionRef: AngularFirestoreCollection;

  constructor(private afs: AngularFirestore) {
    this.gamesRef      = this.afs.collection('games', ref => ref);
    this.gamesInfoRef  = this.afs.collection('games_info', ref => ref);
    this.connectionRef = this.afs.collection('connection', ref => ref);
  }
  /**
   * Gets all users games.
   * @param field String with the filed name to match the uid (black_uid / white_uid).
   * @param uid String with the user id.
   * @returns Firestore collection with list of user games.
   */
  public gatUserGames(field: string, uid: string): AngularFirestoreCollection<Game> {
    return this.afs.collection('games', ref => ref.where(field, '==', uid))
  }

  /**
   * @param game Object Contains the basic game data (users info and users id).
   */
  public addGame(game: Game) {
    return this.gamesRef.add(game);
  }

  /**
   * @param gameInfo Object Contains all game info such as time score etc.
   */
  public addGameInfo(gameInfo: GameInfo) {
    return this.gamesInfoRef.add(gameInfo);
  }

  public addGameConnection(connection) {
    return this.connectionRef.add(connection);
  }

  public updateGame(game, id: string) {
    return this.gamesRef.doc(id).update(game);
  }

  public updateGameInfoByGameId(gameInfo, gameId: string) {
    return this.getGameInfoByGameId(gameId).valueChanges({idField: 'id'}).pipe(take(1)).subscribe(doc => {
      this.gamesInfoRef.doc(doc[0]['id']).update(gameInfo);
    });
  }

  public updateGameConnectionByGameId(connection, gameId: string) {
    return this.getGameConnectionByGameId(gameId).valueChanges({idField: 'id'}).pipe(take(1)).subscribe(doc => {
      this.connectionRef.doc(doc[0]['id']).update(connection);
    });
  }

  public getGameById(id: string) {
    return this.gamesRef.doc(id).valueChanges({ idField: 'id' }).pipe(shareReplay(1));
  }

  public getGameInfoByGameId(gameId: string) {
    return this.afs.collection('games_info', ref => ref.where('game_id', '==', gameId));
  }

  public getGameConnectionByGameId(gameId: string) {
    return this.afs.collection('connection', ref => ref.where('game_id', '==', gameId));
  }

}
