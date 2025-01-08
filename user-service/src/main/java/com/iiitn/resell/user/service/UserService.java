package com.iiitn.resell.user.service;

import com.iiitn.resell.common.exception.ApiException;
import com.iiitn.resell.user.api.UserDtos.ProfileResponse;
import com.iiitn.resell.user.api.UserDtos.UpdateProfileRequest;
import com.iiitn.resell.user.domain.UserProfile;
import com.iiitn.resell.user.domain.UserProfileRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserProfileRepository repo;
    private final CloudinaryService cloudinary;

    @Cacheable(value = "userProfiles", key = "#userId")
    public ProfileResponse getProfile(UUID userId) {
        UserProfile p = repo.findById(userId).orElseThrow(() -> ApiException.notFound("Profile"));
        return toResponse(p);
    }

    /**
     * Upsert called by auth-service via Kafka user.registered events (consumer
     * lives in this service — see UserEventConsumer). Also callable directly
     * to support out-of-band sync.
     */
    @Transactional
    @CacheEvict(value = "userProfiles", key = "#userId")
    public void upsertOnRegister(UUID userId, String username, String email) {
        UserProfile p = repo.findById(userId).orElseGet(() -> UserProfile.builder()
                .userId(userId)
                .build());
        p.setUsername(username);
        p.setEmail(email);
        repo.save(p);
    }

    @Transactional
    @CacheEvict(value = "userProfiles", key = "#userId")
    public ProfileResponse update(UUID userId, UpdateProfileRequest req) {
        UserProfile p = repo.findById(userId).orElseThrow(() -> ApiException.notFound("Profile"));
        p.setUsername(req.username());
        p.setEmail(req.email());
        p.setBio(req.bio());
        return toResponse(repo.save(p));
    }

    @Transactional
    @CacheEvict(value = "userProfiles", key = "#userId")
    public ProfileResponse uploadPicture(UUID userId, byte[] image, String contentType) {
        UserProfile p = repo.findById(userId).orElseThrow(() -> ApiException.notFound("Profile"));
        if (p.getProfilePicture() != null) {
            cloudinary.deleteByUrl(p.getProfilePicture());
        }
        String url = cloudinary.upload(image, "iiitn-resell-profiles");
        p.setProfilePicture(url);
        return toResponse(repo.save(p));
    }

    @Transactional
    @CacheEvict(value = "userProfiles", key = "#userId")
    public void delete(UUID userId) {
        repo.findById(userId).ifPresent(p -> {
            if (p.getProfilePicture() != null) cloudinary.deleteByUrl(p.getProfilePicture());
            repo.delete(p);
        });
    }

    private ProfileResponse toResponse(UserProfile p) {
        return new ProfileResponse(p.getUserId(), p.getUsername(), p.getEmail(),
                p.getProfilePicture(), p.getBio(), p.getCreatedAt(), p.getUpdatedAt());
    }
}
