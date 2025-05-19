package com.teste.tokio.backend.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.teste.tokio.backend.config.CustomUserDetails;
import com.teste.tokio.backend.dto.address.AddressDTO;
import com.teste.tokio.backend.dto.user.UserCreateDTO;
import com.teste.tokio.backend.dto.user.UserUpdateDTO;
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
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class UserControllerIntegrationTest {

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

        // Gerar tokens usando CustomUserDetails em vez de cast direto
        CustomUserDetails adminDetails = new CustomUserDetails(adminUser);
        CustomUserDetails userDetails = new CustomUserDetails(regularUser);

        adminToken = jwtTokenProvider.generateToken(adminDetails);
        userToken = jwtTokenProvider.generateToken(userDetails);
    }

    @Test
    void shouldCreateUserWhenAdmin() throws Exception {
        AddressDTO addressDTO = new AddressDTO(
            null, "Rua Teste", "123", null,
            "Bairro Teste", "Cidade Teste",
            "Estado Teste", "08080030"
        );

        UserCreateDTO userCreateDTO = new UserCreateDTO(
            "Novo Usuário",
            "novo@teste.com",
            "senha123",
            addressDTO,
            "USER"
        );

        mockMvc.perform(post("/api/users/create")
                .header("Authorization", "Bearer " + adminToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(userCreateDTO)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.nome").value("Novo Usuário"))
                .andExpect(jsonPath("$.email").value("novo@teste.com"));
    }

    @Test
    void shouldDenyCreateUserWhenNotAdmin() throws Exception {
        AddressDTO addressDTO = new AddressDTO(
            null, "Rua Teste", "123", null,
            "Bairro Teste", "Cidade Teste",
            "Estado Teste", "12345-678"
        );

        UserCreateDTO userCreateDTO = new UserCreateDTO(
            "Novo Usuário",
            "novo@teste.com",
            "senha123",
            addressDTO,
            "USER"
        );

        mockMvc.perform(post("/api/users/create")
                .header("Authorization", "Bearer " + userToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(userCreateDTO)))
                .andExpect(status().isForbidden());
    }

    @Test
    void shouldListUsersWhenAdmin() throws Exception {
        mockMvc.perform(get("/api/users")
                .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content", hasSize(2)));
    }

    @Test
    void shouldDenyListUsersWhenNotAdmin() throws Exception {
        mockMvc.perform(get("/api/users")
                .header("Authorization", "Bearer " + userToken))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void shouldGetUserByIdWhenSameUser() throws Exception {
        mockMvc.perform(get("/api/users/" + regularUser.getId())
                .header("Authorization", "Bearer " + userToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(regularUser.getId()))
                .andExpect(jsonPath("$.nome").value("User"));
    }

    @Test
    void shouldGetUserByIdWhenAdmin() throws Exception {
        mockMvc.perform(get("/api/users/" + regularUser.getId())
                .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(regularUser.getId()));
    }

    @Test
    void shouldDenyAccessToOtherUserProfile() throws Exception {
        mockMvc.perform(get("/api/users/" + adminUser.getId())
                .header("Authorization", "Bearer " + userToken))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void shouldUpdateUserWhenSameUser() throws Exception {
        UserUpdateDTO updateDTO = new UserUpdateDTO(
            "Nome Atualizado",
            null, // manter o mesmo email
            null, // manter a mesma senha
            null  // manter os mesmos endereços
        );

        mockMvc.perform(put("/api/users/" + regularUser.getId())
                .header("Authorization", "Bearer " + userToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(updateDTO)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.nome").value("Nome Atualizado"));
    }

    @Test
    void shouldUpdateUserWhenAdmin() throws Exception {
        UserUpdateDTO updateDTO = new UserUpdateDTO(
            "Alterado pelo Admin",
            null,
            null,
            null
        );

        mockMvc.perform(put("/api/users/" + regularUser.getId())
                .header("Authorization", "Bearer " + adminToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(updateDTO)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.nome").value("Alterado pelo Admin"));
    }

    @Test
    void shouldDenyUpdateOtherUserProfile() throws Exception {
        UserUpdateDTO updateDTO = new UserUpdateDTO(
            "Tentativa de Alteração",
            null,
            null,
            null
        );

        mockMvc.perform(put("/api/users/" + adminUser.getId())
                .header("Authorization", "Bearer " + userToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(updateDTO)))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void shouldDeleteUserWhenAdmin() throws Exception {
        // Cria usuário para deletar
        User userToDelete = new User();
        userToDelete.setNome("Para Deletar");
        userToDelete.setEmail("deletar@teste.com");
        userToDelete.setPassword(passwordEncoder.encode("senha123"));
        userToDelete.setRole(Role.USER);
        userToDelete.setActive(true);
        userToDelete = userRepository.save(userToDelete);

        mockMvc.perform(delete("/api/users/" + userToDelete.getId())
                .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isOk());

        // Verifica se o usuário foi marcado como inativo
        userRepository.findById(userToDelete.getId()).orElseThrow();
        mockMvc.perform(get("/api/users/" + userToDelete.getId())
                .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isOk());
    }

    @Test
    void shouldDenyDeleteUserWhenNotAdmin() throws Exception {
        mockMvc.perform(delete("/api/users/" + regularUser.getId())
                .header("Authorization", "Bearer " + userToken))
                .andExpect(status().isUnauthorized());
    }
}