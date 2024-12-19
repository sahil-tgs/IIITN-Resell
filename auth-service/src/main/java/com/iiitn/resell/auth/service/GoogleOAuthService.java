package com.iiitn.resell.auth.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.iiitn.resell.auth.api.AuthDtos.AuthResponse;
import com.iiitn.resell.common.exception.ApiException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestClient;

/**
 * Minimal OAuth2 authorization-code flow against Google. We deliberately
 * roll our own (vs spring-security-oauth2-client) because we only need the
 * happy path and want full control over the redirect into the React app.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class GoogleOAuthService {

    private static final String AUTH_URL     = "https://accounts.google.com/o/oauth2/v2/auth";
    private static final String TOKEN_URL    = "https://oauth2.googleapis.com/token";
    private static final String USERINFO_URL = "https://openidconnect.googleapis.com/v1/userinfo";

    private final AuthService authService;
    private final RestClient http = RestClient.create();

    @Value("${google.oauth.client-id}")     private String clientId;
    @Value("${google.oauth.client-secret}") private String clientSecret;
    @Value("${google.oauth.redirect-uri}")  private String redirectUri;

    public String buildAuthorizationUrl() {
        return AUTH_URL
                + "?client_id="     + clientId
                + "&redirect_uri="  + redirectUri
                + "&response_type=code"
                + "&scope=openid%20email%20profile"
                + "&prompt=select_account";
    }

    public AuthResponse exchangeCodeAndLogin(String code) {
        MultiValueMap<String, String> form = new LinkedMultiValueMap<>();
        form.add("code", code);
        form.add("client_id", clientId);
        form.add("client_secret", clientSecret);
        form.add("redirect_uri", redirectUri);
        form.add("grant_type", "authorization_code");

        JsonNode tokenResp = http.post()
                .uri(TOKEN_URL)
                .contentType(MediaType.APPLICATION_FORM_URLENCODED)
                .body(form)
                .retrieve()
                .body(JsonNode.class);
        if (tokenResp == null || tokenResp.get("access_token") == null) {
            throw new ApiException(HttpStatus.BAD_GATEWAY, "Google token exchange failed");
        }
        String accessToken = tokenResp.get("access_token").asText();

        JsonNode userInfo = http.get()
                .uri(USERINFO_URL)
                .header(HttpHeaders.AUTHORIZATION, "Bearer " + accessToken)
                .retrieve()
                .body(JsonNode.class);
        if (userInfo == null || !userInfo.has("sub")) {
            throw new ApiException(HttpStatus.BAD_GATEWAY, "Failed to fetch Google profile");
        }

        return authService.loginWithGoogle(
                userInfo.get("sub").asText(),
                userInfo.get("email").asText(),
                userInfo.has("name") ? userInfo.get("name").asText() : null);
    }
}
