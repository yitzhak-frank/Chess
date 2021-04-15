import { Component, HostListener, OnInit } from '@angular/core';
import { ConnectionListenerService } from 'src/app/services/connection.service';
import { ActivatedRoute, Router } from '@angular/router';
import { ChessTableService } from 'src/app/services/chess-table.service';
import { FierbaseService } from 'src/app/services/firebase.service';
import { LeavePageGuard } from '../../guards/leave-page.guard';
import { TimeCounters } from 'src/app/interfaces/game-interfaces';
import { AuthService } from 'src/app/services/auth.service';
import { GameService } from 'src/app/services/game.service';
import { cols, rows } from 'src/app/data/tableArrays';
import { Location } from '@angular/common';
import { take } from 'rxjs/operators';
import firebase from 'firebase/app';

@Component({
  selector: 'app-chess-game',
  templateUrl: './chess-game.component.html',
  styleUrls: ['./chess-game.component.scss']
})
export class ChessGameComponent implements OnInit, LeavePageGuard {
  @HostListener('window:beforeunload')

  canDeactivate(): boolean {
    return this.doLeavePage;
  }

  public  playerColor:   boolean[] = [];
  public  blackUser:     firebase.User;
  public  whiteUser:     firebase.User;
  public  timeCounters:  TimeCounters;
  private gameId:        string;
  private uid:           string;
  private player2Uid:    string;
  private doLeavePage:   boolean;
  public  deadTools:     { black: string[]; white: string[]; };

  constructor(
    private Route:       ActivatedRoute,
    private fbs:         FierbaseService,
    private GameService: GameService,
    private Router:      Router,
    private Connection:  ConnectionListenerService,
    private Auth:        AuthService,
    private Location:    Location,
    public  ChessTable:  ChessTableService
  ) {
    this.timeCounters = GameService.timeCounters;
    this.deadTools    = GameService.deadTools;
  }

  setGameId(gameId: string): void {
    localStorage['chess-game-id'] = gameId;
  }

  leavePage(e): void {
    if(!confirm('Are you sure that you want to leave the game?')) return;
    this.doLeavePage = true;
    this.exitGame(e);
  }

  exitGame(path: string): void {
    this.Connection.disconnectFromGame(this.uid);
    if(path === 'Home') this.Router.navigate(['/home']);
    else this.Router.navigate(['..']);
  }

  ngOnInit(): void {

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

        if(this.playerColor[0]) {
          cols.reverse();
          rows.reverse();
        }
        this.Connection.listenToUserStatus(this.player2Uid);
      });
    });
  }

}
