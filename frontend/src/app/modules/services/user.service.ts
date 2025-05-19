import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { UserModel, UserCreateDTO, UserUpdateDTO } from '../models/user.model';
import { PageResponse } from '../models/page.model';
import { environment } from '../../../enviroments/environment';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  createUser(userData: UserCreateDTO): Observable<UserModel> {
    return this.http.post<UserModel>(`${this.apiUrl}/users/create`, userData);
  }

  // Obter todos os usuários (apenas para admin)
  getUsers(page: number = 0, size: number = 10): Observable<PageResponse<UserModel>> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());
    return this.http.get<PageResponse<UserModel>>(`${this.apiUrl}/users`, { params });
  }

  // Obter usuário por ID
  getUserById(id: number): Observable<UserModel> {
    return this.http.get<UserModel>(`${this.apiUrl}/users/${id}`);
  }

  // Atualizar dados do usuário
  updateUser(id: number, userData: UserUpdateDTO): Observable<UserModel> {
    return this.http.put<UserModel>(`${this.apiUrl}/users/${id}`, userData);
  }

  // Excluir usuário (apenas admin pode excluir)
  deleteUser(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/users/${id}`);
  }
}
