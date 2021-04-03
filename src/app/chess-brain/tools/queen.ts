import { ToolInfo } from '../../interfaces/tool-interface';
import Tool from "./tool";

class Queen extends Tool {

  constructor(toolInfo: ToolInfo) {
    super(toolInfo);
  }

  /**
   * Calcs the optionals moves for the tool
   * @param check Function that checks the possible moves or the threth map and adds it to their prop
   */
  public calcPossibleMoves(check: (currentCell: string) => boolean | void): void {
    this.setIndex();
    this.threatsMap = [];
    this.possibleMoves = [];

    for(let i = 1; (i + this.index[0] < 8) && (i + this.index[1] < 8); i++)
      if(check(this.chessMatrix[this.index[0] + i][this.index[1] + i])) break;
    for(let i = 1; (this.index[0] - i >= 0) && (this.index[1] - i >= 0); i++)
      if(check(this.chessMatrix[this.index[0] - i][this.index[1] - i])) break;
    for(let i = 1; (i + this.index[0] < 8) && (this.index[1] - i >= 0); i++)
      if(check(this.chessMatrix[this.index[0] + i][this.index[1] - i])) break;
    for(let i = 1; (this.index[0] - i >= 0) && (i + this.index[1] < 8); i++)
      if(check(this.chessMatrix[this.index[0] - i][this.index[1] + i])) break;
    for(let i = 1; i + this.index[0] < 8; i++)
      if(check(this.chessMatrix[this.index[0] + i][this.index[1]])) break;
    for(let i = 1; i + this.index[1] < 8; i++)
      if(check(this.chessMatrix[this.index[0] ][this.index[1] + i])) break;
    for(let i = 1; this.index[0] - i >= 0; i++)
      if(check(this.chessMatrix[this.index[0] - i][this.index[1]])) break;
    for(let i = 1; this.index[1] - i >= 0; i++)
      if(check(this.chessMatrix[this.index[0]][this.index[1] - i])) break;
  }

  private setIndex() {this.chessMatrix.forEach((ar, i)=> ar.forEach((item, x) => (item == this.position)? this.index = [i, x]:''))}

}

export default Queen;
