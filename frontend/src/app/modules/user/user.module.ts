import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { UserRoutingModule } from './user-routing.module';
import { UserListComponent } from './user-list/user-list.component';
import { UserFormComponent } from './user-form/user-form.component';

@NgModule({
  declarations: [
  ],
  imports: [
    UserListComponent,
    UserFormComponent,
    CommonModule,
    UserRoutingModule
  ]
})
export class UserModule { }