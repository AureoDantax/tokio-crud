import { Routes } from '@angular/router';
import { AddressListComponent } from './address-list/address-list.component';
import { AddressFormComponent } from './address-form/address-form.component';

export const ADDRESS_ROUTES: Routes = [
  { path: '', component: AddressListComponent },
  { path: 'novo', component: AddressFormComponent },
  { path: 'editar/:id', component: AddressFormComponent }
];