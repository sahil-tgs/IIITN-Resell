package com.iiitn.resell.auth.api;

import com.iiitn.resell.auth.api.AuthDtos.AuthResponse;
import com.iiitn.resell.auth.api.AuthDtos.LoginRequest;
import com.iiitn.resell.auth.api.AuthDtos.RegisterRequest;
import com.iiitn.resell.auth.api.AuthDtos.VerifyResponse;
import com.iiitn.resell.auth.service.AuthService;
import com.iiitn.resell.auth.service.GoogleOAuthService;
import com.iiitn.resell.common.security.AuthenticatedUser;
import com.iiitn.resell.common.security.CurrentUser;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;
    private final GoogleOAuthService googleOAuth;

    @Value("${client.url}")
    private String clientUrl;

    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(@Valid @RequestBody RegisterRequest req) {
        return ResponseEntity.status(201).body(authService.register(req));
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody LoginRequest req) {
        return ResponseEntity.ok(authService.login(req));
    }

    @GetMapping("/verify-token")
    public ResponseEntity<VerifyResponse> verify(@CurrentUser AuthenticatedUser user) {
        // The gateway already validated the JWT before populating user; if we
        // got here with a non-null user, the token is valid.
        return ResponseEntity.ok(new VerifyResponse(user != null, user == null ? null : user.userId()));
    }

    /** Step 1 of OAuth: redirect the browser to Google's consent screen. */
    @GetMapping("/google")
    public void googleLogin(HttpServletResponse resp) throws IOException {
        resp.sendRedirect(googleOAuth.buildAuthorizationUrl());
    }

    /** Step 2: Google redirects back with ?code= — we exchange it and mint a JWT. */
    @GetMapping("/google/callback")
    public void googleCallback(@RequestParam("code") String code, HttpServletResponse resp) throws IOException {
        AuthResponse authResp = googleOAuth.exchangeCodeAndLogin(code);
        String redirect = clientUrl + "/auth-success?token=" + URLEncoder.encode(authResp.token(), StandardCharsets.UTF_8)
                + "&userId=" + URLEncoder.encode(authResp.userId(), StandardCharsets.UTF_8);
        resp.sendRedirect(redirect);
    }
}
