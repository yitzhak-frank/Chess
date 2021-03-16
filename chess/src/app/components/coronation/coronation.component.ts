import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { ToolInfo } from 'src/app/interfaces/tool-interface';
import { ChessTableService } from 'src/app/services/chess-table.service';

@Component({
  selector: 'app-coronation',
  templateUrl: './coronation.component.html',
  styleUrls: ['./coronation.component.scss']
})
export class CoronationComponent implements OnInit {

  @Output() coronation = new EventEmitter<null>();
  @Input() position: string;
  @Input() color:    boolean;

  public whiteTools: string[] = ['♕', '♖', '♗', '♘'];
  public blackTools: string[] = ['♛', '♜', '♝', '♞'];
  public options:    string[] = ['queen', 'rook', 'bishop', 'knight'];

  constructor(private tableService: ChessTableService) {}

  selectTool(tool: string, rank: string) {
    let { position, color } = this;
    let selectedTool: ToolInfo = { position, tool, color, rank };
    this.tableService.coronation(selectedTool);
    this.coronation.emit(null);
    this.tableService.updateGameInfo();
  }

  ngOnInit(): void {}

}
