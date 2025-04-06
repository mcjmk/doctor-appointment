import { Component } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { AuthService } from "../../shared/auth.service";
import { Router } from "@angular/router";
import { passwordMatchValidator } from "./password-match.validator";

@Component({
  selector: "app-register",
  templateUrl: "./register.component.html",
  styleUrl: "./register.component.css",
})
export class RegisterComponent {
  registerForm: FormGroup;
  errorMessage: string = "";

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
  ) {
    this.registerForm = this.fb.group(
      {
        email: ["", [Validators.required, Validators.email]],
        password: ["", [Validators.required, Validators.minLength(6)]],
        passwordConf: ["", [Validators.required, Validators.minLength(6)]],
      },
      {
        validators: passwordMatchValidator,
      },
    );
  }

  onSubmit(): void {
    if (this.registerForm.valid) {
      const { email, password } = this.registerForm.value;
      console.log("Register info:", email, password);
      this.authService
        .register(email, password)
        .then(() => {
          this.router.navigate(["/"]);
        })
        .catch((error) => {
          this.errorMessage = this.getErrorMessage(error);
        });
    }
  }

  private getErrorMessage(error: any): string {
    switch (error.code) {
      case "auth/email-already-in-use":
        return "Ten adres email jest już używany.";
      case "auth/invalid-email":
        return "Nieprawidłowy adres email.";
      case "auth/weak-password":
        return "Hasło jest zbyt słabe.";
      default:
        return "Wystąpił błąd";
    }
  }
}
