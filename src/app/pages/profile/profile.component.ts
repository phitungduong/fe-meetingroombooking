import { Component, OnInit, ViewChild, AfterViewInit } from '@angular/core';
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
import { start } from 'repl';
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
    private matPaginatorModule: MatPaginatorModule,
  ) {}

  ngOnInit(): void {
    this.user = this.userService.getUser();
    this.loadBookings();

    // 🔥 cập nhật thời gian mỗi 30s
    setInterval(() => {
      this.now = new Date();
    }, 3000);
  }

  loadBookings() {
    this.bookingService.getMyBookings().subscribe((res) => {
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
    const status = booking.status;

    if (status === 'Pending') return true;

    if (status === 'Booked') {
      const now = new Date();
      const start = new Date(booking.startTime);

      const diffHours = (start.getTime() - now.getTime()) / (1000 * 60 * 60);

      return diffHours >= this.CANCEL_LIMIT_HOURS;
    }

    // ❌ Ongoing / Completed / Expired → không cho cancel
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
    return booking.status;
  }
  getStatusClass(booking: any): string {
    const status = booking.status?.toLowerCase();

    switch (status) {
      case 'ongoing':
        return 'status-ongoing';
      case 'booked':
        return 'status-booked';
      case 'completed':
        return 'status-completed';
      case 'pending':
        return 'status-pending';

      case 'cancelled':
        return 'status-cancelled';
      case 'rejected':
        return 'status-rejected';
      case 'expired':
        return 'status-expired';
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

    // filter room
    if (this.selectedRooms?.length) {
      filtered = filtered.filter((b) =>
        this.selectedRooms.includes(b.meetingRoom?.name),
      );
    }

    // filter status
    if (this.selectedStatuses?.length) {
      filtered = filtered.filter((b) =>
        this.selectedStatuses
          .map((s) => s.toLowerCase())
          .includes(b.status?.toLowerCase()),
      );
    }

    // filter from date
    if (this.fromDate) {
      const from = new Date(this.fromDate);
      from.setHours(0, 0, 0, 0);

      filtered = filtered.filter((b) => new Date(b.startTime) >= from);
    }

    // filter to date
    if (this.toDate) {
      const to = new Date(this.toDate);
      to.setHours(23, 59, 59, 999);

      filtered = filtered.filter((b) => new Date(b.startTime) <= to);
    }

    // 🔥 SORT CHUẨN (QUAN TRỌNG)
    const order: any = {
      ongoing: 1,
      booked: 2,
      completed: 3,
      pending: 4,
      expired: 5,
      cancelled: 6,
      rejected: 7,
    };

    filtered = filtered.sort((a, b) => {
      const statusA = a.status?.toLowerCase();
      const statusB = b.status?.toLowerCase();

      // ưu tiên theo status
      if (order[statusA] !== order[statusB]) {
        return order[statusA] - order[statusB];
      }

      // cùng status → sort theo giờ
      return new Date(a.startTime).getTime() - new Date(b.startTime).getTime();
    });

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
    return [
      ...new Set(
        this.originalBookings.map((b) => b.meetingRoom?.name).filter(Boolean),
      ),
    ];
  }
  refresh() {
    this.selectedRooms = [];
    this.selectedStatuses = [];
    this.fromDate = null;
    this.toDate = null;

    this.loadBookings();
  }
}
