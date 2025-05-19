package com.teste.tokio.backend.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.teste.tokio.backend.dto.address.AddressDTO;
import com.teste.tokio.backend.entity.Address;
import com.teste.tokio.backend.entity.User;
import com.teste.tokio.backend.repository.AddressRepository;
import com.teste.tokio.backend.repository.UserRepository;
import jakarta.persistence.EntityNotFoundException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AddressServiceImplTest {

    @Mock
    private AddressRepository addressRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private ObjectMapper mapper;

    @InjectMocks
    private AddressServiceImpl addressService;

    private User user;
    private Address address;
    private AddressDTO addressDTO;

    @BeforeEach
    void setUp() {
        user = new User();
        user.setId(1L);
        user.setNome("Teste");

        address = new Address();
        address.setId(1L);
        address.setCep("12345-678");
        address.setLogradouro("Rua Teste");
        address.setNumero("123");
        address.setBairro("Bairro Teste");
        address.setCidade("Cidade Teste");
        address.setEstado("Estado Teste");
        address.setUser(user);

        addressDTO = new AddressDTO(
            1L, "Rua Teste", "123", null,
            "Bairro Teste", "Cidade Teste",
            "Estado Teste", "12345-678"
        );
    }

    @Test
    void shouldCreateAddress() {
        when(userRepository.findById(anyLong())).thenReturn(Optional.of(user));
        when(mapper.convertValue(any(AddressDTO.class), eq(Address.class))).thenReturn(address);
        when(addressRepository.save(any(Address.class))).thenReturn(address);
        when(mapper.convertValue(any(Address.class), eq(AddressDTO.class))).thenReturn(addressDTO);

        AddressDTO result = addressService.create(1L, addressDTO);

        assertNotNull(result);
        assertEquals(addressDTO.cep(), result.cep());
        verify(userRepository).findById(1L);
        verify(addressRepository).save(address);
    }

    @Test
    void shouldThrowExceptionWhenUserNotFound() {
        when(userRepository.findById(anyLong())).thenReturn(Optional.empty());

        assertThrows(EntityNotFoundException.class, () ->
            addressService.create(1L, addressDTO)
        );

        verify(userRepository).findById(1L);
        verify(addressRepository, never()).save(any());
    }

    @Test
    void shouldListAddressesByUser() {
        when(addressRepository.findByUserId(anyLong())).thenReturn(List.of(address));
        when(mapper.convertValue(any(Address.class), eq(AddressDTO.class))).thenReturn(addressDTO);

        List<AddressDTO> result = addressService.listByUser(1L);

        assertNotNull(result);
        assertEquals(1, result.size());
        verify(addressRepository).findByUserId(1L);
    }

    @Test
    void shouldUpdateAddress() {
        when(addressRepository.findById(anyLong())).thenReturn(Optional.of(address));
        when(addressRepository.save(any(Address.class))).thenReturn(address);
        when(mapper.convertValue(any(Address.class), eq(AddressDTO.class))).thenReturn(addressDTO);

        AddressDTO updatedAddress = new AddressDTO(
            1L, "Rua Nova", "456", "Apto 101",
            "Bairro Novo", "Nova Cidade",
            "Novo Estado", "98765-432"
        );

        AddressDTO result = addressService.update(1L, updatedAddress);

        assertNotNull(result);
        verify(addressRepository).findById(1L);
        verify(addressRepository).save(address);
    }

    @Test
    void shouldVerifyOwnership() {
        when(addressRepository.findById(anyLong())).thenReturn(Optional.of(address));

        boolean isOwner = addressService.isOwner(1L, 1L);
        boolean isNotOwner = addressService.isOwner(2L, 1L);

        assertTrue(isOwner);
        assertFalse(isNotOwner);
    }
}