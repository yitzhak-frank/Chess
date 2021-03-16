import { Injectable } from '@angular/core';
import { AngularFirestore, AngularFirestoreCollection } from '@angular/fire/firestore';
import { shareReplay, take } from 'rxjs/operators';
import { Connection, Game, GameInfo } from '../interfaces/game-interfaces';

@Injectable({
  providedIn: 'root'
})
export class FierbaseService {

  private gamesRef:      AngularFirestoreCollection<Game>;
  private gamesInfoRef:  AngularFirestoreCollection<GameInfo>;
  private connectionRef: AngularFirestoreCollection<Connection>;

  constructor(private afs: AngularFirestore) {
    this.gamesRef      = this.afs.collection('games', ref => ref);
    this.gamesInfoRef  = this.afs.collection('games_info', ref => ref);
    this.connectionRef = this.afs.collection('connection', ref => ref);
  }

  gatUserGames(uid: string) {
    return this.afs.collection('games', ref => ref.where('white_uid', '==', uid).orderBy('black_uid'))
  }

  addGame(game: Game) {
    return this.gamesRef.add(game);
  }

  addGameInfo(gameInfo: GameInfo) {
    return this.gamesInfoRef.add(gameInfo);
  }

  addGameConnection(connection: Connection) {
    return this.connectionRef.add(connection);
  }

  updateGame(game, id: string) {
    return this.gamesRef.doc(id).update(game);
  }

  updateGameInfoByGameId(gameInfo, gameId: string) {
    this.getGameInfoByGameId(gameId).valueChanges({idField: 'id'}).pipe(take(1)).subscribe(doc => {
      this.gamesInfoRef.doc(doc[0]['id']).update(gameInfo);
    });
  }

  updateGameConnectionByGameId(connection, gameId: string) {
    this.getGameConnectionByGameId(gameId).valueChanges({idField: 'id'}).pipe(take(1)).subscribe(doc => {
      this.connectionRef.doc(doc[0]['id']).update(connection);
    });
  }

  getGameById(id: string) {
    return this.gamesRef.doc(id).valueChanges({ idField: 'id' }).pipe(shareReplay(1));
  }

  getGameInfoByGameId(gameId: string) {
    return this.afs.collection('games_info', ref => ref.where('game_id', '==', gameId));
  }

  getGameConnectionByGameId(gameId: string) {
    return this.afs.collection('connection', ref => ref.where('game_id', '==', gameId));
  }

  // removeGame(id: string) {
  //   return this.gamesRef.doc(id).delete();
  // }

  // removeGameConnection(id: string) {
  //   return this.connectionRef.doc(id).delete();
  // }

}
