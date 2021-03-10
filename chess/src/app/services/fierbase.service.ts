import { Injectable } from '@angular/core';
import { AngularFirestore, AngularFirestoreCollection } from '@angular/fire/firestore';

@Injectable({
  providedIn: 'root'
})
export class FierbaseService {

  gamesRef:     AngularFirestoreCollection;
  gamesInfoRef: AngularFirestoreCollection;

  constructor(private afs: AngularFirestore) {
    this.gamesRef     = this.afs.collection('games', ref => ref);
    this.gamesInfoRef = this.afs.collection('games_info', ref => ref);
  }

  gatUserGames(uid: string) {
    return this.afs.collection('games', ref => ref.where('white_uid', '==', uid).orderBy('black_uid'))
  }

  addGame(game) {
    return this.gamesRef.add(game);
  }

  addGameInfo(gameInfo) {
    return this.gamesInfoRef.add(gameInfo);
  }

  updateGame(game, id: string) {
    return this.gamesRef.doc(id).update(game);
  }

  updateGameInfo(gameInfo, id: string) {
    return this.gamesInfoRef.doc(id).update(gameInfo);
  }

  getGameById(id: string) {
    return this.gamesRef.doc(id).valueChanges({ idField: 'id' });
  }

  removeGame(id: string) {
    return this.gamesRef.doc(id).delete();
  }

}
