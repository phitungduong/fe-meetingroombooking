import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { jwtDecode } from 'jwt-decode';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {

  constructor(
    private router: Router,
    private authService: AuthService
  ) {}

  canActivate(): boolean {

  const token = this.authService.getAccessToken();

  if (!token) {
    this.router.navigate(['/login']);
    return false;
  }

  try {
    const decoded: any = jwtDecode(token);

    const isExpired = decoded.exp * 1000 < Date.now();

    if (isExpired) {
      this.authService.logout();
      this.router.navigate(['/login']);
      return false;
    }

    return true;

  } catch {
    this.authService.logout();
    this.router.navigate(['/login']);
    return false;
  }
}
}
