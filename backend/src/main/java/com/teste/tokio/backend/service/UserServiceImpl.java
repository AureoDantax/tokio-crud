package com.teste.tokio.backend.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.teste.tokio.backend.dto.user.UserCreateDTO;
import com.teste.tokio.backend.dto.user.UserDTO;
import com.teste.tokio.backend.dto.user.UserUpdateDTO;
import com.teste.tokio.backend.entity.Address;
import com.teste.tokio.backend.entity.Role;
import com.teste.tokio.backend.entity.User;
import com.teste.tokio.backend.exception.BusinessException;
import com.teste.tokio.backend.repository.UserRepository;
import com.teste.tokio.backend.service.interfaces.IUserService;
import jakarta.persistence.EntityNotFoundException;
import jakarta.transaction.Transactional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.util.ObjectUtils;

import java.util.List;

@Service
public class UserServiceImpl implements IUserService {
    private final UserRepository repo;
    private final PasswordEncoder encoder;
    private final ObjectMapper mapper;
    private final ViaCepAdapter cepAdapter;

    public UserServiceImpl(UserRepository repo, PasswordEncoder encoder, ObjectMapper mapper, ViaCepAdapter cepAdapter) {
        this.repo = repo;
        this.encoder = encoder;
        this.mapper = mapper;
        this.cepAdapter = cepAdapter;
    }

    @Override
    @Transactional(rollbackOn = Exception.class)
    public UserDTO create(UserCreateDTO dto) {
        if (repo.findByEmail(dto.email()).isPresent()) {
            throw new BusinessException("Email já cadastrado");
        }

        User user = new User();
        user.setNome(dto.nome());
        user.setEmail(dto.email());
        user.setPassword(encoder.encode(dto.password()));
        user.setRole(Role.valueOf(dto.role().toUpperCase()));
        var validAdress = cepAdapter.fetch(dto.address().cep());
        if (ObjectUtils.isEmpty(dto.address()) && ObjectUtils.isEmpty(validAdress)) {

            throw new BusinessException("CEP não encontrado ou não informado");
        }
        Address address = mapper.convertValue(dto.address(), Address.class);
        address.setUser(user);
        user.getAddresses().add(address);

        User saved = repo.save(user);
        return mapper.convertValue(saved, UserDTO.class);
    }

    @Override
    public Page<UserDTO> list(Pageable page) {
        return repo.findAllByActiveIsTrue(page).map(user -> mapper.convertValue(user, UserDTO.class));

    }

    @Override
    public UserDTO getById(Long id) {
        User user = repo.findById(id).orElseThrow(() -> new EntityNotFoundException("Usuário não encontrado"));
        return mapper.convertValue(user, UserDTO.class);
    }

    @Override
    @Transactional(rollbackOn = Exception.class)
    public UserDTO update(Long id, UserUpdateDTO dto) {
        User user = repo.findById(id).orElseThrow(() -> new EntityNotFoundException("Usuário não encontrado"));

        // Atualiza informações básicas do usuário
        if (!ObjectUtils.isEmpty(dto.nome())) {
            user.setNome(dto.nome());
        }
        if (!ObjectUtils.isEmpty(dto.email()) && !user.getEmail().equals(dto.email())) {
            if (repo.findByEmail(dto.email()).isPresent()) {
                throw new BusinessException("Email já cadastrado");
            }
            user.setEmail(dto.email());
        }
        if (!ObjectUtils.isEmpty(dto.password())) {
            user.setPassword(encoder.encode(dto.password()));
        }

        // Trata os endereços
        if (dto.addresses() != null && !dto.addresses().isEmpty()) {
            user.getAddresses().clear();

            // Adiciona os novos endereços
            dto.addresses().forEach(addrDto -> {
                Address address = mapper.convertValue(addrDto, Address.class);
                // Garante que o ID seja nulo para criar um novo endereço
                address.setId(null);
                address.setUser(user);
                user.getAddresses().add(address);
            });
        }

        User updated = repo.save(user);
        return mapper.convertValue(updated, UserDTO.class);
    }

    @Override
    public void delete(Long id) {
        User user = repo.findById(id).orElseThrow(() -> new EntityNotFoundException("Usuário não encontrado"));
        user.setActive(false);
        repo.save(user);
    }

}
