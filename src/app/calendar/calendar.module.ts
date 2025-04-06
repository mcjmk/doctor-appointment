import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { CalendarViewComponent } from "./calendar-view/calendar-view.component";
import { AvailabilityFormComponent } from "./availability-form/availability-form.component";
import { AbsenceFormComponent } from "./absence-form/absence-form.component";
import { AppointmentDialogComponent } from "./appointment-dialog/appointment-dialog.component";

import { MatCardModule } from "@angular/material/card";
import { MatButtonModule } from "@angular/material/button";
import { MatSelectModule } from "@angular/material/select";
import { MatInputModule } from "@angular/material/input";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatDatepickerModule } from "@angular/material/datepicker";
import { MatNativeDateModule, MatOptionModule } from "@angular/material/core";
import { MatDialogModule } from "@angular/material/dialog";
import { MatCheckboxModule } from "@angular/material/checkbox";
import { RouterModule } from "@angular/router";
import { MatIconModule } from "@angular/material/icon";

@NgModule({
  declarations: [
    CalendarViewComponent,
    AvailabilityFormComponent,
    AbsenceFormComponent,
    AppointmentDialogComponent,
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatSelectModule,
    MatInputModule,
    MatFormFieldModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatDialogModule,
    MatCheckboxModule,
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatSelectModule,
    MatButtonModule,
    MatInputModule,
    MatDatepickerModule,
    MatCardModule,
    MatOptionModule,
    RouterModule,
  ],
  exports: [
    CalendarViewComponent,
    AvailabilityFormComponent,
    AbsenceFormComponent,
  ],
})
export class CalendarModule {}
