package com.teste.tokio.backend.dto.user;

public record LoginRequest(
        String email,
        String password) {
}
