package com.iiitn.resell.common.security;

/**
 * Lightweight principal injected by the gateway (via X-User-Id / X-User-Email
 * headers) into downstream service request scope. Services should not trust
 * these headers from an external source — the gateway strips and re-adds them.
 */
public record AuthenticatedUser(String userId, String email, boolean admin) {
}
