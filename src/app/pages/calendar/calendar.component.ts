import {
  Component,
  ViewChild,
  OnInit,
  ViewEncapsulation,
  AfterViewInit,
  NgZone,
  ChangeDetectorRef,
} from '@angular/core';
import { CalendarOptions } from '@fullcalendar/core';
import interactionPlugin from '@fullcalendar/interaction';
import timeGridPlugin from '@fullcalendar/timegrid';
import { FullCalendarComponent } from '@fullcalendar/angular';
import { Router } from '@angular/router';
import { BookingService } from 'src/app/services/booking.service';
import { MatDialog } from '@angular/material/dialog';
import { BookingComponent } from '../booking/booking.component';
import { CalendarStateService } from 'src/app/services/calendar-state.service';
import { RoomService } from 'src/app/services/room.service';
import { Room } from 'src/app/models/room';
import { AuthService } from 'src/app/services/auth.service';
import { jwtDecode } from 'jwt-decode';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-calendar',
  templateUrl: './calendar.component.html',
  styleUrls: ['./calendar.component.css'],
  encapsulation: ViewEncapsulation.None,
})
export class CalendarComponent implements OnInit, AfterViewInit {
  @ViewChild('calendar') calendarComponent!: FullCalendarComponent;

  isDayView: boolean = false;
  selectedDate: Date = new Date();
  isDialogOpen = false;
  isPast: boolean = true;
  rooms: Room[] = [];
  selectedRoomId: number | null = null;
  currentUser: any = null;
  role: string = '';

  calendarOptions: CalendarOptions = {
    plugins: [interactionPlugin, timeGridPlugin],
    initialView: 'timeGridWeek',
    contentHeight: window.innerHeight - 150,
    slotLabelFormat: {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    },

    eventTimeFormat: {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    },
    headerToolbar: {
      left: 'prev,next today',
      center: 'title',
      right: 'timeGridWeek,timeGridDay',
    },
    customButtons: {
      myWeek: {
        text: '',
        click: () => {
          this.calendarComponent.getApi().changeView('timeGridWeek');
        },
      },
      myDay: {
        text: '',
        click: () => {
          this.calendarComponent.getApi().changeView('timeGridDay');
        },
      },
    },
    dayHeaderContent: (arg) => {
      const date = arg.date;

      const weekday = date.toLocaleDateString('vi-VN', {
        weekday: 'long',
      });

      const dayMonth = date.toLocaleDateString('vi-VN', {
        day: '2-digit',
        month: '2-digit',
      });

      return {
        html: `
      <div style="text-align:center">
        <div style="font-size:13px">${weekday}</div>
        <div style="font-weight:bold">${dayMonth}</div>
      </div>
    `,
      };
    },
    eventDidMount: (info) => {
    const status = info.event.extendedProps['status']?.toLowerCase();

    if (status === 'booked') {
      info.el.style.backgroundColor = '#aeb6df';
    }

    if (status === 'ongoing') {
      info.el.style.backgroundColor = '#adc5ae';
    }

    if (status === 'completed') {
      info.el.style.backgroundColor = '#8a9cff';
    }
  },
    selectable: false,
    firstDay: 1,
    slotMinTime: '08:00:00',
    slotMaxTime: '18:00:00',
    slotDuration: '00:30:00',

    datesSet: () => {
      this.updateViewState();
      this.loadBookings();
    },
    dateClick: (info) => {
      const calendarApi = this.calendarComponent.getApi();

      if (calendarApi.view.type === 'timeGridWeek') {
        calendarApi.changeView('timeGridDay', info.date);

        this.ngZone.run(() => {
          this.isDayView = true;

          const selected = new Date(info.date);
          selected.setHours(0, 0, 0, 0);

          const today = new Date();
          today.setHours(0, 0, 0, 0);

          this.isPast = selected < today;

          this.loadBookings();
        });
      }
    },
    eventClick: (info) => {
      const calendarApi = this.calendarComponent.getApi();

      if (calendarApi.view.type === 'timeGridWeek' && info.event.start) {
        calendarApi.changeView('timeGridDay', info.event.start);

        this.ngZone.run(() => {
          this.updateViewState();
          this.loadBookings();
        });
      }
    },
    viewDidMount: () => {
      this.updateViewState();
    },
  };

