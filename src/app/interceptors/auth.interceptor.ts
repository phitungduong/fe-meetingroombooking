import { Injectable } from '@angular/core';
import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, switchMap } from 'rxjs/operators';
import { AuthService } from '../services/auth.service';
import { HttpClient } from '@angular/common/http';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {

  constructor(private auth: AuthService, private http: HttpClient) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {

  const token = this.auth.getAccessToken();

  if (token) {
    req = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
  }

  return next.handle(req).pipe(
    catchError(error => {

      // ✅ BỎ QUA LOGIN & REFRESH TOKEN
      if (
        req.url.includes('/login') ||
        req.url.includes('/refresh-token')
      ) {
        return throwError(() => error);
      }

      // ✅ chỉ refresh khi có refreshToken
      if (error.status === 401 && this.auth.getRefreshToken()) {
        return this.handleRefreshToken(req, next);
      }

      return throwError(() => error);
    })
  );
}

  handleRefreshToken(req: HttpRequest<any>, next: HttpHandler) {

  const refreshToken = this.auth.getRefreshToken();

  if (!refreshToken) {
    return throwError(() => new Error('No refresh token'));
  }

  return this.auth.refreshToken(refreshToken).pipe(
    switchMap((res: any) => {

      this.auth.saveToken(res);

      const newReq = req.clone({
        setHeaders: {
          Authorization: `Bearer ${res.accessToken}`
        }
      });

      return next.handle(newReq);
    }),
    catchError(err => {
      // ❌ refresh fail → logout luôn
      this.auth.logout();
      return throwError(() => err);
    })
  );
}
}
