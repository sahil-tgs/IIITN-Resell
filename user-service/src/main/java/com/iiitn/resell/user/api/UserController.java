package com.iiitn.resell.user.api;

import com.iiitn.resell.common.exception.ApiException;
import com.iiitn.resell.common.security.AuthenticatedUser;
import com.iiitn.resell.common.security.CurrentUser;
import com.iiitn.resell.user.api.UserDtos.ProfileResponse;
import com.iiitn.resell.user.api.UserDtos.UpdateProfileRequest;
import com.iiitn.resell.user.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.UUID;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    @GetMapping("/profile")
    public ResponseEntity<ProfileResponse> myProfile(@CurrentUser AuthenticatedUser user) {
        return ResponseEntity.ok(userService.getProfile(UUID.fromString(user.userId())));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ProfileResponse> byId(@PathVariable("id") UUID id) {
        return ResponseEntity.ok(userService.getProfile(id));
    }

    @PutMapping("/profile")
    public ResponseEntity<ProfileResponse> update(
            @CurrentUser AuthenticatedUser user,
            @Valid @RequestBody UpdateProfileRequest req) {
        return ResponseEntity.ok(userService.update(UUID.fromString(user.userId()), req));
    }

    @PutMapping(value = "/profile-picture", consumes = "multipart/form-data")
    public ResponseEntity<ProfileResponse> picture(
            @CurrentUser AuthenticatedUser user,
            @RequestParam("profilePicture") MultipartFile file) throws IOException {
        if (file.isEmpty()) throw ApiException.badRequest("No file uploaded");
        return ResponseEntity.ok(userService.uploadPicture(
                UUID.fromString(user.userId()), file.getBytes(), file.getContentType()));
    }

    @DeleteMapping("/delete-account")
    public ResponseEntity<Void> deleteAccount(@CurrentUser AuthenticatedUser user) {
        userService.delete(UUID.fromString(user.userId()));
        return ResponseEntity.noContent().build();
    }
}
