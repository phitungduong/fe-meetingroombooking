import { Injectable } from '@angular/core';
import {
  HttpEvent,
  HttpHandler,
  HttpInterceptor,
  HttpRequest,
  HttpErrorResponse
} from '@angular/common/http';

import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { ToastrService } from 'ngx-toastr';

@Injectable()
export class ErrorInterceptor implements HttpInterceptor {

  constructor(private toastr: ToastrService) {}

  intercept(req: HttpRequest<any>, next: HttpHandler) {

  return next.handle(req).pipe(

    catchError((error: HttpErrorResponse) => {

      let message = "Có lỗi xảy ra";

      if (error.error?.message) {
        message = error.error.message;
      }

      if (error.status === 401) {
        message = "Bạn cần đăng nhập";
      }

      if (error.status === 500) {
        message = "Lỗi hệ thống";
      }

      this.toastr.error(message);

      return throwError(() => error);
    })
  );
}
}
