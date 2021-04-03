import { Component, Input, OnInit } from '@angular/core';
import { take } from 'rxjs/operators';
import { url } from 'src/app/data/general';
import { Game, PlayerInfo } from 'src/app/interfaces/game-interfaces';
import { FierbaseService } from 'src/app/services/firebase.service';

@Component({
  selector: 'app-game-card',
  templateUrl: './game-card.component.html',
  styleUrls: ['./game-card.component.scss']
})
export class GameCardComponent implements OnInit {

  @Input() game: Game;
  @Input() uid: string;
  public gameInfo;
  public blackPlayerInfo: PlayerInfo;
  public whitePlayerInfo: PlayerInfo;
  public timeIndex: number;
  public link: string;

  constructor(private fbs: FierbaseService) {}

  setGameLink(): void {
    this.link = `${url}/chess?gameId=${this.game.id}uid=${this.uid}`
  }

  setTimeIndex(black: number, white: number): void {
    if(white === black) this.timeIndex = 0;
    else if(white < black) this.timeIndex = 1;
    else if(white > black) this.timeIndex = -1;
  }

  setGameInfo(time: number, moves: number, status: string, startDate, lastDate): void {
    this.gameInfo = {
      status,
      time: new Date(time * 1000).toUTCString().substring(17, 25),
      moves,
      startDate: startDate.toDate(),
      lastDate: lastDate.toDate()
    }
  }

  setPlayerInfo(field: string, name: string, image: string, time: number, deadTools: string[]): void {
    this[field] = {
      name,
      image,
      time: new Date(time * 1000).toUTCString().substring(17, 25),
      deadTools,
      score: this.calcScore(deadTools)
    }
  }

  calcScore(tools: string[]): number {
    let reader = {['♙♟']: 1, ['♘♗♞♝']: 3, ['♖♜']: 5, ['♕♛']: 9};
    let score: number = 0;
    let ranks: string[] = Object.keys(reader);
    for(let tool of tools) ranks.forEach(rank => rank.includes(tool) ? score += reader[rank]:null);
    return score;
  }

  ngOnInit(): void {
    let blackUser = JSON.parse(this.game.black_user);
    let whiteUser = JSON.parse(this.game.white_user);

    if(this.uid === blackUser.uid) blackUser.displayName = 'You';
    else if(this.uid === whiteUser.uid) whiteUser.displayName = 'You';

    this.fbs.getGameInfoByGameId(this.game.id).valueChanges().pipe(take(1)).subscribe(([gameInfo]) => {
      this.setTimeIndex(gameInfo['black_time'], gameInfo['white_time']);
      this.setGameInfo(gameInfo['game_time'], gameInfo['moves'], gameInfo['game_status'], gameInfo['start_date'], gameInfo['last_date']);
      this.setPlayerInfo('blackPlayerInfo', blackUser.displayName, blackUser.photoURL, gameInfo['black_time'], gameInfo['black_dead_tools'])
      this.setPlayerInfo('whitePlayerInfo', whiteUser.displayName, whiteUser.photoURL, gameInfo['white_time'], gameInfo['white_dead_tools'])
      if(gameInfo['game_status'].includes('Active')) this.setGameLink()
    });
  }
}
