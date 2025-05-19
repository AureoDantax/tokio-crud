import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { UserService } from '../../services/user.service';
import { UserModel } from '../../models/user.model';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../core/auth/auth.service';

@Component({
  selector: 'app-user-list',
  templateUrl: './user-list.component.html',
  styleUrls: ['./user-list.component.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule]
})
export class UserListComponent implements OnInit {
  users: UserModel[] = [];
  filteredUsers: UserModel[] = []; // Lista filtrada para exibição
  allUsers: UserModel[] = []; // Todos os usuários carregados
  loading = false;
  currentPage = 0;
  totalPages = 0;
  pageSize = 10;
  searchTerm = '';
  successMessage = '';
  errorMessage = '';
  isAdmin = false;

  constructor(
    private userService: UserService,
    private router: Router,
    private authService: AuthService,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    // Verificar se o usuário é admin
    const currentUser = this.authService.getCurrentUser();
    this.isAdmin = currentUser?.role === 'ROLE_ADMIN';
    
    // Se não for admin, redirecionar para o dashboard
    if (!this.isAdmin) {
      this.router.navigate(['/dashboard']);
      return;
    }
    
    this.loadUsers();

    this.route.queryParams.subscribe(params => {
      if (params['created']) {
        this.successMessage = 'Usuário criado com sucesso!';
        setTimeout(() => this.successMessage = '', 3000);
      } else if (params['updated']) {
        this.successMessage = 'Usuário atualizado com sucesso!';
        setTimeout(() => this.successMessage = '', 3000);
      }
    });
  }

  loadUsers(): void {
    this.loading = true;
    this.userService.getUsers(this.currentPage, this.pageSize).subscribe({
      next: (response) => {
        this.allUsers = response.content; // Armazena todos os usuários
        this.filteredUsers = [...this.allUsers]; // Inicializa a lista filtrada
        this.users = this.filteredUsers; // Lista para exibição
        this.totalPages = response.totalPages;
        this.loading = false;
      },
      error: (error) => {
        console.error('Erro ao carregar usuários', error);
        this.errorMessage = 'Erro ao carregar a lista de usuários.';
        this.loading = false;
      }
    });
  }

  // Método de busca local
  searchUsers(): void {
    if (!this.searchTerm.trim()) {
      this.filteredUsers = [...this.allUsers];
      this.updateDisplayedUsers();
      return;
    }
    
    const term = this.searchTerm.toLowerCase().trim();
    this.filteredUsers = this.allUsers.filter(user => 
      user.nome?.toLowerCase().includes(term) || 
      user.email?.toLowerCase().includes(term)
    );
    
    // Resetar paginação para a primeira página quando filtrar
    this.currentPage = 0;
    this.updateDisplayedUsers();
    
    // Calcular o novo número total de páginas
    this.totalPages = Math.ceil(this.filteredUsers.length / this.pageSize);
    if (this.totalPages === 0) this.totalPages = 1; // Garantir pelo menos uma página
  }

  // Atualiza os usuários exibidos com base na página atual
  updateDisplayedUsers(): void {
    const start = this.currentPage * this.pageSize;
    const end = start + this.pageSize;
    this.users = this.filteredUsers.slice(start, end);
  }

  clearSearch(): void {
    this.searchTerm = '';
    this.filteredUsers = [...this.allUsers];
    this.currentPage = 0;
    this.updateDisplayedUsers();
    this.totalPages = Math.ceil(this.filteredUsers.length / this.pageSize);
    if (this.totalPages === 0) this.totalPages = 1;
  }

  goToPage(page: number): void {
    if (page >= 0 && page < this.totalPages) {
      this.currentPage = page;
      this.updateDisplayedUsers();
    }
  }

  editUser(id: number): void {
    this.router.navigate(['/usuarios/editar', id]);
  }

  deleteUser(id: number | undefined): void {
    if (id === undefined) {
      this.errorMessage = 'ID de usuário inválido';
      return;
    }
    
    if (confirm('Tem certeza que deseja excluir este usuário? Esta ação não pode ser desfeita.')) {
      this.loading = true;
      this.userService.deleteUser(id).subscribe({
        next: () => {
          this.successMessage = 'Usuário excluído com sucesso!';
          // Remover o usuário da lista após exclusão bem-sucedida
          this.allUsers = this.allUsers.filter(user => user.id !== id);
          this.filteredUsers = this.filteredUsers.filter(user => user.id !== id);
          this.updateDisplayedUsers();
          this.totalPages = Math.ceil(this.filteredUsers.length / this.pageSize);
          if (this.totalPages === 0) this.totalPages = 1;
          this.loading = false;
          
          // Limpar a mensagem após alguns segundos
          setTimeout(() => {
            this.successMessage = '';
          }, 3000);
        },
        error: (error) => {
          console.error('Erro ao excluir usuário', error);
          this.errorMessage = 'Erro ao excluir usuário. Tente novamente.';
          this.loading = false;
          
          setTimeout(() => {
            this.errorMessage = '';
          }, 3000);
        }
      });
    }
  }

  addNewUser(): void {
    this.router.navigate(['/usuarios/novo']);
  }

  // Helper para criar um array com o número de páginas
  get pages(): number[] {
    return Array.from({ length: this.totalPages }, (_, i) => i);
  }

  goToDashboard(): void {
    this.router.navigate(['/dashboard']);
  }
}
