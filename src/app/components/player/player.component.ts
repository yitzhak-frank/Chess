import firebase from 'firebase/app';
import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-player',
  templateUrl: './player.component.html',
  styleUrls: ['./player.component.scss']
})
export class PlayerComponent implements OnInit {

  @Input() user:      firebase.User;
  @Input() color:     boolean;
  @Input() counter:   number;
  @Input() deadTools: string[];

  constructor() {}

  ngOnInit(): void {}

}