package com.hobbyconnect.feedservice.util;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;

import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Component
public class JwtUtil {

    private final String userServiceBaseUrl;
    private final RestTemplate restTemplate;

    // In-memory cache: token → userId
    // Avoids calling UserAndInterest on every single request
    private final Map<String, String> tokenCache = new ConcurrentHashMap<>();

    public JwtUtil(
            @Value("${user.service.base-url}") String userServiceBaseUrl,
            RestTemplate restTemplate) {
        this.userServiceBaseUrl = userServiceBaseUrl;
        this.restTemplate = restTemplate;
    }

    /**
     * Extracts userId from a mock token by calling the UserAndInterest
     * /api/auth/validate endpoint which returns the userId for a given token.
     *
     * Token must NOT include the "Bearer " prefix.
     *
     * Result is cached in memory so repeated requests don't keep
     * calling UserAndInterest for the same token.
     */
    public String extractUserId(String token) {
        if (token == null || token.isBlank()) {
            throw new RuntimeException("Missing or empty token");
        }

        // Return from cache if already validated
        if (tokenCache.containsKey(token)) {
            return tokenCache.get(token);
        }

        try {
            String url = userServiceBaseUrl + "/auth/validate?token=" + token;
            // Expects UserAndInterest to return: { "userId": "E1042" }
            @SuppressWarnings("unchecked")
            Map<String, String> response = restTemplate.getForObject(url, Map.class);

            if (response == null || !response.containsKey("userId")) {
                throw new RuntimeException("Invalid token — no userId returned");
            }

            String userId = response.get("userId");
            tokenCache.put(token, userId);   // cache for future requests
            return userId;

        } catch (Exception e) {
            throw new RuntimeException("Token validation failed: " + e.getMessage());
        }
    }

    /**
     * Accepts the full "Bearer <token>" Authorization header value.
     */
    public String extractUserIdFromHeader(String authHeader) {
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            throw new RuntimeException("Missing or malformed Authorization header. " +
                    "Expected format: 'Bearer mock-jwt-xxxx'");
        }
        return extractUserId(authHeader.substring(7).trim());
    }

    public boolean isTokenValid(String token) {
        try {
            extractUserId(token);
            return true;
        } catch (Exception e) {
            return false;
        }
    }

    /**
     * Call this if you need to invalidate a cached token (e.g. on logout).
     */
    public void evictToken(String token) {
        tokenCache.remove(token);
    }
}

