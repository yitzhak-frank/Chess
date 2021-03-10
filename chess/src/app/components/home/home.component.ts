import firebase from 'firebase/app';
import { AuthService } from 'src/app/services/auth.service';
import { Component, OnChanges, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { GameService } from 'src/app/services/game.service';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit, OnDestroy, OnChanges {

  userName: string  = '';
  link:     string  = '';
  params:   string  = '';
  user:     firebase.User = null;
  showLoginIndex: boolean = false;
  copyTooltip:    boolean = false;
  private subscription: Subscription[] = [];

  constructor(public AuthService: AuthService, public GameService: GameService, public activatedRoute: ActivatedRoute) {}

  showLogin() {
    if(this.params) return this.AuthService.googleLogin();
    if(this.user) this.GameService.connectToGame();
    this.showLoginIndex = true;
    let elementsToShow = this.user ? ['sign-in', 'start-game'] : ['sign-in'];
    this.setElementTransform(elementsToShow);
  }

  getUser(user): void {
    this.user = user;
    if(user) this.setElementTransform(['start-game']);
  }

  setElementTransform(ids: string[]): void {
    setTimeout(() => ids.forEach(id => document.getElementById(id).style.transform = 'translate(0)'), 1)
  }

  createGameLink(): void {
    this.link = `http://localhost:4200/home/${this.GameService.getGameId()}`;
  }

  copyLink(input: HTMLInputElement): void {
    input.select();
    document.execCommand("copy");
    this.copyTooltip = true;
    setTimeout(() => this.copyTooltip = false, 2000);
  }

  ngOnInit(): void {
    this.subscription.push(
      this.activatedRoute.params.subscribe(params => {
        if(!params.gameId) this.GameService.playerColor = true;
        else {
          this.params = params.gameId
          this.GameService.gameId = params.gameId;
          this.GameService.saveGameId(params.gameId);
          this.GameService.playerColor = false;
        }
      }),
      this.AuthService.user$.subscribe(user => {
        this.user = user;
        this.userName = user?.providerData[0].displayName;
        if(this.user) this.GameService.connectToGame();
      })
    );
  }

  ngOnChanges() {}

  ngOnDestroy(): void {
    this.subscription.forEach(subscription => subscription.unsubscribe())
  }
}
