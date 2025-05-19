package com.teste.tokio.backend.controller;

import com.teste.tokio.backend.config.CustomUserDetails;
import com.teste.tokio.backend.dto.address.AddressDTO;
import com.teste.tokio.backend.dto.cep.CepResponse;
import com.teste.tokio.backend.service.ViaCepAdapter;
import com.teste.tokio.backend.service.interfaces.IAddressService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/addresses")
public class AddressController {

    private final IAddressService service;
    private final ViaCepAdapter cepAdapter;

    public AddressController(IAddressService service, ViaCepAdapter cepAdapter) {
        this.service = service;
        this.cepAdapter = cepAdapter;
    }

    /*Estou usando o @PreAuthorize com SpEL do Spring para verificar se o usuário tem a role ADMIN
    ou se o id do usuário no DTO é igual ao id do usuário autenticado*/
    @PreAuthorize("hasRole('ADMIN') or #userId == principal.id")
    @PostMapping("/create/{userId}")
    public AddressDTO create(@PathVariable Long userId, @RequestBody @Valid AddressDTO dto) {
        return service.create(userId, dto);
    }

    @PreAuthorize("hasRole('ADMIN') or #userId == principal.id")
    @GetMapping("/user/{userId}")
    public List<AddressDTO> listByUser(@PathVariable Long userId) {
        return service.listByUser(userId);
    }

    @PreAuthorize("hasRole('ADMIN') or @addressServiceImpl.isOwner(principal.id, #id)")
    @GetMapping("/{id}")
    public AddressDTO getById(@PathVariable Long id) {
        return service.getById(id);
    }

    //Aqui uso o SpEL para chamar o isOwner e verificar se o usuario é o dono do endereço
    @PreAuthorize("hasRole('ADMIN') or @addressServiceImpl.isOwner(principal.id, #id)")
    @PutMapping("/{id}")
    public AddressDTO update(@PathVariable Long id, @RequestBody @Valid AddressDTO dto) {
        return service.update(id, dto);
    }

    @PreAuthorize("hasRole('ADMIN') or @addressServiceImpl.isOwner(principal.id, #id)")
    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable Long id) {
        service.delete(id, ((CustomUserDetails) SecurityContextHolder.getContext().getAuthentication().getPrincipal()).getId());
    }




    @GetMapping("/consulta/{cep}")
    public ResponseEntity<CepResponse> getAddresByCep(@PathVariable String cep) {
        return ResponseEntity.ok(cepAdapter.fetch(cep));


    }
}
