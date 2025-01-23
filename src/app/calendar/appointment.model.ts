export type AppointmentType =
  | 'pierwsza'
  | 'kontrolna'
  | 'choroba przewlekła'
  | 'recepta';
export type AppointmentStatus =
  | 'dostępna'
  | 'zajęta'
  | 'odwołana'
  | 'zakończona';

export interface Appointment {
  id?: string;
  doctorId: string;
  patientId?: string;
  startTime: Date;
  endTime: Date;
  type: AppointmentType;
  status: AppointmentStatus;
  patientName: string;
  patientGender: 'K' | 'M' | 'inna';
  patientAge: number;
  notes?: string;
}
