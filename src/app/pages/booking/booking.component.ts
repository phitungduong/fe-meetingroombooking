import {
  Component,
  OnInit,
  OnDestroy,
  ChangeDetectionStrategy,

} from '@angular/core';
import { BookingService } from '../../services/booking.service';
import { RoomService } from '../../services/room.service';
import { ActivatedRoute, Router } from '@angular/router';
import { Room } from '../../models/room';
import { Booking } from '../../models/booking';
import { Subscription } from 'rxjs';
import { ToastrService } from 'ngx-toastr';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Inject } from '@angular/core';
import { Route } from '@angular/router';

@Component({
  selector: 'app-booking',
  templateUrl: './booking.component.html',
  styleUrls: ['./booking.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BookingComponent implements OnInit, OnDestroy {
  rooms: Room[] = [];
  bookedSlots: Booking[] = [];
  timeSlots: string[] = [];
  roomId!: number;
  bookings: any[] = [];


  bookingForm = {
  meetingRoomId: 0,          // giữ lại cho backward
  meetingRoomIds: [] as number[], // thêm dòng này
  date: null as Date | null,
  startTime: '',
  endTime: '',
};

  minDate: string = '';
  private bookingChangedSub!: Subscription;

  constructor(
    private bookingService: BookingService,
    private roomService: RoomService,
    private route: ActivatedRoute,
    private toastr: ToastrService,
    private router: Router,
    private dialogRef: MatDialogRef<BookingComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
  ) {}

  // =========================
  // INIT
  // =========================
  ngOnInit() {
    this.loadRooms();
    this.generateTimeSlots();

    this.minDate = this.getTodayString();

    // 👉 nhận data từ dialog
    if (this.data) {
      this.bookingForm.meetingRoomId = this.data.roomId || 0;

      if (this.data.date) {
        this.bookingForm.date = new Date(this.data.date);
      }
    }

    this.loadBookedSlots();

    this.bookingChangedSub = this.bookingService.bookingChanged$.subscribe(
      () => {
        this.loadBookedSlots();
      },
    );
    this.loadBookingsInDay();
  }

  ngOnDestroy() {
    this.bookingChangedSub?.unsubscribe();
  }

  // =========================
  // UTIL
  // =========================
  getTodayString(): string {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
  //

 loadBookingsInDay() {
  if (!this.bookingForm.date) return;

  const dateStr = this.formatDateLocal(this.bookingForm.date);

  this.bookingService.getBookingsByDate(dateStr, this.bookingForm.meetingRoomId || undefined)
    .subscribe(res => {
      // map dữ liệu đúng với API
      this.bookings = res.map((b: any) => ({
        roomName: b.roomName || 'Room',  // nếu API không trả roomName, có thể dùng 'Room'
        location: b.location || 'N/A',
        status: b.status || '',
        startTime: b.startTime ? new Date(b.startTime) : null,
        endTime: b.endTime ? new Date(b.endTime) : null,
        capacity: b.capacity || 0
      }));

      this.pageIndex = 0;
    });
}

formatDateLocal(date: Date): string {
  const d = new Date(date);

  const year = d.getFullYear();
  const month = ('0' + (d.getMonth() + 1)).slice(-2);
  const day = ('0' + d.getDate()).slice(-2);

  return `${year}-${month}-${day}`;
}
  // =========================
  // LOAD DATA
  // =========================
 loadRooms() {
  this.roomService.getRooms().subscribe((res: any) => {
    this.rooms = res.data.filter((r: any) => r.isActive === true);
  });
}

  generateTimeSlots() {
    this.timeSlots = [];
    for (let hour = 8; hour < 18; hour++) {
      const h = hour.toString().padStart(2, '0');
      this.timeSlots.push(`${h}:00`);
      this.timeSlots.push(`${h}:30`);
    }
  }

  loadBookedSlots() {
  if (!this.bookingForm.meetingRoomId || !this.bookingForm.date) return;

  const date = this.formatDateLocal(this.bookingForm.date); // 🔥 FIX

  this.bookingService
    .getBookingsByRoomAndDate(this.bookingForm.meetingRoomId, date)
    .subscribe((res: any[]) => {

      this.bookedSlots = res;

      console.log('SLOTS:', this.bookedSlots);


      if (
        this.bookingForm.startTime &&
        this.isTimeBooked(this.bookingForm.startTime)
      ) {
        this.bookingForm.startTime = '';
      }

      if (
        this.bookingForm.endTime &&
        this.isTimeBooked(this.bookingForm.endTime)
      ) {
        this.bookingForm.endTime = '';
      }
    });
}
onDateChange() {
  // reload danh sách booking khi đổi ngày
  this.loadBookingsInDay();

  // reload các slot để chọn thời gian
  this.loadBookedSlots();

  // reset start/end time
  this.bookingForm.startTime = '';
  this.bookingForm.endTime = '';
}
  onRoomOrDateChange() {
    this.loadBookedSlots();
    this.bookingForm.startTime = '';
    this.bookingForm.endTime = '';
  }

  // =========================
  // CHECK SLOT
  // =========================
 isTimeBooked(time: string): boolean {
  if (!this.bookingForm.date || !this.bookedSlots) return false;

  const [hour, minute] = time.split(':').map(Number);

  const slotTime = new Date(this.bookingForm.date);
  slotTime.setHours(hour, minute, 0, 0);

  return this.bookedSlots.some((b: any) => {
    const start = new Date(b.startTime);
    const end = new Date(b.endTime);

    return slotTime >= start && slotTime < end;
  });
}
  close() {
    this.dialogRef.close();
  }
  // =========================
  // CREATE BOOKING
  // =========================
  createBooking() {
    if (
      !this.bookingForm.startTime ||
      !this.bookingForm.endTime ||
      !this.bookingForm.date
    ) {
      this.toastr.warning('Vui lòng chọn đầy đủ thông tin');
      return;
    }

    const date = this.bookingForm.date!;

    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();

    const [startHour, startMinute] = this.bookingForm.startTime
      .split(':')
      .map(Number);
    const [endHour, endMinute] = this.bookingForm.endTime
      .split(':')
      .map(Number);

    const start = new Date(year, month - 1, day, startHour, startMinute);
    const end = new Date(year, month - 1, day, endHour, endMinute);

    const booking = {
  meetingRoomId: this.bookingForm.meetingRoomIds.length === 1
    ? this.bookingForm.meetingRoomIds[0]
    : null,

  meetingRoomIds: this.bookingForm.meetingRoomIds,

  startTime: start,
  endTime: end,
};

    this.bookingService.createBooking(booking).subscribe({
      next: () => {
        this.toastr.success('Đặt phòng thành công');
        this.loadBookingsInDay();
        this.router.navigate(['/profile']);

        // ✅ reload thay vì push
        this.loadBookedSlots();

        this.bookingForm.startTime = '';
        this.bookingForm.endTime = '';

        this.bookingService.notifyBookingChanged();

        this.dialogRef.close(true);
      },
      error: (err) => {
        console.log(err);
        this.toastr.error(err?.error?.title || 'Đặt phòng thất bại');
      },
    });
  }

  pageSize = 7;
pageIndex = 0;

get paginatedBookings() {
  const start = this.pageIndex * this.pageSize;
  return this.bookings.slice(start, start + this.pageSize);
}

onPageChange(event: any) {
  this.pageIndex = event.pageIndex;
  this.pageSize = event.pageSize;
}
}
