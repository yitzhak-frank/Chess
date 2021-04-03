import { NgModule } from '@angular/core';
import { environment } from 'src/environments/environment';
import { AppComponent } from './app.component';
import { ToolComponent } from './components/tool/tool.component';
import { BrowserModule } from '@angular/platform-browser';
import { HomeComponent } from './components/home/home.component';
import { WaiterComponent } from './components/waiter/waiter.component';
import { SignInComponent } from './components/sign-in/sign-in.component';
import { PlayerComponent } from './components/player/player.component';
import { AppRoutingModule } from './app-routing.module';
import { HttpClientModule } from '@angular/common/http';
import { AngularFireModule } from '@angular/fire';
import { GameInfoComponent } from './components/game-info/game-info.component';
import { GameCardComponent } from './components/game-card/game-card.component';
import { ChessGameComponent } from './components/chess-game/chess-game.component';
import { GamesListComponent } from './components/games-list/games-list.component';
import { ChessTableComponent } from './components/chess-table/chess-table.component';
import { CoronationComponent } from './components/coronation/coronation.component';
import { TimeCounterComponent } from './components/time-counter/time-counter.component';
import { AngularFireAuthModule } from '@angular/fire/auth';
import { AngularFirestoreModule } from '@angular/fire/firestore';

@NgModule({
  declarations: [
    AppComponent,
    HomeComponent,
    ToolComponent,
    PlayerComponent,
    SignInComponent,
    WaiterComponent,
    GameCardComponent,
    GameInfoComponent,
    ChessGameComponent,
    GamesListComponent,
    ChessTableComponent,
    CoronationComponent,
    TimeCounterComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    AngularFireModule.initializeApp(environment.firebaseConfig),
    AngularFireAuthModule,
    AngularFirestoreModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
