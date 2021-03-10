import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { ToolInfo } from 'src/app/interfaces/tool-interface';

@Component({
  selector: 'app-tool',
  template: `<div  class="tool" (click)="moveTool()">{{toolInfo.tool || ''}}</div>`,
  styles: [`div {cursor: default; transform: rotate(180deg);} div:hover {transform: scale(1.05) rotate(180deg)}`]
})
export class ToolComponent implements OnInit {

  @Input() toolInfo: ToolInfo;
  @Output() cellClicked = new EventEmitter<ToolInfo>();

  constructor() {}

  moveTool() { this.cellClicked.emit(this.toolInfo) }

  ngOnInit(): void {}

}
