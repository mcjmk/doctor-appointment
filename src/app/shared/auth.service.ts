import { Router } from "@angular/router";
import { Injectable } from "@angular/core";
import { AngularFireAuth } from "@angular/fire/compat/auth";
import { AngularFirestore } from "@angular/fire/compat/firestore";
import { Observable, of } from "rxjs";
import { map, switchMap } from "rxjs/operators";
import firebase from "firebase/compat/app";
import { User } from "./user";

@Injectable({
  providedIn: "root",
})
export class AuthService {
  userData: Observable<firebase.User | null>;
  currentUser: Observable<any>;

  userRole: string | null = null;
  userBanned: boolean = false;

  constructor(
    private angularFireAuth: AngularFireAuth,
    private firestore: AngularFirestore,
    private router: Router,
  ) {
    this.userData = this.angularFireAuth.authState;

    this.currentUser = this.userData.pipe(
      switchMap((user) => {
        if (user) {
          return this.firestore.doc<User>(`users/${user.uid}`).valueChanges();
        }
        return of(null);
      }),
    );
  }

  login(email: string, password: string): Promise<void> {
    return this.angularFireAuth
      .signInWithEmailAndPassword(email, password)
      .then((result) => {
        if (!result.user) throw new Error("Login failed");
        this.router.navigate(["/"]);
      });
  }

  register(email: string, password: string): Promise<void> {
    return this.angularFireAuth
      .createUserWithEmailAndPassword(email, password)
      .then((userCredential) => {
        if (!userCredential.user) throw new Error("Registration failed");
        return this.createUserDocument(userCredential.user);
      })
      .then(() => {
        this.router.navigate(["/"]);
      });
  }

  logout(): Promise<void> {
    return this.angularFireAuth.signOut().then(() => {
      localStorage.clear();
      sessionStorage.clear();
      this.router.navigate(["/login"]);
    });
  }

  getCurrentUser(): Promise<firebase.User | null> {
    return this.angularFireAuth.currentUser;
  }

  isAdmin(): Observable<boolean> {
    return this.currentUser.pipe(map((user) => user?.role === "admin"));
  }

  isDoctor(): Observable<boolean> {
    return this.currentUser.pipe(map((user) => user?.role === "doctor"));
  }

  isPatient(): Observable<boolean> {
    return this.currentUser.pipe(map((user) => user?.role === "patient"));
  }

  canAddReview(): Observable<boolean> {
    return this.currentUser.pipe(map((user) => !user?.banned));
  }

  getDoctors(): Observable<User[]> {
    return this.firestore
      .collection<User>("users", (ref) => ref.where("role", "==", "doctor"))
      .valueChanges({ idField: "uid" });
  }

  getDoctorById(uid: string): Observable<User | null> {
    return this.firestore
      .doc<User>(`users/${uid}`)
      .valueChanges()
      .pipe(map((user) => (user ? { ...user, uid } : null)));
  }

  private createUserDocument(user: firebase.User): Promise<void> {
    const userRef = this.firestore.collection("users").doc(user.uid);
    const userProfile = {
      uid: user.uid,
      email: user.email,
      role: "patient",
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
