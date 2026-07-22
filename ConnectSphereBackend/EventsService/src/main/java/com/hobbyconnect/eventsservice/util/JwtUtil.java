package com.hobbyconnect.eventsservice.util;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;

import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Component
public class JwtUtil {

    private final String userServiceBaseUrl;
    private final RestTemplate restTemplate;
    private final Map<String, String> tokenCache = new ConcurrentHashMap<>();

    public JwtUtil(@Value("${user.service.base-url}") String userServiceBaseUrl,
                   RestTemplate restTemplate) {
        this.userServiceBaseUrl = userServiceBaseUrl;
        this.restTemplate = restTemplate;
    }

    public String extractUserId(String token) {
        if (token == null || token.isBlank()) {
            throw new RuntimeException("Missing or empty token");
        }
        if (tokenCache.containsKey(token)) {
            return tokenCache.get(token);
        }
        try {
            String url = userServiceBaseUrl + "/auth/validate?token=" + token;
            @SuppressWarnings("unchecked")
            Map<String, String> response = restTemplate.getForObject(url, Map.class);
            if (response == null || !response.containsKey("userId")) {
                throw new RuntimeException("Invalid token — no userId returned");
            }
            String userId = response.get("userId");
            tokenCache.put(token, userId);
            return userId;
        } catch (Exception e) {
            throw new RuntimeException("Token validation failed: " + e.getMessage());
        }
    }

    public String extractUserIdFromHeader(String authHeader) {
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            throw new RuntimeException(
                    "Missing or malformed Authorization header. Expected: 'Bearer <token>'");
        }
        return extractUserId(authHeader.substring(7).trim());
    }
}
