import { NgModule } from '@angular/core';
import { environment } from 'src/environments/environment';
import { AppComponent } from './app.component';
import { ToolComponent } from './components/tool/tool.component';
import { BrowserModule } from '@angular/platform-browser';
import { HomeComponent } from './components/home/home.component';
import { SignInComponent } from './components/sign-in/sign-in.component';
import { PlayerComponent } from './components/player/player.component';
import { AppRoutingModule } from './app-routing.module';
import { HttpClientModule } from '@angular/common/http';
import { AngularFireModule } from '@angular/fire';
import { GameInfoComponent } from './components/game-info/game-info.component';
import { ChessGameComponent } from './components/chess-game/chess-game.component';
import { ChessTableComponent } from './components/chess-table/chess-table.component';
import { CoronationComponent } from './components/coronation/coronation.component';
import { AngularFireAuthModule } from '@angular/fire/auth';
import { AngularFirestoreModule } from '@angular/fire/firestore';
import { GamesListComponent } from './components/games-list/games-list.component';
import { TimeCounterComponent } from './components/time-counter/time-counter.component';

@NgModule({
  declarations: [
    AppComponent,
    HomeComponent,
    ToolComponent,
    PlayerComponent,
    SignInComponent,
    GameInfoComponent,
    ChessGameComponent,
    ChessTableComponent,
    CoronationComponent,
    GamesListComponent,
    TimeCounterComponent,
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
