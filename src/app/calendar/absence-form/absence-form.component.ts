import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CalendarService } from '../calendar.service';
import { AuthService } from '../../shared/auth.service';
import { Absence } from '../absence.model';
import { Router } from '@angular/router';

@Component({
  selector: 'app-absence-form',
  templateUrl: './absence-form.component.html',
  styleUrl: './absence-form.component.css',
})
export class AbsenceFormComponent {
  absenceForm!: FormGroup;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private calendarService: CalendarService,
    private router: Router
  ) {}

  ngOnInit() {
    this.absenceForm = this.fb.group(
      {
        startDate: ['', Validators.required],
        endDate: ['', Validators.required],
        description: [''],
      },
      { validators: this.dateRangeValidator }
    );
    this.absenceForm.get('startDate')?.valueChanges.subscribe(() => {
      this.absenceForm.updateValueAndValidity();
    });

    this.absenceForm.get('endDate')?.valueChanges.subscribe(() => {
      this.absenceForm.updateValueAndValidity();
    });
  }

  onSubmit() {
    if (this.absenceForm.valid) {
      this.authService.getCurrentUser().then((user) => {
        if (!user) return;

        const absence: Omit<Absence, 'id'> = {
          doctorId: user.uid,
          startDate: this.absenceForm.value.startDate,
          endDate: this.absenceForm.value.endDate,
          description: this.absenceForm.value.description || '',
        };

        this.calendarService
          .setDoctorAbsence(absence)
          .then(() => this.router.navigate(['/calendar']))
          .catch((error) => console.error('Error:', error));
      });
    }
  }
  private dateRangeValidator(group: FormGroup) {
    const startDate = group.get('startDate')?.value;
    const endDate = group.get('endDate')?.value;

    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);

      if (end < start) {
        return { dateRange: true };
      }
    }

    return null;
  }
}
