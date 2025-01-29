import { Component, Inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { User, Specialization } from '../../shared/user';

@Component({
  selector: 'app-doctor-edit-dialog',
  template: `
    <h2 mat-dialog-title>Edit Doctor Details</h2>
    <mat-dialog-content>
      <form [formGroup]="doctorForm" class="flex flex-col gap-4">
        <mat-form-field class="w-full">
          <mat-label>First Name</mat-label>
          <input matInput formControlName="firstName" required />
        </mat-form-field>

        <mat-form-field class="w-full">
          <mat-label>Last Name</mat-label>
          <input matInput formControlName="lastName" required />
        </mat-form-field>

        <mat-form-field class="w-full">
          <mat-label>Display Name</mat-label>
          <input matInput formControlName="displayName" />
        </mat-form-field>

        <mat-form-field class="w-full">
          <mat-label>Specialization</mat-label>
          <mat-select formControlName="specialization" required>
            <mat-option *ngFor="let spec of specializations" [value]="spec">
              {{ spec }}
            </mat-option>
          </mat-select>
        </mat-form-field>

        <mat-form-field class="w-full">
          <mat-label>Description</mat-label>
          <textarea matInput formControlName="description" rows="3"></textarea>
        </mat-form-field>
      </form>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button (click)="onCancel()">Cancel</button>
      <button
        mat-raised-button
        color="primary"
        [disabled]="!doctorForm.valid"
        (click)="onSubmit()"
      >
        Save Changes
      </button>
    </mat-dialog-actions>
  `,
})
export class DoctorEditDialogComponent {
  doctorForm: FormGroup;
  specializations: Specialization[] = [
    'Lekarz rodzinny',
    'Kardiolog',
    'Dermatolog',
    'Neurolog',
    'Ortopeda',
    'Pediatra',
    'Laryngolog',
    'Chirurg',
  ];

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<DoctorEditDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { doctor: User }
  ) {
    this.doctorForm = this.fb.group({
      firstName: [data.doctor.firstName || '', Validators.required],
      lastName: [data.doctor.lastName || '', Validators.required],
      displayName: [data.doctor.displayName || ''],
      specialization: [
        data.doctor.doctorDetails?.specialization || '',
        Validators.required,
      ],
      description: [data.doctor.doctorDetails?.description || ''],
    });
  }

  onSubmit(): void {
    if (this.doctorForm.valid) {
      const formValue = this.doctorForm.value;
      const doctorData = {
        firstName: formValue.firstName,
        lastName: formValue.lastName,
        displayName:
          formValue.displayName ||
          `${formValue.firstName} ${formValue.lastName}`,
        doctorDetails: {
          firstName: formValue.firstName,
          lastName: formValue.lastName,
          specialization: formValue.specialization,
          description: formValue.description,
        },
      };
      this.dialogRef.close(doctorData);
    }
  }

  onCancel(): void {
    this.dialogRef.close();
  }
}
