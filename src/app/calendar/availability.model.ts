export interface TimeSlot {
  start: string;
  end: string;
}

export interface Availability {
  id?: string;
  doctorId: string;
  startDate: any;
  endDate: any;
  cyclical: boolean;
  slots: TimeSlot[];
  weekDays: number[];
}
