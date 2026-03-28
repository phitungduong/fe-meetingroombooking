import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { RoomService } from '../../../services/room.service';
import { MatDialogRef } from '@angular/material/dialog';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-create-room',
  templateUrl: './create-room.component.html',
  styleUrls: ['./create-room.component.css']
})
export class CreateRoomComponent implements OnInit {

  roomForm!: FormGroup;
  loading = false;

  constructor(
    private fb: FormBuilder,
    private roomService: RoomService,
    private toastr: ToastrService,
    private dialogRef: MatDialogRef<CreateRoomComponent>

  ) {}

  ngOnInit(): void {
    this.roomForm = this.fb.group({
      name: ['', Validators.required],
      capacity: [, [Validators.required, Validators.min(1)]],
      location: [''],
      isActive: [true],
      bufferMinutes: [20]
    });
  }

  onSubmit() {
    if (this.roomForm.invalid) return;

    this.loading = true;

    this.roomService.createRoom(this.roomForm.value).subscribe({
      next: () => {
        this.dialogRef.close(true);
        this.toastr.success('Tạo phòng thành công');
      },
      error: () => {
        this.toastr.error('Tạo phòng thất bại');
        this.loading = false;
      }
    });
  }

  onCancel() {
    this.dialogRef.close();
  }
}
