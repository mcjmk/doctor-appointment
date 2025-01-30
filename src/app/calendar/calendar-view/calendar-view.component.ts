import { Component, OnInit } from '@angular/core';
import { User } from '../../shared/user';
import { Appointment } from '../appointment.model';
import { combineLatest, Observable } from 'rxjs';
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
  displayStartHour = 7;
  hoursToDisplay = 6;
  maxHour = 22;
  minHour = 6;

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
    for (let hour = this.minHour; hour < this.maxHour; hour++) {
      const h = hour.toString().padStart(2, '0');
      this.timeSlots.push(`${h}:00`);
      this.timeSlots.push(`${h}:30`);
    }
  }

  generateWeekDays() {
    const start = startOfWeek(this.currentDate, { weekStartsOn: 1 });
    this.weekDays = Array(7)
      .fill(null)
      .map((_, i) => addDays(start, i));
  }

  loadData() {
    if (this.selectedDoctorId) {
      const start = startOfWeek(this.currentDate, { weekStartsOn: 1 });
      const end = endOfWeek(this.currentDate, { weekStartsOn: 1 });

      console.log('Loading data for doctor:', this.selectedDoctorId);
      combineLatest([
        this.calendarService.getDoctorAppointments(
          this.selectedDoctorId,
          start,
          end
        ),
        this.calendarService.getDoctorAbsences(this.selectedDoctorId),
        this.calendarService.getDoctorAvailability(this.selectedDoctorId),
      ]).subscribe({
        next: ([appointments, absences, availabilities]) => {
          console.log('New data loaded:', {
            appointments,
            absences,
            availabilities,
          });

          this.appointments = appointments.filter(
            (app) => app.status !== 'odwołana'
          );

          this.absences = absences;
          this.availabilities = availabilities;
        },
        error: (error) => {
          console.error('Error loading data:', error);
        },
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

  isPast(day: Date, timeSlot: string): boolean {
    return this.calendarService.isPast(day, timeSlot);
  }

  isDoctorAbsent(day: Date): boolean {
    return this.calendarService.isDoctorAbsent(day, this.absences);
  }

  isDoctorAvailable(day: Date, timeSlot: string): boolean {
    return this.calendarService.isDoctorAvailable(
      day,
      timeSlot,
      this.availabilities
    );
  }

  isAvailable(day: Date, timeSlot: string): boolean {
    if (this.isPast(day, timeSlot)) return false;
    if (this.isDoctorAvailable(day, timeSlot)) {
      if (this.isDoctorAbsent(day) || this.isBooked(day, timeSlot))
        return false;
      return true;
    }
    return false;
  }

  isBooked(day: Date, timeSlot: string): boolean {
    return this.calendarService.isBooked(day, timeSlot, this.appointments);
  }

  getAppointment(day: Date, timeSlot: string): Appointment | null {
    return this.calendarService.getAppointment(
      day,
      timeSlot,
      this.appointments
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

  isToday(day: Date): boolean {
    return isToday(day);
  }

  isCurrentTimeSlot(slot: string): boolean {
    const now = new Date();
    const [hours, minutes] = slot.split(':').map(Number);

    return (
      now.getHours() === hours &&
      now.getMinutes() >= minutes &&
      now.getMinutes() < minutes + 30
    );
  }

  isCurrentDateTimeSlot(day: Date, slot: string): boolean {
    return isToday(day) && this.isCurrentTimeSlot(slot);
  }

  getAppointmentCountForDay(day: Date): number {
    return this.calendarService.getAppointmentCountForDay(
      day,
      this.appointments
    );
  }
  get displayedTimeSlots(): string[] {
    const slotsPerHour = 2;
    const startIndex = (this.displayStartHour - this.minHour) * slotsPerHour;
    const numberOfSlots = this.hoursToDisplay * slotsPerHour;
    return this.timeSlots.slice(startIndex, startIndex + numberOfSlots);
  }

  scrollUp() {
    if (this.displayStartHour > this.minHour) {
      this.displayStartHour = Math.max(
        this.minHour,
        this.displayStartHour - this.hoursToDisplay
      );
    }
  }

  scrollDown() {
    const maxStartHour = this.maxHour - this.hoursToDisplay;
    if (this.displayStartHour < maxStartHour) {
      this.displayStartHour = Math.min(
        maxStartHour,
        this.displayStartHour + this.hoursToDisplay
      );
    }
  }

  get canScrollUp(): boolean {
    return this.displayStartHour > this.minHour;
  }

  get canScrollDown(): boolean {
    return this.displayStartHour < this.maxHour - this.hoursToDisplay;
  }

  getAppointmentClass(appointment: Appointment): string {
    const classes = ['appointment-info'];
    if (appointment.type === 'pierwsza') {
      classes.push('first-visit');
    } else if (appointment.type === 'kontrolna') {
      classes.push('follow-up');
    } else if (appointment.type === 'choroba przewlekła') {
      classes.push('chronic');
    } else if (appointment.type === 'recepta') {
      classes.push('prescription');
    }
    return classes.join(' ');
  }
}
