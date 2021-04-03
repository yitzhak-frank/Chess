import { ToolInfo } from "../interfaces/tool-interface";
import KingGuard from "./kingGuard";

class Castling {

  constructor() {}

  /**
   *
   * @param colorTurn Boolean represents the color, true = white and false = black.
   * @param toolsPosition Object contains all tools positions.
   * @param toolsClasses Object contains all tools classes.
   * @param chessMatrix Matrix represents all table cells.
   * @param possibleMoves Array contains all possible moves positions.
   * @param castlingInfo Object contains the castling positions.
   */
  static castlingManager(
    colorTurn:     boolean,
    toolsPosition: object,
    toolsClasses:  object,
    chessMatrix:   Array<string[]>,
    possibleMoves: string[],
    castlingInfo:  object
  ): void {

    let row = (colorTurn)? 0: 7, col = 4;
    let rightRook  = toolsPosition[chessMatrix[0][row]];
    let leftRook   = toolsPosition[chessMatrix[7][row]];
    let rightCells = [chessMatrix[col - 1][row], chessMatrix[col - 2][row], chessMatrix[col - 3][row]];
    let leftCells  = [chessMatrix[col + 1][row], chessMatrix[col + 2][row]];

    if(this.checkIfCastlingAllowed(rightRook, rightCells, toolsClasses, toolsPosition ,colorTurn)) {
      castlingInfo['right'] = chessMatrix[col - 2][row];
      possibleMoves.push(chessMatrix[col - 2][row]);
    }
    if(this.checkIfCastlingAllowed(leftRook, leftCells, toolsClasses, toolsPosition ,colorTurn)) {
      castlingInfo['left'] = chessMatrix[col + 2][row];
      possibleMoves.push(chessMatrix[col + 2][row]);
    }
  }
  /**
   *
   * @param rook Object contains the info for the rook, such as position color etc.
   * @param cells Array contains the cells between the king and the rook.
   * @param toolsClasses Object contains all tools classes.
   * @param toolsPosition Object contains all tools positions.
   * @param colorTurn Boolean represents the color, true = white and false = black.
   * @returns Boolean - true = castling allowed and false = castling not allowed
   */
  static checkIfCastlingAllowed(rook: ToolInfo | null, cells: string[], toolsClasses, toolsPosition ,colorTurn): boolean {
    if(!rook || rook.rank !== 'rook' || !rook.isVirgin) return false;
    for(let cell in cells) if(toolsPosition[cells[cell]]) return false;
    for(let tool in toolsClasses) {
      if(toolsClasses[tool].color === colorTurn) continue;
      let toolThrets = toolsClasses[tool].getThreatsMap();
      if(toolThrets.includes(cells[0]) || toolThrets.includes(cells[1])) return false;
    } return true;
  }

  /**
   *
   * @param position String with the position of the king castling move.
   * @param castlingInfo Object contains the castling positions.
   * @param colorTurn Boolean represents the color, true = white and false = black.
   * @param chessMatrix Matrix represents all table cells.
   * @param possibleMoves Array contains all possible moves positions.
   * @param toolsPosition Object contains all tools positions.
   * @param toolsClasses Object contains all tool classes.
   * @param selectedTool Object contains the info of the selected tool such as position color etc.
   * @param threatsMap Array contains all threatened positions.
   * @returns Call a function that do the castling and returns boolean for color turn.
   */
  static castlingDirection(
    position:      string,
    castlingInfo:  object,
    colorTurn:     boolean,
    chessMatrix:   Array<string[]>,
    possibleMoves: string[],
    toolsPosition: object,
    toolsClasses:  object,
    selectedTool:  ToolInfo,
    threatsMap:    string[]
  ): boolean {

    let row = (colorTurn)? 0: 7;
    if(position === castlingInfo['right']) {
      castlingInfo['right'] = '';
      return this.doCastling(chessMatrix[4][row], chessMatrix[2][row], chessMatrix[0][row], chessMatrix[3][row],
        possibleMoves, toolsPosition, toolsClasses, selectedTool, colorTurn, threatsMap);
    } else if(position === castlingInfo['left']) {
      castlingInfo['left'] = '';
      return this.doCastling(chessMatrix[4][row], chessMatrix[6][row], chessMatrix[7][row], chessMatrix[5][row],
        possibleMoves, toolsPosition, toolsClasses, selectedTool, colorTurn, threatsMap);
    }
  }

  /**
   *
   * @param kingBefore String with the position of the king before the castling.
   * @param kingAfter String with the position of the king after the castling.
   * @param rookBefore String with the position of the rook before the castling
   * @param rookAfter String with the position of the rook after the castling
   * @param possibleMoves Array contains all possible moves positions.
   * @param toolsPosition Object contains all tools positions.
   * @param toolsClasses Object contains all tool classes.
   * @param selectedTool Object contains the info of the selected tool such as position color etc.
   * @param colorTurn Boolean represents the color, true = white and false = black.
   * @param threatsMap Array contains all threatened positions.
   * @returns boolean - represents the color turn
   */
  static doCastling(
    kingBefore:    string,
    kingAfter:     string,
    rookBefore:    string,
    rookAfter:     string,
    possibleMoves: string[],
    toolsPosition: object,
    toolsClasses:  object,
    selectedTool:  ToolInfo,
    colorTurn:     boolean,
    threatsMap:     string[]
  ): boolean {

    possibleMoves.splice(0, possibleMoves.length);
    this.updateDataCastling(kingBefore, kingAfter, toolsPosition, toolsClasses);
    this.updateDataCastling(rookBefore, rookAfter, toolsPosition, toolsClasses);
    delete toolsPosition[kingAfter].selected;
    selectedTool = null;
    colorTurn = !colorTurn;
    KingGuard.checkGameState(threatsMap, toolsClasses, colorTurn, toolsPosition);
    return colorTurn;
  }

  /**
   *
   * @param before String with the tool position before the castling.
   * @param afterString with the tool position after the castling.
   * @param toolsPosition Object contains all tools positions.
   * @param toolsClasses Object contains all tool classes.
   */
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
