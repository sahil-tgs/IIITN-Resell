package com.iiitn.resell.auth.service;

import com.iiitn.resell.auth.api.AuthDtos.AuthResponse;
import com.iiitn.resell.auth.api.AuthDtos.LoginRequest;
import com.iiitn.resell.auth.api.AuthDtos.RegisterRequest;
import com.iiitn.resell.auth.domain.Credential;
import com.iiitn.resell.auth.domain.CredentialRepository;
import com.iiitn.resell.common.event.KafkaTopics;
import com.iiitn.resell.common.event.UserEvent;
import com.iiitn.resell.common.exception.ApiException;
import com.iiitn.resell.common.security.JwtTokenProvider;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.Map;

@Slf4j
@Service
@RequiredArgsConstructor
public class AuthService {

    private static final String ALLOWED_DOMAIN = "@iiitn.ac.in";

    private final CredentialRepository repo;
    private final PasswordEncoder encoder;
    private final JwtTokenProvider jwt;
    private final KafkaTemplate<String, Object> kafka;

    @Transactional
    public AuthResponse register(RegisterRequest req) {
        if (!req.email().toLowerCase().endsWith(ALLOWED_DOMAIN)) {
            throw ApiException.badRequest("Only " + ALLOWED_DOMAIN + " email addresses are allowed");
        }
        if (repo.existsByEmail(req.email()))    throw ApiException.conflict("Email already in use");
        if (repo.existsByUsername(req.username())) throw ApiException.conflict("Username already taken");

        Credential cred = Credential.builder()
                .email(req.email().toLowerCase())
                .username(req.username())
                .passwordHash(encoder.encode(req.password()))
                .admin(false)
                .build();
        repo.save(cred);
        publishRegistered(cred);
        return issue(cred);
    }

    public AuthResponse login(LoginRequest req) {
        Credential cred = repo.findByEmail(req.email().toLowerCase())
                .orElseThrow(() -> ApiException.unauthorized("Invalid credentials"));
        if (cred.getPasswordHash() == null || !encoder.matches(req.password(), cred.getPasswordHash())) {
            throw ApiException.unauthorized("Invalid credentials");
        }
        publishLoggedIn(cred);
        return issue(cred);
    }

    /** Upsert from a successful Google OAuth exchange. */
    @Transactional
    public AuthResponse loginWithGoogle(String googleId, String email, String displayName) {
        if (!email.toLowerCase().endsWith(ALLOWED_DOMAIN)) {
            throw ApiException.forbidden("Only " + ALLOWED_DOMAIN + " email addresses are allowed");
        }
        Credential cred = repo.findByGoogleId(googleId)
                .or(() -> repo.findByEmail(email.toLowerCase()))
                .orElseGet(() -> Credential.builder()
                        .email(email.toLowerCase())
                        .username(generateUsername(displayName, email))
                        .googleId(googleId)
                        .admin(false)
                        .build());
        cred.setGoogleId(googleId);
        repo.save(cred);
        publishLoggedIn(cred);
        return issue(cred);
    }

    private AuthResponse issue(Credential c) {
        String token = jwt.generate(
                c.getId().toString(),
                c.getEmail(),
                Map.of("admin", c.isAdmin(), "username", c.getUsername()));
        return new AuthResponse(token, c.getId().toString(), c.getUsername(), c.getEmail(), c.isAdmin());
    }

    private void publishRegistered(Credential c) {
        kafka.send(KafkaTopics.USER_EVENTS, c.getId().toString(),
                UserEvent.builder()
                        .type(UserEvent.Type.REGISTERED)
                        .userId(c.getId().toString())
                        .username(c.getUsername())
                        .email(c.getEmail())
                        .admin(c.isAdmin())
                        .occurredAt(Instant.now())
                        .build());
    }

    private void publishLoggedIn(Credential c) {
        kafka.send(KafkaTopics.USER_EVENTS, c.getId().toString(),
                UserEvent.builder()
                        .type(UserEvent.Type.LOGGED_IN)
                        .userId(c.getId().toString())
                        .username(c.getUsername())
                        .email(c.getEmail())
                        .occurredAt(Instant.now())
                        .build());
    }

    private String generateUsername(String displayName, String email) {
        String base = displayName == null || displayName.isBlank()
                ? email.split("@")[0]
                : displayName.replaceAll("\\s+", "");
        String candidate = base;
        int suffix = 1;
        while (repo.existsByUsername(candidate)) {
            candidate = base + suffix++;
        }
        return candidate;
    }
}
