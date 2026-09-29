package com.vulntrack.backend.security;

import org.springframework.boot.context.properties.ConfigurationProperties;

import java.time.Duration;

/** Credentials for the single demo user and JWT signing settings. */
@ConfigurationProperties("vulntrack.auth")
public record AuthProperties(
        String username,
        String password,
        String jwtSecret,
        Duration jwtExpiration) {
}
