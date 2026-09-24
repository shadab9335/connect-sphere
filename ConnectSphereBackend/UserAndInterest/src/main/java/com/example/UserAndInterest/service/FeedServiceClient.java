package com.example.UserAndInterest.service;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.Map;

/**
 * Calls the FeedService microservice to create notifications for users
 * (e.g. when a connection request is made) so the notification panel
 * in the app can surface them alongside post-like/comment notifications.
 */
@Service
@Slf4j
public class FeedServiceClient {

    private final RestTemplate restTemplate;
    private final String feedServiceBaseUrl;

    public FeedServiceClient(
            RestTemplate restTemplate,
            @Value("${feed.service.base-url}") String feedServiceBaseUrl) {
        this.restTemplate = restTemplate;
        this.feedServiceBaseUrl = feedServiceBaseUrl;
    }

    /**
     * POST {feedServiceBaseUrl}/api/feed/notifications/internal
     *
     * Fire-and-forget: a notification failure must never break the
     * connect flow, so any exception is logged and swallowed.
     */
    public void createConnectionNotification(
            String recipientUserId,
            String actorUserId,
            String actorName,
            String actorProfilePic,
            String message) {
        try {
            String url = feedServiceBaseUrl + "/api/feed/notifications/internal";
            Map<String, String> body = Map.of(
                    "recipientUserId", recipientUserId,
                    "actorUserId", actorUserId,
                    "actorName", actorName == null ? "" : actorName,
                    "actorProfilePic", actorProfilePic == null ? "" : actorProfilePic,
                    "type", "CONNECTION",
                    "message", message
            );
            restTemplate.postForObject(url, body, Map.class);
        } catch (Exception e) {
            log.error("Failed to create connection notification for recipient {}", recipientUserId, e);
        }
    }
}
