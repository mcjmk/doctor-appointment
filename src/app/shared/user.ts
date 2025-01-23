export interface User {
  uid: string;
  email: string | null;
  role: 'admin' | 'doctor' | 'patient';
  banned?: boolean;
  displayName?: string;
}
