package com.teste.tokio.backend.controller;

import com.teste.tokio.backend.dto.user.UserCreateDTO;
import com.teste.tokio.backend.dto.user.UserDTO;
import com.teste.tokio.backend.dto.user.UserUpdateDTO;
import com.teste.tokio.backend.service.UserServiceImpl;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.net.URI;

@RestController
@RequestMapping("/api/users")
public class UserController {

    @Autowired
    private UserServiceImpl service;

    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping("/create")
    public ResponseEntity<UserDTO> addUser(@Valid @RequestBody UserCreateDTO userDTO) {
        UserDTO createdUser = service.create(userDTO);
        return ResponseEntity.status(201).body(createdUser);
    }

    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping
    public Page<UserDTO> getAllUsers(
            @PageableDefault(sort = {"createdAt"}, direction = Sort.Direction.DESC) Pageable pageable
    ) {
        return service.list(pageable);
    }

    @PreAuthorize("hasRole('ADMIN') or #id == principal.id")
    @GetMapping("/{id}")
    public UserDTO getUserById(@PathVariable Long id) {
        return service.getById(id);
    }

    @PreAuthorize("hasRole('ADMIN') or #id == principal.id")
    @PutMapping("/{id}")
    public UserDTO updateUser(@PathVariable Long id, @RequestBody UserUpdateDTO dto) {
        return service.update(id, dto);
    }

    @PreAuthorize("hasRole('ADMIN')")
    @DeleteMapping("/{id}")
    public void deleteUser(@PathVariable Long id) {
        service.delete(id);
    }
}

