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
      meetingRoomId: ['', Validators.required],
      date: ['', Validators.required],
      startTime: ['', Validators.required],
      endTime: ['', Validators.required]
    });

    this.loadRooms();
    this.generateTimeSlots();
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

  // 🔥 load slot đã book
  loadBookedSlots() {
    const { meetingRoomId, date } = this.form.value;
    if (!meetingRoomId || !date) return;

    this.bookingService
      .getBookingsByRoomAndDate(meetingRoomId, date)
      .subscribe((res: any[]) => {
        this.bookedSlots = res.filter(b => b.status === 'Booked');
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

    const [year, month, day] = date.split('-').map(Number);
    const [hour, minute] = time.split(':').map(Number);

    const slotTime = new Date(year, month - 1, day, hour, minute);
    const now = new Date();

    // block quá khứ
    if (slotTime < now) return true;

    return this.bookedSlots.some(b => {
      const start = new Date(b.startTime);
      const end = new Date(b.endTime);
      return slotTime >= start && slotTime < end;
    });
  }

  submit() {
    if (this.form.invalid) return;

    const { meetingRoomId, date, startTime, endTime } = this.form.value;

    const [y, m, d] = date.split('-').map(Number);
    const [sh, sm] = startTime.split(':').map(Number);
    const [eh, em] = endTime.split(':').map(Number);

    const booking = {
      meetingRoomId,
      startTime: new Date(y, m - 1, d, sh, sm),
      endTime: new Date(y, m - 1, d, eh, em)
    };

    this.bookingService.createBooking(booking).subscribe(() => {
      this.dialogRef.close(true);
      this.toastr.success('Booking created successfully');
    });
  }
  close() {
  this.dialogRef.close();
}
}
