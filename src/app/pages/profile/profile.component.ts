import { Component, OnInit } from '@angular/core';
import { BookingService } from '../../services/booking.service';
import { UserService } from '../../services/user.service';
import { ToastrService } from 'ngx-toastr';
import { Router } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmDialogComponent } from '../../shared/confirm-dialog/confirm-dialog.component';
import { AuthService } from 'src/app/services/auth.service';
import { UpdateBookingComponent } from '../update-booking/update-booking.component';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css'],
})
export class ProfileComponent implements OnInit {
  user: any;
  bookings: any[] = [];
  currentPage = 1;
  pageSize = 5;
  totalPages = 0;
  now = new Date();
  CANCEL_LIMIT_HOURS = 3;
  // 🔥 FILTER
selectedRooms: string[] = [];
selectedStatuses: string[] = [];
fromDate: Date | null = null;
toDate: Date | null = null;

// 🔥 lưu dữ liệu gốc
originalBookings: any[] = [];


  constructor(
    private bookingService: BookingService,
    public userService: UserService,
    private toastr: ToastrService,
    private router: Router,
    private matIconModule: MatIconModule,
    private matDividerModule: MatDividerModule,
    private matButtonModule: MatButtonModule,
    private dialog: MatDialog,
    public authService: AuthService,
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
    this.originalBookings = res.items; // 🔥 giữ bản gốc

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
      },
    });
  }
  goToPage(page: number) {
    if (page < 1 || page > this.totalPages) return;
    this.loadBookings(page);
  }
  canCancel(booking: any): boolean {
    // ✅ Pending → luôn cho hủy
    if (booking.status === 'Pending') {
      return true;
    }

    // ✅ Booked → check 3 tiếng
    if (booking.status === 'Booked') {
      const now = new Date();
      const start = new Date(booking.startTime);

      const diffHours = (start.getTime() - now.getTime()) / (1000 * 60 * 60);

      return diffHours >= this.CANCEL_LIMIT_HOURS;
    }

    // ❌ trạng thái khác
    return false;
  }

  cancelBooking(booking: any) {
    if (!this.canCancel(booking)) {
      let message = '';

      if (booking.status === 'Booked') {
        message = `Chỉ được hủy trước ${this.CANCEL_LIMIT_HOURS} tiếng`;
      } else {
        message = 'Không thể hủy booking này';
      }

      this.toastr.warning(message, 'Không thể hủy');
      return;
    }

    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '350px',
      data: {
        message: 'Bạn có chắc muốn hủy booking này không?',
      },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.bookingService.cancelBooking(booking.id).subscribe({
          next: () => {
            this.toastr.success('Hủy thành công');
            this.loadBookings(this.currentPage);
          },
          error: (err) => {
            this.toastr.error(err.error || 'Hủy thất bại');
          },
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

  getStatusText(booking: any): string {
    const status = booking.status;

    // 🔥 xử lý riêng cho Booked
    if (status === 'Booked') {
      const now = new Date().getTime();
      const start = new Date(booking.startTime).getTime();
      const end = new Date(booking.endTime).getTime();

      if (now >= start && now <= end) {
        return 'Đang diễn ra';
      }

      return 'Đã đặt';
    }

    // ✅ các status khác
    switch (status) {
      case 'Cancelled':
        return 'Đã hủy';
      case 'Completed':
        return 'Đã xong';
      case 'Pending':
        return 'Đang chờ';
      default:
        return status;
    }
  }
  getStatusClass(booking: any): string {
    const status = booking.status;

    if (status === 'Booked') {
      const now = new Date().getTime();
      const start = new Date(booking.startTime).getTime();
      const end = new Date(booking.endTime).getTime();

      if (now >= start && now <= end) {
        return 'status-active';
      }

      return 'status-booked';
    }

    switch (status) {
      case 'Pending':
        return 'status-pending';
      case 'Cancelled':
        return 'status-cancelled';
      case 'Completed':
        return 'status-completed';
      default:
        return '';
    }
  }
  goBack() {
    this.router.navigate(['/calendar']);
  }
  editBooking(b: any) {
    this.dialog
      .open(UpdateBookingComponent, {
        width: '500px',
        data: { ...b },
      })
      .afterClosed()
      .subscribe((result) => {
        if (result) {
          this.loadBookings(); // reload list
        }
      });
  }
applyFilter() {
  let filtered = [...this.originalBookings];

  // 🔎 ROOM
  if (this.selectedRooms.length > 0) {
    filtered = filtered.filter(b =>
      this.selectedRooms.includes(b.meetingRoom?.name)
    );
  }

  // 🔎 STATUS
  if (this.selectedStatuses.length > 0) {
    filtered = filtered.filter(b =>
      this.selectedStatuses.includes(b.status)
    );
  }

  // 🔎 FROM DATE
  if (this.fromDate) {
    const from = new Date(this.fromDate).setHours(0, 0, 0, 0);
    filtered = filtered.filter(b =>
      new Date(b.startTime).getTime() >= from
    );
  }

  // 🔎 TO DATE
  if (this.toDate) {
    const to = new Date(this.toDate).setHours(23, 59, 59, 999);
    filtered = filtered.filter(b =>
      new Date(b.startTime).getTime() <= to
    );
  }

  this.bookings = filtered;
}
get rooms(): string[] {
  return [...new Set(this.originalBookings.map(b => b.meetingRoom?.name).filter(Boolean))];
}
refresh() {
  this.selectedRooms = [];
  this.selectedStatuses = [];
  this.fromDate = null;
  this.toDate = null;

  this.loadBookings(this.currentPage);
}
}
