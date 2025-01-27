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

          this.appointments = appointments;
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

  isAvailable(day: Date, timeSlot: string): boolean {
    // if (this.isBooked(day, timeSlot) || this.isPast(day, timeSlot)) {
    //   return false;
    // }

    // if (
    //   this.absences.some((absence) => {
    //     const startDate = new Date(absence.startDate);
    //     const endDate = new Date(absence.endDate);
    //     return day >= startDate && day <= endDate;
    //   })
    // ) {
    //   return false;
    // }

    return this.availabilities.some((availability) => {
      const startDate = new Date(availability.startDate);
      const endDate = new Date(availability.endDate);
      startDate.setHours(0, 0, 0, 0);
      endDate.setHours(23, 59, 59, 999);

      const currentDate = new Date(day);
      currentDate.setHours(0, 0, 0, 0);

      if (day < startDate || day > endDate) return false;

      const dayOfWeek = day.getDay();
      if (availability.cyclical && !availability.weekDays.includes(dayOfWeek))
        return false;

      return availability.slots.some((slot) => {
        const [startHours, startMinutes] = slot.start.split(':').map(Number);
        const [endHours, endMinutes] = slot.end.split(':').map(Number);

        const [slotHours, slotMinutes] = timeSlot.split(':').map(Number);

        const slotTime = slotHours * 60 + slotMinutes;
        const startTime = startHours * 60 + startMinutes;
        const endTime = endHours * 60 + endMinutes;

        return slotTime > startTime && slotTime < endTime;
      });
    });
  }

  isBooked(day: Date, timeSlot: string): boolean {
    try {
      return this.appointments.some((app) => {
        const appStartTime =
          app.startTime?.toDate?.() || new Date(app.startTime);
        const appEndTime = app.endTime?.toDate?.() || new Date(app.endTime);

        const [hours, minutes] = timeSlot.split(':').map(Number);
        const slotStart = new Date(day);
        slotStart.setHours(hours, minutes, 0, 0);

        const slotEnd = new Date(slotStart);
        slotEnd.setMinutes(slotEnd.getMinutes() + 30);

        // Sprawdzamy tylko czy slot jest dokładnie tym samym czasem co wizyta
        const isBooked =
          isSameDay(appStartTime, day) &&
          format(appStartTime, 'HH:mm') === timeSlot;

        if (isBooked) {
          // console.log('Found booked slot:', {
          //   id: app.id,
          //   slotTime: timeSlot,
          //   appStartTime: format(appStartTime, 'yyyy-MM-dd HH:mm'),
          //   appEndTime: format(appEndTime, 'yyyy-MM-dd HH:mm'),
          // });
        }

        return isBooked;
      });
    } catch (error) {
      console.error('Error in isBooked:', error);
      return false;
    }
  }

  isPast(day: Date, timeSlot: string): boolean {
    const now = new Date();
    if (day < now) {
      return true;
    }
    if (isSameDay(day, now)) {
      const [hours, minutes] = timeSlot.split(':').map(Number);
      const slotDate = new Date(day);
      slotDate.setHours(hours, minutes, 0, 0);

      return slotDate.getTime() < now.getTime();
    }
    return false;
  }

  getAppointment(day: Date, timeSlot: string): Appointment | null {
    // console.log('Finding appointment for:', { day, timeSlot });
    // console.log('Available appointments:', this.appointments);

    try {
      return (
        this.appointments.find((app) => {
          // Upewnij się, że mamy poprawne daty
          const appStartTime =
            app.startTime?.toDate?.() || new Date(app.startTime);

          // Format godziny z appointment
          const appointmentTimeStr = format(appStartTime, 'HH:mm');

          const matchingDay = isSameDay(appStartTime, day);
          const matchingTime = appointmentTimeStr === timeSlot;

          // console.log('Checking appointment:', {
          //   id: app.id,
          //   startTime: appStartTime,
          //   timeSlot,
          //   appointmentTimeStr,
          //   matchingDay,
          //   matchingTime,
          // });

          return matchingDay && matchingTime;
        }) || null
      );
    } catch (error) {
      console.error('Error in getAppointment:', error);
      return null;
    }
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
