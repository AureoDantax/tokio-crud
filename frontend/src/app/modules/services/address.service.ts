import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AddressDTO } from '../models/address.model';
import { environment } from '../../../enviroments/environment';

@Injectable({
  providedIn: 'root'
})
export class AddressService {
  private apiUrl = environment.apiUrl + '/addresses';

  constructor(private http: HttpClient) {}

  getAddressesByUser(userId: number): Observable<AddressDTO[]> {
    return this.http.get<AddressDTO[]>(`${this.apiUrl}/user/${userId}`);
  }

  getAddressById(id: number): Observable<AddressDTO> {
    return this.http.get<AddressDTO>(`${this.apiUrl}/${id}`);
  }

  createAddress(userId: number, addressData: AddressDTO): Observable<AddressDTO> {
    return this.http.post<AddressDTO>(`${this.apiUrl}/create/${userId}`, addressData);
  }

  updateAddress(id: number, addressData: AddressDTO): Observable<AddressDTO> {
    return this.http.put<AddressDTO>(`${this.apiUrl}/${id}`, addressData);
  }

  deleteAddress(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  consultCep(cep: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/consulta/${cep}`);
  }
}
