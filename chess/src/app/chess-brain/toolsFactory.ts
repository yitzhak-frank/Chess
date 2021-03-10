import { ToolInfo } from "../interfaces/tool-interface";
import Tool   from "./tools/tool";
import King   from "./tools/king";
import Queen  from "./tools/queen";
import Rook   from "./tools/rook";
import Bishop from "./tools/bishop";
import Knight from "./tools/knight";
import Pawn   from "./tools/pawn";

class ToolsFactory {

  public class: Tool;

  constructor(tool: ToolInfo) {
    switch(tool.rank) {
      case 'king':   this.class = new King(tool);
        break;
      case 'queen':  this.class = new Queen(tool);
        break;
      case 'rook':   this.class = new Rook(tool);
        break;
      case 'bishop': this.class = new Bishop(tool);
        break;
      case 'knight': this.class = new Knight(tool);
        break;
      case 'pawn':   this.class = new Pawn(tool);
        break;
      default: return;
    }
  }
}

export default ToolsFactory;
