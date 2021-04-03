import { ToolInfo } from '../../interfaces/tool-interface';
import Tool from "./tool";

class Pawn extends Tool {

  constructor(toolInfo: ToolInfo) {
    super(toolInfo);
  }

  /**
   * @returns Array contains all possible moves positions
   */
  public getPossibleMoves(): string[] {
    this.calcPossibleMovesStraight(this.checkToolColor());
    return this.possibleMoves;
  }

  /**
   * @returns Array contains all threatend positions
   */
  public getThreatsMap(): string[] {
    this.calcToolsToEat(this.checkToolColor(), (currentCell: string) => this.checkThreatsMap(currentCell));
    return this.threatsMap;
  }

  /**
   * Checks the color of the tool to set his move diraction
   * @returns 1 or -1 use for the direction by add it to the metrix index
   */
  private checkToolColor(): number {
    this.setIndex();
    this.threatsMap = [];
    this.possibleMoves = [];
    if(this.color) return 1;
    else return -1;
  }

  /**
   * Calcs the optionals straight moves for the pawn
   * @param direction 1 or -1 use for the direction by add it to the metrix index
   */
  private calcPossibleMovesStraight(direction: number): void {
    if(this.toolsPosition[this.position].isVirgin && !this.toolsPosition[this.chessMatrix[this.index[0]][this.index[1] + direction]])
      this.checkPossibleMoves(this.chessMatrix[this.index[0]][this.index[1] + direction + direction]);
    this.checkPossibleMoves(this.chessMatrix[this.index[0]][this.index[1] + direction]);
    this.calcToolsToEat(direction, (currentCell: string) => this.checkToolsToEat(currentCell));
  }

  /**
   * Calcs the slant moves for the pawn
   * @param direction 1 or -1 use for the direction by add it to the metrix index
   * @param check Function that checks the possible moves or the threth map and adds it to their prop
   */
  private calcToolsToEat(direction: number, check: (currentCell: string) => void): void {
    if(this.chessMatrix[this.index[0] + (direction * -1)])
      check(this.chessMatrix[this.index[0] + (direction * -1)][this.index[1] + direction]);
    if(this.chessMatrix[this.index[0] + direction])
      check(this.chessMatrix[this.index[0] + direction][this.index[1] + direction]);
  }

  /**
   * Checks if there is a rival tool in the provided position
   * @param currentCell String represents the position of the desire move
   */
  private checkToolsToEat(currentCell: string): void {
    if(this.toolsPosition[currentCell] && this.toolsPosition[currentCell].color != this.color) this.possibleMoves.push(currentCell);
  }

  /**
   * Checks the position of the cell if is empty
   * @param currentCell string represents the position of the desire move
   */
  public checkPossibleMoves(currentCell: string): void { if(!this.toolsPosition[currentCell]) this.possibleMoves.push(currentCell) }

  /**
   * Checks the position of the cell if exist
   * @param currentCell String represents the position of the desire move
   */
  public checkThreatsMap(currentCell: string) { if(currentCell) this.threatsMap.push(currentCell) }

  private setIndex() {this.chessMatrix.forEach((ar, i)=> ar.forEach((item, x) => (item == this.position)? this.index = [i, x]:''))}

}

export default Pawn;
