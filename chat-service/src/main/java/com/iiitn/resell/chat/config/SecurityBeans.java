package com.iiitn.resell.chat.config;

import com.iiitn.resell.common.security.JwtTokenProvider;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class SecurityBeans {

    @Bean
    public JwtTokenProvider jwtTokenProvider(
            @Value("${security.jwt.secret}") String secret,
            @Value("${security.jwt.expiration-ms}") long expirationMs) {
        return new JwtTokenProvider(secret, expirationMs);
    }
}
