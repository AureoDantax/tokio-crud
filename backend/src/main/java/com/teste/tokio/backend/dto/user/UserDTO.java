package com.teste.tokio.backend.dto.user;

import com.teste.tokio.backend.dto.address.AddressDTO;

import java.util.List;

public record UserDTO(Long id, String nome, String email, List<AddressDTO> addresses) {

}
