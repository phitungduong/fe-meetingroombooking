import { Component, Input, Output, EventEmitter } from '@angular/core';
import { BookingService } from '../../services/booking.service';

@Component({
  selector: 'app-booking-detail',
  templateUrl: './booking-detail.component.html',
  styleUrls: ['./booking-detail.component.css'],
})
export class BookingDetailComponent {
  booking: any;

  constructor(private bookingService: BookingService) {}

  // ✅ nhận id từ profile
  @Input()
  set bookingId(id: number | null) {
    if (id) {
      this.loadBooking(id);
    }
  }

  // ✅ nút close
  @Output() close = new EventEmitter<void>();

  loadBooking(id: number) {
    this.bookingService.getBookingById(id).subscribe((res: any) => {
       console.log(res);
      this.booking = res.data;
    });
  }



  getDuration(start: string, end: string) {
    const s = new Date(start).getTime();
    const e = new Date(end).getTime();
    return ((e - s) / (1000 * 60 * 60)).toFixed(1);
  }
}
