import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Subject, Observable } from 'rxjs';
import { Booking } from '../models/booking';
import { PagedResultDto } from '../models/PagedResultDto';

@Injectable({
  providedIn: 'root',
})
export class BookingService {
  private apiUrl = 'https://localhost:44371/api/bookings';

  private bookingChangedSource = new Subject<void>();
  bookingChanged$ = this.bookingChangedSource.asObservable();

  constructor(private http: HttpClient) {}

  notifyBookingChanged() {
    this.bookingChangedSource.next();
  }

  createBooking(booking: any): Observable<Booking> {
    return this.http.post<Booking>(`${this.apiUrl}`, booking);
  }

  // =========================
  // FIX DATE FORMAT HERE
  // =========================
  private formatDate(date: any): string {
    if (!date) return '';

    if (date instanceof Date) {
      return date.toISOString().split('T')[0]; // YYYY-MM-DD
    }

    return new Date(date).toISOString().split('T')[0];
  }

  getBookingsByRoomAndDate(roomId: number, date: any): Observable<Booking[]> {
    const formattedDate = this.formatDate(date);

    const params = new HttpParams()
      .set('roomId', roomId.toString())
      .set('date', formattedDate);

    return this.http.get<Booking[]>(`${this.apiUrl}/room`, { params });
  }

  getAllBookings() {
    return this.http.get<Booking[]>(this.apiUrl);
  }

  getMyBookings(page: number = 1, pageSize: number = 5) {
    return this.http.get<PagedResultDto<Booking>>(
      `${this.apiUrl}/my-bookings?page=${page}&pageSize=${pageSize}`,
    );
  }

  cancelBooking(id: number) {
    return this.http.put(
      `${this.apiUrl}/cancel/${id}`,
      {},
      { responseType: 'text' },
    );
  }

  getDashboard() {
    return this.http.get<any>(`${this.apiUrl}/dashboard`);
  }

  getBookingById(id: number) {
    return this.http.get(`${this.apiUrl}/${id}`);
  }
  deleteBooking(id: number) {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }
  updateBookingAdmin(id: number, booking: any) {
    return this.http.put(`${this.apiUrl}/admin/${id}`, booking);
  }
  updateBookingUser(id: number, booking: any) {
    return this.http.put(`${this.apiUrl}/${id}`, booking);
  }
  getBookingsByDate(date: string, roomId?: number): Observable<any> {
    let params = new HttpParams().set('date', date);

    if (roomId) {
      params = params.set('roomId', roomId);
    }

    return this.http.get(`${this.apiUrl}/by-date`, { params });
  }
  getBookingsByRooms(roomIds: number[], date: any): Observable<Booking[]> {
    const formattedDate = this.formatDate(date);

    let params = new HttpParams().set('date', formattedDate);

    roomIds.forEach((id) => {
      params = params.append('roomIds', id.toString());
    });

    return this.http.get<Booking[]>(`${this.apiUrl}/rooms`, { params });
  }
  approveBooking(id: number) {
  return this.http.put(
    `${this.apiUrl}/approve/${id}`,
    {},
    { responseType: 'text' }
  );
}
}
