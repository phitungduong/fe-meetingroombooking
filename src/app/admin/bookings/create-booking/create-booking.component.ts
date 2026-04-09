import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { BookingService } from '../../../services/booking.service';
import { RoomService } from '../../../services/room.service';
import { MatDialogRef } from '@angular/material/dialog';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-create-booking',
  templateUrl: './create-booking.component.html',
  styleUrls: ['./create-booking.component.css']
})
export class CreateBookingComponent implements OnInit {

  form!: FormGroup;
  rooms: any[] = [];
  timeSlots: string[] = [];
  bookedSlots: any[] = [];

  constructor(
    private fb: FormBuilder,
    private bookingService: BookingService,
    private roomService: RoomService,
    private dialogRef: MatDialogRef<CreateBookingComponent>,
    private toastr: ToastrService
  ) {}

  ngOnInit(): void {
    this.form = this.fb.group({
      meetingRoomIds: [[], Validators.required],
      date: [null, Validators.required],
      startTime: ['', Validators.required],
      endTime: ['', Validators.required]
    });

    this.loadRooms();
    this.generateTimeSlots();
  }

  // =========================
  // LOAD ROOMS
  // =========================
  loadRooms() {
    this.roomService.getRooms().subscribe((res: any) => {
      this.rooms = res.data.filter((r: any) => r.isActive);
    });
  }

  // =========================
  // TIME SLOTS
  // =========================
  generateTimeSlots() {
    for (let hour = 8; hour < 18; hour++) {
      const h = hour.toString().padStart(2, '0');
      this.timeSlots.push(`${h}:00`, `${h}:30`);
    }
  }

  // =========================
  // LOAD BOOKED SLOTS (MULTI ROOM)
  // =========================
  loadBookedSlots() {
  const { meetingRoomIds, date } = this.form.value;

  if (!date) return;

  // 👉 luôn dùng array (đã là multi rồi)
  if (!meetingRoomIds || meetingRoomIds.length === 0) return;

  // 👉 format date (BE yêu cầu yyyy-MM-dd)
  const formattedDate = this.formatDate(date);

  this.bookingService
    .getBookingsByRooms(meetingRoomIds, formattedDate)
    .subscribe((res: any[]) => {

      this.bookedSlots = res;

      console.log('MULTI SLOTS:', this.bookedSlots);

      // 👉 reset time nếu conflict
      this.resetInvalidTime();
    });
}
resetInvalidTime() {
  const { startTime, endTime } = this.form.value;

  if (startTime && this.isTimeBooked(startTime)) {
    this.form.patchValue({ startTime: '' });
  }

  if (endTime && this.isTimeBooked(endTime)) {
    this.form.patchValue({ endTime: '' });
  }
}
formatDate(date: any): string {
  const d = new Date(date);

  const year = d.getFullYear();
  const month = ('0' + (d.getMonth() + 1)).slice(-2);
  const day = ('0' + d.getDate()).slice(-2);

  return `${year}-${month}-${day}`;
}

  // =========================
  // ON CHANGE ROOM / DATE
  // =========================
  onChange() {
    this.loadBookedSlots();

    this.form.patchValue({
      startTime: '',
      endTime: ''
    });
  }

  // =========================
  // BUILD DATETIME
  // =========================
  buildDateTime(date: Date, time: string): Date {
    const [hour, minute] = time.split(':').map(Number);

    return new Date(
      date.getFullYear(),
      date.getMonth(),
      date.getDate(),
      hour,
      minute
    );
  }

  // =========================
  // CHECK SLOT
  // =========================
isTimeBooked(time: string): boolean {
  if (!this.form.value.date || !this.bookedSlots) return false;

  const [hour, minute] = time.split(':').map(Number);

  const date = new Date(this.form.value.date);

  const slotTime = new Date(date);
  slotTime.setHours(hour, minute, 0, 0);

  const now = new Date();

  // 🔥 block quá khứ
  if (slotTime < now) return true;

  // 🔥 block trùng booking (multi-room đã merge sẵn)
  return this.bookedSlots.some((b: any) => {
    const start = new Date(b.startTime);
    const end = new Date(b.endTime);

    return slotTime >= start && slotTime < end;
  });
}

  // =========================
  // SUBMIT
  // =========================
  submit() {
    if (this.form.invalid) {
      this.toastr.warning('Please fill all fields');
      return;
    }

    const { meetingRoomIds, date, startTime, endTime } = this.form.value;

    const booking = {
      meetingRoomId: meetingRoomIds.length === 1 ? meetingRoomIds[0] : null,
      meetingRoomIds: meetingRoomIds,
      startTime: this.buildDateTime(new Date(date), startTime),
      endTime: this.buildDateTime(new Date(date), endTime)
    };

    this.bookingService.createBooking(booking).subscribe({
      next: () => {
        this.toastr.success('Booking created successfully');
        this.dialogRef.close(true);
      },
      error: (err) => {
        console.log(err);
        this.toastr.error(err?.error?.title || 'Booking failed');
      }
    });
  }

  close() {
    this.dialogRef.close();
  }
}
