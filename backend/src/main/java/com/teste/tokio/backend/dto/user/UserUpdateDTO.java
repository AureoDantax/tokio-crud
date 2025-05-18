package com.teste.tokio.backend.dto.user;

import com.teste.tokio.backend.dto.address.AddressDTO;

import java.util.List;

public record UserUpdateDTO(String nome, String email, String password, List<AddressDTO> addresses) {
}
