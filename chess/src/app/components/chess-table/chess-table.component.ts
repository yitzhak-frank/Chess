import { Component, OnInit } from '@angular/core';
import { cols, rows } from 'src/app/data/tableArrays';
import { firstPosition } from 'src/app/data/toolsPosition';
import { ToolInfo } from 'src/app/interfaces/tool-interface';
import { ChessTableService } from 'src/app/services/chess-table.service';

@Component({
  selector: 'app-chess-table',
  templateUrl: './chess-table.component.html',
  styleUrls: ['./chess-table.component.scss']
})
export class ChessTableComponent implements OnInit {

  public rows:           number[] = rows;
  public cols:           string[] = cols;
  public toolsPosition:  object   = firstPosition;
  public possibleMoves:  string[] = [];
  public thretsMap:      string[] = [];
  public colorTurn:      boolean;
  public coronationInfo: any;

  constructor(private tableService: ChessTableService) {
    this.possibleMoves  = tableService.possibleMoves;
    this.thretsMap      = tableService.thretsMap;
    this.colorTurn      = tableService.colorTurn;
  }

  public toolClicked(tool: ToolInfo): void {
    this.tableService.toolOnClick(tool);
    this.updatData();
  }

  public cellClicked(position: string): void {
    this.tableService.emptyCellOnClick(position);
    this.updatData();
  }

  private updatData(): void {
    this.colorTurn = this.tableService.getColorTurn();
    this.coronationInfo = this.tableService.getCoronationInfo();
  }

  public coronation(e): void { this.coronationInfo = e }

  ngOnInit(): void { this.tableService.onTableLoad() }

}
