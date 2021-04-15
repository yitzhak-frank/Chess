import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { ToolInfo } from 'src/app/interfaces/tool-interface';
import { ChessTableService } from 'src/app/services/chess-table.service';

@Component({
  selector: 'app-tool',
  template: `<div class="tool" (click)="moveTool($event)" (mousedown)="dragTool($event)">{{toolInfo.tool}}</div>`,
  styles: [`div {cursor: default;} div:hover {transform: scale(1.05)}`]
})
export class ToolComponent implements OnInit {

  @Input() toolInfo: ToolInfo;
  @Output() cellClicked = new EventEmitter<ToolInfo>();

  constructor(public tableService: ChessTableService) {}

  moveTool(e): void {
    this.cellClicked.emit(this.toolInfo);
  }

  dragTool(e): void {
    this.cellClicked.emit(this.toolInfo);
    this.tableService.dragAndDrop(e, this.toolInfo.color);
  }

  ngOnInit(): void {}

}
