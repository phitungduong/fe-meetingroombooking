import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { FormBuilder, Validators, FormGroup } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { jwtDecode } from "jwt-decode";

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {

  form: FormGroup;
  error: string = '';
  hide = true;

  constructor(
    private router: Router,
    private authService: AuthService,
    private fb: FormBuilder,
    private toastr: ToastrService
  ) {

    this.form = this.fb.group({
      username: ['', Validators.required],
      password: ['', Validators.required]
    });

  }

  submit() {

    if (this.form.invalid) {
      this.toastr.warning('Vui lòng nhập username và password');
      return;
    }

    this.authService.login(this.form.value)
      .subscribe({
        next: (res: any) => {

          // 🔥 check đúng format mới
          if (!res.accessToken) {
            this.toastr.error("Token không hợp lệ");
            return;
          }

          // 🔥 lưu cả access + refresh
          this.authService.saveToken(res);

          // 🔥 decode accessToken
          const payload: any = jwtDecode(res.accessToken);

          console.log('payload:', payload);

          // 🔥 lấy role (Identity thường dùng key dài)
        const rawRole =
  payload["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"];

const role = Array.isArray(rawRole) ? rawRole[0] : rawRole;

if (!role) {
  this.toastr.error("Không lấy được role");
  return;
}

if (role.toLowerCase() === 'admin') {
  this.router.navigate(['/admin/dashboard']);
} else {
  this.router.navigate(['/calendar']);
}
        },

        error: (err) => {
          console.log(err);

          if (err.status === 401) {
            this.toastr.error('Sai username hoặc password');
          } else {
            this.toastr.error('Có lỗi xảy ra, vui lòng thử lại');
          }
        }
      });
  }

  clickEvent(event: MouseEvent) {
    this.hide = !this.hide;
    event.stopPropagation();
  }

  goRegister() {
    this.router.navigate(['/register']);
  }
}
