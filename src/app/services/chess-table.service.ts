import { Injectable, OnDestroy, OnInit } from '@angular/core';
import { firstPosition } from '../data/toolsPosition';
import { Subscription } from 'rxjs';
import { GameService } from './game.service';
import { chessMatrix } from '../data/tableArrays';
import { GameInfo } from '../interfaces/game-interfaces';
import { ToolInfo } from '../interfaces/tool-interface';
import ToolsFactory from '../chess-brain/toolsFactory';
import KingGuard from '../chess-brain/kingGuard';
import Castling from '../chess-brain/castling';

@Injectable({
  providedIn: 'root'
})
export class ChessTableService implements OnInit, OnDestroy {

  private chessMatrix:      Array<Array<string>> = chessMatrix;
  private toolsPosition:    object   = firstPosition;
  private toolsClasses:     object   = {};
  private playerColor:      boolean[];
  public  colorTurn:        boolean  = true;
  private selectedTool:     ToolInfo;
  public  possibleMoves:    string[] = [];
  private threatsMap:       string[] = [];
  private edgeRowsPositins: string[] = [];
  public  coronationInfo:   object;
  private subscriptions:    Subscription[] = [];
  public  gameInfo:         GameInfo;
  private deadTool:         ToolInfo;
  public  gameStatus:       string;
  public  castlingInfo = { right: '', left: '' };
  public  isChess = { position: '', color: false };

  constructor(private GameService: GameService) {
    this.getGameData();
  }

  getGameData() {
    let {toolsPosition, toolsClasses, GameService, subscriptions, threatsMap, isChess} = this;
    let subscription = GameService.player2Move.subscribe((gameInfo) => {
      let {tools_position, threats_map, color_turn} = gameInfo;

      for(let tool in toolsPosition)  delete toolsPosition[tool];
      for(let tool in toolsClasses)   if(!toolsPosition[tool]) delete toolsClasses[tool];
      for(let tool in tools_position) toolsPosition[tool] = tools_position[tool];
      for(let tool in toolsPosition)  if(!toolsClasses[tool]) toolsClasses[tool] = new ToolsFactory(toolsPosition[tool]).class;

      this.colorTurn = color_turn;

      threatsMap.splice(0, threatsMap.length);
      threatsMap.push(...threats_map);

      isChess['position'] = KingGuard.checkIfChess(threatsMap, toolsClasses, this.colorTurn, toolsPosition);
      isChess['color']    = this.colorTurn;

      KingGuard.checkGameState(threatsMap, toolsClasses, this.colorTurn, toolsPosition);
      this.gameInfo = gameInfo;

      this.GameService.setTimeCounters(gameInfo);
      this.GameService.setDeadTools(gameInfo);
    });
    subscriptions.push(subscription);
  }

  public onTableLoad(playerColor: boolean[]): void {
    this.playerColor = playerColor;
    this.setEdgeRowsPositions();
    for(let tool in this.toolsPosition) this.toolsClasses[tool] = new ToolsFactory(this.toolsPosition[tool]).class;
  }

  public emptyCellOnClick(position: string): void {
    let { castlingInfo, colorTurn, chessMatrix, possibleMoves, toolsPosition, toolsClasses, selectedTool, threatsMap } = this
    if(position === castlingInfo.right || position === castlingInfo.left) {
      this.colorTurn = Castling.castlingDirection(
        position, castlingInfo, colorTurn, chessMatrix, possibleMoves, toolsPosition, toolsClasses, selectedTool, threatsMap
      );
      this.updateGameInfo();
    } else if(selectedTool) this.moveTool(position);
  }

  public toolOnClick(toolInfo: ToolInfo): void {
    if((toolInfo.color != this.colorTurn || toolInfo.color != this.playerColor[0]) && !this.selectedTool) return;
    if(this.selectedTool && this.selectedTool.color != toolInfo.color) {
      this.moveTool(toolInfo.position);
    } else this.selectTool(toolInfo);
  }

  private selectTool(toolInfo: ToolInfo): void {
    let { possibleMoves, toolsClasses, toolsPosition, selectedTool, threatsMap, castlingInfo ,colorTurn } = this;
    possibleMoves.splice(0, possibleMoves.length);
    possibleMoves.push(...toolsClasses[toolInfo.position].getPossibleMoves());

    if(selectedTool) toolsPosition[selectedTool.position].selected  = false;
    if(possibleMoves.length) toolsPosition[toolInfo.position].selected   = true;

    this.selectedTool = toolInfo;

    let kingPos = toolInfo.rank != 'king'? KingGuard.getKingPosition(this.toolsPosition, this.colorTurn): toolInfo.position;
    KingGuard.checkKingThrets(toolsPosition, toolsClasses, this.selectedTool, colorTurn, possibleMoves, kingPos);

    if(toolInfo.rank == 'king' && !threatsMap.includes(toolInfo.position) && toolInfo.isVirgin)
      Castling.castlingManager(colorTurn, toolsPosition, toolsClasses, chessMatrix, possibleMoves, castlingInfo);
  }

  private moveTool(position: string): void {
    let {possibleMoves, toolsPosition, toolsClasses} = this;
    if(!possibleMoves.includes(position)) return this.notAllowedMove();

    possibleMoves.splice(0, possibleMoves.length);
    this.deadTool = toolsPosition[position] ? JSON.parse(JSON.stringify(toolsPosition[position])): null

    this.updateDataToolMoved(toolsPosition, position);
    this.updateDataToolMoved(toolsClasses, position);

    toolsClasses[position].position  = position;
    toolsPosition[position].position = position;

    if(this.isCrowned(position)) this.coronationInfo = { position, color: this.colorTurn };
    else this.updateGameInfo(!this.colorTurn);

    delete toolsPosition[position].selected;
    delete this.selectedTool;

    this.colorTurn = !this.colorTurn;
  }

  public updateGameInfo(colorTurn: boolean = this.colorTurn): void {
    let {threatsMap, gameInfo, deadTool, toolsClasses, toolsPosition} = this;
    this.gameStatus = KingGuard.checkGameState(threatsMap, toolsClasses, this.colorTurn, toolsPosition);
    this.GameService.updateGameInfo(colorTurn, threatsMap, gameInfo, deadTool, this.gameStatus);
  }

  private updateDataToolMoved(data: object, position: string): void {
    data[position] = data[this.selectedTool.position];
    data[position].isVirgin = false;
    delete data[this.selectedTool.position];
  }

  private notAllowedMove(): void {
    this.possibleMoves.splice(0, this.possibleMoves.length);
    this.toolsPosition[this.selectedTool.position].selected = false;
    delete this.selectedTool;
  }

  public coronation(tool: ToolInfo): void {
    this.toolsPosition[tool.position] = tool;
    this.toolsClasses[tool.position]  = new ToolsFactory(tool).class;
    this.coronationInfo = {};
    this.selectedTool = null;
  }

  private isCrowned(position: string): boolean {
    return this.selectedTool.rank === 'pawn' && this.edgeRowsPositins.includes(position);
  }

  private setEdgeRowsPositions(): void {
    this.chessMatrix.map(ar => this.edgeRowsPositins.push(...ar.filter((item, i) => i == 0 || i == 7)));
  }

  public getColorTurn(): boolean { return this.colorTurn }

  public getCoronationInfo(): object { return this.coronationInfo }


  ngOnInit(): void {}

  ngOnDestroy(): void {
    this.subscriptions.forEach(subscription => subscription.unsubscribe());
  }
}
