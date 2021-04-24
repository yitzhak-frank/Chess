import { ToolInfo } from "../interfaces/tool-interface";
import Tool from "./tools/tool";

class KingGuard {

  constructor() {}

  /**
   * Checks if there is a tool that threatning on the king
   * @param toolsPosition Object contains all tools positions.
   * @param toolsClasses Object contains all tools classes.
   * @param selectedTool Object contains the info of the selected tool such as position color etc.
   * @param colorTurn Boolean represents the color, true = white and false = black.
   * @param possibleMoves Array contains all possible moves positions.
   * @param kingPos String with the position of the king.
   */
  static checkKingThrets(
    toolsPosition: object,
    toolsClasses:  object,
    selectedTool:  ToolInfo,
    colorTurn:     boolean,
    possibleMoves: string[],
    kingPos:       string
  ): void {

    let deletedTool  = toolsPosition[selectedTool.position];
    let deletedClass = toolsClasses[selectedTool.position];

    delete toolsPosition[selectedTool.position];
    delete toolsClasses[selectedTool.position];

    if(selectedTool.rank === 'king') this.getKingPossibleMoves(selectedTool, toolsClasses, possibleMoves, toolsPosition, colorTurn);
    else {
      for(let tool in toolsClasses) {
        if(toolsClasses[tool].color === colorTurn) continue;
        if(toolsClasses[tool].getThreatsMap().includes(kingPos))
          this.checkIfMoveHasThret(deletedTool, toolsClasses[tool], kingPos, possibleMoves, toolsPosition);
      }
    }
    toolsPosition[selectedTool.position] = deletedTool;
    toolsClasses[selectedTool.position]  = deletedClass;

    if(!possibleMoves.length) toolsPosition[selectedTool.position].selected = false;
  }

  /**
   *
   * @param toolsPosition Object contains all tools positions.
   * @param colorTurn Boolean represents the color, true = white and false = black.
   * @returns String with the position of the king.
   */
  static getKingPosition(toolsPosition, colorTurn: boolean) {
    for(let pos in toolsPosition)
      if(toolsPosition[pos].rank === 'king' && toolsPosition[pos].color === colorTurn) return pos;
  }

  /**
   *
   * @param king Object contains the info for the king, such as position color etc.
   * @param toolsClasses Object contains all tools classes.
   * @param possibleMoves Array contains all possible moves positions.
   * @param toolsPosition Object contains all tools positions.
   * @param colorTurn Boolean represents the color, true = white and false = black.
   */
  static getKingPossibleMoves(king: ToolInfo, toolsClasses, possibleMoves: string[], toolsPosition, colorTurn: boolean): void {
    for(let tool in toolsClasses) {
      if(toolsClasses[tool].color === colorTurn) continue;
      this.checkIfMoveHasThret(king, toolsClasses[tool], null, possibleMoves, toolsPosition);
    }
  }

  /**
   * Checks if moving the tool expose the king to threats.
   * @param defender Object contains the info for the king, such as position color etc.
   * @param attacker Class instance of the threatening tool.
   * @param king String contains the king position | null if the defender is the king.
   * @param possibleMoves Array contains all possible moves positions.
   * @param toolsPosition Object contains all tools positions.
   */
  static checkIfMoveHasThret(
    defender:      ToolInfo,
    attacker:      Tool,
    king:          string | null,
    possibleMoves: string[],
    toolsPosition: object
  ): void {

    let moves = [...possibleMoves];
    let newPosition, originalTool, kingPos;

    for(let move in possibleMoves) {
      // if selected tool is king do the chess check on his possible moves position
      kingPos = king || possibleMoves[move];
      newPosition = toolsPosition[possibleMoves[move]];
      // if attacker will be killed by moving the tool allow it
      if(newPosition?.position === attacker.position) continue;
      // if there is another tool in this position save it
      (newPosition)? originalTool = JSON.parse(JSON.stringify(newPosition)): originalTool = null;
      toolsPosition[possibleMoves[move]] = defender;
      if(attacker.getThreatsMap().includes(kingPos)) moves.splice(moves.indexOf(possibleMoves[move]), 1);
      (originalTool)? toolsPosition[possibleMoves[move]] = originalTool: delete toolsPosition[possibleMoves[move]];
    }
    possibleMoves.splice(0, possibleMoves.length);
    possibleMoves.push(...moves);
  }

