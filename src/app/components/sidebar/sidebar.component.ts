import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { UserService } from 'src/app/services/user.service';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.css']
})
export class SidebarComponent {

  constructor(
    private userService: UserService,
    private router: Router
  ) {}

  logout(){

    this.userService.logout();

    this.router.navigate(['/login']);

  }

}
