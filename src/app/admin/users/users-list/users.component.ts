import { Component, OnInit, ViewChild, AfterViewInit, } from '@angular/core';
import { AuthService } from 'src/app/services/auth.service';
import { ToastrService } from 'ngx-toastr';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { CreateUserComponent } from '../create-user/create-user.component';
import { ConfirmDialogComponent } from 'src/app/shared/confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-users',
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.css'],
})
export class UsersComponent implements OnInit, AfterViewInit {
  displayedColumns: string[] = ['id', 'userName', 'email', 'actions'];
  dataSource = new MatTableDataSource<any>();

  @ViewChild(MatPaginator) paginator!: MatPaginator;

  constructor(
    private authService: AuthService,
    private toastr: ToastrService,
    private dialog: MatDialog,
  ) {}


  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
  }
  loading = false;

  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers() {
    this.loading = true;

    this.authService.getAllUsers().subscribe({
      next: (res: any) => {
        this.dataSource.data = res.data; // 👈 API của bạn có data
        this.loading = false;
      },
      error: () => {
        alert('Không tải được danh sách user');
        this.loading = false;
      },
    });
  }
openCreateUser() {
  const dialogRef = this.dialog.open(CreateUserComponent, {
    width: '400px'
  });

  dialogRef.afterClosed().subscribe(result => {
    if (result) {
      this.loadUsers(); // reload list
    }
  });
}

  deleteUser(id: string) {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '400px',
      data: {
        title: 'Xác nhận',
        message: 'Bạn có chắc muốn xóa user này?'
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.authService.deleteUser(id).subscribe({
          next: () => {
            this.toastr.success('Xóa user thành công');
            this.loadUsers(); // reload list sau khi xóa
          },
          error: () => {
            this.toastr.error('Xóa user thất bại');
          }
        });
      }
    });
  }
}
