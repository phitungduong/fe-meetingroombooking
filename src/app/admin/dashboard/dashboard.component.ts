import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BookingService } from '../../services/booking.service';
import { MatPaginatorModule } from '@angular/material/paginator';

interface Booking {
  roomName: string;
  startTime: Date;
  status: string;
}

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css'],
})
export class DashboardComponent implements OnInit {
  stats : any = {};
  ongoing: any[] = [];
  upcoming: any[] = [];
  recent: any[] = [];

  bookings: Booking[] = [];

  constructor(
    private http: HttpClient,
    private bookingService: BookingService,

  ) {}
  pageSize = 5;

  // Ongoing
  pagedOngoing: any[] = [];
  ongoingPageIndex = 0;

  // Upcoming
  pagedUpcoming: any[] = [];
  upcomingPageIndex = 0;

  // Recent
  pagedRecent: any[] = [];
  recentPageIndex = 0;

  ngOnInit(): void {
    this.loadDashboard();
    this.updatePagedData();
  }

  loadDashboard() {
  this.bookingService.getDashboard().subscribe((res) => {

    const today = new Date();

    const isSameDay = (d1: Date, d2: Date) =>
      d1.getFullYear() === d2.getFullYear() &&
      d1.getMonth() === d2.getMonth() &&
      d1.getDate() === d2.getDate();

    this.ongoing = res.data.ongoingList || [];

    // 🔥 filter upcoming hôm nay
    this.upcoming = (res.data.upcomingList || []).filter((b: any) =>
      isSameDay(new Date(b.startTime), today)
    );

    this.recent = res.data.recentList || [];

    // 🔥 FIX COUNT
    this.stats = {
      ...res.data.stats,
      upcoming: this.upcoming.length
    };

    this.updatePagedData();
  });
}
  updatePagedData() {
    this.pagedOngoing = this.paginate(this.ongoing, this.ongoingPageIndex);
    this.pagedUpcoming = this.paginate(this.upcoming, this.upcomingPageIndex);
    this.pagedRecent = this.paginate(this.recent, this.recentPageIndex);
  }

  paginate(array: any[], pageIndex: number) {
  if (!array) return []; // ✅ chống crash

  const start = pageIndex * this.pageSize;
  return array.slice(start, start + this.pageSize);
}
  onPageChange(event: any, type: string) {
  if (type === 'ongoing') {
    this.ongoingPageIndex = event.pageIndex;
  }

  if (type === 'upcoming') {
    this.upcomingPageIndex = event.pageIndex;
  }

  if (type === 'recent') {
    this.recentPageIndex = event.pageIndex;
  }

  this.updatePagedData();
}
}