  /**
   * Checks the game state if chessnate or stalemate.
   * @param ThreatsMap Array contains all threatened positions.
   * @param toolsClasses Object contains all tools classes.
   * @param colorTurn Boolean represents the color, true = white and false = black.
   * @param toolsPosition Object contains all tools positions.
   * @returns Call a function that check the state and returns string that describes the game state.
   */
  static checkGameState(ThreatsMap, toolsClasses, colorTurn, toolsPosition): string {
    let isChess = this.checkIfChess(ThreatsMap, toolsClasses, colorTurn, toolsPosition);
    if(isChess) {
      let kinsPos = isChess;
      let kingPossibleMoves = toolsClasses[kinsPos].getPossibleMoves();
      return this.checkChessmate(kinsPos, toolsPosition, toolsClasses, colorTurn, kingPossibleMoves);
    } else return this.checkStalemate(toolsPosition, toolsClasses, colorTurn);
  }

  /**
   *
   * @param threatsMap Array contains all threatened positions.
   * @param toolsClasses Object contains all tools classes.
   * @param colorTurn Boolean represents the color, true = white and false = black.
   * @param toolsPosition Object contains all tools positions.
   * @returns String with the king position if chess | undefind if not.
   */
  static checkIfChess(threatsMap: string[], toolsClasses: object, colorTurn: boolean, toolsPosition): string {
    let kingPos = this.getKingPosition(toolsPosition, colorTurn);
    let isChess: string;
    threatsMap.splice(0, threatsMap.length);
    for(let tool in toolsClasses) {
      if(colorTurn === toolsClasses[tool].color) continue;
      if(toolsClasses[tool].getThreatsMap().includes(kingPos)) isChess = kingPos;
      threatsMap.push(...toolsClasses[tool].getThreatsMap().filter(pos => !threatsMap.includes(pos)));
    }
    return isChess;
  }

  /**
   *
   * @param kingPos String with the position of the king.
   * @param toolsPosition Object contains all tools positions.
   * @param toolsClasses Object contains all tools classes.
   * @param colorTurn Boolean represents the color, true = white and false = black.
   * @param possibleMoves Array contains all possible moves positions.
   * @returns String that describes the game state.
   */
  static checkChessmate(
    kingPos:       string,
    toolsPosition: object,
    toolsClasses:  object,
    colorTurn:     boolean,
    possibleMoves: string[]
  ): string {

    this.getKingPossibleMoves(toolsPosition[kingPos], toolsClasses, possibleMoves, toolsPosition, colorTurn);
    if(possibleMoves.length) return 'Active game';
    if(this.checkIfOneOfTheToolsCanMove(toolsPosition, toolsClasses, colorTurn, kingPos)) return 'Active game';
    let winner = colorTurn ? 'Black' : 'White';
    return winner + ' Won';
  }

  /**
   *
   * @param toolsPosition Object contains all tools positions.
   * @param toolsClasses Object contains all tools classes.
   * @param colorTurn Boolean represents the color, true = white and false = black.
   * @returns String that describes the game state.
   */
  static checkStalemate(toolsPosition, toolsClasses, colorTurn: boolean): string {
    let kingPos = this.getKingPosition(toolsPosition, colorTurn);
    if(this.checkIfOneOfTheToolsCanMove(toolsPosition, toolsClasses, colorTurn, kingPos)) return 'Active game';
    return 'Stalemate';
  }

  /**
   *
   * @param toolsPosition Object contains all tools positions.
   * @param toolsClasses Object contains all tools classes.
   * @param colorTurn Boolean represents the color, true = white and false = black.
   * @param kingPos String with the position of the king.
   * @returns Boolean - true if there is a tool that can move and false if not.
   */
  static checkIfOneOfTheToolsCanMove(toolsPosition, toolsClasses, colorTurn: boolean, kingPos: string): boolean {
    for(let tool in toolsPosition) {
      if(toolsPosition[tool].color != colorTurn) continue;
      let currentTool = toolsPosition[tool];
      let toolPossibleMoves = toolsClasses[currentTool.position].getPossibleMoves();
      this.checkKingThrets(toolsPosition, toolsClasses, currentTool, colorTurn, toolPossibleMoves, kingPos);
      if(toolPossibleMoves.length) return true;
    }
    return false;
  }

}

export default KingGuard;
