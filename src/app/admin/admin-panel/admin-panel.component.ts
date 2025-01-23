import { Component } from '@angular/core';
import { User } from '../../shared/user';
import { Observable } from 'rxjs';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { AuthService } from '../../shared/auth.service';

@Component({
  selector: 'app-admin-panel',
  templateUrl: './admin-panel.component.html',
  styleUrl: './admin-panel.component.css',
})
export class AdminPanelComponent {
  users$: Observable<User[]>;

  constructor(
    private firestore: AngularFirestore,
    private authService: AuthService
  ) {
    this.users$ = this.firestore.collection<User>('users').valueChanges();
  }

  updateRole(userId: string, newRole: string): void {
    this.firestore.doc(`users/${userId}`).update({ role: newRole });
  }

  toggleBan(userId: string, currentBanStatus: boolean): void {
    this.firestore.doc(`users/${userId}`).update({ banned: !currentBanStatus });
  }

  updatePersistence(type: 'LOCAL' | 'SESSION' | 'NONE'): void {
    this.authService
      .setPersistence(type)
      .catch((error) => console.error('Error updating persistence:', error));
  }
}
