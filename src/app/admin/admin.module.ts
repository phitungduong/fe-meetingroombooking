import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { AdminRoutingModule } from './admin-routing.module';
import { DashboardComponent } from './dashboard/dashboard.component';
import { UsersComponent } from './users/users-list/users.component';
import { RoomsComponent } from './rooms/room-list/rooms.component';
import { BookingsComponent } from './bookings/booking-list/bookings.component';
import { AdminComponent } from './admin/admin.component';
import { CreateRoomComponent } from './rooms/create-room/create-room.component';
import { CreateUserComponent } from './users/create-user/create-user.component';
import { SidebarComponent } from './sidebar/sidebar.component';

import { ReactiveFormsModule } from '@angular/forms';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatButtonModule } from '@angular/material/button';
import { MatTabsModule } from '@angular/material/tabs';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatTreeModule } from '@angular/material/tree';
import { EditRoomComponent } from './rooms/edit-room/edit-room.component';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { ToastrModule } from 'ngx-toastr';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDialogModule } from '@angular/material/dialog';
import { MatTableModule } from '@angular/material/table';
import { MatCardModule } from '@angular/material/card';
import { MatSortModule } from '@angular/material/sort';
import { CreateBookingComponent } from './bookings/create-booking/create-booking.component';
import { FormsModule } from '@angular/forms';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { UpdateBookingComponent } from './bookings/update-booking/update-booking.component';






@NgModule({
  declarations: [
    DashboardComponent,
    UsersComponent,
    RoomsComponent,

    BookingsComponent,
    AdminComponent,

    SidebarComponent,
    EditRoomComponent,
    CreateRoomComponent,
    CreateUserComponent,
    CreateBookingComponent,
    UpdateBookingComponent,



  ],
  imports: [
    CommonModule,
    AdminRoutingModule,
    MatSidenavModule,
    MatToolbarModule,
    MatIconModule,
    MatListModule,
    MatButtonModule,
    MatTabsModule,
    MatPaginatorModule,
    MatTreeModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    ToastrModule.forRoot({
      positionClass: 'toast-top-right',
      timeOut: 2000,
    }),
    MatCheckboxModule,
    MatDialogModule,
    MatTableModule,
    MatCardModule,
    MatSortModule,
    FormsModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,





  ],
})
export class AdminModule {}
