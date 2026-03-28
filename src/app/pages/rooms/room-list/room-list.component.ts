import { Component, OnInit } from '@angular/core';
import { RoomService } from '../../../services/room.service';
import { Router } from '@angular/router';
import { Room } from '../../../models/room';
import { MatDialog } from '@angular/material/dialog';
import { BookingComponent } from '../../booking/booking.component';

@Component({
  selector: 'app-room-list',
  templateUrl: './room-list.component.html',
  styleUrls: ['./room-list.component.css']
})
export class RoomListComponent implements OnInit {

  rooms: Room[] = [];

  constructor(private roomService: RoomService, private router: Router, private dialog: MatDialog) {}

  ngOnInit(): void {
    this.loadRooms();
  }

  loadRooms() {
  this.roomService.getRooms().subscribe((res: any) => {
  this.rooms = res.data.filter((room: any) => room.isActive);
});
}
bookRoom(roomId: number) {
  const dialogRef = this.dialog.open(BookingComponent, {
    width: '900px',
    data: {
      roomId: roomId
    }
  });

  dialogRef.afterClosed().subscribe(result => {
    if (result) {
      this.loadRooms(); // reload rooms
    }
  });
}

}
