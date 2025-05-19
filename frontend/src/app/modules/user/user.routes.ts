import { Routes } from '@angular/router';
import { UserListComponent } from './user-list/user-list.component';
import { UserFormComponent } from './user-form/user-form.component';

export const USER_ROUTES: Routes = [
  { path: '', component: UserListComponent },
  { path: 'novo', component: UserFormComponent },
  { path: 'editar/:id', component: UserFormComponent }
];