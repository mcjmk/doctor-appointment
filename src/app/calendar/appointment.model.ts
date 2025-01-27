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
  startTime: any;
  endTime: any;
  type: AppointmentType;
  status: AppointmentStatus;
  patientName: string;
  patientGender: 'K' | 'M' | 'inna';
  patientAge: number;
  notes?: string;
}
