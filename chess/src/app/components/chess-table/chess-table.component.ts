import { Component, DoCheck, Input, OnInit } from '@angular/core';
import { cols, rows } from 'src/app/data/tableArrays';
import { firstPosition } from 'src/app/data/toolsPosition';
import { ToolInfo } from 'src/app/interfaces/tool-interface';
import { ChessTableService } from 'src/app/services/chess-table.service';

@Component({
  selector: 'app-chess-table',
  templateUrl: './chess-table.component.html',
  styleUrls: ['./chess-table.component.scss']
})
export class ChessTableComponent implements OnInit, DoCheck {

  @Input() playerColor:  boolean[] = [];
  public  rows:           number[]  = rows;
  public  cols:           string[]  = cols;
  public  possibleMoves:  string[]  = [];
  public  toolsPosition:  object    = firstPosition;
  public  isChess:        object;
  public  colorTurn:      boolean;
  public  coronationInfo: any;
  private sound;

  constructor(private tableService: ChessTableService) {
    this.possibleMoves  = tableService.possibleMoves;
    this.isChess        = tableService.isChess;
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

  private playChessSound(): void {
    if(this.sound) return;
    this.sound = new Audio('../../../assets/sounds/Run_Sound_Effect.mp3');
    this.sound.play();
  }

  ngDoCheck(): void {
    if(!this.isChess['position'] || this.isChess['color'] !== this.playerColor[0]) return;
    this.playChessSound();
  }

  ngOnInit(): void { this.tableService.onTableLoad(this.playerColor) }

}
