import { Component, OnInit, ViewChild } from '@angular/core';
import { BookingService } from 'src/app/services/booking.service';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { MatSort } from '@angular/material/sort';
import { MatDatepicker } from '@angular/material/datepicker';
import { Router } from '@angular/router';
import { CreateBookingComponent } from '../create-booking/create-booking.component';
import { MatDialog } from '@angular/material/dialog';
import { ToastrModule, ToastrService } from 'ngx-toastr';
import { ConfirmDialogComponent } from 'src/app/shared/confirm-dialog/confirm-dialog.component';
import { UpdateBookingComponent } from '../update-booking/update-booking.component';
import { CalendarStateService } from 'src/app/services/calendar-state.service';

@Component({
  selector: 'app-bookings',
  templateUrl: './bookings.component.html',
  styleUrls: ['./bookings.component.css'],
})
export class BookingsComponent implements OnInit {
  bookings: any[] = [];
  rooms: any[] = [];
  selectedRoom: string = '';
  userFilter: string = '';
  originalData: any[] = [];
  selectedDate: Date | null = null;
  fromDate: Date | null = null;
  toDate: Date | null = null;
  displayedColumns: string[] = [
    'id',
     'meetingRoomId',
    'roomName',
    'capacity',
    'location',
    'user',
    'date',
    'start',
    'end',
    'status',
    'actions'
  ];

  dataSource = new MatTableDataSource<any>();
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;
  constructor(
    private bookingService: BookingService,
    private router: Router,
    private dialog: MatDialog,
    private toastr: ToastrService,
    private calendarState: CalendarStateService

  ) {}

  ngOnInit(): void {
    this.getBookings();
  }
  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;

    this.dataSource.sortingDataAccessor = (item, property) => {
      switch (property) {
        case 'date':
          return new Date(item.startTime);
        default:
          return item[property];
      }
    };

    this.dataSource.sort = this.sort;

    // 🔥 sort mặc định
    this.sort.active = 'date';
    this.sort.direction = 'desc'; // từ tương lai -> quá khứ
  }

  getBookings() {
    this.bookingService.getAllBookings().subscribe((res: any) => {
      const data = res.data;

      this.originalData = data;

      // lấy list room unique
      this.rooms = [...new Set(data.map((b: any) => b.meetingRoom.name))];

      this.applyFilter();
    });
  }
  isDeleting = false;
  deleteBooking(id: number) {
   const dialogRef = this.dialog.open(ConfirmDialogComponent, {
     width: '350px',
     data: {
       message: 'Bạn có chắc muốn xóa booking này không?'
     }
   });
   this.isDeleting = true;
   dialogRef.afterClosed().subscribe(result => {
     if (result) {
       this.bookingService.deleteBooking(id).subscribe({
         next: () => {
           this.toastr.success('Booking deleted');
           this.getBookings(); // reload list
           this.isDeleting = false;
         },
         error: (err) => {
           console.log(err);
           this.toastr.error(err.error.title || 'Delete failed');
           this.isDeleting = false;
         }
       });
     }
   });
  }


  openCreateDialog() {

  const dialogRef = this.dialog.open(CreateBookingComponent, {
  width: '600px',
  panelClass: 'booking-dialog'
});

  dialogRef.afterClosed().subscribe(result => {
    if (result) {
      this.getBookings(); // reload list
    }
  });
}
  applyFilter() {
  let filtered = this.originalData;

  // 🏢 Filter room
  if (this.selectedRoom) {
    filtered = filtered.filter(b =>
      b.meetingRoom.name === this.selectedRoom
    );
  }

  // 👤 Filter user
  if (this.userFilter) {
    const keyword = this.userFilter.toLowerCase();

    filtered = filtered.filter(b =>
      b.user.fullName.toLowerCase().includes(keyword) ||
      b.user.email.toLowerCase().includes(keyword)
    );
  }

  // 📅 Filter 1 ngày cụ thể
  if (this.selectedDate) {
    const selected = new Date(this.selectedDate).toDateString();

    filtered = filtered.filter(b =>
      new Date(b.startTime).toDateString() === selected
    );
  }

  // 📆 Filter khoảng ngày
  if (this.fromDate && this.toDate) {
    filtered = filtered.filter(b => {
      const date = new Date(b.startTime);
      return date >= this.fromDate! && date <= this.toDate!;
    });
  }

  // 🔥 sort lại
  filtered.sort((a: any, b: any) =>
    new Date(b.startTime).getTime() - new Date(a.startTime).getTime()
  );

  this.dataSource.data = filtered;
}
openUpdateDialog(booking: any) {
  console.log('BOOKING:', booking);
  const dialogRef = this.dialog.open(UpdateBookingComponent, {
    width: '600px',
    data: booking
  });

  dialogRef.afterClosed().subscribe(result => {
    if (result) {
      this.getBookings();
      this.calendarState.triggerRefresh(); // reload
      this.toastr.success('Booking updated');
    }
  });
}

refresh() {
  // reset filter
  this.selectedRoom = '';
  this.userFilter = '';
  this.selectedDate = null;
  this.fromDate = null;
  this.toDate = null;

  // reload data từ server
  this.getBookings();

  this.toastr.info('Data refreshed');
}
}
