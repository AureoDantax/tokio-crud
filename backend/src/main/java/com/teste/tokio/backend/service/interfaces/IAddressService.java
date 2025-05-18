package com.teste.tokio.backend.service.interfaces;

import com.teste.tokio.backend.dto.address.AddressDTO;

import java.util.List;

public interface IAddressService {
    AddressDTO create(Long userId, AddressDTO dto);

    List<AddressDTO> listByUser(Long userId);

    AddressDTO
    update(Long id, AddressDTO dto);

    void delete(Long id, Long userId);

    boolean isOwner(Long principalId, Long addressId);
}
