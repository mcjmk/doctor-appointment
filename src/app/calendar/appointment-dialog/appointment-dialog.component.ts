import { AuthService } from './../../shared/auth.service';
import { Component, Inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Appointment } from '../appointment.model';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { CalendarService } from '../calendar.service';

@Component({
  selector: 'app-appointment-dialog',
  templateUrl: './appointment-dialog.component.html',
  styleUrl: './appointment-dialog.component.css',
})
export class AppointmentDialogComponent {
  appointmentForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private calendarService: CalendarService,
    private dialogRef: MatDialogRef<AppointmentDialogComponent>,
    private authService: AuthService,
    @Inject(MAT_DIALOG_DATA)
    public data: { date: Date; timeSlot: string; doctorId: string }
  ) {
    this.appointmentForm = this.fb.group({
      type: ['', Validators.required],
      patientName: ['', Validators.required],
      patientGender: ['', Validators.required],
      patientAge: ['', [Validators.required, Validators.min(0)]],
      notes: [''],
    });
  }

  onSubmit() {
    if (this.appointmentForm.valid) {
      this.authService.getCurrentUser().then((user) => {
        if (!user) return;

        const formValue = this.appointmentForm.value;
        const [hours, minutes] = this.data.timeSlot.split(':').map(Number);
        const startTime = new Date(this.data.date);
        startTime.setHours(hours, minutes, 0, 0);

        const endTime = new Date(startTime);
        endTime.setMinutes(endTime.getMinutes() + 30);

        const appointment: Omit<Appointment, 'id'> = {
          doctorId: this.data.doctorId,
          patientId: user.uid,
          startTime,
          endTime,
          status: 'zajęta',
          type: formValue.type,
          patientName: formValue.patientName,
          patientGender: formValue.patientGender,
          patientAge: formValue.patientAge,
          notes: formValue.notes,
        };

        this.calendarService
          .createAppointment(appointment)
          .then(() => this.dialogRef.close(true));
      });
      this.dialogRef.close(true);
    }
  }

  onCancel() {
    this.dialogRef.close();
  }
}
