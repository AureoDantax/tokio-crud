import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AddressService } from '../../services/address.service';
import { AuthService } from '../../../core/auth/auth.service';

@Component({
  selector: 'app-address-form',
  templateUrl: './address-form.component.html',
  styleUrls: ['./address-form.component.scss']
})
export class AddressFormComponent implements OnInit {
  addressForm!: FormGroup;
  addressId: number | null = null;
  userId: number | null = null;
  loading = false;
  isEditMode = false;

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private addressService: AddressService,
    private authService: AuthService
  ) { }

  ngOnInit(): void {
    this.userId = this.authService.getCurrentUser()?.id ?? null;

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

  loadAddressDetails(id: number): void {
    this.loading = true;
    this.addressService.getAddressById(id).subscribe({
      next: (address) => {
        this.addressForm.patchValue(address);
        this.loading = false;
      },
      error: (error) => {
        console.error('Erro ao carregar detalhes do endereço', error);
        this.loading = false;
      }
    });
  }

  searchCep(): void {
    const cep = this.addressForm.get('cep')?.value.replace(/\D/g, '');

    if (cep && cep.length === 8) {
      this.loading = true;
      this.addressService.consultCep(cep).subscribe({
        next: (data) => {
          this.addressForm.patchValue({
            logradouro: data.logradouro,
            bairro: data.bairro,
            cidade: data.localidade,
            estado: data.uf
          });
          this.loading = false;
        },
        error: (error) => {
          console.error('Erro ao consultar CEP', error);
          this.loading = false;
        }
      });
    }
  }

  onSubmit(): void {
    if (this.addressForm.invalid) {
      return;
    }

    this.loading = true;
    const addressData = this.addressForm.value;

    if (this.isEditMode && this.addressId) {
      this.addressService.updateAddress(this.addressId, addressData).subscribe({
        next: () => {
          this.router.navigate(['/enderecos']);
          this.loading = false;
        },
        error: (error) => {
          console.error('Erro ao atualizar endereço', error);
          this.loading = false;
        }
      });
    } else if (this.userId) {
      this.addressService.createAddress(this.userId, addressData).subscribe({
        next: () => {
          this.router.navigate(['/enderecos']);
          this.loading = false;
        },
        error: (error) => {
          console.error('Erro ao criar endereço', error);
          this.loading = false;
        }
      });
    }
  }
}
