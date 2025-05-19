import { Component, OnInit } from '@angular/core';
import { AddressService } from '../../services/address.service';
import { AuthService } from '../../../core/auth/auth.service';
import { Router, RouterModule, ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AddressDTO } from '../../models/address.model';

@Component({
  selector: 'app-address-list',
  templateUrl: './address-list.component.html',
  styleUrls: ['./address-list.component.scss'],
  standalone: true,
  imports: [CommonModule, RouterModule]
})
export class AddressListComponent implements OnInit {
  addresses: AddressDTO[] = [];
  loading = false;
  userId: number | null = null;
  successMessage: string | null = null;

  constructor(
    private addressService: AddressService,
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.userId = this.authService.getCurrentUser()?.id ?? null;
    
    // Checar mensagens de sucesso a partir dos query params
    this.route.queryParams.subscribe(params => {
      if (params['created']) {
        this.successMessage = 'Endereço criado com sucesso!';
        setTimeout(() => this.successMessage = null, 5000);
      } else if (params['updated']) {
        this.successMessage = 'Endereço atualizado com sucesso!';
        setTimeout(() => this.successMessage = null, 5000);
      }
    });
    
    if (this.userId) {
      this.loadAddresses();
    }
  }

  loadAddresses(): void {
    if (!this.userId) return;

    this.loading = true;
    this.addressService.getAddressesByUser(this.userId).subscribe({
      next: (data) => {
        this.addresses = data;
        this.loading = false;
      },
      error: (error) => {
        console.error('Erro ao carregar endereços', error);
        this.loading = false;
      }
    });
  }

  editAddress(id: number | undefined): void {
    if (id !== undefined) {
      this.router.navigate(['/enderecos/editar', id]);
    }
  }

  deleteAddress(id: number | undefined): void {
    if (id === undefined) return;
    
    if (confirm('Tem certeza que deseja excluir este endereço?')) {
      this.loading = true;
      this.addressService.deleteAddress(id).subscribe({
        next: () => {
          this.successMessage = 'Endereço excluído com sucesso!';
          setTimeout(() => this.successMessage = null, 5000);
          this.loadAddresses();
        },
        error: (error) => {
          console.error('Erro ao excluir endereço', error);
          this.loading = false;
        }
      });
    }
  }

  addNewAddress(): void {
    this.router.navigate(['/enderecos/novo']);
  }
}
