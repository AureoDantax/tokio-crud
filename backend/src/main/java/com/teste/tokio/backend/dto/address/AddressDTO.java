package com.teste.tokio.backend.dto.address;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;

public record AddressDTO(Long id,

                         @NotBlank(message = "Logradouro é obrigatório") String logradouro,

                         @NotBlank(message = "Número é obrigatório") String numero,

                         String complemento,

                         @NotBlank(message = "Bairro é obrigatório") String bairro,

                         @NotBlank(message = "Cidade é obrigatória") String cidade,

                         @NotBlank(message = "Estado é obrigatório") String estado,

                         @NotBlank(message = "CEP é obrigatório") @Pattern(regexp = "\\d{5}-?\\d{3}", message = "Formato de CEP inválido") String cep) {

}