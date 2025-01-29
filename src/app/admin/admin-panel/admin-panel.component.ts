import { Component } from '@angular/core';
import { User } from '../../shared/user';
import { Observable } from 'rxjs';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { AuthService } from '../../shared/auth.service';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { AdminService } from '../admin.service';
import { MatDialog } from '@angular/material/dialog';
import { DoctorEditDialogComponent } from '../doctor-edit-dialog/doctor-edit-dialog.component';

@Component({
  selector: 'app-admin-panel',
  templateUrl: './admin-panel.component.html',
  styleUrl: './admin-panel.component.css',
})
export class AdminPanelComponent {
  users$: Observable<User[]>;
  displayedColumns = ['email', 'role', 'status', 'actions'];
  selectedPersistence: 'LOCAL' | 'SESSION' | 'NONE' = 'LOCAL';

  constructor(private adminService: AdminService, private dialog: MatDialog) {
    this.users$ = this.adminService.getAllUsers();
  }

  updateRole(userId: string, newRole: string): void {
    this.adminService
      .updateUserRole(userId, newRole)
      .catch((error) => console.error('Error updating role:', error));
  }

  toggleBan(userId: string, currentBanStatus: boolean): void {
    this.adminService
      .toggleUserBan(userId, currentBanStatus)
      .catch((error) => console.error('Error toggling ban status:', error));
  }

  editDoctorDetails(doctor: User): void {
    const dialogRef = this.dialog.open(DoctorEditDialogComponent, {
      width: '500px',
      data: { doctor },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.adminService
          .updateDoctor(doctor.uid, result)
          .catch((error) =>
            console.error('Error updating doctor details:', error)
          );
      }
    });
  }

  updatePersistence(type: 'LOCAL' | 'SESSION' | 'NONE'): void {
    this.adminService
      .updatePersistence(type)
      .catch((error) => console.error('Error updating persistence:', error));
  }
}
