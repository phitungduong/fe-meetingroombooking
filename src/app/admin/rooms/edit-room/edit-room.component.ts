import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { RoomService } from '../../../services/room.service';
import { ActivatedRoute, Router } from '@angular/router';
import { Room } from '../../../models/room';
import { ToastrService } from 'ngx-toastr';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Inject } from '@angular/core';


@Component({
  selector: 'app-edit-room',
  templateUrl: './edit-room.component.html',
  styleUrls: ['./edit-room.component.css']
})
export class EditRoomComponent implements OnInit {

  roomForm!: FormGroup;
  roomId!: number;
  loading = false;

  constructor(
    private fb: FormBuilder,
    private roomService: RoomService,
    private route: ActivatedRoute,
    private router: Router,
    private toastr: ToastrService,
    @Inject(MAT_DIALOG_DATA) public data: any,
  private dialogRef: MatDialogRef<EditRoomComponent>,

  ) {}

  ngOnInit(): void {
  this.roomForm = this.fb.group({
    name: [''],
    capacity: [0],
    location: [''],
    isActive: [true],
    bufferMinutes: [20]
  });

  this.roomForm.patchValue(this.data);
}

  loadRoom() {
   this.roomService.getRoomById(this.roomId).subscribe({
  next: (room: any) => {
    this.roomForm.patchValue(room);
  }
});
  }

 onSubmit() {
  const updatedRoom = {
    ...this.roomForm.value,
    id: this.data.id
  };

  this.roomService.editRoom(this.data.id, updatedRoom).subscribe({
    next: () => {
      this.dialogRef.close(true);
      this.toastr.success('Cập nhật phòng thành công');
    },
    error: () => {
      this.toastr.error('Cập nhật phòng thất bại');
    }
  });
}
onCancel() {
  this.dialogRef.close(false); // báo hủy
}
}
