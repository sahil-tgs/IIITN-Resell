package com.iiitn.resell.gateway.security;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.List;

@Data
@Component
@ConfigurationProperties(prefix = "security")
public class GatewaySecurityProperties {
    private List<String> publicPaths = new ArrayList<>();
    private Jwt jwt = new Jwt();

    @Data
    public static class Jwt {
        private String secret;
        private long expirationMs = 86_400_000L;
    }
}
