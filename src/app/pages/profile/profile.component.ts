
import { Component, OnInit } from '@angular/core';
import { BookingService } from '../../services/booking.service';
import { UserService } from '../../services/user.service';
import { ToastrService } from 'ngx-toastr';
import { Router } from '@angular/router';
import {MatIconModule} from '@angular/material/icon';
import {MatDividerModule} from '@angular/material/divider';
import {MatButtonModule} from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmDialogComponent } from '../../shared/confirm-dialog/confirm-dialog.component';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit {

  user: any;
  bookings: any[] = [];
  currentPage = 1;
  pageSize = 5;
  totalPages = 0;
  now = new Date();

  constructor(
    private bookingService: BookingService,
    public userService: UserService,
    private toastr: ToastrService,
    private router: Router,
    private matIconModule: MatIconModule,
    private matDividerModule: MatDividerModule,
    private matButtonModule: MatButtonModule,
    private dialog: MatDialog,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
  this.user = this.userService.getUser();
  this.loadBookings();

  // 🔥 cập nhật thời gian mỗi 30s
  setInterval(() => {
    this.now = new Date();
  }, 30000);
}

  loadBookings(page: number = 1) {
  this.bookingService.getMyBookings(page, this.pageSize).subscribe(res => {
    this.bookings = res.items;
    this.currentPage = res.currentPage;
    this.totalPages = res.totalPages;
  });
}
isFuture(date: string): boolean {
  return new Date(date) > this.now;
}
createBooking(bookingData: any) {
  this.bookingService.createBooking(bookingData).subscribe({
    next: (res) => {
      alert('Booking success');
      // 🔥 Chỉ load lại từ API
      this.loadBookings(this.currentPage);
    },
    error: (err) => {
      console.log(err);
      alert(err.error.title || 'Booking failed');
    }
  });
}
goToPage(page: number) {
  if (page < 1 || page > this.totalPages) return;
  this.loadBookings(page);
}
 cancelBooking(id: number) {

  const dialogRef = this.dialog.open(ConfirmDialogComponent, {
    width: '350px',
    data: {
      message: 'Bạn có chắc muốn hủy booking này không?'
    }
  });

  dialogRef.afterClosed().subscribe(result => {
    if (result) {
      this.bookingService.cancelBooking(id).subscribe({
        next: () => {
          this.toastr.success('Hủy thành công');
          this.loadBookings(this.currentPage);
        },
        error: () => {
          this.toastr.error('Hủy thất bại');
        }
      });
    }
  });
}
selectedBookingId: number | null = null;

viewDetail(id: number) {
  this.selectedBookingId = id;
}

closeDetail() {
  this.selectedBookingId = null;
}

getStatusText(status: string) {
  switch (status) {
    case 'Booked': return 'Đã đặt';
    case 'Cancelled': return 'Đã hủy';
    case 'Completed': return 'Đã xong';
    default: return status;
  }
}
goBack() {
    this.router.navigate(['/calendar']);
}


}
