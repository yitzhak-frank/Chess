import { firstPosition } from '../data/toolsPosition';
import { chessMatrix } from '../data/tableArrays';
import { Injectable } from '@angular/core';
import { ToolInfo } from '../interfaces/tool-interface';
import ToolsFactory from '../chess-brain/toolsFactory';
import KingGuard from '../chess-brain/kingGuard';
import Castling from '../chess-brain/castling';

@Injectable({
  providedIn: 'root'
})
export class ChessTableService {

  private chessMatrix:      Array<Array<string>> = chessMatrix;
  private toolsPosition:    object   = firstPosition;
  private toolsClasses:     object   = {};
  public  colorTurn:        boolean  = true;
  private selectedTool:     ToolInfo;
  public  possibleMoves:    string[] = [];
  public  thretsMap:        string[] = [];
  private edgeRowsPositins: string[] = [];
  public  castlingInfo:     any = { right: '', left: '' };
  public  coronationInfo:   object;

  constructor() {}

  public onTableLoad(): void {
    this.setEdgeRowsPositions();
    for(let tool in this.toolsPosition) this.toolsClasses[tool] = new ToolsFactory(this.toolsPosition[tool]).class;
  }

  public emptyCellOnClick(position: string): void {
    let { castlingInfo, colorTurn, chessMatrix, possibleMoves, toolsPosition, toolsClasses, selectedTool, thretsMap } = this
    if(position === castlingInfo.right || position === castlingInfo.left) this.colorTurn = Castling.castlingDirection(position, castlingInfo, colorTurn, chessMatrix, possibleMoves, toolsPosition, toolsClasses, selectedTool, thretsMap);
    else if(selectedTool) this.moveTool(position);
  }

  public toolOnClick(toolInfo: ToolInfo): void {
    if(toolInfo.color != this.colorTurn && !this.selectedTool) return;
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

    delete this.toolsPosition[position].selected;
    delete this.selectedTool;

    this.colorTurn = !this.colorTurn;
    KingGuard.checkGameState(this.thretsMap, this.toolsClasses, this.colorTurn, this.toolsPosition);
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
    KingGuard.checkIfChess(this.thretsMap, this.toolsClasses, this.colorTurn, this.toolsPosition);
  }

  private isCrowned(position: string): boolean {
    return this.selectedTool.rank === 'pawn' && this.edgeRowsPositins.includes(position);
  }

  private setEdgeRowsPositions() {
    this.chessMatrix.map(ar => this.edgeRowsPositins.push(...ar.filter((item, i) => i == 0 || i == 7)));
  }

  public getColorTurn(): boolean { return this.colorTurn }

  public getCoronationInfo(): object { return this.coronationInfo }
}
