import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/auth';
import { AngularFireDatabase } from '@angular/fire/database';
import { tap, map, switchMap, first, shareReplay, take } from 'rxjs/operators';
import * as firebase from 'firebase/app';
import 'firebase/firestore';
import { of } from 'rxjs';


@Injectable({
  providedIn: 'root'
})
export class UserStatusService {

  constructor(private afa: AngularFireAuth, private db: AngularFireDatabase) {
    this.updateOnConnect().subscribe();
    this.updateOnDisconnect().subscribe();
  }

  get timestamp() {
    return firebase.default.database.ServerValue.TIMESTAMP;
  }

  private getUser() {
    return this.afa.authState.pipe(first()).toPromise();
  }

  async setPresence(status: string) {
    const user = await this.getUser();
    if (user) return this.db.object(`status/${user.uid}`).update({ status, timestamp: this.timestamp });
  }

  private updateOnConnect() {
    const connection = this.db.object('.info/connected').valueChanges()
    .pipe(map(connected => connected ? 'online' : 'offline'));

    return this.afa.authState.pipe(
      shareReplay(1),
      switchMap(user => user ? connection : of('offline')),
      tap(status => this.setPresence(status))
    );
  }

  private updateOnDisconnect() {
    return this.afa.authState.pipe(
      shareReplay(1),
      tap(user => {
        if (!user) return;
        this.db.object(`status/${user.uid}`).query.ref.onDisconnect().update({status: 'offline', timestamp: this.timestamp});
      })
    );
  }

  public updateUserStatus(uid: string, status: string) {
    this.db.object(`status/${uid}`).update({status, timestamp: this.timestamp})
  }

  public listenToUserStatus(uid: string) {
    return this.db.object(`status/${uid}`).valueChanges();
  }
}
