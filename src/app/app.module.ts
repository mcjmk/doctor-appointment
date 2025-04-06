import { NgModule } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { CommonModule } from "@angular/common";

import { MatOptionModule } from "@angular/material/core";
import { BrowserModule } from "@angular/platform-browser";
import { provideAnimationsAsync } from "@angular/platform-browser/animations/async";
import { AppRoutingModule } from "./app-routing.module";
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";
import { FirestoreModule } from "@angular/fire/firestore";

import { AngularFireModule } from "@angular/fire/compat";
import { environment } from "../environments/environment";
import { AuthModule } from "./auth/auth.module";

import { MatCardModule } from "@angular/material/card";
import { MatProgressSpinnerModule } from "@angular/material/progress-spinner";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatButtonModule } from "@angular/material/button";
import { MatToolbarModule } from "@angular/material/toolbar";
import { MatInputModule } from "@angular/material/input";

import { AppComponent } from "./app.component";
import { HeaderComponent } from "./header/header.component";
import { HomeComponent } from "./home/home.component";
import { CartComponent } from "./cart/cart.component";
import { HistoryComponent } from "./history/history.component";
import { DoctorsComponent } from "./doctors/doctors/doctors.component";
import { MatTableModule } from "@angular/material/table";
import { MatSelectModule } from "@angular/material/select";
import { MatDialogModule } from "@angular/material/dialog";
import { AdminModule } from "./admin/admin.module";
import { CalendarModule } from "./calendar/calendar.module";
@NgModule({
  declarations: [
    AppComponent,
    HeaderComponent,
    HomeComponent,
    CartComponent,
    HistoryComponent,
    DoctorsComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    MatCardModule,
    MatProgressSpinnerModule,
    MatFormFieldModule,
    MatButtonModule,
    MatInputModule,
    MatToolbarModule,
    MatOptionModule,
    MatSelectModule,
    MatDialogModule,
    MatTableModule,
    MatSelectModule,
    FormsModule,
    AngularFireModule.initializeApp(environment.firebaseConfig),
    FirestoreModule,
    AdminModule,
    CommonModule,
    BrowserAnimationsModule,
    AuthModule,
    CalendarModule,
  ],
  providers: [provideAnimationsAsync()],
  exports: [HeaderComponent],
  bootstrap: [AppComponent],
})
export class AppModule {}
