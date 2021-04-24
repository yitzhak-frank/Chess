import { Component, HostListener, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ChessTableService } from 'src/app/services/chess-table.service';
import { ConnectionService } from 'src/app/services/connection.service';
import { FierbaseService } from 'src/app/services/firebase.service';
import { LeavePageGuard } from '../../guards/leave-page.guard';
import { TimeCounters } from 'src/app/interfaces/game-interfaces';
import { GameService } from 'src/app/services/game.service';
import { cols, rows } from 'src/app/data/tableArrays';
import { take } from 'rxjs/operators';
import firebase from 'firebase/app';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-chess-game',
  templateUrl: './chess-game.component.html',
  styleUrls: ['./chess-game.component.scss']
})
export class ChessGameComponent implements OnInit, OnDestroy, LeavePageGuard {
  @HostListener('window:beforeunload')
  canDeactivate(): boolean {
    return this.doLeavePage;
  }

  @HostListener('window:unload', ['$event'])
  whenDeactivate(): void {
    this.Connection.disconnectFromGame(this.uid);
  }

  public  playerColor:   boolean[] = [];
  public  blackUser:     firebase.User;
  public  whiteUser:     firebase.User;
  public  timeCounters:  TimeCounters;
  private gameId:        string;
  private uid:           string;
  private player2Uid:    string;
  public  gameStatus:    string;
  public  winnerName:    string;
  private colorTorn:     boolean;
  public  isActive:      boolean = true;
  private doLeavePage:   boolean = false;
  private subscription:  Subscription;
  public  deadTools:     { black: string[]; white: string[]; };

  constructor(
    private Route:       ActivatedRoute,
    private fbs:         FierbaseService,
    private GameService: GameService,
    private Router:      Router,
    private Connection:  ConnectionService,
    public  ChessTable:  ChessTableService
  ) {
    this.timeCounters = GameService.timeCounters;
    this.deadTools    = GameService.deadTools;
  }

  setGameId(gameId: string): void {
    localStorage['chess-game-id'] = gameId;
  }

  setWinnerName(): string {
    if(!this.gameStatus.endsWith('Won')) return '';
    if(this.colorTorn === this.playerColor[0]) {
      this.winnerName = this.playerColor[0] ? this.blackUser.displayName : this.whiteUser.displayName;
    } else this.winnerName = this.playerColor[0] ? this.whiteUser.displayName : this.blackUser.displayName;
  }

  setGameStatus(): void {
    this.subscription = this.GameService.player2Move.subscribe(({game_status, color_turn}) => {
      this.timeCounters = this.GameService.timeCounters;
      this.isActive     = game_status.startsWith('Active') ? true : false;
      this.gameStatus   = game_status;
      this.colorTorn    = color_turn;
      this.setWinnerName();
    })
  }

  leavePage(path: string): void {
    if(!confirm('Are you sure that you want to leave the game?')) return;
    this.exitGame(path);
  }

  exitGame(path: string): void {
    if(this.gameId) this.Connection.disconnectFromGame(this.uid);
    this.doLeavePage = true;
    this.Router.navigate([path]);
  }

  ngOnInit(): void {
    this.Route.queryParams.pipe(take(2)).subscribe(params => {

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

    this.setGameStatus();
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }
}
