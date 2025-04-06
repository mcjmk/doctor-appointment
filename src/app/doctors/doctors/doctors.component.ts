import { AuthService } from "./../../shared/auth.service";
import { Component, OnInit } from "@angular/core";
import { Observable } from "rxjs";
import { Router } from "@angular/router";
import { User } from "../../shared/user";
import { AdminService } from "../../admin/admin.service";

@Component({
  selector: "app-doctors",
  templateUrl: "doctors.component.html",
  styles: [
    `
      .doctor-card {
        height: 100%;
        display: flex;
        flex-direction: column;
      }

      .doctor-card mat-card-content {
        flex-grow: 1;
      }

      .doctor-card mat-card-actions {
        padding: 16px;
      }
    `,
  ],
})
export class DoctorsComponent implements OnInit {
  doctors$: Observable<User[]>;

  constructor(
    private authService: AuthService,
    private router: Router,
  ) {
    this.doctors$ = this.authService.getDoctors();
  }

  ngOnInit(): void {}
}
