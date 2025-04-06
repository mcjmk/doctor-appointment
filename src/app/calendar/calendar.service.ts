import { Injectable } from "@angular/core";
import { AngularFirestore } from "@angular/fire/compat/firestore";
import { Availability } from "./availability.model";
import { from, map, Observable, switchMap, take } from "rxjs";
import { Absence } from "./absence.model";
import { Appointment } from "./appointment.model";
import { User } from "../shared/user";
import { format, isSameDay } from "date-fns";

@Injectable({
  providedIn: "root",
})
export class CalendarService {
  constructor(private firestore: AngularFirestore) {}

  isPast(day: Date, timeSlot: string): boolean {
    const now = new Date();
    const [hours, minutes] = timeSlot.split(":").map(Number);

    const slotDate = new Date(day);
    slotDate.setHours(hours, minutes, 0, 0);

    return slotDate < now;
  }

  isDoctorAbsent(day: Date, absences: Absence[]): boolean {
    return absences.some((absence) => {
      const absenceStart = new Date(absence.startDate.toDate());
      const absenceEnd = new Date(absence.endDate.toDate());
      absenceStart.setHours(0, 0, 0, 0);
      absenceEnd.setHours(23, 59, 59, 999);
      const checkDay = new Date(day);
      checkDay.setHours(0, 0, 0, 0);
      return checkDay >= absenceStart && checkDay <= absenceEnd;
    });
  }

  isDoctorAvailable(
    day: Date,
    timeSlot: string,
    availabilities: Availability[],
  ): boolean {
    return availabilities.some((availability) => {
      const startDate = new Date(availability.startDate.toDate());
      const endDate = new Date(availability.endDate.toDate());
      startDate.setHours(0, 0, 0, 0);
      endDate.setHours(23, 59, 59, 999);

      if (day < startDate || day > endDate) return false;
      const dayOfWeek = day.getDay();
      if (availability.cyclical && !availability.weekDays.includes(dayOfWeek)) {
        return false;
      }

      return availability.slots.some((slot) => {
        const [startHours, startMinutes] = slot.start.split(":").map(Number);
        const [endHours, endMinutes] = slot.end.split(":").map(Number);
        const [slotHours, slotMinutes] = timeSlot.split(":").map(Number);

        const slotTime = slotHours * 60 + slotMinutes;
        const startTime = startHours * 60 + startMinutes;
        const endTime = endHours * 60 + endMinutes;

        return slotTime >= startTime && slotTime < endTime;
      });
    });
  }

  isBooked(day: Date, timeSlot: string, appointments: Appointment[]): boolean {
    return appointments.some((app) => {
      const appStartTime = app.startTime;
      const appEndTime = app.endTime;

      return (
        isSameDay(appStartTime, day) &&
        format(appStartTime, "HH:mm") <= timeSlot &&
        timeSlot < format(appEndTime, "HH:mm") &&
        app.status != "odwołana"
      );
    });
  }

  getAppointment(
    day: Date,
    timeSlot: string,
    appointments: Appointment[],
  ): Appointment | null {
    try {
      return (
        appointments.find((app) => {
          const appStartTime =
            app.startTime?.toDate?.() || new Date(app.startTime);

          const appointmentTimeStr = format(appStartTime, "HH:mm");
          const matchingDay = isSameDay(appStartTime, day);
          const matchingTime = appointmentTimeStr === timeSlot;
          return matchingDay && matchingTime;
        }) || null
      );
    } catch (error) {
      console.error("Error in getAppointment:", error);
      return null;
    }
  }

  getAppointmentsForDay(day: Date, appointments: Appointment[]): Appointment[] {
    return appointments.filter((app) => {
      const appStartTime = app.startTime?.toDate?.() || new Date(app.startTime);
      return isSameDay(appStartTime, day) && app.status != "odwołana";
    });
  }

  getAppointmentCountForDay(day: Date, appointments: Appointment[]): number {
    return this.getAppointmentsForDay(day, appointments).length;
  }

