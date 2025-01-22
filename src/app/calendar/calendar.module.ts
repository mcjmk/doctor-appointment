import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CalendarViewComponent } from './calendar-view/calendar-view.component';
import { AvailabilityComponent } from './availability/availability.component';
import { AbsencesComponent } from './absences/absences.component';



@NgModule({
  declarations: [
    CalendarViewComponent,
    AvailabilityComponent,
    AbsencesComponent
  ],
  imports: [
    CommonModule
  ]
})
export class CalendarModule { }
