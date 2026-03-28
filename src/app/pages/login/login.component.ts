import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { FormBuilder, Validators, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ToastrService } from 'ngx-toastr';
import {MatButtonModule} from '@angular/material/button';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatIconModule} from '@angular/material/icon';
import {MatInputModule} from '@angular/material/input';
import { jwtDecode } from "jwt-decode";

@Component({
  selector: 'app-login',

  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {

  form: FormGroup;
  error: string = '';

  constructor(
    private router: Router,
    private authService: AuthService,
    private fb: FormBuilder,
    private toastr: ToastrService,
    private MatButtonModule: MatButtonModule,
    private MatFormFieldModule: MatFormFieldModule,
    private MatIconModule: MatIconModule,
    private MatInputModule: MatInputModule,


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

  if (!res.token) {
    this.toastr.error("Token không hợp lệ");
    return;
  }

  this.authService.saveToken(res.token);

  const payload: any = jwtDecode(res.token);

  console.log('payload:', payload);

  const role =
    payload.role ||
    payload["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"];

  sessionStorage.setItem("role", role);

  this.toastr.success('Đăng nhập thành công');

  if (role?.toLowerCase() === 'admin') {
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

 hide = true;

clickEvent(event: MouseEvent) {
  this.hide = !this.hide;
  event.stopPropagation();
}

  goRegister() {
    this.router.navigate(['/register']);
  }

}
