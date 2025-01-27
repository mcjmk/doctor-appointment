import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { Availability } from './availability.model';
import { map, Observable } from 'rxjs';
import { Absence } from './absence.model';
import { Appointment } from './appointment.model';
import { User } from '../shared/user';

@Injectable({
  providedIn: 'root',
})
export class CalendarService {
  constructor(private firestore: AngularFirestore) {}

  setDoctorAvailability(availability: Availability): Promise<void> {
    if (availability.id) {
      return this.firestore
        .doc(`availability/${availability.id}`)
        .update(availability);
    }
    return this.firestore.collection('availability').add(availability).then();
  }

  getDoctorAvailability(doctorId: string): Observable<Availability[]> {
    return this.firestore
      .collection<Availability>('availability', (ref) =>
        ref.where('doctorId', '==', doctorId)
      )
      .valueChanges({ idField: 'id' });
  }

  setDoctorAbsence(absence: Absence): Promise<void> {
    if (absence.id) {
      return this.firestore.doc(`absences/${absence.id}`).update(absence);
    }
    return this.firestore.collection('absences').add(absence).then();
  }

  getDoctorAbsences(doctorId: string): Observable<Absence[]> {
    return this.firestore
      .collection<Absence>('absences', (ref) =>
        ref.where('doctorId', '==', doctorId)
      )
      .valueChanges({ idField: 'id' });
  }

  createAppointment(appointment: Appointment): Promise<void> {
    return this.firestore.collection('appointments').add(appointment).then();
  }

  updateAppointment(appointment: Appointment): Promise<void> {
    if (!appointment.id) throw new Error('ID is required');
    return this.firestore
      .doc(`appointments/${appointment.id}`)
      .update(appointment);
  }

  cancelAppointment(appointmentId: string): Promise<void> {
    return this.firestore.doc(`appointments/${appointmentId}`).update({
      status: 'odwołana',
    });
  }

  getAvailableDoctors(): Observable<User[]> {
    return this.firestore
      .collection<User>('users', (ref) => ref.where('role', '==', 'doctor'))
      .valueChanges({ idField: 'uid' });
  }

  getDoctorAppointments(
    doctorId: string,
    startDate: Date,
    endDate: Date
  ): Observable<Appointment[]> {
    return this.firestore
      .collection<Appointment>('appointments', (ref) =>
        ref
          .where('doctorId', '==', doctorId)
          .where('startTime', '>=', startDate)
          .where('startTime', '<=', endDate)
          .orderBy('startTime')
      )
      .valueChanges({ idField: 'id' })
      .pipe(
        map((appointments) => {
          console.log('Raw appointments from Firebase:', appointments);

          return appointments.map((app) => ({
            ...app,
            startTime: app.startTime?.toDate?.() || new Date(app.startTime),
            endTime: app.endTime?.toDate?.() || new Date(app.endTime),
          }));
        })
      );
  }

  getPatientAppointments(patientId: string): Observable<Appointment[]> {
    return this.firestore
      .collection<Appointment>('appointments', (ref) =>
        ref
          .where('patientId', '==', patientId)
          .where('startTime', '>=', new Date())
          .orderBy('startTime')
      )
      .valueChanges({ idField: 'id' })
      .pipe(
        map((appointments) =>
          appointments.map((app) => ({
            ...app,
            startTime: this.fromFirebaseDate(app.startTime),
            endTime: this.fromFirebaseDate(app.endTime),
          }))
        )
      );
  }

  fromFirebaseDate = (timestamp: any): Date => {
    if (timestamp instanceof Date) return timestamp;
    if (timestamp?.toDate) return timestamp.toDate();
    return new Date(timestamp);
  };
}
