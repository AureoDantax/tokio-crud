import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { ADDRESS_ROUTES } from './address.routes';

@NgModule({
  imports: [
    RouterModule.forChild(ADDRESS_ROUTES)
  ],
  exports: [RouterModule]
})
export class AddressModule { }
