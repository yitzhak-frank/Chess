import { ToolInfo } from "../interfaces/tool-interface";
import Tool from "./tools/tool";

class KingGuard {

  constructor() {}

  static checkKingThrets(toolsPosition: object, toolsClasses: object, selectedTool: ToolInfo, colorTurn: boolean, possibleMoves: string[], kingPos: string): void {
    let deletedTool  = toolsPosition[selectedTool.position];
    let deletedClass = toolsClasses[selectedTool.position];

    delete toolsPosition[selectedTool.position];
    delete toolsClasses[selectedTool.position];

    if(selectedTool.rank === 'king') this.getKingPossibleMoves(selectedTool, toolsClasses, possibleMoves, toolsPosition, colorTurn);
    else {
      for(let tool in toolsClasses) {
        if(toolsClasses[tool].color === colorTurn) continue;
        if(toolsClasses[tool].getThretsMap().includes(kingPos))
          this.checkIfMoveHasThret(deletedTool, toolsClasses[tool], kingPos, possibleMoves, toolsPosition);
      }
    }
    toolsPosition[selectedTool.position] = deletedTool;
    toolsClasses[selectedTool.position]  = deletedClass;

    if(!possibleMoves.length) toolsPosition[selectedTool.position].selected = false;
  }

  static getKingPosition(toolsPosition, colorTurn: boolean) {
    for(let pos in toolsPosition)
      if(toolsPosition[pos].rank === 'king' && toolsPosition[pos].color === colorTurn) return pos;
  }

  static getKingPossibleMoves(king: ToolInfo, toolsClasses, possibleMoves: string[], toolsPosition, colorTurn: boolean): void {
    for(let tool in toolsClasses) {
      if(toolsClasses[tool].color === colorTurn) continue;
      this.checkIfMoveHasThret(king, toolsClasses[tool], null, possibleMoves, toolsPosition);
    }
  }

  // check if moving the tool expose the king to threts
  static checkIfMoveHasThret(defender: ToolInfo, attacker: Tool, king: string | null,
    possibleMoves: string[], toolsPosition: object): void {
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
      if(attacker.getThretsMap().includes(kingPos)) moves.splice(moves.indexOf(possibleMoves[move]), 1);
      (originalTool)? toolsPosition[possibleMoves[move]] = originalTool: delete toolsPosition[possibleMoves[move]];
    }
    possibleMoves.splice(0, possibleMoves.length);
    possibleMoves.push(...moves);
  }

  static checkGameState(thretsMap, toolsClasses, colorTurn, toolsPosition): void {
    let isChess = this.checkIfChess(thretsMap, toolsClasses, colorTurn, toolsPosition);
    if(isChess) {
      let kinsPos = isChess;
      let kingPossibleMoves = toolsClasses[kinsPos].getPossibleMoves();
      this.checkChessmate(kinsPos, toolsPosition, toolsClasses, colorTurn, kingPossibleMoves);
    } else this.checkStalemate(toolsPosition, toolsClasses, colorTurn);
  }

  static checkIfChess(thretsMap: string[], toolsClasses: object, colorTurn: boolean, toolsPosition): string {
    let kingPos = this.getKingPosition(toolsPosition, colorTurn);
    let isChess: string;
    thretsMap.splice(0, thretsMap.length);
    for(let tool in toolsClasses) {
      if(colorTurn === toolsClasses[tool].color) continue;
      if(toolsClasses[tool].getThretsMap().includes(kingPos)) isChess = kingPos;
      thretsMap.push(...toolsClasses[tool].getThretsMap().filter(pos => !thretsMap.includes(pos)));
    }
    return isChess;
  }

  static checkChessmate(kingPos: string, toolsPosition: object, toolsClasses: object, colorTurn: boolean, possibleMoves: string[]): void {
    this.getKingPossibleMoves(toolsPosition[kingPos], toolsClasses, possibleMoves, toolsPosition, colorTurn);
    if(possibleMoves.length) return;
    if(this.checkIfOneOfTheToolsCanMove(toolsPosition, toolsClasses, colorTurn, kingPos)) return;
    console.log('Game over chessmate!!!');
  }

  static checkStalemate(toolsPosition, toolsClasses, colorTurn: boolean): void {
    let kingPos = this.getKingPosition(toolsPosition, colorTurn);
    if(this.checkIfOneOfTheToolsCanMove(toolsPosition, toolsClasses, colorTurn, kingPos)) return;
    console.log('Game over Stalemate!!!');
  }

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
