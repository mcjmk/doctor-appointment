import { Component, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CalendarService } from '../calendar.service';
import { AuthService } from '../../shared/auth.service';
import { Router } from '@angular/router';
import { Availability } from '../availability.model';

@Component({
  selector: 'app-availability-form',
  templateUrl: './availability-form.component.html',
  styleUrl: './availability-form.component.css',
})
export class AvailabilityFormComponent implements OnInit {
  availabilityForm!: FormGroup;
  weekDays = [
    { id: 1, name: 'Poniedziałek' },
    { id: 2, name: 'Wtorek' },
    { id: 3, name: 'Środa' },
    { id: 4, name: 'Czwartek' },
    { id: 5, name: 'Piątek' },
    { id: 6, name: 'Sobota' },
    { id: 0, name: 'Niedziela' },
  ];

  constructor(
    private fb: FormBuilder,
    private calendarService: CalendarService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.availabilityForm = this.fb.group({
      startDate: ['', Validators.required],
      endDate: ['', Validators.required],
      cyclical: [false],
      weekDays: this.fb.array([]),
      slots: this.fb.array([]),
    });
    this.availabilityForm
      .get('cyclical')
      ?.valueChanges.subscribe((isCyclical) => {
        const weekDaysArray = this.availabilityForm.get(
          'weekDays'
        ) as FormArray;
        weekDaysArray.clear();
        if (isCyclical) {
          this.weekDays.forEach(() =>
            weekDaysArray.push(this.fb.control(false))
          );
        }
      });
  }

  createTimeSlot() {
    return this.fb.group({
      start: ['', Validators.required],
      end: ['', Validators.required],
    });
  }

  addTimeSlot() {
    const slots = this.availabilityForm.get('slots') as FormArray;
    slots.push(this.createTimeSlot());
  }

  removeTimeSlot(index: number) {
    const slots = this.availabilityForm.get('slots') as FormArray;
    slots.removeAt(index);
  }

  onSubmit() {
    if (this.availabilityForm.valid) {
      this.authService.getCurrentUser().then((user) => {
        if (!user) return;

        const formValue = this.availabilityForm.value;
        const availability: Omit<Availability, 'id'> = {
          doctorId: user.uid,
          startDate: formValue.startDate,
          endDate: formValue.endDate,
          cyclical: formValue.cyclical,
          slots: formValue.slots,
          weekDays: formValue.cyclical
            ? formValue.weekDays
                .map((selected: boolean, index: number) =>
                  selected ? index : -1
                )
                .filter((day: number) => day !== -1)
            : [],
        };

        this.calendarService
          .setDoctorAvailability(availability)
          .then(() => this.router.navigate(['/calendar']))
          .catch((error) => console.error('Error:', error));
      });
    }
  }
}
