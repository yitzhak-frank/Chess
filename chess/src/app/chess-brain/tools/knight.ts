import { ToolInfo } from '../../interfaces/tool-interface';
import Tool from "./tool";

class Knight extends Tool {

  constructor(toolInfo: ToolInfo) {
    super(toolInfo);
  }

  public calcPossibleMoves(check: (currentCell: string) => void): void {
    this.setIndex();
    this.thretsMap = [];
    this.possibleMoves = [];
    if(this.chessMatrix[this.index[0] + 1]) check(this.chessMatrix[this.index[0] + 1][this.index[1] + 2]);
    if(this.chessMatrix[this.index[0] + 1]) check(this.chessMatrix[this.index[0] + 1][this.index[1] - 2]);
    if(this.chessMatrix[this.index[0] - 1]) check(this.chessMatrix[this.index[0] - 1][this.index[1] + 2]);
    if(this.chessMatrix[this.index[0] - 1]) check(this.chessMatrix[this.index[0] - 1][this.index[1] - 2]);
    if(this.chessMatrix[this.index[0] + 2]) check(this.chessMatrix[this.index[0] + 2][this.index[1] + 1]);
    if(this.chessMatrix[this.index[0] + 2]) check(this.chessMatrix[this.index[0] + 2][this.index[1] - 1]);
    if(this.chessMatrix[this.index[0] - 2]) check(this.chessMatrix[this.index[0] - 2][this.index[1] + 1]);
    if(this.chessMatrix[this.index[0] - 2]) check(this.chessMatrix[this.index[0] - 2][this.index[1] - 1]);
  }

  public checkPossibleMoves(currentCell: string): void {
    if(this.toolsPosition[currentCell] && this.toolsPosition[currentCell].color == this.color) return;
    else if(currentCell) this.possibleMoves.push(currentCell);
  }

  public checkThretsMap(currentCell: string): void {
    if(currentCell && !this.toolsPosition[currentCell]) this.thretsMap.push(currentCell);
    else if(currentCell) this.thretsMap.push(currentCell);
  }

  private setIndex() {this.chessMatrix.forEach((ar, i)=> ar.forEach((item, x) => (item == this.position)? this.index = [i, x]:''))}

}

export default Knight;
