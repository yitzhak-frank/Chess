import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ChessTableComponent } from '../components/chess-table/chess-table.component';
import { ToolComponent } from '../components/tool/tool.component';
import { CoronationComponent } from '../components/coronation/coronation.component';
import { SignInComponent } from '../modules/chess/components/sign-in/sign-in.component';

@NgModule({
  declarations: [
    ChessTableComponent,
    ToolComponent,
    CoronationComponent,
    SignInComponent
  ],
  imports: [CommonModule],
  exports: [ChessTableComponent]
})
export class ChessModule { }
