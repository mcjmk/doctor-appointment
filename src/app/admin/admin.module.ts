import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { AdminPanelComponent } from "./admin-panel/admin-panel.component";
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";

import { MatCardModule } from "@angular/material/card";
import { MatTableModule } from "@angular/material/table";
import { MatSelectModule } from "@angular/material/select";
import { MatOptionModule } from "@angular/material/core";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatButtonModule } from "@angular/material/button";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { DoctorEditDialogComponent } from "./doctor-edit-dialog/doctor-edit-dialog.component";
import { MatDialogModule } from "@angular/material/dialog";
import { MatInputModule } from "@angular/material/input";

@NgModule({
  declarations: [AdminPanelComponent, DoctorEditDialogComponent],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatTableModule,
    MatCardModule,
    MatButtonModule,
    MatSelectModule,
    MatFormFieldModule,
    MatInputModule,
    MatDialogModule,
  ],
  exports: [AdminPanelComponent],
})
export class AdminModule {}
