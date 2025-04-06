import { Component, OnInit } from "@angular/core";
import { CalendarService } from "../calendar/calendar.service";
import { AuthService } from "../shared/auth.service";
import { Appointment } from "../calendar/appointment.model";
import firebase from "firebase/compat/app";

@Component({
  selector: "app-cart",
  templateUrl: "./cart.component.html",
  styleUrl: "./cart.component.css",
})
export class CartComponent implements OnInit {
  upcomingAppointments: Appointment[] = [];

  constructor(
    private calendarService: CalendarService,
    private authService: AuthService,
  ) {}

  ngOnInit() {
    this.authService.getCurrentUser().then((user) => {
      if (user) {
        this.calendarService
          .getPatientAppointments(user.uid)
          .subscribe((appointments) => {
            this.upcomingAppointments = appointments;
            this.upcomingAppointments = appointments.map((app) => ({
              ...app,
              startTime:
                app.startTime instanceof firebase.firestore.Timestamp
                  ? app.startTime.toDate()
                  : app.startTime,
              endTime:
                app.endTime instanceof firebase.firestore.Timestamp
                  ? app.endTime.toDate()
                  : app.endTime,
            }));
          });
      }
    });
  }

  cancelAppointment(appointment: Appointment) {
    if (!appointment.id) {
      return;
    }
    const appointmentId = appointment.id;
    this.calendarService
      .cancelAppointment(appointmentId)
      .then(() => {
        this.upcomingAppointments = this.upcomingAppointments.filter(
          (app) => app.id !== appointmentId,
        );
      })
      .catch((error) => {
        console.error("Error canceling appointment:", error);
      });
  }
}
