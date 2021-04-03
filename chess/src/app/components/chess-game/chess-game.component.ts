import firebase from 'firebase/app';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { UserStatusService } from 'src/app/services/user-status.service';
import { FierbaseService } from 'src/app/services/firebase.service';
import { TimeCounters } from 'src/app/interfaces/game-interfaces';
import { Subscription } from 'rxjs';
import { GameService } from 'src/app/services/game.service';
import { take } from 'rxjs/operators';
import { ConnectionListenerService } from 'src/app/services/connection.service';

@Component({
  selector: 'app-chess-game',
  templateUrl: './chess-game.component.html',
  styleUrls: ['./chess-game.component.scss']
})
export class ChessGameComponent implements OnInit, OnDestroy {

  public  playerColor:   boolean[] = [];
  public  blackUser:     firebase.User;
  public  whiteUser:     firebase.User;
  private subscriptions: Subscription[] = [];
  public  timeCounters:  TimeCounters;
  private player2Uid:    string;
  public  deadTools;
  private gameId:        string;

  constructor(
    private Route:       ActivatedRoute,
    private fbs:         FierbaseService,
    private GameService: GameService,
    private Router:      Router,
    private Connection:  ConnectionListenerService
  ) {
    this.timeCounters = GameService.timeCounters;
    this.deadTools    = GameService.deadTools;
  }

  ngOnInit(): void {
    this.Route.queryParams.pipe(take(1)).subscribe(params => {

      if(!params.gameId || !params.uid) return this.Router.navigate(['/home']);

      this.gameId = params.gameId;
      this.GameService.openGameSocket(this.gameId);

      // get users details
      this.fbs.getGameById(this.gameId).pipe(take(1)).subscribe(({white_user, black_user}) => {

        this.blackUser = JSON.parse(black_user);
        this.whiteUser = JSON.parse(white_user);

        if(params.uid === this.blackUser.uid) {
          this.playerColor[0] = false;
          this.player2Uid = this.whiteUser.uid;
        } else if(params.uid === this.whiteUser.uid) {
          this.playerColor[0] = true;
          this.player2Uid = this.blackUser.uid;
        } else return this.Router.navigate(['/home']);

        this.Connection.listenToUserStatus(this.player2Uid);
      });
    });
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(subscription => subscription?.unsubscribe());
  }
}
