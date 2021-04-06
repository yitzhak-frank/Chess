import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { Location } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-back-home-btn',
  template: `
    <div class="buttons">
      <i class="far fa-arrow-alt-circle-left" (click)="goBack()"></i>
      <i class="fas fa-home" (click)="goHome()"></i>
    </div>
  `,
  styleUrls: ['./back-home-btn.component.scss']
})
export class BackHomeBtnComponent implements OnInit {

  @Output() leavePage = new EventEmitter<string>();

  constructor(private Router: Router, private Location: Location) {}

  goBack(): void {
    if(location.pathname.includes('chess')) this.leavePage.emit('Back');
    else this.Location.back();
  }

  goHome(): void {
    if(location.pathname.includes('chess')) this.leavePage.emit('Home');
    else this.Router.navigate(['/home']);
  }

  ngOnInit(): void {}

}
