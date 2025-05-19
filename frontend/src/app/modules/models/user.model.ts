import { AddressDTO } from "./address.model";

export interface UserModel {
  id?: number;
  nome: string;
  email: string;
  password?: string;
  addresses?: AddressDTO[];
  role?: string;
}

export interface UserCreateDTO {
  nome: string;
  email: string;
  password: string;
  address: AddressDTO;
  role: string;
}

export interface UserUpdateDTO {
  nome?: string;
  email?: string;
  password?: string;
  addresses?: AddressDTO[];
}
