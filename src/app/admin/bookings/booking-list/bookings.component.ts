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
  selectedRooms: string[] = [];
  userFilter: string = '';
  originalData: any[] = [];
  selectedDate: Date | null = null;
  fromDate: Date | null = null;
  toDate: Date | null = null;
  selectedStatuses: string[] = ['ALL'];
  displayedColumns: string[] = [
    'select',
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
onRoomChange(event: any) {
  const values = event.value;

  // 👉 Nếu user click ALL
  if (values.includes('ALL')) {
    this.selectedRooms = ['ALL', ...this.rooms];
  } else {
    // 👉 Nếu bỏ ALL
    this.selectedRooms = values.filter((v: any) => v !== 'ALL');
  }

  // 👉 Nếu user chọn đủ tất cả room → auto thêm ALL
  const onlyRooms = this.selectedRooms.filter(v => v !== 'ALL');

  if (onlyRooms.length === this.rooms.length) {
    this.selectedRooms = ['ALL', ...this.rooms];
  }

  // 👉 gọi filter
  this.applyFilter();
}
 getBookings() {
  this.bookingService.getAllBookings().subscribe((res: any) => {

    const data = Array.isArray(res) ? res : (res?.data ?? []);

    data.forEach((b: any) => b.selected = false);

    this.originalData = data;

    this.rooms = [...new Set(data.map((b: any) => b.meetingRoom?.name))];

    this.applyFilter();
  });
}
  isDeleting = false;
  deleteBooking(id: number) {
   const dialogRef = this.dialog.open(ConfirmDialogComponent, {
     width: '350px',
     data: {
       message: 'Are you sure you want to delete this booking?'
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
normalize(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD') // tách dấu
    .replace(/[\u0300-\u036f]/g, ''); // xoá dấu
}
 applyFilter() {
  let filtered = [...this.originalData]; // clone cho an toàn

  // 🏢 Filter room
  if (
    this.selectedRooms &&
    this.selectedRooms.length > 0 &&
    !this.selectedRooms.includes('ALL')
  ) {
    filtered = filtered.filter(b =>
      this.selectedRooms.includes(b.meetingRoom?.name)
    );
  }

  // 👤 Filter user
  if (this.userFilter && this.userFilter.trim()) {
    const keyword = this.normalize(this.userFilter.trim());

    filtered = filtered.filter(b => {
      const fullName = this.normalize(b.user?.fullName || '');
      const email = this.normalize(b.user?.email || '');

      return fullName.includes(keyword) || email.includes(keyword);
    });
  }

  // 📌 Filter status (multi)
  if (
    this.selectedStatuses &&
    this.selectedStatuses.length > 0 &&
    !this.selectedStatuses.includes('ALL')
  ) {
    filtered = filtered.filter(b =>
      this.selectedStatuses.includes(b.status)
    );
  }

  // 📅 + 📆 Filter ngày (fix logic)
  if (this.selectedDate) {
    // 👉 ưu tiên filter 1 ngày
    const selected = new Date(this.selectedDate);
    selected.setHours(0, 0, 0, 0);

    filtered = filtered.filter(b => {
      const date = new Date(b.startTime);
      date.setHours(0, 0, 0, 0);
      return date.getTime() === selected.getTime();
    });

  } else if (this.fromDate && this.toDate) {
    // 👉 filter khoảng ngày (fix giờ)
    const from = new Date(this.fromDate);
    from.setHours(0, 0, 0, 0);

    const to = new Date(this.toDate);
    to.setHours(23, 59, 59, 999);

    filtered = filtered.filter(b => {
      const time = new Date(b.startTime).getTime();
      return time >= from.getTime() && time <= to.getTime();
    });
  }

  // 🔥 sort
  filtered.sort((a: any, b: any) =>
    new Date(b.startTime).getTime() - new Date(a.startTime).getTime()
  );

  this.dataSource.data = filtered;
  this.dataSource.data.forEach(b => b.selected = false);
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
  this.selectedRooms = [];
  this.userFilter = '';
  this.selectedDate = null;
  this.fromDate = null;
  this.toDate = null;
  this.selectedStatuses = ['ALL'];

  // reload data từ server
  this.getBookings();

  this.toastr.info('Data refreshed');
}
getSelectedBookingIds() {
  return this.dataSource.data
    .filter(b => b.selected && b.status === 'Pending')
    .map(b => b.id);
}
confirmSelectedBookings() {
  const ids = this.getSelectedBookingIds();

  if (ids.length === 0) {
    this.toastr.warning('Please select pending bookings');
    return;
  }

  const dialogRef = this.dialog.open(ConfirmDialogComponent, {
    width: '350px',
    data: {
      message: `Approve ${ids.length} booking(s)?`
    }
  });

  dialogRef.afterClosed().subscribe(result => {
    if (result) {
      this.bookingService.bulkConfirm(ids).subscribe({
        next: () => {
          this.toastr.success('Updated successfully');

          // 🔥 QUAN TRỌNG: reload lại từ backend
          console.log('After confirm reload');
this.getBookings();

        },
        error: () => {
          this.toastr.error('Update failed');
        }
      });
    }
  });
}
groupBySlot(data: any[]): Record<string, any[]> {
  const map: Record<string, any[]> = {};

  data.forEach(b => {
    const key = `${b.meetingRoomId}_${b.startTime}`;
    if (!map[key]) map[key] = [];
    map[key].push(b);
  });

  return map;
}

isEarliestBooking(booking: any): boolean {
  const group = this.dataSource.data.filter(b =>
    b.meetingRoomId === booking.meetingRoomId &&
    b.startTime === booking.startTime &&
    b.status === 'Pending'
  );

  if (group.length === 0) return false;

  const earliest = group.reduce((prev, curr) =>
    new Date(prev.createdAt) < new Date(curr.createdAt) ? prev : curr
  );

  return booking.id === earliest.id;
}
toggleAll(event: any) {
  const checked = event.checked;

  const grouped = this.groupBySlot(this.dataSource.data);

  (Object.values(grouped) as any[][]).forEach(group => {
    const pendingGroup = group.filter(b => b.status === 'Pending');

    if (pendingGroup.length === 0) return;

    const earliest = pendingGroup.reduce((prev, curr) =>
      new Date(prev.createdAt) < new Date(curr.createdAt) ? prev : curr
    );

    earliest.selected = checked;
  });
}
isAllSelected() {
  const grouped = this.groupBySlot(this.dataSource.data);

  const earliestList = (Object.values(grouped) as any[][]).map(group => {
    const pending = group.filter(b => b.status === 'Pending');
    if (pending.length === 0) return null;

    return pending.reduce((prev, curr) =>
      new Date(prev.createdAt) < new Date(curr.createdAt) ? prev : curr
    );
  }).filter(x => x !== null);

  return earliestList.length > 0 && earliestList.every(b => b.selected);
}

isIndeterminate() {
  const grouped = this.groupBySlot(this.dataSource.data);

  const earliestList = (Object.values(grouped) as any[][]).map(group => {
    const pending = group.filter(b => b.status === 'Pending');
    if (pending.length === 0) return null;

    return pending.reduce((prev, curr) =>
      new Date(prev.createdAt) < new Date(curr.createdAt) ? prev : curr
    );
  }).filter(x => x !== null);

  const selected = earliestList.filter(b => b.selected);

  return selected.length > 0 && selected.length < earliestList.length;
}



// deleteSelectedBookings() {
//   const ids = this.getSelectedBookingIds();

//   if (ids.length === 0) {
//     this.toastr.warning('Please select bookings');
//     return;
//   }

//   const dialogRef = this.dialog.open(ConfirmDialogComponent, {
//     width: '350px',
//     data: {
//       message: `Are you sure you want to delete ${ids.length} booking(s)?`
//     }
//   });

//   dialogRef.afterClosed().subscribe(result => {
//     if (result) {
//       this.bookingService.bulkDelete(ids).subscribe({
//         next: () => {
//           this.toastr.success('Deleted successfully');

//           // 🔥 Xóa luôn trên UI
//           this.dataSource.data = this.dataSource.data.filter(
//             b => !ids.includes(b.id)
//           );

//           // reset selection
//           this.dataSource.data.forEach(b => b.selected = false);
//         },
//         error: () => {
//           this.toastr.error('Delete failed');
//         }
//       });
//     }
//   });
// }
}
