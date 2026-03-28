import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class CalendarStateService {

  isDayView: boolean = false;
  isPast: boolean = true;
  selectedDate: Date = new Date();

}
