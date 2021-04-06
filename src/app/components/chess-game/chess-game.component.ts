import { ConnectionListenerService } from 'src/app/services/connection.service';
import { ActivatedRoute, Router } from '@angular/router';
import { Component, OnInit } from '@angular/core';
import { FierbaseService } from 'src/app/services/firebase.service';
import { TimeCounters } from 'src/app/interfaces/game-interfaces';
import { AuthService } from 'src/app/services/auth.service';
import { GameService } from 'src/app/services/game.service';
import { Location } from '@angular/common';
import { take } from 'rxjs/operators';
import firebase from 'firebase/app';

@Component({
  selector: 'app-chess-game',
  templateUrl: './chess-game.component.html',
  styleUrls: ['./chess-game.component.scss']
})
export class ChessGameComponent implements OnInit {

  public  playerColor:   boolean[] = [];
  public  blackUser:     firebase.User;
  public  whiteUser:     firebase.User;
  public  timeCounters:  TimeCounters;
  private gameId:        string;
  private uid:           string;
  private player2Uid:    string;
  public  deadTools:     { black: string[]; white: string[]; };

  constructor(
    private Route:       ActivatedRoute,
    private fbs:         FierbaseService,
    private GameService: GameService,
    private Router:      Router,
    private Connection:  ConnectionListenerService,
    private Auth:        AuthService,
    private Location:    Location
  ) {
    this.timeCounters = GameService.timeCounters;
    this.deadTools    = GameService.deadTools;
  }

  setGameId(gameId: string): void {
    localStorage['chess-game-id'] = gameId;
  }

  leavePage(e): void {
    if(!confirm('Are you sure that you want to leave the game?')) return;
    this.exitGame(e);
  }

  exitGame(path): void {
    this.Connection.disconnectFromGame(this.uid);
    if(path === 'Home') this.Router.navigate(['/home']);
    else this.Location.back();
  }

  ngOnInit(): void {
    (async () => {
      let user = await this.Auth.user$.pipe(take(1)).toPromise();
      if(!user) return this.Router.navigate(['/home']);
    })()

    this.Route.queryParams.pipe(take(1)).subscribe(params => {

      if(!params.gameId || !params.uid) return this.Router.navigate(['/home']);

      this.gameId = params.gameId;
      this.uid    = params.uid;
      this.setGameId(this.gameId);
      this.fbs.updateGameConnectionByGameId({[this.uid]: true}, this.gameId);
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

}
