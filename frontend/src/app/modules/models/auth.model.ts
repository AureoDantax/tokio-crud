import { AddressDTO } from "./address.model";

export interface LoginDto {
  email: string;
  password: string;
}

export interface RegisterDto {
  nome: string;
  email: string;
  password: string;
  address: AddressDTO;
  role: string;
}

export interface Token {
  token: string;
  userId: number;

}
