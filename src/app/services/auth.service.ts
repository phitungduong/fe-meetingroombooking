import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { jwtDecode } from 'jwt-decode';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private apiUrl = 'https://localhost:44371/api/Auth';

  constructor(private http: HttpClient) {}

  // 🔥 API
  register(data: any) {
    return this.http.post(`${this.apiUrl}/register`, data);
  }

  login(data: any) {
    return this.http.post(`${this.apiUrl}/login`, data);
  }

  // 🔥 LƯU TOKEN (QUAN TRỌNG)
  saveToken(token: string) {
    sessionStorage.setItem('token', token);
  }

  // 🔥 LẤY TOKEN
  getToken(): string | null {
    return sessionStorage.getItem('token');
  }

  // 🔥 LOGOUT
  logout() {
    sessionStorage.clear();
  }

  // 🔥 LẤY FULLNAME
  getFullName(): string {
    const token = this.getToken();
    if (!token) return '';

    const decoded: any = jwtDecode(token);
    return decoded.fullname;
  }
  getEmail(): string {
    const token = this.getToken();
    if (!token) return '';

    const decoded: any = jwtDecode(token);
    return decoded.email;
  }
  // 🔥 CHECK LOGIN
  isLoggedIn(): boolean {
    return !!this.getToken();
  }

  getAllUsers() {
    return this.http.get(`${this.apiUrl}/all-user`);
  }
  getUserById(id: string) {
    return this.http.get(`${this.apiUrl}/user/${id}`);
  }
  deleteUser(id: string) {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }
  updateProfile(data: any) {
    return this.http.put(`${this.apiUrl}/user`, data);
  }
}
