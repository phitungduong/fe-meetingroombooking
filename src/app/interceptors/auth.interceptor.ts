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

    // 🔥 gắn access token
    if (token) {
      req = req.clone({
        setHeaders: {
          Authorization: `Bearer ${token}`
        }
      });
    }

    return next.handle(req).pipe(
      catchError(error => {

        // 🔥 nếu 401 → refresh token
        if (error.status === 401) {
          return this.handleRefreshToken(req, next);
        }

        return throwError(() => error);
      })
    );
  }

  handleRefreshToken(req: HttpRequest<any>, next: HttpHandler) {

    const refreshToken = this.auth.getRefreshToken();

    return this.auth.refreshToken(refreshToken!).pipe(
      switchMap((res: any) => {

        // 🔥 lưu token mới
        this.auth.saveToken(res);

        // 🔥 clone request mới
        const newReq = req.clone({
          setHeaders: {
            Authorization: `Bearer ${res.accessToken}`
          }
        });

        return next.handle(newReq);
      })
    );
  }
}
