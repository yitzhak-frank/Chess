import { ActivatedRoute, Router } from '@angular/router';
import { Component, OnInit } from '@angular/core';
import { FierbaseService } from 'src/app/services/firebase.service';
import { switchMap, take } from 'rxjs/operators';
import { AuthService } from 'src/app/services/auth.service';
import { Observable } from 'rxjs';
import firebase from 'firebase/app';
import { ConnectionListenerService } from 'src/app/services/connection.service';

@Component({
  selector: 'app-games-list',
  templateUrl: './games-list.component.html',
  styleUrls: ['./games-list.component.scss']
})
export class GamesListComponent implements OnInit {

  public user$: Observable<firebase.User>;
  public games = [];
  public uid: string;

  constructor(
    private Auth:   AuthService,
    private fbs:    FierbaseService,
    private Route:  ActivatedRoute,
    private Router: Router,
    private Connection: ConnectionListenerService
  ) {
    this.user$ = Auth.user$;
  }

  disconnectFromGame(): void {
    this.Connection.disconnectFromGame(this.uid);
  }

  ngOnInit(): void {
    this.Route.queryParams.subscribe(params => {

      if(!params.uid) return this.Router.navigate(['/home']);

      this.uid = params.uid;

      this.fbs.gatUserGames('white_uid', params.uid).valueChanges({idField: 'id'}).pipe(
        take(2),
        switchMap(games => {
          this.games.push(...games.filter(game => game['black_uid']));
          return this.fbs.gatUserGames('black_uid', params.uid).valueChanges({idField: 'id'})
        })
      ).subscribe(games => this.games.push(...games));
    });
  }
}
