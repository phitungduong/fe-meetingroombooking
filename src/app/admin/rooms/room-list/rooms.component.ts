import { Router } from '@angular/router';
import { Component, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { Room } from 'src/app/models/room';
import { RoomService } from 'src/app/services/room.service';
import { MatDialog } from '@angular/material/dialog';
import { ToastrService } from 'ngx-toastr';
import { EditRoomComponent } from '../edit-room/edit-room.component';
import { ConfirmDialogComponent } from 'src/app/shared/confirm-dialog/confirm-dialog.component';
import { CreateRoomComponent } from '../create-room/create-room.component';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';

@Component({
  selector: 'app-rooms',
  templateUrl: './rooms.component.html',
  styleUrls: ['./rooms.component.css'],
})
export class RoomsComponent implements OnInit, AfterViewInit {

  displayedColumns: string[] = ['id', 'name', 'capacity', 'location', 'status', 'actions'];

  dataSource: MatTableDataSource<Room> = new MatTableDataSource<Room>();

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(
    private roomService: RoomService,
    private router: Router,
    private dialog: MatDialog,
    private toastr: ToastrService,
  ) {}

  ngOnInit(): void {
    this.loadRooms();
  }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  // ✅ load data đúng cách
  loadRooms() {
  this.roomService.getRooms().subscribe((res: any) => {
    this.dataSource.data = res.data.map((room: any) => ({
      ...room,
      status: room.isActive ? 'Active' : 'Inactive'
    }));
  });
}
  openCreate() {
    const dialogRef = this.dialog.open(CreateRoomComponent, {
      width: '500px'
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loadRooms();
      }
    });
  }

  openEdit(room: Room) {
    const dialogRef = this.dialog.open(EditRoomComponent, {
      width: '400px',
      data: room
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loadRooms();
      }
    });
  }

  deleteRoom(id: number) {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '350px',
      data: {
        message: 'Bạn có chắc muốn xóa room này không?'
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.roomService.deleteRoom(id).subscribe(() => {
          this.toastr.success('Deleted successfully');
          this.loadRooms();
        });
      }
    });
  }

  // 🔥 optional: search
  applyFilter(event: Event) {
    const value = (event.target as HTMLInputElement).value;
    this.dataSource.filter = value.trim().toLowerCase();
  }
}
