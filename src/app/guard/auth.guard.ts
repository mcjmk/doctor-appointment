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

  canActivate(route: ActivatedRouteSnapshot): Observable<boolean> {
    return this.auth.currentUser.pipe(
      take(1),
      map((user) => {
        if (!user) {
          this.router.navigate(['/login']);
          return false;
        }
        const requiredRole = route.data['role'];
        if (requiredRole && user.role !== requiredRole) {
          this.router.navigate(['/']);
          return false;
        }
        return true;
      })
    );
  }
}
