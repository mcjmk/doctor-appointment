import { Observable } from 'rxjs';
import { AuthService } from '../shared/auth.service';
import { AsyncPipe } from '@angular/common';
import { Component } from '@angular/core';
import firebase from 'firebase/compat/app';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrl: './header.component.css',
})
export class HeaderComponent {
  user$: Observable<firebase.User | null>;

  constructor(public authService: AuthService) {
    this.user$ = this.authService.userData;
  }

  logout(): void {
    this.authService.logout().catch((error) => {
      console.error('Error during logout:', error);
    });
  }
}
