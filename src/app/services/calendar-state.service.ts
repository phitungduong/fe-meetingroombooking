import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CalendarStateService {

  // 🔥 STATE (giữ lại cái cũ)
  isDayView: boolean = false;
  isPast: boolean = false;
  selectedDate: Date = new Date();

  // 🔥 EVENT (thêm mới)
  refreshCalendar$ = new Subject<void>();

  triggerRefresh() {
    this.refreshCalendar$.next();
  }
}
