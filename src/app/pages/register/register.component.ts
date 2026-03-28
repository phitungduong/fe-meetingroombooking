import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { FormBuilder, Validators, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { ToastrService } from 'ngx-toastr';
import {MatButtonModule} from '@angular/material/button';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatIconModule} from '@angular/material/icon';
import {MatInputModule} from '@angular/material/input';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css'],

})
export class RegisterComponent {

  form: FormGroup;

  constructor(
     private authService: AuthService,
    private http: HttpClient,
    private router: Router,
    private fb: FormBuilder,
    private toastr: ToastrService,
    private MatButtonModule: MatButtonModule,
    private MatFormFieldModule: MatFormFieldModule,
    private MatIconModule: MatIconModule,
    private MatInputModule: MatInputModule,
  ) {
    this.form = this.fb.group({
  UserName: ['', Validators.required],
  Email: ['', [Validators.required, Validators.email]],
  Password: ['', Validators.required],  // sửa
  FullName: ['', Validators.required]
});
  }


  register() {
 console.log(this.form.value);
  console.log(this.form.valid);
  if (this.form.invalid) {
    this.toastr.warning('Form không hợp lệ');
    return;
  }

  this.authService.register(this.form.value)
  .subscribe({
    next: () => {
      this.toastr.success('Đăng ký thành công');
      this.router.navigate(['/login']);
    },
    error: (err) => {
      console.error(err);

      this.toastr.error(JSON.stringify(err.error));
    }
  });

}
hide = true;

clickEvent(event: MouseEvent) {
  this.hide = !this.hide;
  event.stopPropagation();
}
goLogin() {
  this.router.navigate(['/login']);
}
}
