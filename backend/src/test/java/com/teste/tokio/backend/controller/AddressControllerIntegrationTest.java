package com.teste.tokio.backend.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.teste.tokio.backend.config.CustomUserDetails;
import com.teste.tokio.backend.dto.address.AddressDTO;
import com.teste.tokio.backend.entity.Role;
import com.teste.tokio.backend.entity.User;
import com.teste.tokio.backend.repository.AddressRepository;
import com.teste.tokio.backend.repository.UserRepository;
import com.teste.tokio.backend.util.JwtUtil;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import static org.hamcrest.Matchers.hasSize;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class AddressControllerIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private AddressRepository addressRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtUtil jwtTokenProvider;

    private String adminToken;
    private String userToken;
    private User adminUser;
    private User regularUser;

    @BeforeEach
    void setUp() {
        // Limpar banco
        addressRepository.deleteAll();
        userRepository.deleteAll();

        // Criar usuário ADMIN
        adminUser = new User();
        adminUser.setNome("Admin");
        adminUser.setEmail("admin@teste.com");
        adminUser.setPassword(passwordEncoder.encode("senha123"));
        adminUser.setRole(Role.ADMIN);
        adminUser.setActive(true);
        adminUser = userRepository.save(adminUser);

        // Criar usuário normal
        regularUser = new User();
        regularUser.setNome("User");
        regularUser.setEmail("user@teste.com");
        regularUser.setPassword(passwordEncoder.encode("senha123"));
        regularUser.setRole(Role.USER);
        regularUser.setActive(true);
        regularUser = userRepository.save(regularUser);

        // Gerar tokens
        adminToken = jwtTokenProvider.generateToken(new CustomUserDetails(adminUser));
        userToken = jwtTokenProvider.generateToken(new CustomUserDetails(regularUser));
    }

    @Test
    void shouldCreateAddressWhenUserAuthenticated() throws Exception {
        AddressDTO addressDTO = new AddressDTO(
                null, "Rua Teste", "123", null,
                "Bairro Teste", "Cidade Teste",
                "Estado Teste", "12345-678"
        );

        mockMvc.perform(post("/api/addresses/create/" + regularUser.getId())
                        .header("Authorization", "Bearer " + userToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(addressDTO)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.logradouro").value("Rua Teste"))
                .andExpect(jsonPath("$.cep").value("12345-678"));
    }

    @Test
    void shouldListAddressesByUserWhenAuthenticated() throws Exception {
        // Criar endereço para teste
        AddressDTO addressDTO = new AddressDTO(
                null, "Rua Teste", "123", null,
                "Bairro Teste", "Cidade Teste",
                "Estado Teste", "12345-678"
        );

        mockMvc.perform(post("/api/addresses/create/" + regularUser.getId())
                        .header("Authorization", "Bearer " + userToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(addressDTO)))
                .andExpect(status().isOk());

        // Listar endereços
        mockMvc.perform(get("/api/addresses/user/" + regularUser.getId())
                        .header("Authorization", "Bearer " + userToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(1)))
                .andExpect(jsonPath("$[0].logradouro").value("Rua Teste"));
    }

    @Test
    void shouldDenyAccessWhenUserTriesToAccessOtherUserAddresses() throws Exception {
        mockMvc.perform(get("/api/addresses/user/" + adminUser.getId())
                .header("Authorization", "Bearer " + userToken))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void shouldAllowAdminToAccessAnyUserAddresses() throws Exception {
        mockMvc.perform(get("/api/addresses/user/" + regularUser.getId())
                .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isOk());
    }

    @Test
    void shouldUpdateAddressWhenOwner() throws Exception {
        // Criar endereço
        AddressDTO addressDTO = new AddressDTO(
                null, "Rua Original", "123", null,
                "Bairro Original", "Cidade Original",
                "Estado Original", "12345-678"
        );

        // Corrigir o endpoint para criar o endereço
        String response = mockMvc.perform(post("/api/addresses/create/" + regularUser.getId())
                        .header("Authorization", "Bearer " + userToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(addressDTO)))
                .andExpect(status().isOk())
                .andReturn().getResponse().getContentAsString();

        AddressDTO createdAddress = objectMapper.readValue(response, AddressDTO.class);

        // Atualizar endereço
        AddressDTO updateDTO = new AddressDTO(
                createdAddress.id(), "Rua Atualizada", "456", "Complemento",
                "Bairro Atualizado", "Cidade Atualizada",
                "Estado Atualizado", "87654-321"
        );

        mockMvc.perform(put("/api/addresses/" + createdAddress.id())
                        .header("Authorization", "Bearer " + userToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(updateDTO)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.logradouro").value("Rua Atualizada"))
                .andExpect(jsonPath("$.cep").value("87654-321"));
    }
}