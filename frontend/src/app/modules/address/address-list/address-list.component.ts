import { Component, OnInit } from '@angular/core';
import { AddressService } from '../../services/address.service';
import { AuthService } from '../../../core/auth/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-address-list',
  templateUrl: './address-list.component.html',
  styleUrls: ['./address-list.component.scss']
})
export class AddressListComponent implements OnInit {
  addresses: any[] = [];
  loading = false;
  userId: number | null = null;

  constructor(
    private addressService: AddressService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.userId = this.authService.getCurrentUser()?.id ?? null;
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

  editAddress(id: number): void {
    this.router.navigate(['/enderecos/editar', id]);
  }

  deleteAddress(id: number): void {
    if (confirm('Tem certeza que deseja excluir este endereço?')) {
      this.addressService.deleteAddress(id).subscribe({
        next: () => {
          this.loadAddresses();
        },
        error: (error) => {
          console.error('Erro ao excluir endereço', error);
        }
      });
    }
  }

  addNewAddress(): void {
    this.router.navigate(['/enderecos/novo']);
  }
}
