import { SharedModule } from './../shared/shared.module';
import { Injectable } from '@angular/core';
import {
  CanActivate,
  ActivatedRouteSnapshot,
  RouterStateSnapshot,
  Router,
} from '@angular/router';
import { Observable } from 'rxjs';
import { map, take } from 'rxjs/operators';
import { AuthService } from '../shared/auth.service';
import { User } from '../shared/user';

@Injectable({
  providedIn: 'root',
})
export class AuthGuard implements CanActivate {
  constructor(private auth: AuthService, private router: Router) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean> {
    return this.auth.userData.pipe(
      map((user) => {
        if (!user) {
          this.router.navigate(['/login']);
          console.log('tried to go to: forbidden');
          return false;
        }
        const requiredRole = route.data['role'];
        console.log(`current role: ${this.auth.userRole}`);
        if (this.auth.userRole != requiredRole) {
          this.router.navigate(['/']);
          return false;
        }
        return true;
      })
    );
  }
}
