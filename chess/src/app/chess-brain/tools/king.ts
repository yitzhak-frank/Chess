import { ToolInfo } from '../../interfaces/tool-interface';
import Tool from "./tool";

class King extends Tool {

  constructor(toolInfo: ToolInfo) {
    super(toolInfo);
  }

  /**
   * Calcs the optionals moves for the tool
   * @param check Function that checks the possible moves or the threth map and adds it to their prop
   */
  public calcPossibleMoves(check: (currentCell: string) => void): void {
    this.setIndex();
    this.threatsMap = [];
    this.possibleMoves = [];

    check(this.chessMatrix[this.index[0]][this.index[1] + 1]);
    check(this.chessMatrix[this.index[0]][this.index[1] - 1]);

    if(this.chessMatrix[this.index[0] + 1]) {
      check(this.chessMatrix[this.index[0] + 1][this.index[1]]);
      check(this.chessMatrix[this.index[0] + 1][this.index[1] + 1]);
      check(this.chessMatrix[this.index[0] + 1][this.index[1] - 1]);
    }
    if(this.chessMatrix[this.index[0] - 1]) {
      check(this.chessMatrix[this.index[0] - 1][this.index[1]]);
      check(this.chessMatrix[this.index[0] - 1][this.index[1] + 1]);
      check(this.chessMatrix[this.index[0] - 1][this.index[1] - 1]);
    }
  }

  /**
   * Checks the position of the cell if exist and is empty from friendly tools
   * @param currentCell String represents the position of the desire move
   * @returns void
   */
  public checkPossibleMoves(currentCell: string): void {
    if(this.toolsPosition[currentCell] && this.toolsPosition[currentCell].color == this.color) return;
    else if(currentCell) this.possibleMoves.push(currentCell);
  }

  /**
   * Checks the position of the cell if exist
   * @param currentCell String represents the position of the desire move
   */
  public checkThreatsMap(currentCell: string): void {
    if(currentCell && !this.toolsPosition[currentCell]) this.threatsMap.push(currentCell);
    else if(currentCell) this.threatsMap.push(currentCell);
  }

  private setIndex() {this.chessMatrix.forEach((ar, i)=> ar.forEach((item, x) => (item == this.position)? this.index = [i, x]:''))}

}

export default King;
