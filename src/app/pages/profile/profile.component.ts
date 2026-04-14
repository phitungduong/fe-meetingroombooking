import { Component, OnInit,ViewChild, AfterViewInit } from '@angular/core';
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
import { MatPaginator } from '@angular/material/paginator';
import { MatPaginatorModule } from '@angular/material/paginator';
@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css'],
})
export class ProfileComponent implements OnInit {
  user: any;
  bookings: any[] = [];
  originalBookings: any[] = [];

paginatedBookings: any[] = [];

@ViewChild(MatPaginator) paginator!: MatPaginator;
pageSize = 5;
  now = new Date();
  CANCEL_LIMIT_HOURS = 3;
  // 🔥 FILTER
selectedRooms: string[] = [];
selectedStatuses: string[] = [];
fromDate: Date | null = null;
toDate: Date | null = null;



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
    private matPaginatorModule: MatPaginatorModule

  ) {}

  ngOnInit(): void {
    this.user = this.userService.getUser();
    this.loadBookings();

    // 🔥 cập nhật thời gian mỗi 30s
    setInterval(() => {
      this.now = new Date();
    }, 30000);
  }

loadBookings() {
  this.bookingService.getMyBookings().subscribe(res => {
    console.log('API response:', res); // 👈 xem cái này
   this.originalBookings = res;
    this.applyFilter();
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
        this.loadBookings();
      },
      error: (err) => {
        console.log(err);
        alert(err.error.title || 'Booking failed');
      },
    });
  }
  updatePagedData() {
  if (!this.paginator) return;

  const start = this.paginator.pageIndex * this.paginator.pageSize;
  const end = start + this.paginator.pageSize;

  this.paginatedBookings = this.bookings.slice(start, end);
}

onPageChange() {
  this.updatePagedData();
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

    // ❌ other statuses
    return false;
  }

  cancelBooking(booking: any) {
    if (!this.canCancel(booking)) {
      let message = '';

      if (booking.status === 'Booked') {
        message = `Can only cancel ${this.CANCEL_LIMIT_HOURS} hours before`;
      } else {
        message = 'Cannot cancel this booking';
      }

      this.toastr.warning(message, 'Cannot Cancel');
      return;
    }

    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '350px',
      data: {
        message: 'Are you sure you want to cancel this booking?',
      },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.bookingService.cancelBooking(booking.id).subscribe({
          next: () => {
            this.toastr.success('Booking cancelled successfully');
            this.loadBookings();
          },
          error: (err) => {
            this.toastr.error(err.error || 'Booking cancellation failed');
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
        return 'In Progress';
      }

      return 'Booked';
    }

    // ✅ các status khác
    switch (status) {
      case 'Cancelled':
        return 'Cancelled';
      case 'Completed':
        return 'Completed';
      case 'Pending':
        return 'Pending';
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
  formatDate(date: any): string {
  const d = new Date(date);
  return d.toISOString().split('T')[0]; // yyyy-MM-dd
}
applyFilter() {
  let filtered = [...this.originalBookings];

  if (this.selectedRooms?.length) {
    filtered = filtered.filter(b =>
      this.selectedRooms.includes(b.meetingRoom?.name)
    );
  }

  if (this.selectedStatuses?.length) {
    filtered = filtered.filter(b =>
      this.selectedStatuses.includes(b.status)
    );
  }

  // ✅ FROM DATE
  if (this.fromDate) {
    const from = new Date(this.fromDate);
    from.setHours(0, 0, 0, 0); // đầu ngày

    filtered = filtered.filter(b =>
      new Date(b.startTime) >= from
    );
  }

  // ✅ TO DATE
  if (this.toDate) {
    const to = new Date(this.toDate);
    to.setHours(23, 59, 59, 999); // cuối ngày

    filtered = filtered.filter(b =>
      new Date(b.startTime) <= to
    );
  }

  this.bookings = filtered;

  if (this.paginator) {
    this.paginator.firstPage();
  }

  this.updatePagedData();
}
ngAfterViewInit() {
  this.updatePagedData();
}
get rooms(): string[] {
  return [...new Set(this.originalBookings.map(b => b.meetingRoom?.name).filter(Boolean))];
}
refresh() {
  this.selectedRooms = [];
  this.selectedStatuses = [];
  this.fromDate = null;
  this.toDate = null;

  this.loadBookings();
}
}
