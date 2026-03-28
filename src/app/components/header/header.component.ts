import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/services/auth.service';
import { ToastrService } from 'ngx-toastr';
import { UserService } from 'src/app/services/user.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit {

  constructor(
    private authService: AuthService,
    private router: Router,
    private toastr: ToastrService,
    public userService: UserService
  ) { }

  ngOnInit(): void {
  }
logout() {
    this.authService.logout(); // nếu có

    // nếu chưa có thì dùng:
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('role');

   

    this.router.navigate(['/login']);
  }
  goToLogin() {
    this.router.navigate(['/login']);
  }
  goProfile() {
    this.router.navigate(['/profile']);
  }
}
