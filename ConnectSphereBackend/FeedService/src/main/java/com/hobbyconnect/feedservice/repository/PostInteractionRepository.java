package com.hobbyconnect.feedservice.repository;

import com.hobbyconnect.feedservice.model.PostInteraction;
import com.hobbyconnect.feedservice.model.PostInteraction.InteractionType;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PostInteractionRepository extends MongoRepository<PostInteraction, String> {

    Optional<PostInteraction> findByUserIdAndPostIdAndType(
            String userId, String postId, InteractionType type);

    boolean existsByUserIdAndPostIdAndType(
            String userId, String postId, InteractionType type);

    // All bookmarked posts for a user — returns postIds
    List<PostInteraction> findByUserIdAndType(String userId, InteractionType type);

    void deleteByPostId(String postId);
}
