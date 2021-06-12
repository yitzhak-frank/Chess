import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-gameover',
  templateUrl: './gameover.component.html',
  styleUrls: ['./gameover.component.scss']
})
export class GameoverComponent implements OnInit {

  @Input() winnerName: string;
  @Input() gameStatus: string;
  public  imgUrl:      string;
  public  txt:         string;

  constructor() {}

  setImgUrl(): void {
    if(this.gameStatus.endsWith('Won')) this.imgUrl = "../../../assets/images/gameover-chessmate.png";
    else this.imgUrl = "../../../assets/images/gameover-stalemate.png";
  }

  setTxt(): void {
    if(this.gameStatus.endsWith('Won')) this.txt = `Gameover Chessmate ${this.winnerName} Won!!!`;
    else this.txt = `Gameover Stalemate :(`;
  }

  ngOnInit(): void {
    this.setImgUrl();
    this.setTxt();
  }

}
