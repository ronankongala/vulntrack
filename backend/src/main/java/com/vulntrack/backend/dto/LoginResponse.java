package com.vulntrack.backend.dto;

public record LoginResponse(
        String token,
        String tokenType,
        long expiresIn) {
}
