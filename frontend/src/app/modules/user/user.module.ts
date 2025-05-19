import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { USER_ROUTES } from './user.routes';

@NgModule({
  imports: [
    RouterModule.forChild(USER_ROUTES)
  ],
  exports: [RouterModule]
})
export class UserModule { }