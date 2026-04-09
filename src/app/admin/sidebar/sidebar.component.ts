import { Component, OnInit } from '@angular/core';
import { Input } from '@angular/core';
import { ConfirmDialogComponent } from '../../shared/confirm-dialog/confirm-dialog.component';
import { MatDialog } from '@angular/material/dialog';
@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.css']
})
export class SidebarComponent implements OnInit {
@Input() collapsed: boolean = false;
  constructor(private dialog: MatDialog) { }

  ngOnInit(): void {
  }
logout(): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '300px',
      data: { message: 'Bạn có chắc chắn muốn đăng xuất?' },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {

        sessionStorage.removeItem('role');
        sessionStorage.removeItem('token');
        window.location.href = '/';
      }
    });
  }
}

