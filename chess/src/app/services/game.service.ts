import { Injectable, OnDestroy, OnInit, Output, EventEmitter } from '@angular/core';
import { GameInfo, TimeCounters } from '../interfaces/game-interfaces';
import { shareReplay, switchMap } from 'rxjs/operators';
import { GameCreatorService } from 'src/app/services/game-creator.service';
import { FierbaseService } from './firebase.service';
import { firstPosition } from '../data/toolsPosition';
import { Subscription } from 'rxjs';
import { AuthService } from './auth.service';
import { ToolInfo } from '../interfaces/tool-interface';
import { Router } from '@angular/router';
import * as firebase from 'firebase/app';
import 'firebase/firestore';

@Injectable({
  providedIn: 'root'
})
export class GameService implements OnInit, OnDestroy {

  private toolsPosition = firstPosition;
  private connector;
  private userId:        string
  private playerColor:   string;
  public  timeCounters:  TimeCounters = {gameTime: 0, blackTime: 0, whiteTime: 0};
  public  deadTools = { black: [], white: [] };
  private subscriptions: Subscription[] = [];
  @Output() player2 = new EventEmitter();

  constructor(
    private fbs:         FierbaseService,
    private GameCreator: GameCreatorService,
    private AuthService: AuthService,
    private Route:       Router,
  ) {}

  get timestamp() {
    return firebase.default.firestore.FieldValue.serverTimestamp();
  }

  getGameId = () => localStorage['chess-game-id'];

  setTimeCounters({game_time, black_time, white_time, last_date, color_turn}: GameInfo): void {
    if(!last_date) return;
    this.timeCounters['gameTime']  = this.calcTimePass(game_time, last_date);
    this.timeCounters['blackTime'] = color_turn? black_time: this.calcTimePass(black_time, last_date);
    this.timeCounters['whiteTime'] = color_turn? this.calcTimePass(white_time, last_date): white_time;
  }

  setDeadTools({black_dead_tools, white_dead_tools}: GameInfo): void {
    this.deadTools['black'] = black_dead_tools.sort();
    this.deadTools['white'] = white_dead_tools.sort();
  }

  openGameSocket(gameId: string): void {
    let subscription = this.fbs.getGameInfoByGameId(gameId).valueChanges().pipe(shareReplay(1)).subscribe(([gameInfo]) => {
      if(!gameInfo) return;
      this.player2.emit(gameInfo);
    });
    this.subscriptions.push(subscription);
  }

  openGameConnection(gameId: string): void {
    let subscription = this.AuthService.getUserId().pipe(
      switchMap((...[{uid}]) => {
        if(!uid) return;
        this.userId = uid;
        return this.fbs.getGameById(this.getGameId());
      }),
      switchMap((...[game]) => {
        if(!game) return;
        this.playerColor = game['black_uid'] === this.userId ? 'black_player' : 'white_player';
        return this.fbs.getGameConnectionByGameId(gameId).valueChanges().pipe(shareReplay(1));
      })
    ).subscribe(([connection]: object[]) => {
      if(!connection) return;
      for(let field in connection) if(!connection[field]) this.connectionFail();
    })
    this.subscriptions.push(subscription);
  }

  connectionFail(): void {
    console.log('connection fail');
    // this.Route.navigate(['/home']);
  }

  updateGameInfo(color_turn: boolean, threts_map: string[], oldInfo: GameInfo, deadTool: ToolInfo, gameStatus: string): void {
    let playerTime      = color_turn ? 'black_time' : 'white_time';
    let playerDeadTools = color_turn ? 'white_dead_tools' : 'black_dead_tools';
    let updatedInfo = {
      color_turn,
      threts_map,
      moves:          oldInfo.moves + 1,
      tools_position: this.toolsPosition,
      last_date:      this.timestamp,
      game_time:      this.calcTimePass(oldInfo.game_time, oldInfo.last_date),
      [playerTime]:   this.calcTimePass(oldInfo[playerTime], oldInfo.last_date),
      [playerDeadTools]: deadTool ? [...oldInfo[playerDeadTools], deadTool.tool] : oldInfo[playerDeadTools],
      game_status: gameStatus
    }
    this.fbs.updateGameInfoByGameId(updatedInfo, this.getGameId());
  }

  calcTimePass(time: number, lastDate): number {
    return Number((time + ((Date.now() - lastDate.toDate().getTime()) / 1000)).toFixed(0));
  }

  ngOnInit() {}

  ngOnDestroy(): void {
    this.subscriptions.forEach(subscription => subscription.unsubscribe());
    clearInterval(this.connector);
  }
}
