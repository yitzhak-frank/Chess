import { Injectable, OnDestroy, OnInit } from '@angular/core';
import { firstPosition } from '../data/toolsPosition';
import { Subscription } from 'rxjs';
import { GameService } from './game.service';
import { chessMatrix } from '../data/tableArrays';
import { ToolInfo } from '../interfaces/tool-interface';
import ToolsFactory from '../chess-brain/toolsFactory';
import KingGuard from '../chess-brain/kingGuard';
import Castling from '../chess-brain/castling';
import { GameInfo } from '../interfaces/game-interfaces';

@Injectable({
  providedIn: 'root'
})
export class ChessTableService implements OnInit, OnDestroy {

  private chessMatrix:      Array<Array<string>> = chessMatrix;
  private toolsPosition:    object   = firstPosition;
  private toolsClasses:     object   = {};
  private playerColor:      boolean;
  public  colorTurn:        boolean  = true;
  private selectedTool:     ToolInfo;
  public  possibleMoves:    string[] = [];
  private thretsMap:        string[] = [];
  private edgeRowsPositins: string[] = [];
  public  castlingInfo:     any = { right: '', left: '' };
  public  coronationInfo:   object;
  private subscriptions:    Subscription[] = [];
  public  isChess:          object = {position: '', color: false};
  private moves:            number = 0;
  public  gameInfo:         GameInfo;

  constructor(private GameService: GameService) {
    this.getGameData();
  }

  getGameData() {
    let {toolsPosition, toolsClasses, GameService, subscriptions, thretsMap, isChess} = this;
    let subscription = GameService.player2.subscribe((gameInfo) => {
      let {tools_position, threts_map, color_turn, moves} = gameInfo;

      for(let tool in toolsPosition) delete toolsPosition[tool];
      for(let tool in toolsClasses) if(!toolsPosition[tool]) delete toolsClasses[tool];
      for(let tool in tools_position) toolsPosition[tool] = tools_position[tool];
      for(let tool in toolsPosition) if(!toolsClasses[tool]) toolsClasses[tool] = new ToolsFactory(toolsPosition[tool]).class;

      this.colorTurn = color_turn;
      this.moves     = moves;

      thretsMap.splice(0, thretsMap.length);
      thretsMap.push(...threts_map);

      isChess['position'] = KingGuard.checkIfChess(thretsMap, toolsClasses, this.colorTurn, toolsPosition);
      isChess['color']    = this.colorTurn;

      KingGuard.checkGameState(thretsMap, toolsClasses, this.colorTurn, toolsPosition);
      this.gameInfo = gameInfo;
    });
    subscriptions.push(subscription);
  }

  public onTableLoad(playerColor: boolean): void {
    this.playerColor = playerColor;
    this.setEdgeRowsPositions();
    for(let tool in this.toolsPosition) this.toolsClasses[tool] = new ToolsFactory(this.toolsPosition[tool]).class;
  }

  public emptyCellOnClick(position: string): void {
    let { castlingInfo, colorTurn, chessMatrix, possibleMoves, toolsPosition, toolsClasses, selectedTool, thretsMap } = this
    if(position === castlingInfo.right || position === castlingInfo.left) {
      this.colorTurn = Castling.castlingDirection(
        position, castlingInfo, colorTurn, chessMatrix, possibleMoves, toolsPosition, toolsClasses, selectedTool, thretsMap
      );
      this.updateGameInfo();
    } else if(selectedTool) this.moveTool(position);
  }

  public toolOnClick(toolInfo: ToolInfo): void {
    if((toolInfo.color != this.colorTurn || toolInfo.color != this.playerColor) && !this.selectedTool) return;
    if(this.selectedTool && this.selectedTool.color != toolInfo.color) {
      this.moveTool(toolInfo.position);
    } else this.selectTool(toolInfo);
  }

  private selectTool(toolInfo: ToolInfo): void {
    let { possibleMoves, toolsClasses, toolsPosition, selectedTool, thretsMap, castlingInfo ,colorTurn } = this;
    possibleMoves.splice(0, possibleMoves.length);
    possibleMoves.push(...toolsClasses[toolInfo.position].getPossibleMoves());

    if(selectedTool) toolsPosition[selectedTool.position].selected  = false;
    if(possibleMoves.length) toolsPosition[toolInfo.position].selected   = true;

    this.selectedTool = toolInfo;

    let kingPos = toolInfo.rank != 'king'? KingGuard.getKingPosition(this.toolsPosition, this.colorTurn): toolInfo.position;
    KingGuard.checkKingThrets(toolsPosition, toolsClasses, this.selectedTool, colorTurn, possibleMoves, kingPos);

    if(toolInfo.rank == 'king' && !thretsMap.includes(toolInfo.position) && toolInfo.isVirgin)
      Castling.castlingManager(colorTurn, toolsPosition, toolsClasses, chessMatrix, possibleMoves, castlingInfo);
  }

  private moveTool(position: string): void {
    if(!this.possibleMoves.includes(position)) return this.notAllowedMove();
    this.possibleMoves.splice(0, this.possibleMoves.length);

    this.updateDataToolMoved(this.toolsPosition, position);
    this.updateDataToolMoved(this.toolsClasses, position);

    this.toolsClasses[position].position  = position;
    this.toolsPosition[position].position = position;

    if(this.isCrowned(position)) this.coronationInfo = { position, color: this.colorTurn };
    else this.updateGameInfo(!this.colorTurn);

    delete this.toolsPosition[position].selected;
    delete this.selectedTool;

    this.colorTurn = !this.colorTurn;
  }

  public updateGameInfo(colorTurn: boolean = this.colorTurn): void {
    this.GameService.updateGameInfo(colorTurn, this.thretsMap, this.moves + 1);
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
