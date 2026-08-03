package com.hobbyconnect.feedservice.model;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.index.Indexed;

import java.time.Instant;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "feed_posts")
public class FeedPost {

    @Id
    private String id;

    // ── Author info ────────────────────────────────────────────────────────────
    @Indexed
    private String userId;
    private String displayName;
    private String avatar;
    private String avatarColor;
    private boolean anonymous;

    // ── Post content ──────────────────────────────────────────────────────────
    private String content;
    @Indexed
    private String tag;


    /**
     * Images stored as Base64 data-URI strings.
     * Format per entry: "data:<mimeType>;base64,<encodedBytes>"
     * Frontend uses directly as <img src="..."> — no separate HTTP fetch needed.
     * Max 10 images per post, each up to 10 MB.
     */
    private List<String> imageDataList;

    /**
     * Videos stored as Base64 data-URI strings.
     * Format per entry: "data:<mimeType>;base64,<encodedBytes>"
     * Frontend uses directly as <video src="..."> — no separate HTTP fetch needed.
     * Max 3 videos per post, each up to 50 MB.
     */
    private List<String> videoDataList;

    // ── Engagement counts ──────────────────────────────────────────────────────
    private int likeCount;
    private int replyCount;

    // ── Event metadata ─────────────────────────────────────────────────────────
    private String eventStatus;
    private String eventDate;
    private String eventLocation;

    // ── Likes tracking ─────────────────────────────────────────────────────────
    /**
     * Holds the MongoDB ObjectIds (as Strings) of all users who have liked this post.
     * Used for sending like notifications to the post owner.
     */
    private List<String> likedBy = new java.util.ArrayList<>();

    // ── Timestamps ─────────────────────────────────────────────────────────────
    @Indexed
    private Instant createdAt;
    private Instant updatedAt;

    // ── Soft-delete state ──────────────────────────────────────────────────────
    /**
     * When true, this post is hidden from every read query but still lives
     * in MongoDB. The future Restore feature flips this back to false.
     */
    @Indexed
    private boolean deleted = false;

    /** When the post was soft-deleted (null if active). */
    private Instant deletedAt;
}
