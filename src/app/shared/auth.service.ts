import { Router } from '@angular/router';
import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import firebase from 'firebase/compat/app';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  userData: Observable<firebase.User | null>;
  userRole: string | null = null;
  userBanned: boolean = false;

  constructor(
    private angularFireAuth: AngularFireAuth,
    private firestore: AngularFirestore,
    private router: Router
  ) {
    this.userData = this.angularFireAuth.authState;

    this.userData.subscribe((user) => {
      if (user) {
        this.firestore
          .doc(`users/${user.uid}`)
          .valueChanges()
          .subscribe((userData: any) => {
            this.userRole = userData?.role || null;
          });
      } else {
        this.userRole = null;
        this.userBanned = false;
      }
    });
  }

  login(email: string, password: string): Promise<void> {
    return this.angularFireAuth
      .signInWithEmailAndPassword(email, password)
      .then((result) => {
        if (!result.user) throw new Error('Login failed');
        this.router.navigate(['/']);
      });
  }

  register(email: string, password: string): Promise<void> {
    return this.angularFireAuth
      .createUserWithEmailAndPassword(email, password)
      .then((userCredential) => {
        if (!userCredential.user) throw new Error('Registration failed');
        return this.createUserDocument(userCredential.user);
      })
      .then(() => {
        this.userRole = 'patient';
        this.userBanned = false;
        this.router.navigate(['/']);
      });
  }

  logout(): Promise<void> {
    return this.angularFireAuth.signOut().then(() => {
      this.userRole = null;
      this.router.navigate(['/login']);
    });
  }

  getCurrentUser(): Promise<firebase.User | null> {
    return this.angularFireAuth.currentUser;
  }

  isAdmin(): boolean {
    return this.userRole === 'admin';
  }

  isDoctor(): boolean {
    return this.userRole === 'doctor';
  }

  isPatient(): boolean {
    return this.userRole === 'patient';
  }

  canAddReview(): boolean {
    return !this.userBanned && this.userRole === 'patient';
  }

  private createUserDocument(user: firebase.User): Promise<void> {
    const userRef = this.firestore.collection('users').doc(user.uid);
    const userProfile = {
      uid: user.uid,
      email: user.email,
      role: 'patient',
      banned: false,
    };
    return userRef.set(userProfile);
  }

  setPersistence(type: string): Promise<void> {
    const persistence = {
      LOCAL: firebase.auth.Auth.Persistence.LOCAL,
      SESSION: firebase.auth.Auth.Persistence.SESSION,
      NONE: firebase.auth.Auth.Persistence.NONE,
    }[type];
    return this.angularFireAuth.setPersistence(persistence!);
  }
}
