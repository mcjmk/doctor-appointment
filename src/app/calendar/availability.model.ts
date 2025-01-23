export interface TimeSlot {
  start: string;
  end: string;
}

export interface Availability {
  id?: string;
  doctorId: string;
  startDate: Date;
  endDate: Date;
  cyclical: boolean;
  slots: TimeSlot[];
  weekDays: number[];
}
