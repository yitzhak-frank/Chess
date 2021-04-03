import { Injectable, OnDestroy, OnInit, Output, EventEmitter } from '@angular/core';
import { GameInfo, TimeCounters } from '../interfaces/game-interfaces';
import { FierbaseService } from './firebase.service';
import { firstPosition } from '../data/toolsPosition';
import { Subscription } from 'rxjs';
import { shareReplay } from 'rxjs/operators';
import { ToolInfo } from '../interfaces/tool-interface';
import firebase from 'firebase/app';
import * as Firebase from 'firebase/app';
import 'firebase/firestore';

@Injectable({
  providedIn: 'root'
})
export class GameService implements OnInit, OnDestroy {

  private toolsPosition = firstPosition;
  private connector;
  public  timeCounters:  TimeCounters = {gameTime: 0, blackTime: 0, whiteTime: 0};
  public  deadTools = { black: [], white: [] };
  private subscriptions: Subscription[] = [];
  public  player2:       firebase.User
  @Output() player2Move = new EventEmitter();

  constructor(private fbs: FierbaseService) {}

  get timestamp() {
    return Firebase.default.firestore.FieldValue.serverTimestamp();
  }

  get gameId() {
    return localStorage['chess-game-id'];
  }

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
      this.player2Move.emit(gameInfo);
    });
    this.subscriptions.push(subscription);
  }

  updateGameInfo(color_turn: boolean, threats_map: string[], oldInfo: GameInfo, deadTool: ToolInfo, gameStatus: string): void {
    let playerTime  = color_turn ? 'black_time' : 'white_time';
    let playerKills = color_turn ? 'white_dead_tools' : 'black_dead_tools';
    let updatedInfo = {
      color_turn,
      threats_map,
      moves:          oldInfo.moves + 1,
      tools_position: this.toolsPosition,
      last_date:      this.timestamp,
      game_time:      this.calcTimePass(oldInfo.game_time, oldInfo.last_date),
      [playerTime]:   this.calcTimePass(oldInfo[playerTime], oldInfo.last_date),
      [playerKills]:  deadTool ? [...oldInfo[playerKills], deadTool.tool] : oldInfo[playerKills],
      game_status:    gameStatus,
      chess_table:    document.querySelector('#chess-table').innerHTML
    }
    this.fbs.updateGameInfoByGameId(updatedInfo, this.gameId);
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
