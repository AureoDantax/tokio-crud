import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { LoginDto, RegisterDto, Token } from '../../modules/models/auth.model';
import { UserModel } from '../../modules/models/user.model';
import { environment } from '../../../enviroments/environment';
import { jwtDecode } from 'jwt-decode';
@Injectable({
  providedIn: 'root'
})
export class AuthService {


private decodeToken(): any {
  const token = this.getToken();
  if (token) {
    try {
      return jwtDecode(token);
    } catch (error) {
      console.error('Erro ao decodificar token:', error);
      return null;
    }
  }
  return null;
}
  private apiUrl = environment.apiUrl;
  private currentUser: UserModel | null = null;

  constructor(private http: HttpClient) {
    // Tenta recuperar o usuário do localStorage ao inicializar o serviço
    const userData = localStorage.getItem('current_user');
    if (userData) {
      try {
        this.currentUser = JSON.parse(userData);
      } catch (e) {
        console.error('Erro ao recuperar dados do usuário:', e);
        localStorage.removeItem('current_user');
      }
    }
  }

  login(loginDto: LoginDto): Observable<Token> {
    return this.http.post<Token>(`${this.apiUrl}/auth/login`, loginDto);
  }

  register(registerDto: RegisterDto): Observable<UserModel> {
    return this.http.post<UserModel>(`${this.apiUrl}/auth/register`, registerDto);
  }

  logout(): void {
    localStorage.removeItem('access_token');
    localStorage.removeItem('current_user');
    this.currentUser = null;
  }

  isAuthenticated(): boolean {
    return !!localStorage.getItem('access_token');
  }

  getToken(): string | null {
    return localStorage.getItem('access_token');
  }

  setToken(token: Token): void {
    localStorage.setItem('access_token', token.token);
  }

  // Método para obter o usuário atual
  getCurrentUser(): UserModel | null {
    return this.currentUser;
  }

  // Método para buscar os dados do usuário por ID
  fetchUserById(userId: number): Observable<UserModel> {
  return this.http.get<UserModel>(`${this.apiUrl}/users/${userId}`);
}

  // Método para salvar os dados do usuário após login/registro
  setCurrentUser(user: UserModel): void {
    this.currentUser = user;
    localStorage.setItem('current_user', JSON.stringify(user));
  }

  // Método para buscar os dados do usuário da API
 fetchCurrentUser(): Observable<UserModel> {
  const decodedToken = this.decodeToken();
  console.log('Decoded Token:', decodedToken);
  if (decodedToken && decodedToken.userId) {
    const userId = decodedToken.userId;
    return this.http.get<UserModel>(`${this.apiUrl}/users/${userId}`);
  }
  return throwError(() => new Error('Token inválido ou expirado'));
}


}
