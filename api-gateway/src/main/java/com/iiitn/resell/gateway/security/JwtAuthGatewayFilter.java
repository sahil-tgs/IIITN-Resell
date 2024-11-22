package com.iiitn.resell.gateway.security;

import com.iiitn.resell.common.security.JwtTokenProvider;
import io.jsonwebtoken.Claims;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cloud.gateway.filter.GatewayFilterChain;
import org.springframework.cloud.gateway.filter.GlobalFilter;
import org.springframework.core.Ordered;
import org.springframework.http.HttpStatus;
import org.springframework.http.server.reactive.ServerHttpRequest;
import org.springframework.stereotype.Component;
import org.springframework.util.AntPathMatcher;
import org.springframework.web.server.ServerWebExchange;
import reactor.core.publisher.Mono;

import java.util.List;

/**
 * The gateway is the only place JWTs are verified. Downstream services trust
 * X-User-Id / X-User-Email / X-User-Admin headers because the gateway also
 * STRIPS any pre-existing ones an attacker might inject. Public paths (login,
 * register, product browse, etc.) bypass this entirely.
 */
@Slf4j
@Component
public class JwtAuthGatewayFilter implements GlobalFilter, Ordered {

    private final JwtTokenProvider tokenProvider;
    private final List<String> publicPaths;
    private final AntPathMatcher matcher = new AntPathMatcher();

    public JwtAuthGatewayFilter(JwtTokenProvider tokenProvider, GatewaySecurityProperties props) {
        this.tokenProvider = tokenProvider;
        this.publicPaths = props.getPublicPaths();
    }

    @Override
    public Mono<Void> filter(ServerWebExchange exchange, GatewayFilterChain chain) {
        ServerHttpRequest req = exchange.getRequest();
        String path = req.getURI().getPath();

        // Always strip caller-supplied identity headers before considering auth.
        ServerHttpRequest stripped = req.mutate()
                .headers(h -> {
                    h.remove("X-User-Id");
                    h.remove("X-User-Email");
                    h.remove("X-User-Admin");
                })
                .build();

        if (isPublic(path, req.getMethodValue())) {
            return chain.filter(exchange.mutate().request(stripped).build());
        }

        String auth = req.getHeaders().getFirst("Authorization");
        if (auth == null || !auth.startsWith("Bearer ")) {
            return unauthorized(exchange, "Missing bearer token");
        }
        String token = auth.substring(7);
        if (!tokenProvider.isValid(token)) {
            return unauthorized(exchange, "Invalid or expired token");
        }
        Claims claims = tokenProvider.parse(token);

        ServerHttpRequest withIdentity = stripped.mutate()
                .header("X-User-Id", claims.getSubject())
                .header("X-User-Email", String.valueOf(claims.get("email", String.class)))
                .header("X-User-Admin", String.valueOf(claims.get("admin", Boolean.class) == Boolean.TRUE))
                .build();

        return chain.filter(exchange.mutate().request(withIdentity).build());
    }

    private boolean isPublic(String path, String method) {
        // Product browse (GET only) is public; POST/PUT/DELETE require auth.
        if ("GET".equalsIgnoreCase(method) && path.startsWith("/api/products")) return true;
        return publicPaths.stream().anyMatch(p -> matcher.match(p, path));
    }

    private Mono<Void> unauthorized(ServerWebExchange exchange, String msg) {
        log.debug("Gateway auth rejected: {}", msg);
        exchange.getResponse().setStatusCode(HttpStatus.UNAUTHORIZED);
        return exchange.getResponse().setComplete();
    }

    @Override
    public int getOrder() {
        return -1;
    }
}
