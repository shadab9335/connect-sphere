package com.hobbyconnect.feedservice.controller;

import com.hobbyconnect.feedservice.dto.Dtos.*;
import com.hobbyconnect.feedservice.model.Notification;
import com.hobbyconnect.feedservice.repository.NotificationRepository;
import com.hobbyconnect.feedservice.service.FeedService;
import com.hobbyconnect.feedservice.util.JwtUtil;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.data.domain.Page;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import java.io.IOException;
import java.util.List;

@RestController
@RequestMapping("/api/feed")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class FeedController {

    private final FeedService feedService;
    private final JwtUtil jwtUtil;

    @Bean
    public WebMvcConfigurer corsConfigurer() {
        return new WebMvcConfigurer() {
            @Override
            public void addCorsMappings(CorsRegistry registry) {
                registry.addMapping("/**").allowedOrigins("*").allowedMethods("*");
            }
        };
    }

    // ─────────────────────────────────────────────────────────────────────────
    // TABS — personalised, DB-driven
    // ─────────────────────────────────────────────────────────────────────────

    /**
     * GET /api/feed/tabs
     * Header: Authorization: Bearer <token>
     *
     * Returns tabs ordered as:
     *   1. All  (always first)
     *   2. Logged-in user's own interests  (promoted to front)
     *   3. All remaining active interests  (rest of DB list)
     */
    @GetMapping("/tabs")
    public ResponseEntity<ApiResponse<List<FeedTabResponse>>> getTabs(
            @RequestHeader("Authorization") String authHeader) {
        String userId = jwtUtil.extractUserIdFromHeader(authHeader);
        List<FeedTabResponse> tabs = feedService.getTabs(userId);
        return ResponseEntity.ok(ApiResponse.ok(tabs));
    }

    // ─────────────────────────────────────────────────────────────────────────
    // POSTS — READ (page-based, original API)
    // ─────────────────────────────────────────────────────────────────────────

    @GetMapping("/posts")
    public ResponseEntity<ApiResponse<Page<FeedPostResponse>>> getFeed(
            @RequestHeader("Authorization") String authHeader,
            @RequestParam(required = false) String tag,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {

        String userId = jwtUtil.extractUserIdFromHeader(authHeader);
        Page<FeedPostResponse> feed = feedService.getFeed(tag, page, size, userId);
        return ResponseEntity.ok(ApiResponse.ok(feed));
    }

    // ─────────────────────────────────────────────────────────────────────────
    // POSTS — READ (timestamp-cursor)
    // ─────────────────────────────────────────────────────────────────────────

    @GetMapping("/posts/timeline")
    public ResponseEntity<ApiResponse<TimestampFeedResponse>> getFeedByTimestamp(
            @RequestHeader("Authorization") String authHeader,
            @RequestParam(required = false) String tag,
            @RequestParam(required = false) String before,
            @RequestParam(defaultValue = "20") int size) {

        String userId = jwtUtil.extractUserIdFromHeader(authHeader);
        TimestampFeedResponse result = feedService.getFeedByTimestamp(tag, before, size, userId);
        return ResponseEntity.ok(ApiResponse.ok(result));
    }

    // ─────────────────────────────────────────────────────────────────────────
    // POSTS — CREATE
    // ─────────────────────────────────────────────────────────────────────────

    @PostMapping(value = "/posts", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ApiResponse<FeedPostResponse>> createPost(
            @RequestHeader("Authorization") String authHeader,
            @RequestParam String content,
            @RequestParam String tag,
            @RequestParam(defaultValue = "false") boolean anonymous,
            @RequestParam(required = false) String eventStatus,
            @RequestParam(required = false) String eventDate,
            @RequestParam(required = false) String eventLocation,
            @RequestParam(required = false) MultipartFile[] images,
            @RequestParam(required = false) MultipartFile[] videos) throws IOException {

        String userId = jwtUtil.extractUserIdFromHeader(authHeader);
        FeedPostResponse response = feedService.createPost(
                userId, content, tag, anonymous,
                eventStatus, eventDate, eventLocation,
                images, videos);

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok("Post created successfully", response));
    }

    @GetMapping("/user/{userId}/posts/count")
    public ResponseEntity<ApiResponse<Long>> getPostCount(
            @RequestHeader("Authorization") String authHeader,
            @PathVariable String userId) {

        jwtUtil.extractUserIdFromHeader(authHeader);
        long count = feedService.getPostCountByUserId(userId);
        return ResponseEntity.ok(ApiResponse.ok("Post count retrieved", count));
    }

    // ─────────────────────────────────────────────────────────────────────────
    // POSTS — SINGLE / UPDATE / DELETE
    // ─────────────────────────────────────────────────────────────────────────

    @GetMapping("/posts/{id}")
    public ResponseEntity<ApiResponse<FeedPostResponse>> getPost(
            @RequestHeader("Authorization") String authHeader,
            @PathVariable String id) {

        String userId = jwtUtil.extractUserIdFromHeader(authHeader);
        return ResponseEntity.ok(ApiResponse.ok(feedService.getPostById(id, userId)));
    }

    @DeleteMapping("/posts/{id}")
    public ResponseEntity<ApiResponse<Void>> deletePost(
            @RequestHeader("Authorization") String authHeader,
            @PathVariable String id) {

        String userId = jwtUtil.extractUserIdFromHeader(authHeader);
        feedService.deletePost(id, userId);
        return ResponseEntity.ok(ApiResponse.ok("Post deleted", null));
    }

    @PutMapping("/posts/{id}")
    public ResponseEntity<ApiResponse<FeedPostResponse>> updatePost(
            @RequestHeader("Authorization") String authHeader,
            @PathVariable String id,
            @RequestBody @Valid UpdatePostRequest request) {
        String userId = jwtUtil.extractUserIdFromHeader(authHeader);
        FeedPostResponse response = feedService.updatePost(id, userId, request);
        return ResponseEntity.ok(ApiResponse.ok("Post updated successfully", response));
    }

    // ─────────────────────────────────────────────────────────────────────────
    // LIKES
    // ─────────────────────────────────────────────────────────────────────────

    @PostMapping("/posts/{id}/like")
    public ResponseEntity<ApiResponse<FeedPostResponse>> likePost(
            @RequestHeader("Authorization") String authHeader,
            @PathVariable String id) {

        String userId = jwtUtil.extractUserIdFromHeader(authHeader);
        return ResponseEntity.ok(ApiResponse.ok(feedService.likePost(id, userId)));
    }

    @DeleteMapping("/posts/{id}/like")
    public ResponseEntity<ApiResponse<FeedPostResponse>> unlikePost(
            @RequestHeader("Authorization") String authHeader,
            @PathVariable String id) {

        String userId = jwtUtil.extractUserIdFromHeader(authHeader);
        return ResponseEntity.ok(ApiResponse.ok(feedService.unlikePost(id, userId)));
    }

    // ─────────────────────────────────────────────────────────────────────────
    // BOOKMARKS
    // ─────────────────────────────────────────────────────────────────────────

    @PostMapping("/posts/{id}/bookmark")
    public ResponseEntity<ApiResponse<Void>> bookmark(
            @RequestHeader("Authorization") String authHeader,
            @PathVariable String id) {

        String userId = jwtUtil.extractUserIdFromHeader(authHeader);
        feedService.bookmarkPost(id, userId);
        return ResponseEntity.ok(ApiResponse.ok("Bookmarked", null));
    }

    @DeleteMapping("/posts/{id}/bookmark")
    public ResponseEntity<ApiResponse<Void>> removeBookmark(
            @RequestHeader("Authorization") String authHeader,
            @PathVariable String id) {

        String userId = jwtUtil.extractUserIdFromHeader(authHeader);
        feedService.removeBookmark(id, userId);
        return ResponseEntity.ok(ApiResponse.ok("Bookmark removed", null));
    }

    // ─────────────────────────────────────────────────────────────────────────
    // REPLIES
    // ─────────────────────────────────────────────────────────────────────────

    @GetMapping("/posts/{id}/replies")
    public ResponseEntity<ApiResponse<List<ReplyResponse>>> getReplies(
            @RequestHeader("Authorization") String authHeader,
            @PathVariable String id) {

        jwtUtil.extractUserIdFromHeader(authHeader);
        return ResponseEntity.ok(ApiResponse.ok(feedService.getReplies(id)));
    }

    @PostMapping("/posts/{id}/replies")
    public ResponseEntity<ApiResponse<ReplyResponse>> addReply(
            @RequestHeader("Authorization") String authHeader,
            @PathVariable String id,
            @RequestBody CreateReplyRequest request) {

        String userId = jwtUtil.extractUserIdFromHeader(authHeader);
        ReplyResponse reply = feedService.addReply(
                id, userId, request.getContent(), request.isAnonymous());

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok("Reply added", reply));
    }

    @DeleteMapping("/replies/{replyId}")
    public ResponseEntity<ApiResponse<Void>> deleteReply(
            @RequestHeader("Authorization") String authHeader,
            @PathVariable String replyId) {

        String userId = jwtUtil.extractUserIdFromHeader(authHeader);
        feedService.deleteReply(replyId, userId);
        return ResponseEntity.ok(ApiResponse.ok("Reply deleted", null));
    }

    // ─────────────────────────────────────────────────────────────────────────
    // USER-SCOPED
    // ─────────────────────────────────────────────────────────────────────────

    @GetMapping("/user/{userId}/posts")
    public ResponseEntity<ApiResponse<List<FeedPostResponse>>> getUserPosts(
            @RequestHeader("Authorization") String authHeader,
            @PathVariable String userId) {

        String requestingUserId = jwtUtil.extractUserIdFromHeader(authHeader);
        return ResponseEntity.ok(
                ApiResponse.ok(feedService.getPostsByUser(userId, requestingUserId)));
    }

    @GetMapping("/user/{userId}/bookmarks")
    public ResponseEntity<ApiResponse<List<FeedPostResponse>>> getUserBookmarks(
            @RequestHeader("Authorization") String authHeader,
            @PathVariable String userId) {

        String requestingUserId = jwtUtil.extractUserIdFromHeader(authHeader);
        if (!requestingUserId.equals(userId)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(ApiResponse.error("You can only view your own bookmarks"));
        }
        return ResponseEntity.ok(ApiResponse.ok(feedService.getBookmarkedPosts(userId)));
    }

    private final NotificationRepository notificationRepo;

    @GetMapping("/notifications")
    public ResponseEntity<ApiResponse<List<Notification>>> getMyNotifications(
            @RequestHeader("Authorization") String authHeader) {
        String userId = jwtUtil.extractUserIdFromHeader(authHeader);
        List<Notification> list = notificationRepo.findByRecipientUserIdAndReadFalseOrderByCreatedAtDesc(userId);
        return ResponseEntity.ok(ApiResponse.ok(list));
    }

    @DeleteMapping("/notifications/{id}")
    public ResponseEntity<ApiResponse<Void>> dismissNotification(
            @RequestHeader("Authorization") String authHeader,
            @PathVariable String id) {
        String userId = jwtUtil.extractUserIdFromHeader(authHeader);
        notificationRepo.deleteByRecipientUserIdAndId(userId, id);
        return ResponseEntity.ok(ApiResponse.ok("Notification dismissed", null));
    }

    @DeleteMapping("/notifications/clear-all")
    public ResponseEntity<ApiResponse<Void>> clearAllNotifications(
            @RequestHeader("Authorization") String authHeader) {
        String userId = jwtUtil.extractUserIdFromHeader(authHeader);
        notificationRepo.deleteAllByRecipientUserId(userId);
        return ResponseEntity.ok(ApiResponse.ok("All notifications cleared", null));
    }
}
