import { Injectable, OnDestroy, Output, EventEmitter } from '@angular/core';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { shareReplay } from 'rxjs/operators';
import { AuthService } from './auth.service';
import { FierbaseService } from './firebase.service';
import { UserStatusService } from './user-status.service';

@Injectable({
  providedIn: 'root'
})
export class ConnectionService implements OnDestroy {

  public  isListening: boolean | undefined = undefined;
  private subscriptions: Subscription[] = [];
  private statusTimeoutId;
  @Output() waiterFlag = new EventEmitter<boolean>();

  constructor(
    private Auth: AuthService,
    private fbs: FierbaseService,
    private Router: Router,
    private UserStatus: UserStatusService
  ) {
    this.subscriptions.push(Auth.user$.subscribe(user => user && this.gameId ? this.startListening(user.uid) : null));
  }

  get gameId() {
    return localStorage['chess-game-id'];
  }

  public startListening(uid: string): void {
    if(!this.gameId) return;
    if(this.isListening) this.subscriptions[0].unsubscribe();

    let sub = this.fbs.getGameConnectionByGameId(this.gameId).valueChanges().pipe(shareReplay(1)).subscribe((data: object[]) => {
      let [connection] = data;
      if(!connection) return;
      if(!connection[uid]) return this.waiterFlag.emit(false);
      if(Object.keys(connection).length < 3) return this.waiterFlag.emit(true);

      for(let field in connection) {
        if(field === uid || field === 'game_id') continue;
        if(connection[field]) this.joinPlayersToGame(uid);
        else this.waiterFlag.emit(true);
      }
    });
    this.isListening = true;
    this.subscriptions[0] = sub;
  }

  public stopListening(): void {
    if(!this.subscriptions[0].closed) this.subscriptions[0].unsubscribe();
    this.isListening = false;
  }

  public listenToUserStatus(uid: string): void {
    let subscription = this.UserStatus.listenToUserStatus(uid).subscribe(({status}) => {
      if(status === 'offline') {
        if(!this.statusTimeoutId) this.statusTimeoutId = setTimeout(() => this.disconnectFromGame(uid), 1000 * 65);
      } else if(this.statusTimeoutId) {
        clearTimeout(this.statusTimeoutId);
        this.statusTimeoutId = null
        this.connectToGame(uid);
      }
    });
    this.subscriptions[1] = subscription;
  }

  public connectToGame(uid: string): void {
    this.startListening(uid);
    this.fbs.updateGameConnectionByGameId({[uid]: true}, this.gameId);
  }

  public disconnectFromGame(uid: string): void {
    this.stopListening();
    this.fbs.updateGameConnectionByGameId({[uid]: false}, this.gameId);
  }

  public joinPlayersToGame(uid: string): void {
    this.waiterFlag.emit(false)
    this.Router.navigate(['/chess'], { queryParams: { gameId: this.gameId, uid } });
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(subscription => subscription.closed || subscription.unsubscribe());
  }
}
