import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../../../services/auth.service';
import { MatDialogRef } from '@angular/material/dialog';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-create-user',
  templateUrl: './create-user.component.html',
  styleUrls: ['./create-user.component.css']
})
export class CreateUserComponent implements OnInit {

  userForm!: FormGroup;
  loading = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private dialogRef: MatDialogRef<CreateUserComponent>,
    private toastr: ToastrService

  ) {}

  ngOnInit(): void {
    this.userForm = this.fb.group({
  fullName: ['', Validators.required],
  userName: ['', Validators.required],
  email: ['', [Validators.required, Validators.email]],
  password: ['', [Validators.required, Validators.minLength(6)]]
});
  }

  onSubmit() {
  if (this.userForm.invalid) return;

  const data = this.userForm.value; // ✅ giờ đúng key rồi

  this.authService.register(data).subscribe({
    next: () => {
      this.dialogRef.close(true);
      this.toastr.success('Tạo user thành công');
      
    },
    error: (err) => {
      console.log(err);
      this.toastr.error('Tạo user thất bại');
      this.loading = false;
    }
  });
}

  onCancel() {
    this.dialogRef.close();
  }
}
