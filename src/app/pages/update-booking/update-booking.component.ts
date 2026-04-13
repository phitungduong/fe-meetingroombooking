import { Component, OnInit, Inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { BookingService } from '../../../app/services/booking.service';
import { RoomService } from 'src/app/services/room.service';
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
    endTime: [this.formatTime(end), Validators.required]
  });

  this.loadRooms();
  this.generateTimeSlots();

  // 🔥 gọi lần đầu nhưng không reset
  this.onChange(true);
  console.log('DATA:', this.data);
}

  // ===== FORMAT TIME =====
  formatTime(date: any): string {
    const d = new Date(date);
    const h = d.getHours().toString().padStart(2, '0');
    const m = d.getMinutes().toString().padStart(2, '0');
    return `${h}:${m}`;
  }

  // ===== LOAD ROOMS =====
  loadRooms() {
    this.roomService.getRooms().subscribe((res: any) => {
      this.rooms = res.data;
    });
  }

  // ===== GENERATE SLOT =====
  generateTimeSlots() {
    this.timeSlots = [];
    for (let hour = 8; hour < 18; hour++) {
      const h = hour.toString().padStart(2, '0');
      this.timeSlots.push(`${h}:00`, `${h}:30`);
    }
  }

  // ===== LOAD SLOT ĐÃ BOOK =====
  loadBookedSlots() {
    const { meetingRoomId, date } = this.form.value;
    if (!meetingRoomId || !date) return;

    const formattedDate = new Date(date).toISOString().substring(0, 10);

    this.bookingService
      .getBookingsByRoomAndDate(meetingRoomId, formattedDate)
      .subscribe((res: any[]) => {
        this.bookedSlots = res.filter(
          b => b.status === 'Booked' && b.id !== this.data.id
        );
      });
  }

  // ===== CHANGE ROOM / DATE =====
 onChange(isInit = false) {
  this.loadBookedSlots();

  if (!isInit) {
    this.form.patchValue({
      startTime: '',
      endTime: ''
    });
  }
}

  // ===== CHECK SLOT =====
  isTimeBooked(time: string): boolean {
    const { date } = this.form.value;
    if (!date) return false;

    const slotTime = new Date(date);
    const [h, m] = time.split(':');
    slotTime.setHours(Number(h), Number(m), 0, 0);

    const now = new Date();

    // ❌ block quá khứ
    if (slotTime < now) return true;

    return this.bookedSlots.some(b => {
      const start = new Date(b.startTime);
      const end = new Date(b.endTime);
      return slotTime >= start && slotTime < end;
    });
  }

  // ===== FIX TIMEZONE =====
  toLocalISOString(date: Date): string {
    const tzOffset = date.getTimezoneOffset() * 60000;
    return new Date(date.getTime() - tzOffset)
      .toISOString()
      .slice(0, -1);
  }

  // ===== SUBMIT USER UPDATE =====
  submit() {
    if (this.form.invalid) return;

    const { meetingRoomId, date, startTime, endTime } = this.form.value;

    const start = new Date(date);
    const [sh, sm] = startTime.split(':');
    start.setHours(sh, sm, 0, 0);

    const end = new Date(date);
    const [eh, em] = endTime.split(':');
    end.setHours(eh, em, 0, 0);

    const payload = {
      meetingRoomId,
      startTime: this.toLocalISOString(start),
      endTime: this.toLocalISOString(end)
    };

    this.bookingService.updateBookingUser(this.data.id, payload)
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
