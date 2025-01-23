export interface Absence {
  id?: string;
  doctorId: string;
  startDate: Date;
  endDate: Date;
  description?: string;
}
