export type Specialization =
  | "Lekarz rodzinny"
  | "Kardiolog"
  | "Dermatolog"
  | "Neurolog"
  | "Ortopeda"
  | "Pediatra"
  | "Laryngolog"
  | "Chirurg";

export interface DoctorDetails {
  firstName: string;
  lastName: string;
  specialization: Specialization;
  description: string | null;
}

export interface User {
  uid: string;
  email: string | null;
  role: "admin" | "doctor" | "patient";
  banned?: boolean;
  displayName?: string;
  firstName?: string;
  lastName?: string;
  doctorDetails?: DoctorDetails;
}
