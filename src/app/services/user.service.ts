import { Injectable } from '@angular/core';
import { jwtDecode } from 'jwt-decode';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private user: any = null;

  constructor() {
    this.loadUser();
  }

  // Load user từ token
  loadUser() {
  const token = sessionStorage.getItem("token");

  if (!token) {
    return;
  }

  try {
    const decoded: any = jwtDecode(token);

    this.user = decoded; // ✅ GÁN VÀO ĐÂY

    console.log("User:", this.user);
  } catch (e) {
    console.error("Invalid token", e);
  }
}

  // Lấy fullname
  getFullName(): string {
    const token = sessionStorage.getItem('token');

    if (!token) return '';

    const decoded: any = jwtDecode(token);

    return decoded[
      'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name'
    ];
  }

  // Lấy userId
  getUserId() {
    const token = sessionStorage.getItem('token');

    if (!token) return null;

    const decoded: any = jwtDecode(token);

    return decoded[
      'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier'
    ];
  }

  // Lấy email
  getEmail(): string {
  return this.user?.[
    'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress'
  ];
}

  // Logout
  logout() {
    sessionStorage.removeItem('token');
    this.user = null;
  }
  getUser() {
  return this.user;
}
}
