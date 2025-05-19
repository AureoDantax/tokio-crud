import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AddressDTO } from '../models/address.model';
import { environment } from '../../../enviroments/environment';

interface CepResponse {
  cep: string;
  logradouro: string;
  complemento: string;
  bairro: string;
  localidade: string;
  uf: string;
  erro?: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class AddressService {
  private apiUrl = `${environment.apiUrl}/addresses`;

  constructor(private http: HttpClient) { }

  // Consultar CEP via ViaCEP
  consultCep(cep: string): Observable<CepResponse> {
    return this.http.get<CepResponse>(`https://viacep.com.br/ws/${cep}/json/`);
  }

  // Obter todos os endereços de um usuário
  getAddressesByUser(userId: number): Observable<AddressDTO[]> {
    return this.http.get<AddressDTO[]>(`${this.apiUrl}/user/${userId}`);
  }

  getAddressById(id: number): Observable<AddressDTO> {
    return this.http.get<AddressDTO>(`${this.apiUrl}/${id}`);
  }

  createAddress(userId: number, addressData: AddressDTO): Observable<AddressDTO> {
    return this.http.post<AddressDTO>(`${this.apiUrl}/create/${userId}`, addressData);
  }

  // Atualizar um endereço existente
  updateAddress( addressId: number, address: Omit<AddressDTO, 'id'>): Observable<AddressDTO> {
    return this.http.put<AddressDTO>(`${this.apiUrl}/${addressId}`, address);
  }

  deleteAddress(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  
}
