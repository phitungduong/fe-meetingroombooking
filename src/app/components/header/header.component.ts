import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/services/auth.service';
import { ToastrService } from 'ngx-toastr';
import { UserService } from 'src/app/services/user.service';
import { MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { ConfirmDialogComponent } from 'src/app/shared/confirm-dialog/confirm-dialog.component';
import { MatDialog } from '@angular/material/dialog';
@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit {

  constructor(
    public authService: AuthService,
    private router: Router,
    private toastr: ToastrService,
    public userService: UserService,
    private matDialog: MatDialog,
    private matDialogModule: MatDialogModule,
    private matButtonModule: MatButtonModule,

  ) { }

  ngOnInit(): void {
  }
logout() {
  const dialogRef = this.matDialog.open(ConfirmDialogComponent, {
    data: {
      title: 'Xác nhận đăng xuất',
      message: 'Bạn có chắc muốn đăng xuất không?',
    },
    width: '350px',
  });

  dialogRef.afterClosed().subscribe(result => {
    if (result) {
     
      this.authService.logout();

      localStorage.removeItem('token');
      localStorage.removeItem('role');

      this.router.navigate(['/login']);
    }
  });
}
  goToLogin() {
    this.router.navigate(['/login']);
  }
  goProfile() {
    this.router.navigate(['/profile']);
  }
}
