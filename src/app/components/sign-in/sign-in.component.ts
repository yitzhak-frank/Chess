import firebase from 'firebase/app';
import { Subscription } from 'rxjs';
import { AuthService } from 'src/app/services/auth.service';
import { Component, EventEmitter, OnDestroy, OnInit, Output } from '@angular/core';
import { ConnectionService } from 'src/app/services/connection.service';

@Component({
  selector: 'app-sign-in',
  templateUrl: './sign-in.component.html',
  styleUrls: ['./sign-in.component.scss']
})
export class SignInComponent implements OnInit, OnDestroy {

  user: firebase.User = null;
  subscripion: Subscription;
  @Output() onLogin = new EventEmitter<firebase.User>();

  constructor(
    private Auth: AuthService,
    private Connection: ConnectionService
  ) {
    this.subscripion = this.Auth.user$.subscribe(user => {
      this.user = user;
      this.onLogin.emit(this.user);
    });
  }

  get gameId(): string {
    return localStorage['chess-game-id'];
  }

  removeGameId(): void {
    delete localStorage['chess-game-id'];
  }

  login(): void {
    this.Auth.googleLogin();
  }

  logout(): void {
    if(this.gameId) this.Connection.disconnectFromGame(this.user.uid);
    this.removeGameId();
    this.Auth.logOut();
  }

  ngOnInit(): void {}

  ngOnDestroy(): void {
    this.subscripion.unsubscribe();
  }
}
