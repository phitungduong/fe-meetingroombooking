import { Component, OnInit } from '@angular/core';
import { AdminRoutingModule } from '../admin-routing.module';
import { AdminGuard } from '../../guards/admin.guard';
import { ConfirmDialogComponent } from '../../shared/confirm-dialog/confirm-dialog.component';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';

@Component({
  selector: 'app-admin',
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.css'],
})
export class AdminComponent implements OnInit {
  constructor(
    private dialog: MatDialog,
    private adminGuard: AdminGuard,
    private adminRoutingModule: AdminRoutingModule,
    private router: Router,
  ) {}
  opened = true;
  ngOnInit(): void {}
  isCollapsed = false;

  toggleSidebar() {
    this.isCollapsed = !this.isCollapsed;
  }
  logout(): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '300px',
      data: { message: 'Are you sure you want to logout?' },
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
