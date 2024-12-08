package com.iiitn.resell.auth.domain;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface CredentialRepository extends JpaRepository<Credential, UUID> {
    Optional<Credential> findByEmail(String email);
    Optional<Credential> findByUsername(String username);
    Optional<Credential> findByGoogleId(String googleId);
    boolean existsByEmail(String email);
    boolean existsByUsername(String username);
}
