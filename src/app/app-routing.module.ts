import { NgModule } from '@angular/core';
import { HomeComponent } from './components/home/home.component';
import { ChessGameComponent } from './components/chess-game/chess-game.component';
import { RouterModule, Routes } from '@angular/router';
import { GamesListComponent } from './components/games-list/games-list.component';

const routes: Routes = [
  { path: 'home', component: HomeComponent },
  { path: 'chess', component: ChessGameComponent },
  { path: 'games', component: GamesListComponent },
  { path: '**', redirectTo: 'home', pathMatch: 'full' }
]

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {}
