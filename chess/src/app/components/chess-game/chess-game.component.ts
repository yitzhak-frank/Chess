import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';
import { AuthService } from 'src/app/services/auth.service';
import { GameService } from 'src/app/services/game.service';

@Component({
  selector: 'app-chess-game',
  templateUrl: './chess-game.component.html',
  styleUrls: ['./chess-game.component.scss']
})
export class ChessGameComponent implements OnInit, OnDestroy {

  public  userName;
  public  user;
  private subscriptions: Subscription[] = [];

  constructor(private ActivatedRoute: ActivatedRoute, private AuthService: AuthService, private GameService: GameService) { }

  ngOnInit(): void {
    this.subscriptions.push(
      this.ActivatedRoute.params.subscribe(params => {
        this.GameService.openGameSocket(params.gameId)
      }),
      this.AuthService.user$.subscribe(user => {
        this.user = user;
        this.userName = user?.providerData[0].displayName;
      })
    );
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(subscription => subscription.unsubscribe());
  }
}
