package com.iiitn.resell.user.api;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

import java.time.Instant;
import java.util.UUID;

public class UserDtos {

    public record ProfileResponse(
            UUID userId,
            String username,
            String email,
            String profilePicture,
            String bio,
            Instant createdAt,
            Instant updatedAt
    ) {}

    public record UpdateProfileRequest(
            @NotBlank @Size(max = 64) String username,
            @NotBlank @Email String email,
            String bio
    ) {}
}
