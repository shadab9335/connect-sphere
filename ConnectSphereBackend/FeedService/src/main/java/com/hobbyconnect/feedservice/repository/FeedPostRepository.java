
package com.hobbyconnect.feedservice.repository;

import com.hobbyconnect.feedservice.model.FeedPost;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.time.Instant;
import java.util.List;

@Repository
public interface FeedPostRepository extends MongoRepository<FeedPost, String> {

    // All methods below return only ACTIVE (non-soft-deleted) posts.
    // When we add the Restore / Recently Deleted view next pass, we'll add
    // mirror methods filtering by deleted=true.

    // ── Paginated feed (page-based API) ───────────────────────────────────────
    Page<FeedPost> findByDeletedFalse(Pageable pageable);
    Page<FeedPost> findByTagAndDeletedFalse(String tag, Pageable pageable);

    // ── Counts ────────────────────────────────────────────────────────────────
    long countByDeletedFalse();
    long countByTagAndDeletedFalse(String tag);
    long countByUserIdAndDeletedFalse(String userId);
    long countByCreatedAtBeforeAndDeletedFalse(Instant before);
    long countByTagAndCreatedAtBeforeAndDeletedFalse(String tag, Instant before);

    // ── User's own posts ──────────────────────────────────────────────────────
    List<FeedPost> findByUserIdAndDeletedFalseOrderByCreatedAtDesc(String userId);

    // ── Timestamp-cursor — first page (no cursor) ─────────────────────────────
    List<FeedPost> findByDeletedFalseOrderByCreatedAtDesc(Pageable pageable);
    List<FeedPost> findByTagAndDeletedFalseOrderByCreatedAtDesc(
            String tag, Pageable pageable);

    // ── Timestamp-cursor — continuation pages ─────────────────────────────────
    List<FeedPost> findByCreatedAtBeforeAndDeletedFalseOrderByCreatedAtDesc(
            Instant before, Pageable pageable);
    List<FeedPost> findByTagAndCreatedAtBeforeAndDeletedFalseOrderByCreatedAtDesc(
            String tag, Instant before, Pageable pageable);
}
