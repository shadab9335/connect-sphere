package com.hobbyconnect.feedservice.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

import java.util.List;

// ─────────────────────────────────────────────────────────────────────────────
// REQUEST / RESPONSE DTOs
// ─────────────────────────────────────────────────────────────────────────────

public class Dtos {

    // ── CreatePostRequest ─────────────────────────────────────────────────────
    // NOTE: This is NOT used as a @RequestBody because the endpoint accepts
    // multipart/form-data. Fields are bound via @RequestParam in the controller.
    // Kept here for documentation purposes only.
    @Data
    public static class CreatePostRequest {
        @NotBlank(message = "Content cannot be empty")
        @Size(max = 1000, message = "Post content cannot exceed 1000 characters")
        private String content;

        @NotBlank(message = "Tag is required")
        private String tag;

        private boolean anonymous;

        private String eventStatus;
        private String eventDate;
        private String eventLocation;
        // images and videos are handled as MultipartFile[], not in this DTO
    }

    // ── CreateReplyRequest ────────────────────────────────────────────────────
    @Data
    public static class CreateReplyRequest {
        @NotBlank(message = "Reply content cannot be empty")
        @Size(max = 500, message = "Reply cannot exceed 500 characters")
        private String content;

        private boolean anonymous;
    }

    // ── FeedPostResponse ──────────────────────────────────────────────────────
    @Data
    public static class FeedPostResponse {
        private String id;
        private String userId;
        private String displayName;
        private String avatar;
        private String avatarColor;
        private boolean anonymous;
        private String content;
        private String tag;

        // 🌟 ADD THIS FIELD HERE:
        private String profilePicture;

        /**
         * List of Base64 data-URI strings for images.
         * Each entry is a complete data-URI: "data:image/jpeg;base64,..."
         * The frontend can use each string directly as an <img src> attribute.
         */
        private List<String> imageDataList;

        /**
         * List of Base64 data-URI strings for videos.
         * Each entry is a complete data-URI: "data:video/mp4;base64,..."
         * The frontend can use each string directly as a <video src> attribute.
         */
        private List<String> videoDataList;

        private int likeCount;
        private int replyCount;
        private String eventStatus;
        private String eventDate;
        private String eventLocation;
        private String createdAt;       // ISO-8601 UTC — frontend formats to "2h ago"
        private String updatedAt;
        private boolean likedByMe;
        private boolean bookmarkedByMe;
    }

    // ── ReplyResponse ─────────────────────────────────────────────────────────
    @Data
    public static class ReplyResponse {
        private String id;
        private String postId;
        private String userId;
        private String displayName;
        private String avatar;
        private String avatarColor;
        private boolean anonymous;
        private String content;
        private String createdAt;
    }

    // ── FeedTabResponse ───────────────────────────────────────────────────────
    @Data
    public static class FeedTabResponse {
        private String id;
        private String emoji;

        public FeedTabResponse(String id, String emoji) {
            this.id = id;
            this.emoji = emoji;
        }
    }

    // ── TimestampFeedResponse ─────────────────────────────────────────────────
    /**
     * Wraps a page of posts returned by the timestamp-cursor feed API.
     * The client should persist {@code nextCursor} and pass it on the next call
     * to continue paging chronologically.
     */
    @Data
    public static class TimestampFeedResponse {
        /** The posts in this batch, newest-first. */
        private List<FeedPostResponse> posts;

        /**
         * ISO-8601 UTC timestamp of the OLDEST post in this batch.
         * Pass this as {@code before} on the next request to get earlier posts.
         * {@code null} when there are no more posts to fetch.
         */
        private String nextCursor;

        /** Total number of posts that match the filter (for progress indicators). */
        private long totalCount;

        /** Whether there are more posts to fetch after this batch. */
        private boolean hasMore;

        public TimestampFeedResponse(List<FeedPostResponse> posts,
                                     String nextCursor,
                                     long totalCount,
                                     boolean hasMore) {
            this.posts = posts;
            this.nextCursor = nextCursor;
            this.totalCount = totalCount;
            this.hasMore = hasMore;
        }
    }

    // ── UpdatePostRequest ─────────────────────────────────────────────────────
    @Data
    public static class UpdatePostRequest {

        @NotBlank(message = "Content cannot be empty")
        @Size(max = 1000, message = "Post content cannot exceed 1000 characters")
        private String content;

        @NotBlank(message = "Tag is required")
        private String tag;

        private boolean anonymous;
    }

    // ── ApiResponse ───────────────────────────────────────────────────────────
    @Data
    public static class ApiResponse<T> {
        private boolean success;
        private String message;
        private T data;

        public ApiResponse(boolean success, String message, T data) {
            this.success = success;
            this.message = message;
            this.data = data;
        }

        public static <T> ApiResponse<T> ok(T data) {
            return new ApiResponse<>(true, "Success", data);
        }

        public static <T> ApiResponse<T> ok(String message, T data) {
            return new ApiResponse<>(true, message, data);
        }

        public static <T> ApiResponse<T> error(String message) {
            return new ApiResponse<>(false, message, null);
        }
    }

    // ── UserProfileDto ────────────────────────────────────────────────────────
    @Data
    public static class UserProfileDto {
        private String userId;
        private String displayName;
        private String avatar;
        private String color;

        // 🌟 ADD THIS NEW FIELD HERE:
        private String profilePicture;
    }
}
