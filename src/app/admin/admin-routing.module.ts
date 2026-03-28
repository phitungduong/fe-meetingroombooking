import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DashboardComponent } from './dashboard/dashboard.component';
import { UsersComponent } from './users/users-list/users.component';
import { RoomsComponent } from './rooms/room-list/rooms.component';
import { BookingsComponent } from './bookings/booking-list/bookings.component';
import { AdminComponent } from './admin/admin.component';
import { EditRoomComponent } from './rooms/edit-room/edit-room.component';
import { CreateRoomComponent } from './rooms/create-room/create-room.component';
import { CreateUserComponent } from './users/create-user/create-user.component';
import { CreateBookingComponent } from './bookings/create-booking/create-booking.component';
import { UpdateBookingComponent } from './bookings/update-booking/update-booking.component';
const routes: Routes = [
  {
    path: '',
    component: AdminComponent,
    children: [
      { path: 'rooms/room-list', component: RoomsComponent },
      { path: 'rooms/edit/:id', component: EditRoomComponent },
      { path: 'rooms/create', component: CreateRoomComponent },
      { path: 'bookings/booking-list', component: BookingsComponent },
      { path: 'dashboard', component: DashboardComponent },
      { path : 'users', component: UsersComponent },
      { path : 'users/create', component: CreateUserComponent },
      { path : 'bookings/create', component: CreateBookingComponent },
      { path : 'bookings/update/:id', component: UpdateBookingComponent },

    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AdminRoutingModule {}
