import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { ToolInfo } from 'src/app/interfaces/tool-interface';

@Component({
  selector: 'app-tool',
  template: `<div  [ngClass]="{tool: true, white: playerColor}" (click)="moveTool()">{{toolInfo.tool || ''}}</div>`,
  styles: [`
    div {cursor: default;}
    div:hover {transform: scale(1.05)}
    .white {transform: rotate(180deg);}
    .white:hover {transform: scale(1.05) rotate(180deg)}
  `]
})
export class ToolComponent implements OnInit {

  @Input() toolInfo:    ToolInfo;
  @Input() playerColor: boolean;
  @Output() cellClicked = new EventEmitter<ToolInfo>();

  constructor() {}

  moveTool() { this.cellClicked.emit(this.toolInfo) }

  ngOnInit(): void {}

}
