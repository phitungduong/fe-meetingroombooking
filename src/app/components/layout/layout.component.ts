import { Booking } from './../../models/booking';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CalendarStateService } from 'src/app/services/calendar-state.service';
import { MatDialog } from '@angular/material/dialog';
import { BookingComponent } from 'src/app/pages/booking/booking.component';
import { BookingService } from 'src/app/services/booking.service';

@Component({
  selector: 'app-layout',
  templateUrl: './layout.component.html',
  styleUrls: ['./layout.component.css']
})
export class LayoutComponent implements OnInit {

  constructor(
    public calendarState: CalendarStateService,
    private dialog: MatDialog,
    private router: Router,
    private bookingService: BookingService
  ) { }


  ngOnInit(): void {
  }
goToBooking() {
  const selected = this.calendarState.selectedDate;

  console.log('Booking date:', selected);
   this.dialog.open(BookingComponent, {
    width: '900px',
    data: {
      date: selected,
      roomId: 0,
    },
  });

}
isCalendarPage(): boolean {
  return this.router.url.includes('calendar');
}
}
