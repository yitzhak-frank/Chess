import { chessMatrix } from '../../data/tableArrays';
import { firstPosition } from '../../data/toolsPosition';
import { ToolInfo } from '../../interfaces/tool-interface';

class Tool {

  public color:         boolean;
  public position:      string;
  public isVirgin:      boolean;
  public index:         number[];
  public chessMatrix:   Array<Array<string>> = chessMatrix;
  public toolsPosition: object = firstPosition;
  public threatsMap:    string[] = [];
  public possibleMoves: string[] = [];

  constructor({ color, position, isVirgin }: ToolInfo){
    this.color    = color;
    this.position = position;
    this.isVirgin = isVirgin;
  }

  /**
   * @returns Array contains all possible moves positions
   */
  public getPossibleMoves(): string[] {
    this.calcPossibleMoves((currentCell: string) => this.checkPossibleMoves(currentCell));
    return this.possibleMoves;
  }

  /**
   * @returns Array contains all threatend positions
   */
  public getThreatsMap(): string[] {
    this.calcPossibleMoves((currentCell: string) => this.checkThreatsMap(currentCell));
    return this.threatsMap;
  }

  public calcPossibleMoves(check: (currentCell: string) => boolean | void): void {}

  /**
  * Checks the position of the cell if exist and is empty from friendly tools
  * @param currentCell String represents the position of the desire move
  * @returns void | boolean - true for stop moving forward if there is a tool there
  */
  public checkPossibleMoves(currentCell: string): boolean | void {
    if(!this.toolsPosition[currentCell]) this.possibleMoves.push(currentCell);
    else if(this.toolsPosition[currentCell].color == this.color) return true;
    else if(currentCell) {
      this.possibleMoves.push(currentCell);
      return true;
    }
  }

  /**
   * Checks the position of the cell if exist
   * @param currentCell String represents the position of the desire move
   * @returns void | boolean - true for stop moving forward if there is a tool there
   */
  public checkThreatsMap(currentCell: string): boolean | void {
    if(currentCell && !this.toolsPosition[currentCell]) this.threatsMap.push(currentCell);
    else if(currentCell) {
      this.threatsMap.push(currentCell);
      return true;
    }
  }
}

export default Tool;
