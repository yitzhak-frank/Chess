import { ToolInfo } from '../../interfaces/tool-interface';
import Tool from "./tool";

class Pawn extends Tool {

  constructor(toolInfo: ToolInfo) {
    super(toolInfo);
  }

  public getPossibleMoves(): string[] {
    this.calcPossibleMovesStraight(this.checkToolColor());
    return this.possibleMoves;
  }

  public getThretsMap(): string[] {
    this.calcToolsToEat(this.checkToolColor(), (currentCell: string) => this.checkThretsMap(currentCell));
    return this.thretsMap;
  }

  private checkToolColor(): number {
    this.setIndex();
    this.thretsMap = [];
    this.possibleMoves = [];
    if(this.color) return 1;
    else return -1;
  }

  private calcPossibleMovesStraight(direction: number): void {
    if(this.toolsPosition[this.position].isVirgin && !this.toolsPosition[this.chessMatrix[this.index[0]][this.index[1] + direction]])
      this.checkPossibleMoves(this.chessMatrix[this.index[0]][this.index[1] + direction + direction]);
    this.checkPossibleMoves(this.chessMatrix[this.index[0]][this.index[1] + direction]);
    this.calcToolsToEat(direction, (currentCell: string) => this.checkToolsToEat(currentCell));
  }

  private calcToolsToEat(direction: number, check: (currentCell: string) => void): void {
    if(this.chessMatrix[this.index[0] + (direction * -1)])
      check(this.chessMatrix[this.index[0] + (direction * -1)][this.index[1] + direction]);
    if(this.chessMatrix[this.index[0] + direction])
      check(this.chessMatrix[this.index[0] + direction][this.index[1] + direction]);
  }

  private checkToolsToEat(currentCell: string): void {
    if(this.toolsPosition[currentCell] && this.toolsPosition[currentCell].color != this.color) this.possibleMoves.push(currentCell);
  }

  public checkPossibleMoves(currentCell: string): void { if(!this.toolsPosition[currentCell]) this.possibleMoves.push(currentCell) }

  public checkThretsMap(currentCell: string) { if(currentCell) this.thretsMap.push(currentCell) }

  private setIndex() {this.chessMatrix.forEach((ar, i)=> ar.forEach((item, x) => (item == this.position)? this.index = [i, x]:''))}

}

export default Pawn;
