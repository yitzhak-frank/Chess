import firebase from 'firebase/app';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { GameService } from 'src/app/services/game.service';
import { FierbaseService } from 'src/app/services/firebase.service';
import { take } from 'rxjs/operators';

@Component({
  selector: 'app-chess-game',
  templateUrl: './chess-game.component.html',
  styleUrls: ['./chess-game.component.scss']
})
export class ChessGameComponent implements OnInit, OnDestroy {

  public  playerColor:   boolean = false;
  public  blackUser:     firebase.User;
  public  whiteUser:     firebase.User;
  private subscriptions: Subscription[] = [];

  constructor(
    private Route:       ActivatedRoute,
    private fbs:         FierbaseService,
    private GameService: GameService,
    private Router:      Router,
  ) {}

  ngOnInit(): void {
    let subscription = this.Route.queryParams.subscribe(params => {

      if(!params.gameId) return this.Router.navigate(['/home']);

      this.GameService.openGameSocket(params.gameId);
      this.GameService.openGameConnection(params.gameId)

      this.playerColor = Boolean(Number(params.playerColor));

      this.fbs.getGameById(params.gameId).pipe(take(1)).subscribe(({white_user, black_user}) => {
        this.blackUser = JSON.parse(black_user);
        this.whiteUser = JSON.parse(white_user);
        console.log(JSON.parse(black_user), JSON.parse(white_user))
      });
    });
    this.subscriptions.push(subscription);
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(subscription => subscription.unsubscribe());
  }
}