  setDoctorAvailability(availability: Availability): Promise<void> {
    if (availability.id) {
      return this.firestore
        .doc(`availability/${availability.id}`)
        .update(availability);
    }
    return this.firestore.collection("availability").add(availability).then();
  }

  getDoctorAvailability(doctorId: string): Observable<Availability[]> {
    return this.firestore
      .collection<Availability>("availability", (ref) =>
        ref.where("doctorId", "==", doctorId),
      )
      .valueChanges({ idField: "id" });
  }

  setDoctorAbsence(absence: Absence): Promise<void> {
    return this.getDoctorAppointments(
      absence.doctorId,
      absence.startDate,
      absence.endDate,
    )
      .pipe(
        take(1),
        map((appointments) => {
          const batch = this.firestore.firestore.batch();
          appointments
            .filter((app) => app.status !== "odwołana")
            .forEach((app) => {
              const appointmentRef = this.firestore.doc(
                `appointments/${app.id}`,
              ).ref;
              batch.update(appointmentRef, { status: "odwołana" });
            });

          if (absence.id) {
            const absenceRef = this.firestore.doc(`absences/${absence.id}`).ref;
            batch.update(absenceRef, absence);
          } else {
            const absenceRef = this.firestore.collection("absences").doc().ref;
            batch.set(absenceRef, absence);
          }
          return batch;
        }),
        switchMap((batch) => from(batch.commit())),
      )
      .toPromise();
  }

  getDoctorAbsences(doctorId: string): Observable<Absence[]> {
    return this.firestore
      .collection<Absence>("absences", (ref) =>
        ref.where("doctorId", "==", doctorId),
      )
      .valueChanges({ idField: "id" });
  }

  createAppointment(appointment: Appointment): Promise<void> {
    return this.firestore.collection("appointments").add(appointment).then();
  }

  updateAppointment(appointment: Appointment): Promise<void> {
    if (!appointment.id) throw new Error("ID is required");
    return this.firestore
      .doc(`appointments/${appointment.id}`)
      .update(appointment);
  }

  cancelAppointment(appointmentId: string): Promise<void> {
    return this.firestore.doc(`appointments/${appointmentId}`).update({
      status: "odwołana",
    });
  }

  getAvailableDoctors(): Observable<User[]> {
    return this.firestore
      .collection<User>("users", (ref) => ref.where("role", "==", "doctor"))
      .valueChanges({ idField: "uid" });
  }

  getDoctorAppointments(
    doctorId: string,
    startDate: Date,
    endDate: Date,
  ): Observable<Appointment[]> {
    const start = new Date(startDate);
    start.setHours(0, 0, 0, 0);

    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999);

    return this.firestore
      .collection<Appointment>("appointments", (ref) =>
        ref
          .where("doctorId", "==", doctorId)
          .where("startTime", ">=", start)
          .where("startTime", "<=", end)
          .orderBy("startTime"),
      )
      .valueChanges({ idField: "id" })
      .pipe(
        map((appointments) => {
          console.log("Raw appointments from Firebase:", appointments);

          return appointments.map((app) => ({
            ...app,
            startTime: app.startTime?.toDate?.() || new Date(app.startTime),
            endTime: app.endTime?.toDate?.() || new Date(app.endTime),
          }));
        }),
      );
  }

  getPatientAppointments(patientId: string): Observable<Appointment[]> {
    return this.firestore
      .collection<Appointment>("appointments", (ref) =>
        ref
          .where("patientId", "==", patientId)
          .where("startTime", ">=", new Date())
          .orderBy("startTime"),
      )
      .valueChanges({ idField: "id" })
      .pipe(
        map((appointments) =>
          appointments.map((app) => ({
            ...app,
            startTime: this.fromFirebaseDate(app.startTime),
            endTime: this.fromFirebaseDate(app.endTime),
          })),
        ),
      );
  }

  fromFirebaseDate = (timestamp: any): Date => {
    if (timestamp instanceof Date) return timestamp;
    if (timestamp?.toDate) return timestamp.toDate();
    return new Date(timestamp);
  };
}
