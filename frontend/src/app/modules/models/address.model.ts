export interface AddressDTO {
  id: number; // Garante que id sempre seja obrigatório
  cep: string;
  logradouro: string;
  numero: string;
  complemento?: string;
  bairro: string;
  cidade: string;
  estado: string;
}
