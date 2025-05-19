import { Routes } from '@angular/router';
import { LoginComponent } from './core/auth/login/login.component';
import { RegisterComponent } from './core/auth/register/register.component';
import { authGuard } from './core/auth/auth.guard';

export const routes: Routes = [
  // Rotas públicas
  { path: 'login', component: LoginComponent },
  { path: 'registro', component: RegisterComponent },

  // Rotas protegidas com lazy loading
  {
    path: 'usuarios',
    loadChildren: () => import('./modules/user/user.module').then(m => m.UserModule),
    canActivate: [authGuard]  // Uso da função em vez da classe
  },
  // Mesmo para as outras rotas
  {
    path: 'enderecos',
    loadChildren: () => import('./modules/address/address.module').then(m => m.AddressModule),
    canActivate: [authGuard]  // Uso da função em vez da classe
  },
  {
    path: 'dashboard',
    loadChildren: () => import('./modules/dashboard/dashboard.module').then(m => m.DashboardModule),
    canActivate: [authGuard]  // Uso da função em vez da classe
  },
  // Redirecionamentos mantidos como estão
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: '**', redirectTo: '/login' }
];