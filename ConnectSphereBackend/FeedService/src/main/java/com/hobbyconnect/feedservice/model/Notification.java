package com.hobbyconnect.feedservice.model;

import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import java.time.Instant;

@Data
@Document(collection = "notifications")
public class Notification {
    @Id
    private String id;
    private String recipientUserId;    // User B (the post author)
    private String actorUserId;        // User A (the liker)
    private String actorName;          // User A's name
    private String actorProfilePic;    // User A's avatar picture
    private String type = "POST_LIKE"; // "POST_LIKE", "EVENT_UPDATE", etc.
    private String postId;
    private String postImageThumbnail; // First picture from User B's post
    private String message;
    private boolean read = false;
    private Instant createdAt = Instant.now();
}