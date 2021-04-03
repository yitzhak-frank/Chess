import { Component, OnInit } from '@angular/core';
import { AuthService } from 'src/app/services/auth.service';
import firebase from 'firebase/app';
import { FierbaseService } from 'src/app/services/firebase.service';
import { take, tap } from 'rxjs/operators';
import { Game } from 'src/app/interfaces/game-interfaces';
import { Observable } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-games-list',
  templateUrl: './games-list.component.html',
  styleUrls: ['./games-list.component.scss']
})
export class GamesListComponent implements OnInit {

  public user$: Observable<firebase.User>;
  public games //: Game[];
  public uid: string;

  constructor(
    private Auth:   AuthService,
    private fbs:    FierbaseService,
    private Route:  ActivatedRoute,
    private Router: Router
  ) {
    this.user$ = Auth.user$;
  }

  ngOnInit(): void {
    this.Route.queryParams.subscribe(params => {

      if(!params.uid) return this.Router.navigate(['/home']);

      this.uid = params.uid;

      this.fbs.gatUserGames(params.uid)
      .valueChanges({idField: 'id'})
      .pipe(take(1))
      .subscribe(games => this.games = games.filter(game => game['black_uid']));
    });
  }
}
