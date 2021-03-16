import firebase from 'firebase/app';
import { Subscription } from 'rxjs';
import { AuthService } from 'src/app/services/auth.service';
import { Component, EventEmitter, OnDestroy, OnInit, Output } from '@angular/core';
import { GameCreatorService } from 'src/app/services/game-creator.service';

@Component({
  selector: 'app-sign-in',
  templateUrl: './sign-in.component.html',
  styleUrls: ['./sign-in.component.scss']
})
export class SignInComponent implements OnInit, OnDestroy {

  user: firebase.User = null;
  subscripion: Subscription;
  @Output() onLogin = new EventEmitter<firebase.User>();

  constructor(private AuthService: AuthService, private GameCreatorService: GameCreatorService) {
    this.subscripion = this.AuthService.user$.subscribe(user => {
      this.user = user;
      this.onLogin.emit(this.user);
    });
  }

  login(): void {
    this.AuthService.googleLogin();
  }

  logout(): void {
    this.AuthService.logOut();
    this.GameCreatorService.removeGameId();
  }

  ngOnInit(): void {}

  ngOnDestroy(): void {
    this.subscripion.unsubscribe();
  }
}
