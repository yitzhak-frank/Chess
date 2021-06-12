import { NgModule } from '@angular/core';
import { AuthGuard } from './guards/auth.guard';
import { HomeComponent } from './components/home/home.component';
import { LeavePageGuard } from './guards/leave-page.guard';
import { ChessGameComponent } from './components/chess-game/chess-game.component';
import { GamesListComponent } from './components/games-list/games-list.component';
import { GameDetailsComponent } from './components/game-details/game-details.component';
import { RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  { path: 'home', component: HomeComponent },
  { path: 'chess', component: ChessGameComponent, canActivate: [AuthGuard], canDeactivate: [LeavePageGuard] },
  { path: 'games', component: GamesListComponent, canActivate: [AuthGuard] },
  { path: 'game-details', component: GameDetailsComponent, canActivate: [AuthGuard] },
  { path: '**', redirectTo: 'home', pathMatch: 'full' }
]

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
  providers: [AuthGuard, LeavePageGuard, ChessGameComponent]
})
export class AppRoutingModule {}
