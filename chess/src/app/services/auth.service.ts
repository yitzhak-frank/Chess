import 'firebase/auth'
import firebase from 'firebase/app';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { shareReplay } from 'rxjs/operators';
import { AngularFireAuth } from '@angular/fire/auth';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  user$: Observable<firebase.User> = null;
  user: firebase.User = null;
  isLogged: boolean = false;

  constructor(private afa: AngularFireAuth) {
    this.user$ = this.getUserId();
    this.user$.subscribe(user => this.user = user);
  }

  getUserId() {
    return this.afa.authState.pipe(shareReplay(1));
  }

  signup(email: string, password: string) {
    return this.afa.createUserWithEmailAndPassword(email, password);
  }

  login(email: string, password: string) {
    return this.afa.signInWithEmailAndPassword(email, password);
  }

  googleLogin() {
    return this.afa.signInWithPopup(new firebase.auth.GoogleAuthProvider());
  }

  logOut() {
    return this.afa.signOut();
  }
}