  constructor(
    private bookingService: BookingService,
    private router: Router,
    private dialog: MatDialog,
    private ngZone: NgZone,
    private cd: ChangeDetectorRef,
    public calendarState: CalendarStateService,
    private roomService: RoomService,
    private authService: AuthService,
    private toastr: ToastrService,
  ) {}

  ngOnInit(): void {
    this.loadBookings();
    this.loadRooms();
    this.getUserFromToken();
    this.calendarState.refreshCalendar$.subscribe(() => {
      this.loadBookings(); // 🔥 auto reload
    });
  }

  loadRooms() {
    this.roomService.getRooms().subscribe((res: any) => {
      console.log('ROOMS:', res);

      this.rooms = (res.data || res).filter((room: any) => room.isActive);
    });
  }
  selectRoom(room: any) {
    this.selectedRoomId = room.id;

    this.openBooking(room.id); // 🔥 mở luôn
  }
  openBooking(roomId: number) {
    this.dialog.open(BookingComponent, {
      width: '900px',
      data: {
        roomId: roomId,
        date: new Date(), // 👉 mặc định hôm nay
      },
    });
  }

  ngAfterViewInit(): void {
    setTimeout(() => {
      this.ngZone.run(() => {
        this.updateViewState();
      });
    }, 300);
  }
  getUserFromToken() {
    const token = this.authService.getAccessToken();

    if (!token) return null;

    try {
      const payload: any = jwtDecode(token);
      this.currentUser = payload;
      return payload;
    } catch (error) {
      console.error('Decode token lỗi:', error);
      return null;
    }
  }
  onDateChange(date: Date) {
    this.selectedDate = date;

    const calendarApi = this.calendarComponent.getApi();

    calendarApi.changeView('timeGridDay', date);

    this.updateViewState(); // 🔥 quan trọng
  }
  isLoggedIn(): boolean {
    return this.authService.isLoggedIn();
  }
  logout() {
    this.authService.logout(); // 🔥 đã clear localStorage

    this.currentUser = null;

    this.router.navigate(['/login']);
  }
  goToLogin() {
    this.router.navigate(['/login']);
  }
  // 🔥 Load booking từ backend, filter booking đã hủy
 loadBookings() {
  this.bookingService.getAllBookings().subscribe((data: any) => {
    const bookings = data.$values || data.data || data;

    const events = bookings
      // ✅ chỉ lấy đúng 3 trạng thái
      .filter((b: any) => {
        const status = b.status?.toLowerCase();
        return status === 'booked'
            || status === 'ongoing'
            || status === 'completed';
      })

      .map((b: any) => ({
        id: b.id,
        title: b.meetingRoom?.name || 'No Room',
        start: new Date(b.startTime),
        end: new Date(b.endTime),

        // 🔥 giữ status để dùng render màu
        extendedProps: {
          status: b.status
        }
      }));

    this.calendarOptions.events = events;

    if (this.calendarComponent) {
      const calendarApi = this.calendarComponent.getApi();
      calendarApi.removeAllEventSources();
      calendarApi.setOption('events', events);
      calendarApi.refetchEvents();
    }
  });
}

  updateViewState() {
    const calendarApi = this.calendarComponent.getApi();

    const isDay = calendarApi.view.type === 'timeGridDay';

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const currentDate = calendarApi.getDate();
    const selected = new Date(currentDate);
    selected.setHours(0, 0, 0, 0);

    this.calendarState.isDayView = isDay;
    this.calendarState.isPast = selected < today;
    this.calendarState.selectedDate = selected;
  }

  // 🔥 Chuyển sang trang booking
  goToBooking() {
    if (this.isDialogOpen) return;

    const calendarApi = this.calendarComponent.getApi();
    const currentDate = calendarApi.getDate();

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const selected = new Date(currentDate);
    selected.setHours(0, 0, 0, 0);

    if (selected < today) {
      this.toastr.warning('Không thể đặt phòng cho ngày đã qua');
      return;
    }

    this.isDialogOpen = true;
    const dialogRef = this.dialog.open(BookingComponent, {
      width: '900px',
      data: {
        date: selected,
        roomId: 0,
      },
    });
    dialogRef.afterClosed().subscribe(() => {
      this.isDialogOpen = false; // ✅ mở lại khi đóng
    });
  }
  goProfile() {
    this.router.navigate(['/profile']);
  }

}
