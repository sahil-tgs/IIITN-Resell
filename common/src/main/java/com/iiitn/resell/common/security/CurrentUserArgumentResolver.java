package com.iiitn.resell.common.security;

import org.springframework.core.MethodParameter;
import org.springframework.web.bind.support.WebDataBinderFactory;
import org.springframework.web.context.request.NativeWebRequest;
import org.springframework.web.method.support.HandlerMethodArgumentResolver;
import org.springframework.web.method.support.ModelAndViewContainer;

import jakarta.servlet.http.HttpServletRequest;

/**
 * Resolves @CurrentUser parameters on controller methods. The gateway is
 * responsible for putting verified identity into X-User-Id / X-User-Email
 * headers; this resolver reads them.
 */
public class CurrentUserArgumentResolver implements HandlerMethodArgumentResolver {

    @Override
    public boolean supportsParameter(MethodParameter parameter) {
        return parameter.hasParameterAnnotation(CurrentUser.class)
                && parameter.getParameterType().equals(AuthenticatedUser.class);
    }

    @Override
    public Object resolveArgument(MethodParameter parameter,
                                  ModelAndViewContainer mavContainer,
                                  NativeWebRequest webRequest,
                                  WebDataBinderFactory binderFactory) {
        HttpServletRequest req = webRequest.getNativeRequest(HttpServletRequest.class);
        if (req == null) return null;
        String userId = req.getHeader("X-User-Id");
        String email = req.getHeader("X-User-Email");
        boolean admin = "true".equalsIgnoreCase(req.getHeader("X-User-Admin"));
        if (userId == null) return null;
        return new AuthenticatedUser(userId, email, admin);
    }
}
