import { Game, GameInfo, PlayerInfo } from '../../interfaces/game-interfaces';
import { Component, OnInit } from '@angular/core';
import { FierbaseService } from 'src/app/services/firebase.service';
import { ActivatedRoute, Router } from '@angular/router';
import { take } from 'rxjs/operators';
import { AuthService } from 'src/app/services/auth.service';
import { ConnectionService } from 'src/app/services/connection.service';
import { url } from 'src/app/data/general';

@Component({
  selector: 'app-game-details',
  templateUrl: './game-details.component.html',
  styleUrls: ['./game-details.component.scss']
})
export class GameDetailsComponent implements OnInit {

  private game: Game;
  private params;
  public  timeIndex: number;
  public  gameInfo;
  public  whitePlayerInfo: PlayerInfo;
  public  blackPlayerInfo: PlayerInfo;
  public  link: string;
  public  copyTooltip: boolean;
  private player2uid: string;
  public  gameStatus: string;

  constructor(
    private fbs: FierbaseService,
    private Route: ActivatedRoute,
    private Router: Router,
    private Auth: AuthService,
    private Connection: ConnectionService
  ) {}

  get gameId() {
    return localStorage['chess-game-id'];
  }

  setGameId(gameId: string): void {
    localStorage['chess-game-id'] = gameId;
  }

  setTimeIndex(black: number, white: number): void {
    if(white === black) this.timeIndex = 0;
    else if(white < black) this.timeIndex = 1;
    else if(white > black) this.timeIndex = -1;
  }

  setGameInfo(
    time:       number,
    moves:      number,
    status:     string,
    startDate:  firebase.default.firestore.Timestamp,
    lastDate:   firebase.default.firestore.Timestamp,
    chessTable: string
  ): void {
    this.gameInfo = {
      status,
      time: new Date(time * 1000).toUTCString().substring(17, 25),
      moves,
      startDate: startDate.toDate(),
      lastDate: lastDate.toDate(),
      chessTable
    }
  }

  setPlayerInfo(field: string, name: string, image: string, time: number, deadTools: string[]): void {
    this[field] = {
      name,
      image,
      time: new Date(time * 1000).toUTCString().substring(17, 25),
      deadTools
    }
  }

  createGameLink(): void {
    this.setGameId(this.params.gameId);
    this.link = `${url}/chess?gameId=${this.gameId}&uid=${this.player2uid}`
  }

  deleteGameLink(): void {
    this.link = '';
  }

  connectToGame(): void {
    this.createGameLink();
    this.Connection.startListening(this.params.uid);
    this.Connection.connectToGame(this.params.uid);
  }

  disconnectFromGame(): void {
    this.deleteGameLink();
    this.Connection.disconnectFromGame(this.params.uid);
  }

  ngOnInit(): void {
    this.params = this.Route.snapshot.queryParams;
    if(!this.params.gameId || !this.params.uid) {
      this.Router.navigate(['/home']);
      return;
    }
    this.fbs.getGameById(this.params.gameId).pipe(take(1)).toPromise().then(game => this.game = game).then(() => {
      if(this.game['black_uid'] !== this.params.uid && this.game['white_uid'] !== this.params.uid)
        return this.Router.navigate(['/home']);

      this.player2uid = this.game['black_uid'] === this.params.uid ? this.game['white_uid'] : this.game['black_uid'];

      let whiteUser = JSON.parse(this.game.white_user);
      let blackUser = JSON.parse(this.game.black_user);

      this.fbs.getGameInfoByGameId(this.game.id).valueChanges().pipe(take(1)).subscribe(([gameInfo]: GameInfo[]) => {
        let {
          game_time, moves, game_status, start_date, last_date, chess_table ,black_time, white_time, black_dead_tools, white_dead_tools
        } = gameInfo;
        this.gameStatus = game_status;
        this.setTimeIndex(black_time, white_time);
        this.setGameInfo(game_time, moves, game_status, start_date, last_date, chess_table);
        this.setPlayerInfo('blackPlayerInfo', blackUser.displayName, blackUser.photoURL, black_time, black_dead_tools);
        this.setPlayerInfo('whitePlayerInfo', whiteUser.displayName, whiteUser.photoURL, white_time, white_dead_tools);
      });
    });
    this.Connection.startListening(this.params.uid);
  }

}
