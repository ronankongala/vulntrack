package com.vulntrack.backend.security;

import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.time.Duration;
import java.time.Instant;
import java.util.Date;

/** Issues and validates HS256-signed JWTs. */
@Service
public class JwtService {

    private final SecretKey key;
    private final Duration expiration;

    public JwtService(AuthProperties properties) {
        // hmacShaKeyFor rejects keys shorter than 256 bits, so a weak secret fails at startup
        this.key = Keys.hmacShaKeyFor(properties.jwtSecret().getBytes(StandardCharsets.UTF_8));
        this.expiration = properties.jwtExpiration();
    }

    public String generateToken(String username) {
        Instant now = Instant.now();
        return Jwts.builder()
                .subject(username)
                .issuedAt(Date.from(now))
                .expiration(Date.from(now.plus(expiration)))
                .signWith(key)
                .compact();
    }

    /**
     * Returns the token's subject.
     *
     * @throws JwtException if the token is malformed, has a bad signature, or is expired
     */
    public String validateAndGetSubject(String token) {
        return Jwts.parser()
                .verifyWith(key)
                .build()
                .parseSignedClaims(token)
                .getPayload()
                .getSubject();
    }

    public Duration getExpiration() {
        return expiration;
    }
}
