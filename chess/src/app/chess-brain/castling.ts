import { ToolInfo } from "../interfaces/tool-interface";
import KingGuard from "./kingGuard";

class Castling {

  constructor() {}

  static castlingManager(colorTurn: boolean, toolsPosition: object, toolsClasses: object,
    chessMatrix: Array<string[]>, possibleMoves: string[], castlingInfo): void {
    let row = (colorTurn)? 0: 7, col = 4;
    let rightRook  = toolsPosition[chessMatrix[0][row]];
    let leftRook   = toolsPosition[chessMatrix[7][row]];
    let rightCells = [chessMatrix[col - 1][row], chessMatrix[col - 2][row], chessMatrix[col - 3][row]];
    let leftCells  = [chessMatrix[col + 1][row], chessMatrix[col + 2][row]];

    if(this.checkIfCastlingAllowed(rightRook, rightCells, toolsClasses, toolsPosition ,colorTurn)) {
      castlingInfo.right = chessMatrix[col - 2][row];
      possibleMoves.push(chessMatrix[col - 2][row]);
    }
    if(this.checkIfCastlingAllowed(leftRook, leftCells, toolsClasses, toolsPosition ,colorTurn)) {
      castlingInfo.left = chessMatrix[col + 2][row];
      possibleMoves.push(chessMatrix[col + 2][row]);
    }
  }

  static checkIfCastlingAllowed(rook: ToolInfo | null, cells: string[], toolsClasses, toolsPosition ,colorTurn): boolean {
    if(!rook || rook.rank !== 'rook' || !rook.isVirgin) return false;
    for(let cell in cells) if(toolsPosition[cells[cell]]) return false;
    for(let tool in toolsClasses) {
      if(toolsClasses[tool].color === colorTurn) continue;
      let toolThrets = toolsClasses[tool].getThretsMap();
      if(toolThrets.includes(cells[0]) || toolThrets.includes(cells[1])) return false;
    } return true;
  }

  static castlingDirection(position: string, castlingInfo, colorTurn: boolean, chessMatrix: Array<string[]>,
    possibleMoves: string[], toolsPosition: object, toolsClasses: object, selectedTool: object, thretsMap: string[]): boolean {
    let row = (colorTurn)? 0: 7;
    if(position === castlingInfo.right) {
      castlingInfo.right = '';
      return this.doCastling(chessMatrix[4][row], chessMatrix[2][row], chessMatrix[0][row], chessMatrix[3][row],
        possibleMoves, toolsPosition, toolsClasses, selectedTool, colorTurn, thretsMap);
    } else if(position === castlingInfo.left) {
      castlingInfo.left = '';
      return this.doCastling(chessMatrix[4][row], chessMatrix[6][row], chessMatrix[7][row], chessMatrix[5][row],
        possibleMoves, toolsPosition, toolsClasses, selectedTool, colorTurn, thretsMap);
    }
  }

  static doCastling(kingBefore: string, kingAfter: string, rookBefore: string, rookAfter: string,
    possibleMoves, toolsPosition, toolsClasses, selectedTool, colorTurn, thretsMap): boolean {
    possibleMoves.splice(0, possibleMoves.length);
    this.updateDataCastling(kingBefore, kingAfter, toolsPosition, toolsClasses);
    this.updateDataCastling(rookBefore, rookAfter, toolsPosition, toolsClasses);
    delete toolsPosition[kingAfter].selected;
    selectedTool = null;
    colorTurn = !colorTurn;
    KingGuard.checkGameState(thretsMap, toolsClasses, colorTurn, toolsPosition);
    return colorTurn;
  }

  static updateDataCastling(before: string, after: string, toolsPosition: object, toolsClasses: object): void {
    toolsPosition[after] = toolsPosition[before];
    toolsClasses[after]  = toolsClasses[before];
    toolsPosition[after].position = after;
    toolsClasses[after].position  = after;
    delete toolsPosition[before];
    delete toolsClasses[before];
  }

}

export default Castling;
