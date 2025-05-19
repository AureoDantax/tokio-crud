import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators, AbstractControl } from '@angular/forms';
import { Router, RouterModule, ActivatedRoute } from '@angular/router';
import { AuthService } from '../auth.service';
import { jwtDecode, JwtPayload } from 'jwt-decode';

interface CustomJwtPayload extends JwtPayload {
  userId: number;
  role: string[];
  sub: string;
}

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {
  loginForm: FormGroup;
  errorMessage = '';
  successMessage = '';
  loading = false;
  hidePassword = true; // Para controle de visibilidade da senha

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  ngOnInit(): void {
    // Verificar se o usuário acabou de se registrar
    this.route.queryParams.subscribe(params => {
      if (params['registered']) {
        this.successMessage = 'Registro concluído com sucesso! Faça login para continuar.';
      } else if (params['sessionExpired']) {
        this.errorMessage = 'Sua sessão expirou. Por favor, faça login novamente.';
      } else if (params['emailChanged']) {
        this.successMessage = 'Seu email foi alterado. Por favor, faça login novamente com seu novo email.';
      }
    });

    // Limpar tokens existentes por segurança
    this.authService.logout();

  }

  onSubmit(): void {
    // Resetar mensagens
    this.errorMessage = '';
    this.successMessage = '';

    if (this.loginForm.invalid) {
      this.markFormGroupTouched(this.loginForm);
      return;
    }

    this.loading = true;
    this.authService.login(this.loginForm.value).subscribe({
      next: (response) => {
        this.authService.setToken(response);
        const decodedToken = jwtDecode<CustomJwtPayload>(response.token);
        const userId = decodedToken.userId;

        // Verificamos se o userId existe
        if (userId) {
          this.authService.fetchUserById(userId).subscribe({
            next: (userData) => {
              const userWithRole = {
                ...userData,
                role: decodedToken.role[0]
              };
              this.authService.setCurrentUser(userWithRole);
              this.router.navigate(['/dashboard']);
            },
            error: (err) => {
              console.error('Erro ao buscar dados do usuário:', err);
              this.router.navigate(['/dashboard']);
            }
          });
        } else {
          console.error('UserId não encontrado no token');
          this.router.navigate(['/dashboard']);
        }
      },
      error: (err) => {
        console.error('Erro durante login:', err);

        if (err.status === 401) {
          this.errorMessage = 'Credenciais inválidas. Verifique seu e-mail e senha.';
        } else if (err.status === 429) {
          this.errorMessage = 'Muitas tentativas. Tente novamente mais tarde.';
        } else {
          this.errorMessage = 'Falha ao conectar ao servidor. Tente novamente.';
        }

        this.loading = false;
      }
    });
  }

  togglePasswordVisibility(): void {
    this.hidePassword = !this.hidePassword;
  }

  // Marcar todos os campos como tocados para ativar validações visuais
  markFormGroupTouched(formGroup: FormGroup): void {
    Object.values(formGroup.controls).forEach(control => {
      control.markAsTouched();

      if ((control as any).controls) {
        this.markFormGroupTouched(control as FormGroup);
      }
    });
  }

  // Getters tipados para os controles do formulário
  get emailControl(): AbstractControl | null {
    return this.loginForm.get('email');
  }

  get passwordControl(): AbstractControl | null {
    return this.loginForm.get('password');
  }
}