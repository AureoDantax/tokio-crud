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
  emailChanged = false;
  passwordRequired = false;

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

    // Detecção de mudanças no email para garantir validação correta
    this.profileForm.get('email')?.valueChanges.subscribe(newValue => {
      const originalEmail = this.currentUser.email;
      this.emailChanged = newValue !== originalEmail;
      
      // Se o email mudou, a senha se torna obrigatória
      if (this.emailChanged) {
        this.profileForm.get('password')?.setValidators([Validators.required]);
      } else {
        this.profileForm.get('password')?.clearValidators();
      }
      
      // Importante: Atualizar a validade do campo e do formulário
      this.profileForm.get('password')?.updateValueAndValidity();
      this.profileForm.updateValueAndValidity();
      this.passwordRequired = this.emailChanged;
    });
    
    // Adicionar também um observador para o campo de senha
    this.profileForm.get('password')?.valueChanges.subscribe(() => {
      // Forçar validação do formulário a cada alteração da senha
      this.profileForm.updateValueAndValidity();
    });

    // Observador para novaSenha
    this.profileForm.get('novaSenha')?.valueChanges.subscribe(value => {
      // Se o valor existe mas é muito curto, marque como tocado para mostrar o erro
      if (value && value.length > 0 && value.length < 6) {
        this.profileForm.get('novaSenha')?.markAsTouched();
      }
      this.profileForm.updateValueAndValidity();
    });
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
    // Formulário de perfil com validação para nova senha
    this.profileForm = this.fb.group({
      nome: [this.currentUser.nome, [Validators.required, Validators.minLength(3)]],
      email: [this.currentUser.email, [Validators.required, Validators.email]],
      password: [''], // Validadores adicionados dinamicamente
      novaSenha: ['', [Validators.minLength(6)]], // Adiciona validação de tamanho mínimo
      confirmarNovaSenha: ['']
    });
    
    // Aplicar validador personalizado apenas se ambos campos de senha tiverem valor
    this.profileForm.valueChanges.subscribe(() => {
      const novaSenha = this.profileForm.get('novaSenha')?.value;
      const confirmarSenha = this.profileForm.get('confirmarNovaSenha')?.value;
      
      if (novaSenha && confirmarSenha) {
        // Aplicar validador apenas se ambos tiverem valor
        this.profileForm.setErrors(
          novaSenha === confirmarSenha ? null : { passwordsMismatch: true }
        );
      } else {
        // Remover erro de incompatibilidade se algum campo estiver vazio
        const currentErrors = this.profileForm.errors || {};
        if (currentErrors['passwordsMismatch']) {
          delete currentErrors['passwordsMismatch'];
          this.profileForm.setErrors(Object.keys(currentErrors).length ? currentErrors : null);
        }
      }
    });
  }

  // Validador personalizado para verificar se as senhas coincidem
  passwordsMatch(control: AbstractControl): ValidationErrors | null {
    const novaSenha = control.get('novaSenha')?.value;
    const confirmarNovaSenha = control.get('confirmarNovaSenha')?.value;
    
    // Se algum dos campos de nova senha está preenchido
    if (novaSenha || confirmarNovaSenha) {
      // Validar apenas se ambos os campos estiverem preenchidos
      if (novaSenha && confirmarNovaSenha) {
        return novaSenha === confirmarNovaSenha ? null : { passwordsMismatch: true };
      }
      // Se apenas um campo está preenchido, não bloquear o formulário completo
      return null;
    }
    
    // Se os campos de nova senha estão vazios, não há erro
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
    // Preservar a role do usuário atual
    const currentRole = this.currentUser?.role;
    const oldEmail = this.currentUser.email;
    const newEmail = this.profileForm.get('email')?.value;
    const confirmPassword = this.profileForm.get('password')?.value;
    const newPassword = this.profileForm.get('novaSenha')?.value;
    const emailChanged = oldEmail !== newEmail;
    
    // Criar o objeto de dados para enviar à API
    const userData = {
      ...this.currentUser,
      nome: this.profileForm.get('nome')?.value,
      email: this.profileForm.get('email')?.value,
      role: currentRole,
      addresses: this.userAddresses
    };
    
    // Adicionar a senha apenas se:
    // 1. O email foi alterado (usando o campo password para confirmação)
    // 2. Uma nova senha foi definida (usando novaSenha como o novo password)
    if (emailChanged && confirmPassword) {
      userData.password = confirmPassword; // Senha atual para confirmar mudança de email
    } else if (newPassword) {
      userData.password = newPassword; // Nova senha definida pelo usuário
    }

    console.log('Dados a serem enviados para a API:', userData);

    this.userService.updateUser(this.currentUser.id, userData).subscribe({
      next: (updatedUser) => {
        // Garantir que a role seja preservada na resposta
        const userWithRole = {
          ...updatedUser,
          role: updatedUser.role || currentRole
        };
        
        this.currentUser = userWithRole;
        this.authService.setCurrentUser(userWithRole);
        
        // Se o email foi alterado e uma senha foi fornecida, renovar o token
        if (emailChanged && confirmPassword) {
          this.renewToken(newEmail, confirmPassword);
        } else {
          this.successMessage = 'Perfil atualizado com sucesso!';
          this.loading = false;
          setTimeout(() => {
            this.router.navigate(['/dashboard']);
          }, 1500);
        }
      },
      error: (err: any) => {
        console.error('Erro ao atualizar perfil:', err);
        this.errorMessage = 'Erro ao atualizar perfil. Tente novamente.';
        this.loading = false;
      }
    });
  }

  // Método para renovar o token
  renewToken(email: string, password: string): void {
    this.authService.renewToken(email, password).subscribe({
      next: () => {
        this.successMessage = 'Perfil e credenciais atualizados com sucesso!';
        this.loading = false;
        setTimeout(() => {
          this.router.navigate(['/dashboard']);
        }, 1500);
      },
      error: (err) => {
        console.error('Erro ao renovar o token:', err);
        this.errorMessage = 'Seu perfil foi atualizado, mas você precisa fazer login novamente com o novo email.';
        this.loading = false;
        setTimeout(() => {
          this.authService.logout();
          this.router.navigate(['/login'], { queryParams: { emailChanged: 'true' } });
        }, 3000);
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

  // Adicionar estes getters
  get novaSenhaControl(): AbstractControl | null { 
    return this.profileForm.get('novaSenha'); 
  }
  
  get confirmarNovaSenhaControl(): AbstractControl | null { 
    return this.profileForm.get('confirmarNovaSenha'); 
  }

  //validação customizada do botão
  isFormInvalid(): boolean {
    // Campos básicos obrigatórios
    const requiredFieldsInvalid = 
      this.nomeControl?.invalid || 
      this.emailControl?.invalid;
      
    // Email alterado mas sem senha de confirmação
    const emailChangedAndNoPassword = 
      this.emailChanged && (!this.passwordControl?.value);
      
    // Nova senha muito curta (menos de 6 caracteres)
    const novaSenhaInvalid = 
      this.novaSenhaControl?.value && this.novaSenhaControl?.invalid;

    // Senhas não coincidem
    const passwordsMismatch = 
      (this.novaSenhaControl?.value || this.confirmarNovaSenhaControl?.value) && 
      (this.novaSenhaControl?.value !== this.confirmarNovaSenhaControl?.value);
    
    return !!requiredFieldsInvalid || 
           !!emailChangedAndNoPassword || 
           !!passwordsMismatch || 
           !!novaSenhaInvalid;
  }
}