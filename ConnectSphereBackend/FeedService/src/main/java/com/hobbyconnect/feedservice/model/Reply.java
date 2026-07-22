package com.hobbyconnect.feedservice.model;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.index.Indexed;

import java.time.Instant;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "post_replies")
public class Reply {

    @Id
    private String id;

    @Indexed
    private String postId;          // references feed_posts._id

    // ── Author info ────────────────────────────────────────────────────────────
    private String userId;
    private String displayName;
    private String avatar;
    private String avatarColor;
    private boolean anonymous;

    // ── Content ───────────────────────────────────────────────────────────────
    private String content;

    // ── Timestamp ─────────────────────────────────────────────────────────────
    private Instant createdAt;
}
