import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';

import { AddressRoutingModule } from './address-routing.module';
import { AddressFormComponent } from './address-form/address-form.component';
import { AddressListComponent } from './address-list/address-list.component';

@NgModule({
  declarations: [

  ],
  imports: [
    AddressFormComponent,
    AddressListComponent,
    CommonModule,
    AddressRoutingModule,
    ReactiveFormsModule
  ]
})
export class AddressModule { }
