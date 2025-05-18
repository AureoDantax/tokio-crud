package com.teste.tokio.backend.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.teste.tokio.backend.dto.address.AddressDTO;
import com.teste.tokio.backend.entity.Address;
import com.teste.tokio.backend.entity.User;
import com.teste.tokio.backend.repository.AddressRepository;
import com.teste.tokio.backend.repository.UserRepository;
import com.teste.tokio.backend.service.interfaces.IAddressService;
import jakarta.persistence.EntityNotFoundException;
import jakarta.transaction.Transactional;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class AddressServiceImpl implements IAddressService {
    private final AddressRepository repo;
    private final UserRepository userRepo;
    private final ObjectMapper mapper;

    public AddressServiceImpl(AddressRepository repo,
                              UserRepository userRepo,
                              ObjectMapper mapper) {
        this.repo = repo;
        this.userRepo = userRepo;
        this.mapper = mapper;
    }

    @Override
    @Transactional(rollbackOn = Exception.class)
    public AddressDTO create(Long userId,AddressDTO dto) {
        User user = userRepo.findById(userId)
                .orElseThrow(() -> new EntityNotFoundException("Usuário não encontrado"));
        Address address = mapper.convertValue(dto, Address.class);
        address.setUser(user);
        Address saved = repo.save(address);
        return mapper.convertValue(saved, AddressDTO.class);
    }

    @Override
    public List<AddressDTO> listByUser(Long userId) {
        return repo.findByUserId(userId)
                .stream()
                .map(address -> mapper.convertValue(address, AddressDTO.class))
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(rollbackOn = Exception.class)
    public AddressDTO update(Long id, AddressDTO dto) {
        Address address = repo.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Endereço não encontrado"));
        // atualiza campos
        mapper.convertValue(dto, Address.class);
        Address updated = repo.save(address);
        return mapper.convertValue(updated, AddressDTO.class);

    }

    @Override
    public void delete(Long id, Long userId) {
        Address address = repo.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Endereço não encontrado"));

        // Verifica se o usuário é ADMIN através do contexto de segurança
        boolean isAdmin = SecurityContextHolder.getContext()
                .getAuthentication()
                .getAuthorities()
                .stream()
                .anyMatch(authority -> authority.getAuthority().equals("ADMIN"));

        repo.delete(address);
    }

    @Override
    public boolean isOwner(Long principalId, Long addressId) {
        return repo.findById(addressId)
                .map(a -> a.getUser().getId().equals(principalId))
                .orElse(false);
    }
}