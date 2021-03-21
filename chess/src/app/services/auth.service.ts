import 'firebase/auth'
import firebase from 'firebase/app';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { AngularFireAuth } from '@angular/fire/auth';
import { UserStatusService } from './user-status.service';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  user$: Observable<firebase.User> = null;
  user: firebase.User = null;
  isLogged: boolean = false;

  constructor(private afa: AngularFireAuth, private UserStatus: UserStatusService) {
    this.user$ = this.getUserId();
    this.user$.subscribe(user => this.user = user);
  }

  getUserId() {
    return this.afa.authState;
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
    this.UserStatus.updateUserStatus(this.user.uid, 'offline');
    return this.afa.signOut();
  }
}
