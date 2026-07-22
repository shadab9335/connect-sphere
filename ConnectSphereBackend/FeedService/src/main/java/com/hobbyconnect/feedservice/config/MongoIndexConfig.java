package com.hobbyconnect.feedservice.config;

import com.hobbyconnect.feedservice.model.FeedPost;
import com.hobbyconnect.feedservice.model.PostInteraction;
import com.hobbyconnect.feedservice.model.Reply;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.domain.Sort;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.index.Index;

@Configuration
@RequiredArgsConstructor
public class MongoIndexConfig {

    private final MongoTemplate mongoTemplate;

    /**
     * Ensures all required indexes exist at startup.
     *
     * feed_posts  : index on tag (for filtered feed), createdAt desc (for sorting)
     * feed_posts  : index on userId (for profile page queries)
     * post_replies: index on postId (for fetching replies by post)
     * post_interactions: compound unique index on (userId, postId, type)
     *                    — prevents duplicate likes/bookmarks
     */
    @PostConstruct
    public void ensureIndexes() {

        // feed_posts — tag filter
        mongoTemplate.indexOps(FeedPost.class)
                .ensureIndex(new Index().on("tag", Sort.Direction.ASC));

        // feed_posts — default sort (newest first)
        mongoTemplate.indexOps(FeedPost.class)
                .ensureIndex(new Index().on("createdAt", Sort.Direction.DESC));

        // feed_posts — user's own posts
        mongoTemplate.indexOps(FeedPost.class)
                .ensureIndex(new Index().on("userId", Sort.Direction.ASC));

        // post_replies — replies by post
        mongoTemplate.indexOps(Reply.class)
                .ensureIndex(new Index().on("postId", Sort.Direction.ASC));

        // post_interactions — unique constraint: one like and one bookmark per user per post
        mongoTemplate.indexOps(PostInteraction.class)
                .ensureIndex(new Index()
                        .on("userId", Sort.Direction.ASC)
                        .on("postId", Sort.Direction.ASC)
                        .on("type", Sort.Direction.ASC)
                        .unique());
    }
}
