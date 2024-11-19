package com.iiitn.resell.gateway.security;

import com.iiitn.resell.common.security.JwtTokenProvider;
import org.springframework.cloud.gateway.filter.ratelimit.KeyResolver;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import reactor.core.publisher.Mono;

@Configuration
public class GatewaySecurityConfig {

    @Bean
    public JwtTokenProvider jwtTokenProvider(GatewaySecurityProperties props) {
        return new JwtTokenProvider(props.getJwt().getSecret(), props.getJwt().getExpirationMs());
    }

    /**
     * Rate-limit key resolver: bucket per source IP. Configured per-route in
     * api-gateway.yml under filters: RequestRateLimiter.
     */
    @Bean
    public KeyResolver ipKeyResolver() {
        return exchange -> Mono.justOrEmpty(
                exchange.getRequest().getRemoteAddress() != null
                        ? exchange.getRequest().getRemoteAddress().getAddress().getHostAddress()
                        : "unknown");
    }
}
