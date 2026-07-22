package com.hobbyconnect.feedservice.model;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.index.CompoundIndex;
import org.springframework.data.mongodb.core.index.CompoundIndexes;

import java.time.Instant;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "post_interactions")
@CompoundIndexes({
        // Enforces one LIKE and one BOOKMARK per user per post
        @CompoundIndex(name = "unique_interaction", def = "{'userId': 1, 'postId': 1, 'type': 1}", unique = true)
})
public class PostInteraction {

    @Id
    private String id;

    private String userId;
    private String postId;
    private InteractionType type;   // LIKE | BOOKMARK

    private Instant createdAt;

    public enum InteractionType {
        LIKE, BOOKMARK
    }
}
