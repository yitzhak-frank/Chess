import { Component, OnDestroy, OnInit } from '@angular/core';
import { ConnectionService } from 'src/app/services/connection.service';
import { ActivatedRoute, Router } from '@angular/router';
import { GameCreatorService } from 'src/app/services/game-creator.service';
import { Subscription } from 'rxjs';
import { AuthService } from 'src/app/services/auth.service';
import { url } from 'src/app/data/general';
import firebase from 'firebase/app';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit, OnDestroy {

  userName: string  = '';
  link:     string  = '';
  params:   string  = '';
  user:     firebase.User = null;
  showLoginIndex: boolean = false;
  copyTooltip:    boolean = false;
  private subscription: Subscription[] = [];

  constructor(
    private Route:  ActivatedRoute,
    private Router: Router,
    private Auth: AuthService,
    private GameCreator: GameCreatorService,
    private Connection: ConnectionService
  ) {}

  showLogin() {
    if(this.params) return this.Auth.googleLogin();
    this.showLoginIndex = true;
    let elementsToShow  = this.user ? ['sign-in', 'start-game'] : ['sign-in'];
    this.setElementTransform(elementsToShow);
  }

  getUser(user: firebase.User): void {
    this.user = user;
    if(user) this.setElementTransform(['start-game']);
  }

  setElementTransform(ids: string[]): void {
    setTimeout(() => ids.forEach(id => document.getElementById(id).style.transform = 'translate(0)'), 1)
  }

  private createGameLink() {
    this.link = `${url}/home?gameId=${this.GameCreator.gameId}`;
  }

  deleteGameLink(): void {
    this.link = '';
  }

  connectToGame(): void {
    this.GameCreator.createGame(this.user.uid, () => {
      this.createGameLink();
      this.Connection.connectToGame(this.user.uid);
    });
  }

  disconnectFromGame(): void {
    this.deleteGameLink();
    this.Connection.disconnectFromGame(this.user.uid);
  }

  goToGamesList(): void {
    this.Router.navigate(['/games'], {queryParams: {uid: this.user.uid}});
  }

  ngOnInit(): void {
    if(this.Auth.user?.uid && this.GameCreator.gameId) this.Connection.startListening(this.Auth.user.uid);
    this.subscription.push(
      this.Route.queryParams.subscribe(params => {
        if(!params.gameId) this.GameCreator.setPlayerColor(true);
        else {
          this.params = params.gameId
          this.GameCreator.setGameId(params.gameId);
          this.GameCreator.setPlayerColor(false);
        }
      }),
      this.Auth.user$.subscribe(user => {
        this.user = user;
        this.userName = user?.displayName;
        if(!this.params) this.GameCreator.setPlayerColor(true);
        if(user && this.params && this.Connection.isListening !== false) {
          this.GameCreator.joinToGame(user.uid);
          this.Connection.startListening(user.uid);
        }
      })
    );
  }

  ngOnChanges() {}

  ngOnDestroy(): void {
    this.subscription.forEach(subscription => subscription.closed || subscription.unsubscribe());
  }
}
