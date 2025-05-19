// modules/dashboard/dashboard.component.ts
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { AuthService } from '../../core/auth/auth.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
  standalone: true,
  imports: [CommonModule, RouterModule]
})
export class DashboardComponent implements OnInit {
  currentUser: any;
  isAdmin = false;
  errorMessage = '';
  successMessage = '';
  constructor(
    private authService: AuthService,
    private router: Router,
    private activatedRoute: ActivatedRoute

  ) { }

  ngOnInit(): void {
    this.currentUser = this.authService.getCurrentUser();
    console.log('Usuário atual:', this.currentUser);
    this.isAdmin = this.currentUser?.role === 'ROLE_ADMIN';
       this.activatedRoute.queryParams.subscribe(params => {
      if (params['registered']) {
        this.successMessage = 'Registro concluído com sucesso! Faça login para continuar.';
      } else if (params['sessionExpired']) {
        this.errorMessage = 'Sua sessão expirou. Por favor, faça login novamente.';
      } else if (params['loggedOut']) {
        this.successMessage = 'Logout realizado com sucesso.';
      }
    });

  }

  goToUsers(): void {
    this.router.navigate(['/usuarios']);
  }

  goToAddresses(): void {
    this.router.navigate(['/enderecos']);
  }

  goToMyProfile(): void {
    if (this.currentUser?.id) {
      this.router.navigate(['/usuarios/editar', this.currentUser.id]);
    }
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login'], {
      queryParams: { loggedOut: 'true' }
    });
  }
}
