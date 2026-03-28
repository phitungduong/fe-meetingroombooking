import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AdminGuard implements CanActivate {

  constructor(private router: Router) {}

  canActivate(): boolean {
  const token = sessionStorage.getItem('token');
  const role = sessionStorage.getItem('role');

  if (token && role === 'Admin') {
    return true;
  }

  this.router.navigate(['/login']);
  return false;
}
}
