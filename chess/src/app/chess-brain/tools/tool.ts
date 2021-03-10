import { chessMatrix } from '../../data/tableArrays';
import { firstPosition } from '../../data/toolsPosition';
import { ToolInfo } from '../../interfaces/tool-interface';

class Tool {

  public color: boolean;
  public position: string;
  public isVirgin: boolean;
  public index: number[];
  public chessMatrix: Array<Array<string>> = chessMatrix;
  public toolsPosition: object = firstPosition;
  public thretsMap: string[] = [];
  public possibleMoves: string[] = [];

  constructor({ color, position, isVirgin }: ToolInfo){
    this.color    = color;
    this.position = position;
    this.isVirgin = isVirgin;
  }

  public getPossibleMoves(): string[] {
    this.calcPossibleMoves((currentCell: string) => this.checkPossibleMoves(currentCell));
    return this.possibleMoves;
  }

  public getThretsMap(): string[] {
    this.calcPossibleMoves((currentCell: string) => this.checkThretsMap(currentCell));
    return this.thretsMap;
  }

  public calcPossibleMoves(check: (currentCell: string) => boolean | void): void {}

  public checkPossibleMoves(currentCell: string): boolean | void {
    if(!this.toolsPosition[currentCell]) this.possibleMoves.push(currentCell);
    else if(this.toolsPosition[currentCell].color == this.color) return true;
    else if(currentCell) {
      this.possibleMoves.push(currentCell);
      return true;
    }
  }

  public checkThretsMap(currentCell: string): boolean | void {
    if(currentCell && !this.toolsPosition[currentCell]) this.thretsMap.push(currentCell);
    else if(currentCell) {
      this.thretsMap.push(currentCell);
      return true;
    }
  }
}

export default Tool;
