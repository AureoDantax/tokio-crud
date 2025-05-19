import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { AddressService } from '../../services/address.service';
import { AuthService } from '../../../core/auth/auth.service';
import { CommonModule } from '@angular/common';
import { CepMaskDirective } from '../../../shared/directives/cep-mask.directive';

@Component({
  selector: 'app-address-form',
  templateUrl: './address-form.component.html',
  styleUrls: ['./address-form.component.scss'],
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule, CepMaskDirective]
})
export class AddressFormComponent implements OnInit {
  addressForm!: FormGroup;
  addressId: number | null = null;
  userId: number | null = null;
  loading = false;
  isEditMode = false;
  cepMessage: { message: string, type: 'success' | 'error' | 'info' } | null = null;

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private addressService: AddressService,
    private authService: AuthService
  ) { }

  ngOnInit(): void {
    // Obter ID do usuário logado
    this.userId = this.authService.getCurrentUser()?.id ?? null;
    
    if (!this.userId) {
      this.router.navigate(['/login']);
      return;
    }

    this.initForm();

    this.addressId = Number(this.route.snapshot.paramMap.get('id'));
    this.isEditMode = !!this.addressId;

    if (this.isEditMode && this.addressId) {
      this.loadAddressDetails(this.addressId);
    }
  }

  initForm(): void {
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

  loadAddressDetails(addressId: number): void {
    this.loading = true;
    this.addressService.getAddressById(addressId).subscribe({
      next: (address) => {
        this.addressForm.patchValue(address);
        this.loading = false;
      },
      error: (error) => {
        console.error('Erro ao carregar detalhes do endereço', error);
        this.loading = false;
        this.cepMessage = {
          message: 'Erro ao carregar endereço. Tente novamente.',
          type: 'error'
        };
        setTimeout(() => this.cepMessage = null, 5000);
      }
    });
  }

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
    
    this.loading = true;
    const cepNumerico = cep.replace(/\D/g, '');
    
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
      error: (error) => {
        console.error('Erro ao consultar CEP:', error);
        this.cepMessage = {
          message: 'Erro ao consultar CEP. Tente novamente mais tarde.',
          type: 'error'
        };
        this.loading = false;
        setTimeout(() => this.cepMessage = null, 5000);
      }
    });
  }

  markFormAsTouched(formGroup: FormGroup): void {
    Object.keys(formGroup.controls).forEach(field => {
      const control = formGroup.get(field);
      control?.markAsTouched();
      
      if (control instanceof FormGroup) {
        this.markFormAsTouched(control);
      }
    });
  }

  onSubmit(): void {
    if (this.addressForm.invalid) {
      this.markFormAsTouched(this.addressForm);
      return;
    }

    if (!this.userId) {
      this.cepMessage = {
        message: 'Erro: Usuário não identificado.',
        type: 'error'
      };
      return;
    }

    this.loading = true;
    const addressData = this.addressForm.value;

    if (this.isEditMode && this.addressId) {
      this.addressService.updateAddress(this.addressId, addressData).subscribe({
        next: () => {
          this.loading = false;
          this.router.navigate(['/enderecos'], { queryParams: { updated: 'true' } });
        },
        error: (error) => {
          console.error('Erro ao atualizar endereço', error);
          this.loading = false;
          this.cepMessage = {
            message: 'Erro ao atualizar endereço. Tente novamente.',
            type: 'error'
          };
        }
      });
    } else {
      this.addressService.createAddress(this.userId, addressData).subscribe({
        next: () => {
          this.loading = false;
          this.router.navigate(['/enderecos'], { queryParams: { created: 'true' } });
        },
        error: (error) => {
          console.error('Erro ao criar endereço', error);
          this.loading = false;
          this.cepMessage = {
            message: 'Erro ao criar endereço. Tente novamente.',
            type: 'error'
          };
        }
      });
    }
  }
}
