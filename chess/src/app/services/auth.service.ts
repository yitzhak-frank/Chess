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

  public user$: Observable<firebase.User> = null;
  public user: firebase.User = null;

  constructor(private afa: AngularFireAuth, private UserStatus: UserStatusService) {
    this.user$ = this.getUserId();
    this.user$.subscribe(user => this.user = user);
  }

  private getUserId(): Observable<firebase.User> {
    return this.afa.authState;
  }

  public signup(email: string, password: string) {
    return this.afa.createUserWithEmailAndPassword(email, password);
  }

  public login(email: string, password: string) {
    return this.afa.signInWithEmailAndPassword(email, password);
  }

  public googleLogin() {
    return this.afa.signInWithPopup(new firebase.auth.GoogleAuthProvider());
  }

  public logOut() {
    this.UserStatus.updateUserStatus(this.user.uid, 'offline');
    return this.afa.signOut();
  }
}
