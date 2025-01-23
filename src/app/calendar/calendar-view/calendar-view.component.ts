import { Component, OnInit } from '@angular/core';
import { User } from '../../shared/user';
import { Appointment } from '../appointment.model';
import { Observable } from 'rxjs';
import { AuthService } from '../../shared/auth.service';
import { CalendarService } from '../calendar.service';
import { MatDialog } from '@angular/material/dialog';
import {
  startOfWeek,
  endOfWeek,
  addDays,
  addWeeks,
  subWeeks,
  isSameDay,
  format,
  isToday,
} from 'date-fns';
import { AppointmentDialogComponent } from '../appointment-dialog/appointment-dialog.component';
import { Absence } from '../absence.model';
import { Availability } from '../availability.model';

@Component({
  selector: 'app-calendar-view',
  templateUrl: './calendar-view.component.html',
  styleUrl: './calendar-view.component.css',
})
export class CalendarViewComponent implements OnInit {
  weekDays: Date[] = [];
  doctors$: Observable<User[]>;
  selectedDoctorId: string = '';
  timeSlots: string[] = [];
  currentDate = new Date();
  displayHours = 6;

  absences: Absence[] = [];
  availabilities: Availability[] = [];
  appointments: Appointment[] = [];

  constructor(
    public authService: AuthService,
    private calendarService: CalendarService,
    private dialog: MatDialog
  ) {
    this.doctors$ = this.calendarService.getAvailableDoctors();
    this.generateTimeSlots();
    this.generateWeekDays();
  }

  ngOnInit() {
    if (this.authService.isDoctor()) {
      this.authService.userData.subscribe((user) => {
        this.selectedDoctorId = user?.uid || '';
        this.loadData();
      });
    } else if (this.authService.isPatient()) {
      this.doctors$.subscribe((doctors) => {
        if (doctors.length > 0) {
          this.selectedDoctorId = doctors[0].uid;
          this.loadData();
        }
      });
    }
  }

  generateTimeSlots() {
    this.timeSlots = [];
    for (let hour = 8; hour < 20; hour++) {
      this.timeSlots.push(`${hour}:00`);
      this.timeSlots.push(`${hour}:30`);
    }
  }

  generateWeekDays() {
    const start = startOfWeek(this.currentDate);
    this.weekDays = Array(7)
      .fill(null)
      .map((_, i) => addDays(start, i));
  }

  loadData() {
    if (this.selectedDoctorId) {
      this.calendarService
        .getDoctorAppointments(
          this.selectedDoctorId,
          startOfWeek(this.currentDate),
          endOfWeek(this.currentDate)
        )
        .subscribe((appointments) => {
          this.appointments = appointments;
        });

      this.calendarService
        .getDoctorAbsences(this.selectedDoctorId)
        .subscribe((absences) => {
          this.absences = absences;
        });

      this.calendarService
        .getDoctorAvailability(this.selectedDoctorId)
        .subscribe((availabilities) => {
          this.availabilities = availabilities;
        });
    }
  }

  previousWeek() {
    this.currentDate = subWeeks(this.currentDate, 1);
    this.generateWeekDays();
    this.loadData();
  }

  nextWeek() {
    this.currentDate = addWeeks(this.currentDate, 1);
    this.generateWeekDays();
    this.loadData();
  }

  isAvailable(day: Date, timeSlot: string): boolean {
    if (this.isBooked(day, timeSlot) || this.isPast(day, timeSlot)) {
      return false;
    }

    if (
      this.absences.some((absence) => {
        const startDate = new Date(absence.startDate);
        const endDate = new Date(absence.endDate);
        return day >= startDate && day <= endDate;
      })
    ) {
      return false;
    }

    return this.availabilities.some((availability) => {
      const startDate = new Date(availability.startDate);
      const endDate = new Date(availability.endDate);
      const dayOfWeek = day.getDay();

      if (day < startDate || day > endDate) return false;

      if (availability.cyclical && !availability.weekDays.includes(dayOfWeek))
        return false;

      return availability.slots.some((slot) => {
        const [startHours, startMinutes] = slot.start.split(':').map(Number);
        const [endHours, endMinutes] = slot.end.split(':').map(Number);

        const [slotHours, slotMinutes] = timeSlot.split(':').map(Number);

        const slotTime = slotHours * 60 + slotMinutes;
        const startTime = startHours * 60 + startMinutes;
        const endTime = endHours * 60 + endMinutes;

        return slotTime >= startTime && slotTime < endTime;
      });
    });
  }

  isBooked(day: Date, timeSlot: string): boolean {
    return this.appointments.some((app) => {
      const appDate = new Date(app.startTime);
      const appEndDate = new Date(app.endTime);
      const [hours, minutes] = timeSlot.split(':').map(Number);

      const slotStart = new Date(day);
      slotStart.setHours(hours, minutes, 0, 0);

      const slotEnd = new Date(slotStart);
      slotEnd.setMinutes(slotEnd.getMinutes() + 30);

      return (
        isSameDay(appDate, day) && slotStart < appEndDate && slotEnd > appDate
      );
    });
  }
  isPast(day: Date, timeSlot: string): boolean {
    const [hours, minutes] = timeSlot.split(':').map(Number);
    const slotDate = new Date(day);
    slotDate.setHours(hours, minutes, 0, 0);
    return slotDate < new Date();
  }

  getAppointment(day: Date, timeSlot: string): Appointment | null {
    return (
      this.appointments.find((app) => {
        const appDate = new Date(app.startTime);
        return isSameDay(appDate, day) && format(appDate, 'HH:mm') === timeSlot;
      }) || null
    );
  }

  onSlotClick(day: Date, timeSlot: string) {
    if (this.isAvailable(day, timeSlot)) {
      const dialogRef = this.dialog.open(AppointmentDialogComponent, {
        width: '400px',
        data: {
          date: day,
          timeSlot: timeSlot,
          doctorId: this.selectedDoctorId,
        },
      });

      dialogRef.afterClosed().subscribe((result) => {
        if (result) {
          this.loadData();
        }
      });
    }
  }

  isTodayCell(day: Date): boolean {
    return isToday(day);
  }

  isCurrentTimeSlot(slot: string): boolean {
    const now = new Date();
    const [hours, minutes] = slot.split(':').map(Number);

    const slotDate = new Date();
    slotDate.setHours(hours, minutes, 0, 0);

    return (
      isSameDay(now, slotDate) &&
      now.getHours() === hours &&
      now.getMinutes() >= minutes &&
      now.getMinutes() < minutes + 30
    );
  }
}
