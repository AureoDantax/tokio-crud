package com.teste.tokio.backend.controller;

import com.teste.tokio.backend.dto.user.JwtResponse;
import com.teste.tokio.backend.dto.user.LoginRequest;
import com.teste.tokio.backend.dto.user.UserCreateDTO;
import com.teste.tokio.backend.dto.user.UserDTO;
import com.teste.tokio.backend.service.interfaces.IUserService;
import com.teste.tokio.backend.util.JwtUtil;
import jakarta.validation.Valid;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.net.URI;
@Slf4j
@RestController
@RequestMapping("api/auth")
public class AuthController {

    private final AuthenticationManager authManager;
    private final JwtUtil jwtUtil;
    private final IUserService service;

    public AuthController(AuthenticationManager authManager, JwtUtil jwtUtil, IUserService service) {
        this.authManager = authManager;
        this.jwtUtil = jwtUtil;
        this.service = service;
    }

    @PostMapping("/login")
    public ResponseEntity<JwtResponse> login(@RequestBody LoginRequest req) {
        Authentication auth = authManager.authenticate(
                new UsernamePasswordAuthenticationToken(req.email(), req.password())
        );
        UserDetails userDetails = (UserDetails) auth.getPrincipal();
        String token = jwtUtil.generateToken(userDetails);
        return ResponseEntity.ok(new JwtResponse(token));
    }

    @PostMapping("/register")
    public ResponseEntity<UserDTO> register(@RequestBody @Valid UserCreateDTO requestDto) {
        UserDTO user = service.create(requestDto);
        return ResponseEntity.created(URI.create("api/users/")).body(user);
    }

}