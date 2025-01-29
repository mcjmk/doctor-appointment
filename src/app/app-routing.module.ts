import { CalendarViewComponent } from './calendar/calendar-view/calendar-view.component';
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './auth/login/login.component';
import { RegisterComponent } from './auth/register/register.component';
import { HomeComponent } from './home/home.component';
import { CartComponent } from './cart/cart.component';
import { AuthGuard } from './guard/auth.guard';
import { DoctorsComponent } from './doctors/doctors/doctors.component';
import { AdminPanelComponent } from './admin/admin-panel/admin-panel.component';
import { AppointmentsComponent } from './appointments/appointments.component';
import { AvailabilityFormComponent } from './calendar/availability-form/availability-form.component';
import { AbsenceFormComponent } from './calendar/absence-form/absence-form.component';

const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  {
    path: 'doctors',
    component: DoctorsComponent,
  },
  {
    path: 'calendar',
    canActivate: [AuthGuard],
    data: { roles: ['patient', 'doctor'] },
    children: [
      {
        path: '',
        component: CalendarViewComponent,
      },
      {
        path: 'availability',
        component: AvailabilityFormComponent,
        canActivate: [AuthGuard],
        data: { role: 'doctor' },
      },
      {
        path: 'absence',
        component: AbsenceFormComponent,
        canActivate: [AuthGuard],
        data: { role: 'doctor' },
      },
    ],
  },
  {
    path: 'appointments',
    component: AppointmentsComponent,
    canActivate: [AuthGuard],
    data: { role: 'patient' },
  },
  {
    path: 'adminPanel',
    component: AdminPanelComponent,
    canActivate: [AuthGuard],
    data: { role: 'admin' },
  },
  {
    path: 'cart',
    component: CartComponent,
    canActivate: [AuthGuard],
    data: { role: 'patient' },
  },
  { path: '**', redirectTo: '' },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
