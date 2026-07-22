package com.hobbyconnect.feedservice.service;

import com.hobbyconnect.feedservice.dto.Dtos.UserProfileDto;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.Collections;
import java.util.List;
import java.util.Map;

/**
 * Calls the UserAndInterest microservice to fetch user profile data,
 * user interests, and the master list of all active interests.
 *
 * Profile data is only fetched ONCE at post-creation time and then
 * stored inside the feed_posts document so feed reads never require
 * a cross-service call.
 *
 * Interests are fetched at tabs-load time to build the personalised
 * tab ordering: All → user's interests → remaining interests.
 */
@Service
public class UserServiceClient {

    private final RestTemplate restTemplate;
    private final String userServiceBaseUrl;

    public UserServiceClient(
            RestTemplate restTemplate,
            @Value("${user.service.base-url}") String userServiceBaseUrl) {
        this.restTemplate = restTemplate;
        this.userServiceBaseUrl = userServiceBaseUrl;
    }

    // ── GET USER PROFILE ──────────────────────────────────────────────────────

    /**
     * GET {userServiceBaseUrl}/api/users/{userId}/profile
     *
     * Returns a minimal UserProfileDto with displayName, avatar, color.
     * Falls back to safe defaults if the user service is unavailable.
     */
    public UserProfileDto getUserProfile(String userId) {
        try {
            String url = userServiceBaseUrl + "/api/users/" + userId + "/profile";
            return restTemplate.getForObject(url, UserProfileDto.class);
        } catch (Exception e) {
            // Graceful fallback — don't fail post creation if user service is down
            UserProfileDto fallback = new UserProfileDto();
            fallback.setUserId(userId);
            fallback.setDisplayName("User " + userId);
            fallback.setAvatar(userId.length() >= 2
                    ? userId.substring(0, 2).toUpperCase()
                    : userId.toUpperCase());
            fallback.setColor("#8892B0");
            return fallback;
        }
    }

    // ── GET USER'S OWN INTERESTS ──────────────────────────────────────────────

    /**
     * GET {userServiceBaseUrl}/api/users/{userId}/interests
     *
     * Returns the list of interest names the logged-in user selected
     * at registration (e.g. ["Cricket", "Gaming", "Movies"]).
     * Used to promote those tabs to the front of the tab bar.
     * Returns an empty list if the call fails so the tab bar still works.
     */
    @SuppressWarnings("unchecked")
    public List<String> getUserInterests(String userId) {
        try {
            String url = userServiceBaseUrl + "/api/users/" + userId + "/interests";
            Map<String, Object> response = restTemplate.getForObject(url, Map.class);
            if (response != null && Boolean.TRUE.equals(response.get("success"))) {
                Object data = response.get("data");
                if (data instanceof List) {
                    return (List<String>) data;
                }
            }
        } catch (Exception e) {
            // Fallback: return empty list — tabs will still load, just without personalisation
        }
        return Collections.emptyList();
    }

    // ── GET ALL ACTIVE INTERESTS ──────────────────────────────────────────────

    /**
     * GET {userServiceBaseUrl}/auth/interests
     *
     * Returns the master list of all active interests from the DB.
     * Each entry is a map with keys: id, label, emoji, description.
     * Used to fill in the "remaining" tabs after the user's interests.
     * Returns an empty list if the call fails.
     */
    @SuppressWarnings("unchecked")
    public List<Map<String, String>> getAllInterests() {
        try {
            String url = userServiceBaseUrl + "/auth/interests";
            Map<String, Object> response = restTemplate.getForObject(url, Map.class);
            if (response != null && Boolean.TRUE.equals(response.get("success"))) {
                Object data = response.get("data");
                if (data instanceof List) {
                    return (List<Map<String, String>>) data;
                }
            }
        } catch (Exception e) {
            // Fallback: return empty list — tabs will still load without the full list
        }
        return Collections.emptyList();
    }
}
