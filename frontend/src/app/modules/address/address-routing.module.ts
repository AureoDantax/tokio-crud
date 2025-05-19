import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AddressListComponent } from './address-list/address-list.component';
import { AddressFormComponent } from './address-form/address-form.component';
import { authGuard } from '../../core/auth/auth.guard';

const routes: Routes = [
  {
    path: '',
    component: AddressListComponent,
    canActivate: [authGuard]
  },
  {
    path: 'novo',
    component: AddressFormComponent,
    canActivate: [authGuard]
  },
  {
    path: 'editar/:id',
    component: AddressFormComponent,
    canActivate: [authGuard]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AddressRoutingModule { }
