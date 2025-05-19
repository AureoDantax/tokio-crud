package com.teste.tokio.backend.dto.user;

import com.teste.tokio.backend.dto.address.AddressDTO;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

public record UserCreateDTO(
        @NotBlank(message = "Nome é obrigatório")
        String nome,

        @Email(message = "Email inválido")
        @NotBlank(message = "Email é obrigatório")
        String email,

        @NotBlank(message = "Senha é obrigatória")
        String password,


        AddressDTO address,

        @NotBlank(message = "Tipo de usuário é obrigatório")
        String role
) {
}