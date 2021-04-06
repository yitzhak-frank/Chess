import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

@Component({
  selector: 'app-copy-link',
  templateUrl: './copy-link.component.html',
  styleUrls: ['./copy-link.component.scss']
})
export class CopyLinkComponent implements OnInit {

  @Input() link: string;
  @Output() getLink = new EventEmitter();
  public copyTooltip: boolean;

  constructor() {}

  setLink(): void {
    this.getLink.emit();
  }

  copyLink(input: HTMLInputElement): void {
    input.select();
    document.execCommand("copy");
    this.copyTooltip = true;
    setTimeout(() => this.copyTooltip = false, 2000);
  }

  ngOnInit(): void {}

}
