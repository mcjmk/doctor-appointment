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
} from 'date-fns';
import { AppointmentDialogComponent } from '../appointment-dialog/appointment-dialog.component';

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
  appointments: Appointment[] = [];
  currentDate = new Date();
  displayHours = 6;

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
    return !this.isBooked(day, timeSlot) && !this.isPast(day, timeSlot);
  }

  isBooked(day: Date, timeSlot: string): boolean {
    return this.appointments.some((app) => {
      const appDate = new Date(app.startTime);
      return isSameDay(appDate, day) && format(appDate, 'HH:mm') === timeSlot;
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
          this.authService.userData.subscribe((user) => {
            if (!user) return;

            const appointment = {
              ...result,
              patientId: user.uid,
            };

            this.calendarService
              .createAppointment(appointment)
              .then(() => this.loadData())
              .catch((error) =>
                console.error('Error booking appointment:', error)
              );
          });
        }
      });
    }
  }
}
