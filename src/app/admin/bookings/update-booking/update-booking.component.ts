import { Component, OnInit, Inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { BookingService } from '../../../services/booking.service';
import { RoomService } from '../../../services/room.service';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-update-booking',
  templateUrl: './update-booking.component.html',
  styleUrls: ['./update-booking.component.css']
})
export class UpdateBookingComponent implements OnInit {

  form!: FormGroup;
  rooms: any[] = [];
  timeSlots: string[] = [];
  bookedSlots: any[] = [];
  statuses: string[] = ['Booked', 'Cancelled'];

  constructor(
    private fb: FormBuilder,
    private bookingService: BookingService,
    private roomService: RoomService,
    private dialogRef: MatDialogRef<UpdateBookingComponent>,
    private toastr: ToastrService,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {}

 ngOnInit(): void {

  const start = new Date(this.data.startTime);
  const end = new Date(this.data.endTime);

  this.form = this.fb.group({
    meetingRoomId: [this.data.meetingRoomId, Validators.required],
    date: [start, Validators.required],
    startTime: [this.formatTime(start), Validators.required],
    endTime: [this.formatTime(end), Validators.required],
    status: [this.data.status || 'Booked']
  });

  this.loadRooms();
  this.generateTimeSlots();
  this.loadBookedSlots();
}
  // 🔥 format date yyyy-MM-dd
  formatDate(date: any): string {
  if (!date) return '';

  const d = new Date(date);

  if (isNaN(d.getTime())) return '';

  return d.toISOString().substring(0, 10);
}

  // 🔥 format time HH:mm
  formatTime(date: any): string {
  if (!date) return '';

  const d = new Date(date);

  const hours = d.getHours().toString().padStart(2, '0');
  const minutes = d.getMinutes().toString().padStart(2, '0');

  return `${hours}:${minutes}`;
}

  loadRooms() {
    this.roomService.getRooms().subscribe((res: any) => {
      this.rooms = res.data;
    });
  }

  generateTimeSlots() {
    for (let hour = 8; hour < 18; hour++) {
      const h = hour.toString().padStart(2, '0');
      this.timeSlots.push(`${h}:00`, `${h}:30`);
    }
  }

  // 🔥 load slot đã book (trừ chính booking hiện tại)
  loadBookedSlots() {
  const { meetingRoomId, date } = this.form.value;
  if (!meetingRoomId || !date) return;

  const formattedDate = date.toISOString().substring(0, 10);

  this.bookingService
    .getBookingsByRoomAndDate(meetingRoomId, formattedDate)
    .subscribe((res: any[]) => {
      this.bookedSlots = res
        .filter(b => b.status === 'Booked' && b.id !== this.data.id);
    });
}

  onChange() {
    this.loadBookedSlots();
    this.form.patchValue({ startTime: '', endTime: '' });
  }

  // 🔥 check slot
  isTimeBooked(time: string): boolean {
  const { date } = this.form.value;
  if (!date) return false;

  const slotTime = new Date(date);

  const [hour, minute] = time.split(':');
  slotTime.setHours(Number(hour), Number(minute), 0, 0);

  const now = new Date();

  // block quá khứ
  if (slotTime < now) return true;

  return this.bookedSlots.some(b => {
    const start = new Date(b.startTime);
    const end = new Date(b.endTime);
    return slotTime >= start && slotTime < end;
  });
}
toLocalISOString(date: Date): string {
  const tzOffset = date.getTimezoneOffset() * 60000;
  return new Date(date.getTime() - tzOffset)
    .toISOString()
    .slice(0, -1); // bỏ chữ Z
}
 submit() {
  if (this.form.invalid) return;

  const { meetingRoomId, date, startTime, endTime, status } = this.form.value;

  const start = new Date(date);
  const [sh, sm] = startTime.split(':');
  start.setHours(sh, sm, 0, 0);

  const end = new Date(date);
  const [eh, em] = endTime.split(':');
  end.setHours(eh, em, 0, 0);

  const payload = {
  meetingRoomId,
  startTime: this.toLocalISOString(start), // 🔥 FIX
  endTime: this.toLocalISOString(end),     // 🔥 FIX
  status
};

  this.bookingService.updateBookingAdmin(this.data.id, payload)
    .subscribe({
      next: () => {
        this.dialogRef.close(true);
        this.toastr.success('Updated successfully');
      },
      error: (err) => {
        this.toastr.error(err.error?.message || 'Update failed');
      }
    });
}

  close() {
    this.dialogRef.close();
  }
}
