import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../core/auth/auth.service';
import { UserService } from '../../services/user.service';
import { AddressService } from '../../services/address.service';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss'],
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule]
})
export class ProfileComponent implements OnInit {
  profileForm!: FormGroup;
  passwordForm!: FormGroup;
  currentUser: any;
  loading = false;
  successMessage = '';
  errorMessage = '';
  activeTab = 'profile'; // Aba ativa, pode ser 'profile' ou 'password'
  userAddresses: any[] = []; 
  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private userService: UserService,
    private addressService: AddressService,
    public router: Router 
  ) {}

  ngOnInit(): void {
    this.currentUser = this.authService.getCurrentUser();
    
    if (!this.currentUser) {
      this.router.navigate(['/login']);
      return;
    }
    
    this.initForms();
    this.loadUserAddresses();
  }

  loadUserAddresses(): void {
    this.addressService.getAddressesByUser(this.currentUser.id).subscribe({
      next: (addresses) => {
        this.userAddresses = addresses;
      },
      error: (err: any) => {
        console.error('Erro ao carregar endereços:', err);
      }
    });
  }

  goToAddressManagement(): void {
    this.router.navigate(['/enderecos']);
  }

  initForms(): void {
    // Formulário de perfil
    this.profileForm = this.fb.group({
      nome: [this.currentUser.nome, [Validators.required, Validators.minLength(3)]],
      email: [this.currentUser.email, [Validators.required, Validators.email]],
      password: ['', []],
      confirmPassword: ['', []]
    }, { validators: this.passwordsMatch });

    // Formulário de alteração de senha
    this.passwordForm = this.fb.group({
      currentPassword: ['', [Validators.required]],
      newPassword: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required]]
    }, { validators: this.passwordsMatch });
  }

  // Validador personalizado para verificar se as senhas coincidem
  passwordsMatch(control: AbstractControl): ValidationErrors | null {
    // Primeiro tenta os campos usados no formulário de perfil
    const password = control.get('password')?.value;
    const confirmPassword = control.get('confirmPassword')?.value;
    
    // Se ambos estiverem vazios, não tem erro pois sao opcionais
    if ((!password && !confirmPassword)) {
      return null;
    }
    
    // Se ambos tiverem valores, verifica se são iguais
    if (password && confirmPassword) {
      return password === confirmPassword ? null : { passwordsMismatch: true };
    }
    
    // Se um deles tiver valor e o outro não, da erro
    if ((password && !confirmPassword) || (!password && confirmPassword)) {
      return { passwordsMismatch: true };
    }
    
    // Tenta os campos do formulário de alteração de senha como backup
    const newPassword = control.get('newPassword')?.value;
    const newConfirmPassword = control.get('confirmPassword')?.value;
    
    if (newPassword && newConfirmPassword) {
      return newPassword === newConfirmPassword ? null : { passwordsMismatch: true };
    }
    
    return null;
  }

  // Alternar entre abas
  setActiveTab(tab: string): void {
    this.activeTab = tab;
    this.successMessage = '';
    this.errorMessage = '';
  }

  // Salvar alterações de perfil
  updateProfile(): void {
    if (this.profileForm.invalid) {
      this.markFormGroupTouched(this.profileForm);
      return;
    }

    this.loading = true;
    const userData = {
      ...this.currentUser,
      ...this.profileForm.value,
      addresses: this.userAddresses
    };

    this.userService.updateUser(this.currentUser.id, userData).subscribe({
      next: (updatedUser) => {
        this.currentUser = updatedUser;
        this.authService.setCurrentUser(updatedUser);
        this.successMessage = 'Perfil atualizado com sucesso!';
        this.loading = false;
        setTimeout(() => {
        this.router.navigate(['/dashboard']);
      }, 1500); // Pequeno atraso para mostrar a mensagem de sucesso
      },
      error: (err: any) => {
        console.error('Erro ao atualizar perfil:', err);
        this.errorMessage = 'Erro ao atualizar perfil. Tente novamente.';
        this.loading = false;
      }
    });
  }

  // Marcar todos os campos do formulário como tocados
  markFormGroupTouched(formGroup: FormGroup): void {
    Object.values(formGroup.controls).forEach(control => {
      control.markAsTouched();
      if (control instanceof FormGroup) {
        this.markFormGroupTouched(control);
      }
    });
  }

  // Getters para facilitar acesso nos templates
  get nomeControl(): AbstractControl | null { return this.profileForm.get('nome'); }
  get emailControl(): AbstractControl | null { return this.profileForm.get('email'); }
  
  // Adicionando para compatibilidade com o template
  get passwordControl(): AbstractControl | null { return this.profileForm.get('password'); }
  get confirmPasswordControl(): AbstractControl | null { return this.profileForm.get('confirmPassword'); }
  
  get currentPasswordControl(): AbstractControl | null { return this.passwordForm.get('currentPassword'); }
  get newPasswordControl(): AbstractControl | null { return this.passwordForm.get('newPassword'); }
}