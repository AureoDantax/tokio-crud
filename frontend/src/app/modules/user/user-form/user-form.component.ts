import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, Validators, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { UserService } from '../../services/user.service';
import { AddressService } from '../../services/address.service';
import { CommonModule } from '@angular/common';
import { UserCreateDTO, UserUpdateDTO } from '../../models/user.model';
import { AddressDTO } from '../../models/address.model';

@Component({
  selector: 'app-user-form',
  templateUrl: './user-form.component.html',
  styleUrls: ['./user-form.component.scss'],
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule]
})
export class UserFormComponent implements OnInit {
  userForm!: FormGroup;
  userId: number | null = null;
  isEditMode = false;
  loading = false;
  submitted = false;
  roles = ['USER', 'ADMIN'];

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    public router: Router,
    private userService: UserService,
    private addressService: AddressService
  ) {}

  ngOnInit(): void {
    this.initForms();

    // Verificar se estamos no modo de edição ou criação
    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam) {
      this.userId = +idParam;
      this.isEditMode = true;
      this.loadUserDetails(this.userId);
    } else {
      // No modo de criação, senha é obrigatória
      this.userForm.get('password')?.setValidators([Validators.required]);
      this.userForm.get('password')?.updateValueAndValidity();
    }
  }

  initForms(): void {
    this.userForm = this.fb.group({
      nome: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      password: [''], // Será validado condicionalmente
      role: ['USER', [Validators.required]],
      addresses: this.fb.array([
        this.createAddressForm() // Iniciar com um endereço
      ])
    });
  }

  // Criar formulário para um endereço
  createAddressForm(): FormGroup {
    return this.fb.group({
      id: [null], // Para atualização
      cep: ['', [Validators.required, Validators.pattern(/^\d{5}-\d{3}$/)]],
      logradouro: ['', [Validators.required]],
      numero: ['', [Validators.required]],
      complemento: [''],
      bairro: ['', [Validators.required]],
      cidade: ['', [Validators.required]],
      estado: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(2)]]
    });
  }

  // Para facilitar acesso no template
  get f() { return this.userForm.controls; }
  
  // Obter o FormArray de endereços
  get addresses(): FormArray {
    return this.userForm.get('addresses') as FormArray;
  }

  // Adicionar novo endereço
  addAddress(): void {
    this.addresses.push(this.createAddressForm());
  }

  // Remover endereço por índice
  removeAddress(index: number): void {
    // Não permitir remover se só tiver um endereço
    if (this.addresses.length > 1) {
      this.addresses.removeAt(index);
    }
  }

  // Buscar CEP para um endereço específico
  searchCep(index: number): void {
    const addressForm = this.addresses.at(index) as FormGroup;
    const cep = addressForm.get('cep')?.value;
    
    if (cep && /^\d{5}-\d{3}$/.test(cep)) {
      this.loading = true;
      const cepNumerico = cep.replace(/\D/g, '');
      
      this.addressService.consultCep(cepNumerico).subscribe({
        next: (data) => {
          if (!data.erro) {
            addressForm.patchValue({
              logradouro: data.logradouro,
              bairro: data.bairro,
              cidade: data.localidade,
              estado: data.uf
            });
          } else {
            alert('CEP não encontrado');
          }
          this.loading = false;
        },
        error: (error) => {
          console.error('Erro ao consultar CEP:', error);
          alert('Erro ao consultar CEP. Tente novamente.');
          this.loading = false;
        }
      });
    } else {
      alert('Por favor, informe um CEP válido no formato 00000-000');
    }
  }

  loadUserDetails(id: number): void {
    this.loading = true;
    this.userService.getUserById(id).subscribe({
      next: (user) => {
        // Atualizar os campos do formulário principal
        this.userForm.patchValue({
          nome: user.nome,
          email: user.email,
          role: user.role?.replace('ROLE_', '') // Remover prefixo ROLE_
        });

        // Lidar com múltiplos endereços
        if (user.addresses && user.addresses.length > 0) {
          // Limpar o FormArray inicial
          while (this.addresses.length) {
            this.addresses.removeAt(0);
          }
          
          // Adicionar cada endereço ao FormArray
          user.addresses.forEach(address => {
            const addressForm = this.createAddressForm();
            addressForm.patchValue({
              id: address.id,
              cep: address.cep,
              logradouro: address.logradouro,
              numero: address.numero,
              complemento: address.complemento || '',
              bairro: address.bairro,
              cidade: address.cidade,
              estado: address.estado
            });
            this.addresses.push(addressForm);
          });
        }
        
        this.loading = false;
      },
      error: (error) => {
        console.error('Erro ao carregar usuário:', error);
        this.loading = false;
        this.router.navigate(['/usuarios']);
      }
    });
  }

  onSubmit(): void {
    this.submitted = true;

    if (this.userForm.invalid) {
      console.log('Formulário inválido:', this.userForm.errors);
      return;
    }

    this.loading = true;
    
    // Obter todos os endereços do FormArray
    const addressesData = this.addresses.controls.map(control => control.value);
    
    if (this.isEditMode && this.userId) {
      // Atualizar usuário existente
      const updateData: UserUpdateDTO = {
        nome: this.f['nome'].value,
        email: this.f['email'].value,
        role: this.f['role'].value,
        addresses: addressesData
      };

      // Adicionar senha se fornecida
      if (this.f['password'].value) {
        updateData.password = this.f['password'].value;
      }

      this.userService.updateUser(this.userId, updateData).subscribe({
        next: () => {
          this.loading = false;
          this.router.navigate(['/usuarios'], { queryParams: { updated: 'true' } });
        },
        error: (error) => {
          console.error('Erro ao atualizar usuário:', error);
          this.loading = false;
          alert('Erro ao atualizar usuário. Verifique os logs para mais detalhes.');
        }
      });
    } else {
      // Criar novo usuário - apenas com o primeiro endereço
      const createData: UserCreateDTO = {
        nome: this.f['nome'].value,
        email: this.f['email'].value,
        password: this.f['password'].value,
        role: this.f['role'].value,
        address: addressesData[0] // Usar apenas o primeiro endereço para criação
      };

      this.userService.createUser(createData).subscribe({
        next: () => {
          this.loading = false;
          this.router.navigate(['/usuarios'], { queryParams: { created: 'true' } });
        },
        error: (error) => {
          console.error('Erro ao criar usuário:', error);
          this.loading = false;
          alert('Erro ao criar usuário. Verifique os logs para mais detalhes.');
        }
      });
    }
  }
}
