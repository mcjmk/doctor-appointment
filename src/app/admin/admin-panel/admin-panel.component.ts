import { Component } from '@angular/core';
import { User } from '../../shared/user';
import { Observable } from 'rxjs';
import { AngularFirestore } from '@angular/fire/compat/firestore';

@Component({
  selector: 'app-admin-panel',
  templateUrl: './admin-panel.component.html',
  styleUrl: './admin-panel.component.css',
})
export class AdminPanelComponent {
  users$: Observable<User[]>;
  displayedColumns: string[] = ['email', 'role', 'status', 'actions'];

  constructor(private firestore: AngularFirestore) {
    this.users$ = this.firestore.collection<User>('users').valueChanges();
  }

  updateRole(userId: string, newRole: string): void {
    this.firestore.doc(`users/${userId}`).update({ role: newRole });
  }

  toggleBan(userId: string, currentBanStatus: boolean): void {
    this.firestore.doc(`users/${userId}`).update({ banned: !currentBanStatus });
  }
}
