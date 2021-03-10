import { NgModule } from '@angular/core';
import { HomeComponent } from './components/home/home.component';
import { ChessGameComponent } from './components/chess-game/chess-game.component';
import { RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  { path: 'home', component: HomeComponent },
  { path: 'home/:gameId', component: HomeComponent },
  { path: 'chess/:gameId', component: ChessGameComponent },
  { path: '**', redirectTo: 'home', pathMatch: 'full' }
]

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {}
