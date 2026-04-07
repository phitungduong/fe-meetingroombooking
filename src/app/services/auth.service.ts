import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { jwtDecode } from 'jwt-decode';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private apiUrl = 'https://localhost:44371/api/Auth';

  constructor(private http: HttpClient) {}

  // ================= API =================

  register(data: any) {
    return this.http.post(`${this.apiUrl}/register`, data);
  }

  login(data: any) {
    return this.http.post<any>(`${this.apiUrl}/login`, data);
  }

  refreshToken(refreshToken: string) {
    return this.http.post<any>(`${this.apiUrl}/refresh-token`, {
      refreshToken
    });
  }

  // ================= TOKEN =================

  saveToken(res: any) {
    localStorage.setItem('accessToken', res.accessToken);
    localStorage.setItem('refreshToken', res.refreshToken);
  }

  getAccessToken(): string | null {
    return localStorage.getItem('accessToken');
  }

  getRefreshToken(): string | null {
    return localStorage.getItem('refreshToken');
  }

  logout() {
    localStorage.clear();
  }

  isLoggedIn(): boolean {
    return !!this.getAccessToken();
  }

  // ================= USER INFO =================

  private getDecodedToken(): any {
    const token = this.getAccessToken();
    if (!token) return null;

    return jwtDecode(token);
  }

  getFullName(): string {
    const decoded = this.getDecodedToken();
    return decoded?.name ||
      decoded?.["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name"] ||
      '';
  }

  getEmail(): string {
    const decoded = this.getDecodedToken();
    return decoded?.email ||
      decoded?.["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress"] ||
      '';
  }

  getRole(): string {
    const decoded = this.getDecodedToken();

    return decoded?.role ||
      decoded?.["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"] ||
      '';
  }

  // ================= USER API =================

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
