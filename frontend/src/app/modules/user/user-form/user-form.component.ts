import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { UserService } from '../../services/user.service';
import { AddressService } from '../../services/address.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-user-form',
  templateUrl: './user-form.component.html',
  styleUrls: ['./user-form.component.scss'],
  standalone: true,
  imports: [CommonModule]
})
export class UserFormComponent implements OnInit {
  userForm!: FormGroup;
  addressForm!: FormGroup;
  userId: number | null = null;
  isEditMode = false;
  loading = false;
  roles = ['USER', 'ADMIN'];

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private userService: UserService,
    private addressService: AddressService
  ) {}

  ngOnInit(): void {
    this.initForms();

    this.userId = Number(this.route.snapshot.paramMap.get('id'));
    this.isEditMode = !!this.userId;

    if (this.isEditMode && this.userId) {
      this.loadUserDetails(this.userId);
    }
  }

  initForms(): void {
    this.userForm = this.fb.group({
      nome: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', this.isEditMode ? [] : Validators.required],
      role: ['USER', Validators.required]
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

  loadUserDetails(id: number): void {
    this.loading = true;
    this.userService.getUserById(id).subscribe({
      next: (user) => {
        // Remove a senha e preenche o formulário
        const { password, ...userData } = user;
        this.userForm.patchValue(userData);
        this.loading = false;
      },
      error: (error) => {
        console.error('Erro ao carregar dados do usuário', error);
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
    if (this.userForm.invalid || this.addressForm.invalid) {
      return;
    }

    this.loading = true;
    const userData = this.userForm.value;
    const addressData = this.addressForm.value;

    if (this.isEditMode && this.userId) {
      // No modo de edição, enviamos apenas os dados alterados
      const updateData = {
        ...userData,
        addresses: [addressData]
      };

      // Se a senha estiver vazia, removemos do objeto
      if (!updateData.password) {
        delete updateData.password;
      }

      this.userService.updateUser(this.userId, updateData).subscribe({
        next: () => {
          this.router.navigate(['/usuarios']);
          this.loading = false;
        },
        error: (error) => {
          console.error('Erro ao atualizar usuário', error);
          this.loading = false;
        }
      });
    } else {
      // No modo de criação, enviamos todos os dados
      const createData = {
        ...userData,
        address: addressData
      };

      this.userService.createUser(createData).subscribe({
        next: () => {
          this.router.navigate(['/usuarios']);
          this.loading = false;
        },
        error: (error) => {
          console.error('Erro ao criar usuário', error);
          this.loading = false;
        }
      });
    }
  }
}
