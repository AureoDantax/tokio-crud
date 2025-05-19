import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { UserService } from '../../services/user.service';
import { UserModel } from '../../models/user.model';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../core/auth/auth.service';
import { ConfirmModalComponent } from '../../../shared/components/confirm-modal/confirm-modal.component';

@Component({
  selector: 'app-user-list',
  templateUrl: './user-list.component.html',
  styleUrls: ['./user-list.component.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, ConfirmModalComponent] // Adicionado ConfirmModalComponent
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
  showConfirmModal = false;
  userToDelete: number | null = null;

  // propriedades para ordenação
  sortColumn: 'nome' | 'email' | null = null;
  sortDirection: 'asc' | 'desc' = 'asc';

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

        // Aplicar ordenação se existir
        if (this.sortColumn) {
          this.sortUsers();
        } else {
          this.updateDisplayedUsers();
        }
      },
      error: (error) => {
        console.error('Erro ao carregar usuários', error);
        this.errorMessage = 'Erro ao carregar a lista de usuários.';
        this.loading = false;
      }
    });
  }

  // Método para abrir o modal de confirmação
  confirmDeleteUser(id: number): void {
    this.userToDelete = id;
    this.showConfirmModal = true;
  }
  
  // Método chamado quando o usuário confirma a exclusão no modal
  onDeleteConfirmed(): void {
    if (this.userToDelete === null) return;
    
    this.loading = true;
    this.userService.deleteUser(this.userToDelete).subscribe({
      next: () => {
        this.successMessage = 'Usuário excluído com sucesso!';
        // Remover o usuário da lista após exclusão bem-sucedida
        this.allUsers = this.allUsers.filter(user => user.id !== this.userToDelete);
        this.filteredUsers = this.filteredUsers.filter(user => user.id !== this.userToDelete);
        this.updateDisplayedUsers();
        this.totalPages = Math.ceil(this.filteredUsers.length / this.pageSize);
        if (this.totalPages === 0) this.totalPages = 1;
        this.loading = false;
        
        // Limpar a mensagem após alguns segundos
        setTimeout(() => {
          this.successMessage = '';
        }, 3000);
        
        // Fechar o modal
        this.closeModal();
      },
      error: (error) => {
        console.error('Erro ao excluir usuário', error);
        this.errorMessage = 'Erro ao excluir usuário. Tente novamente.';
        this.loading = false;
        
        setTimeout(() => {
          this.errorMessage = '';
        }, 3000);
        
        // Fechar o modal mesmo em caso de erro
        this.closeModal();
      }
    });
  }
  
  // Método para fechar o modal
  closeModal(): void {
    this.showConfirmModal = false;
    this.userToDelete = null;
  }
  
  // Método de busca local
  searchUsers(): void {
    if (!this.searchTerm.trim()) {
      this.filteredUsers = [...this.allUsers];
    } else {
      const term = this.searchTerm.toLowerCase().trim();
      this.filteredUsers = this.allUsers.filter(user => 
        user.nome?.toLowerCase().includes(term) || 
        user.email?.toLowerCase().includes(term)
      );
    }
    
    // Manter a ordenação após a busca
    if (this.sortColumn) {
      this.sortUsers();
    } else {
      this.updateDisplayedUsers();
    }
    
    // Resetar paginação e calcular total de páginas
    this.currentPage = 0;
    this.totalPages = Math.ceil(this.filteredUsers.length / this.pageSize);
    if (this.totalPages === 0) this.totalPages = 1;
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
    
    // Manter a ordenação ao limpar busca
    if (this.sortColumn) {
      this.sortUsers();
    } else {
      this.updateDisplayedUsers();
    }
    
    this.currentPage = 0;
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

  // Substituir o método deleteUser pelo confirmDeleteUser no html
  // Manter o método para compatibilidade temporária
  deleteUser(id: number | undefined): void {
    if (id === undefined) {
      this.errorMessage = 'ID de usuário inválido';
      return;
    }
    
    this.confirmDeleteUser(id);
  }

  addNewUser(): void {
    this.router.navigate(['/usuarios/novo']);
  }

  // Método para alternar ordenação
  toggleSort(column: 'nome' | 'email'): void {
    if (this.sortColumn === column) {
      // Se já está ordenando por esta coluna, inverte a direção
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      // Se é uma nova coluna, define ela e começa com ascendente
      this.sortColumn = column;
      this.sortDirection = 'asc';
    }
    
    this.sortUsers();
  }
  
  // Método para ordenar usuários
  sortUsers(): void {
    if (!this.sortColumn) return;
    
    // Clonar array antes de ordenar para evitar efeitos colaterais
    const sortedArray = [...this.filteredUsers];
    
    sortedArray.sort((a, b) => {
      const valueA = a[this.sortColumn!]?.toLowerCase() || '';
      const valueB = b[this.sortColumn!]?.toLowerCase() || '';
      
      // Comparar valores da coluna selecionada
      if (valueA < valueB) {
        return this.sortDirection === 'asc' ? -1 : 1;
      }
      if (valueA > valueB) {
        return this.sortDirection === 'asc' ? 1 : -1;
      }
      
      // Se os valores forem iguais, use o ID como critério secundário
      // para manter uma ordem consistente
      return (a.id || 0) - (b.id || 0);
    });
    
    this.filteredUsers = sortedArray;
    this.updateDisplayedUsers();
  }

  // Helper para criar um array com o número de páginas
  get pages(): number[] {
    return Array.from({ length: this.totalPages }, (_, i) => i);
  }

  goToDashboard(): void {
    this.router.navigate(['/dashboard']);
  }

  resetSort(): void {
    // Limpar as propriedades de ordenação
    this.sortColumn = null;
    this.sortDirection = 'asc';
    
    // Restaurar a ordem original (baseada em data de criação)
    this.filteredUsers.sort((a, b) => (a.id || 0) - (b.id || 0));
    this.updateDisplayedUsers();
  }
}
