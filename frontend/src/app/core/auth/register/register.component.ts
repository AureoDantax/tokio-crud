import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators, AbstractControl } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../auth.service';
import { AddressService } from '../../../modules/services/address.service';
import { CommonModule } from '@angular/common';
import { CepMaskDirective } from '../../../shared/directives/cep-mask.directive';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss'],
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule, CepMaskDirective]
})
export class RegisterComponent implements OnInit {
  userForm!: FormGroup;
  addressForm!: FormGroup;
  loading = false;
  errorMessage = '';
  formStep = 1; // Controle de etapas do formulário
  cepMessage: { message: string, type: 'success' | 'error' | 'info' } | null = null;
  
  constructor(
    private fb: FormBuilder,
    private router: Router,
    private authService: AuthService,
    private addressService: AddressService
  ) {}
  
  ngOnInit(): void {
    this.initForms();
  }
  
  initForms(): void {
    this.userForm = this.fb.group({
      nome: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
    
    this.addressForm = this.fb.group({
      cep: ['', [Validators.required, Validators.pattern(/^\d{5}-\d{3}$/)]],
      logradouro: ['', Validators.required],
      numero: ['', Validators.required],
      complemento: [''],
      bairro: ['', Validators.required],
      cidade: ['', Validators.required],
      estado: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(2)]]
    });
  }
  
  // Avançar para a próxima etapa do formulário
  nextStep(): void {
    if (this.userForm.invalid) {
      this.markFormGroupTouched(this.userForm);
      return;
    }
    this.formStep = 2;
  }
  
  // Voltar para a etapa anterior
  previousStep(): void {
    this.formStep = 1;
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
  
  // Atualizar o método searchCep para usar notificações amigáveis
  searchCep(): void {
    const cep = this.addressForm.get('cep')?.value;
    
    if (!cep || !/^\d{5}-\d{3}$/.test(cep)) {
      this.cepMessage = {
        message: 'Por favor, informe um CEP válido no formato 00000-000',
        type: 'error'
      };
      setTimeout(() => this.cepMessage = null, 5000);
      return;
    }

    const cepNumerico = cep.replace(/\D/g, '');
    
    this.loading = true;
    this.addressService.consultCep(cepNumerico).subscribe({
      next: (data) => {
        if (!data.erro) {
          this.addressForm.patchValue({
            logradouro: data.logradouro,
            bairro: data.bairro,
            cidade: data.localidade,
            estado: data.uf
          });
          
          this.cepMessage = {
            message: 'Endereço encontrado com sucesso!',
            type: 'success'
          };
        } else {
          this.cepMessage = {
            message: 'CEP não encontrado. Verifique e tente novamente.',
            type: 'error'
          };
        }
        this.loading = false;
        setTimeout(() => this.cepMessage = null, 5000);
      },
      error: (error: Error) => {
        console.error('Erro ao consultar CEP', error);
        this.cepMessage = {
          message: 'Erro ao consultar CEP. Tente novamente mais tarde.',
          type: 'error'
        };
        this.loading = false;
        setTimeout(() => this.cepMessage = null, 5000);
      }
    });
  }
  
  onSubmit(): void {
    // Se estiver na etapa 1 e o botão de submit for clicado, avança para etapa 2
    if (this.formStep === 1) {
      this.nextStep();
      return;
    }
    
    if (this.userForm.invalid || this.addressForm.invalid) {
      this.markFormGroupTouched(this.userForm);
      this.markFormGroupTouched(this.addressForm);
      return;
    }
    
    this.loading = true;
    this.errorMessage = '';
    
    const registerData = {
      ...this.userForm.value,
      address: this.addressForm.value,
      role: 'USER' // Por padrão registra como usuário comum
    };
    
    this.authService.register(registerData).subscribe({
      next: () => {
        this.router.navigate(['/login'], {
          queryParams: { registered: 'true' }
        });
      },
      error: (err: Error) => {
        this.errorMessage = 'Erro ao registrar. Verifique os dados e tente novamente.';
        console.error('Erro de registro:', err);
        this.loading = false;
      }
    });
  }
  
  // Getters para facilitar o acesso nos templates
  get userControls() {
    return this.userForm.controls;
  }
  
  get addressControls() {
    return this.addressForm.controls;
  }

  // Getters para os controles do formulário de usuário
  get nomeControl(): AbstractControl | null { return this.userForm.get('nome'); }
  get emailControl(): AbstractControl | null { return this.userForm.get('email'); }
  get passwordControl(): AbstractControl | null { return this.userForm.get('password'); }
  
  // Getters para os controles do formulário de endereço
  get cepControl(): AbstractControl | null { return this.addressForm.get('cep'); }
  get logradouroControl(): AbstractControl | null { return this.addressForm.get('logradouro'); }
  get numeroControl(): AbstractControl | null { return this.addressForm.get('numero'); }
  get complementoControl(): AbstractControl | null { return this.addressForm.get('complemento'); }
  get bairroControl(): AbstractControl | null { return this.addressForm.get('bairro'); }
  get cidadeControl(): AbstractControl | null { return this.addressForm.get('cidade'); }
  get estadoControl(): AbstractControl | null { return this.addressForm.get('estado'); }
}