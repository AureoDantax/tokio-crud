package com.teste.tokio.backend.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.teste.tokio.backend.dto.address.AddressDTO;
import com.teste.tokio.backend.dto.cep.CepResponse;
import com.teste.tokio.backend.dto.user.UserCreateDTO;
import com.teste.tokio.backend.dto.user.UserDTO;
import com.teste.tokio.backend.dto.user.UserUpdateDTO;
import com.teste.tokio.backend.entity.Address;
import com.teste.tokio.backend.entity.Role;
import com.teste.tokio.backend.entity.User;
import com.teste.tokio.backend.exception.BusinessException;
import com.teste.tokio.backend.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.HashSet;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class UserServiceImplTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private ObjectMapper mapper;

    @Mock
    private ViaCepAdapter cepAdapter;

    @InjectMocks
    private UserServiceImpl userService;

    private User user;
    private UserDTO userDTO;
    private UserCreateDTO createDTO;

    @BeforeEach
    void setUp() {
        // Configurar objeto inicial
        user = new User();
        user.setId(1L);
        user.setNome("Teste User");
        user.setEmail("teste@email.com");
        user.setPassword("encoded_password");
        user.setRole(Role.USER);
        user.setActive(true);
        user.setAddresses(new HashSet<>());

        Address address = new Address();
        address.setId(1L);
        address.setCep("12345-678");
        user.getAddresses().add(address);

        userDTO = mock(UserDTO.class);

        createDTO = new UserCreateDTO(
                "Novo Usuário",
                "novo@email.com",
                "senha123",
                mock(AddressDTO.class),
                "USER"


        );

    }

    @Test
    void shouldCreateUser() {
        // Configurar o mock de AddressDTO para retornar um CEP válido
        AddressDTO addressDTO = mock(AddressDTO.class);
        when(addressDTO.cep()).thenReturn("12345-678");

        // Recriar o createDTO com o mock configurado
        createDTO = new UserCreateDTO(
                "Novo Usuário",
                "novo@email.com",
                "senha123",
                addressDTO,
                "USER"
        );

        // Configurar os demais mocks
        when(userRepository.findByEmail(anyString())).thenReturn(Optional.empty());
        when(passwordEncoder.encode(anyString())).thenReturn("encoded_password");
        when(cepAdapter.fetch("12345-678")).thenReturn(mock(CepResponse.class));
        when(mapper.convertValue(any(), eq(Address.class))).thenReturn(new Address());
        when(userRepository.save(any(User.class))).thenReturn(user);
        when(mapper.convertValue(any(User.class), eq(UserDTO.class))).thenReturn(userDTO);

        // Executar
        UserDTO result = userService.create(createDTO);

        // Verificar resultado
        assertNotNull(result);
        verify(userRepository).findByEmail("novo@email.com");
        verify(passwordEncoder).encode("senha123");
        verify(userRepository).save(any(User.class));
    }

    @Test
    void shouldUpdateUser() {
        // Preparar dados de teste
        UserUpdateDTO updateDTO = mock(UserUpdateDTO.class);
        when(updateDTO.nome()).thenReturn("Nome Atualizado");
        when(updateDTO.email()).thenReturn("atualizado@email.com");
        when(updateDTO.password()).thenReturn("novaSenha123");
        when(updateDTO.addresses()).thenReturn(List.of(mock(AddressDTO.class)));

        // Configurar comportamento esperado (configuração única para cada mock)
        when(userRepository.findById(1L)).thenReturn(Optional.of(user));
        when(passwordEncoder.encode(anyString())).thenReturn("novo_encoded_password");
        when(mapper.convertValue(any(AddressDTO.class), eq(Address.class))).thenReturn(new Address());
        when(userRepository.save(any(User.class))).thenReturn(user);
        when(mapper.convertValue(any(User.class), eq(UserDTO.class))).thenReturn(userDTO);

        // Executar método
        UserDTO result = userService.update(1L, updateDTO);

        // Verificar resultados
        assertNotNull(result);
        verify(userRepository).findById(1L);
        verify(passwordEncoder).encode("novaSenha123");
        verify(userRepository).save(user);
    }

    @Test
    void shouldReturnPageOfUsers() {
        // Configurar mock
        Pageable pageable = mock(Pageable.class);
        Page<User> userPage = new PageImpl<>(List.of(user));
        when(userRepository.findAllByActiveIsTrue(any(Pageable.class))).thenReturn(userPage);
        when(mapper.convertValue(any(User.class), eq(UserDTO.class))).thenReturn(userDTO);

        // Executar método
        Page<UserDTO> result = userService.list(pageable);

        // Verificar resultado
        assertNotNull(result);
        assertEquals(1, result.getTotalElements());
        verify(userRepository).findAllByActiveIsTrue(pageable);
    }

    @Test
    void shouldThrowBusinessExceptionWhenEmailExists() {
        // Configurar mock
        when(userRepository.findByEmail(anyString())).thenReturn(Optional.of(user));

        // Executar e verificar exceção
        assertThrows(BusinessException.class, () -> userService.create(createDTO));
        verify(userRepository, never()).save(any());
    }
}