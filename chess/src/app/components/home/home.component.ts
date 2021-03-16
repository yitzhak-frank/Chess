import firebase from 'firebase/app';
import { AuthService } from 'src/app/services/auth.service';
import { Component, OnChanges, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { GameCreatorService } from 'src/app/services/game-creator.service';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit, OnChanges, OnDestroy {

  userName: string  = '';
  link:     string  = '';
  params:   string  = '';
  user:     firebase.User = null;
  showLoginIndex: boolean = false;
  copyTooltip:    boolean = false;
  private subscription: Subscription[] = [];

  constructor(
    public AuthService: AuthService,
    public GameCreatorService: GameCreatorService,
    public Route: ActivatedRoute
  ) {}

  showLogin() {
    if(this.params) return this.AuthService.googleLogin();
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

  createGameLink(): void {
    this.link = `http://localhost:4200/home?gameId=${this.GameCreatorService.getGameId()}&playerColor=0`;
  }

  copyLink(input: HTMLInputElement): void {
    input.select();
    document.execCommand("copy");
    this.copyTooltip = true;
    setTimeout(() => this.copyTooltip = false, 2000);
  }

  ngOnInit(): void {
    this.subscription.push(
      this.Route.queryParams.subscribe(params => {
        if(!params.gameId) this.GameCreatorService.setPlayerColor(true);
        else {
          this.params = params.gameId
          this.GameCreatorService.setGameId(params.gameId);
          this.GameCreatorService.saveGameId(params.gameId);
          this.GameCreatorService.setPlayerColor(false);
        }
      }),
      this.AuthService.user$.subscribe(user => {
        this.user = user;
        this.userName = user?.displayName;
        if(!this.params) this.GameCreatorService.setPlayerColor(true);
        if(user) this.GameCreatorService.connectToGame();
      })
    );
  }

  ngOnChanges() {}

  ngOnDestroy(): void {
    this.subscription.forEach(subscription => subscription.unsubscribe())
  }
}
