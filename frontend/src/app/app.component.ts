import { Component } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from './core/auth/auth.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  standalone: true,
  imports: [CommonModule, RouterModule]
})
export class AppComponent {
  
  constructor(
    private router: Router,
    private authService: AuthService
  ) {}
  
  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}