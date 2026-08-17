package com.hobbyconnect.feedservice.service;

import com.hobbyconnect.feedservice.dto.Dtos;
import com.hobbyconnect.feedservice.dto.Dtos.*;
import com.hobbyconnect.feedservice.exception.ResourceNotFoundException;
import com.hobbyconnect.feedservice.exception.UnauthorizedException;
import com.hobbyconnect.feedservice.model.FeedPost;
import com.hobbyconnect.feedservice.model.Notification;
import com.hobbyconnect.feedservice.model.PostInteraction;
import com.hobbyconnect.feedservice.model.PostInteraction.InteractionType;
import com.hobbyconnect.feedservice.model.Reply;
import com.hobbyconnect.feedservice.repository.FeedPostRepository;
import com.hobbyconnect.feedservice.repository.NotificationRepository;
import com.hobbyconnect.feedservice.repository.PostInteractionRepository;
import com.hobbyconnect.feedservice.repository.ReplyRepository;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.*;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.time.Instant;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class FeedService {

    private final FeedPostRepository postRepo;
    private final ReplyRepository replyRepo;
    private final PostInteractionRepository interactionRepo;
    private final MediaStorageService mediaStorageService;
    private final UserServiceClient userServiceClient;
    private final NotificationRepository notificationRepo;

    private static final DateTimeFormatter ISO_FMT =
            DateTimeFormatter.ISO_INSTANT.withZone(ZoneId.of("UTC"));

    // Emoji map — one emoji per interest tag, used when building tab responses.
    // Add a new entry here whenever a new interest is added to the DB.
    private static final Map<String, String> TAG_EMOJI = Map.ofEntries(
            Map.entry("All",         "✨"),
            Map.entry("Cricket",     "🏏"),
            Map.entry("Movies",      "🎬"),
            Map.entry("Travel",      "✈️"),
            Map.entry("Cycling",     "🚴"),
            Map.entry("Running",     "🏃"),
            Map.entry("Chess",       "♟️"),
            Map.entry("Gaming",      "🎮"),
            Map.entry("Photography", "📸"),
            Map.entry("Music",       "🎵"),
            Map.entry("Cooking",     "🍳"),
            Map.entry("Yoga",        "🧘"),
            Map.entry("General",     "💬"),
            Map.entry("Badminton",   "🏸")
    );

    // ─────────────────────────────────────────────────────────────────────────
    // TABS — personalised ordering
    // ─────────────────────────────────────────────────────────────────────────

    /**
     * Returns the feed tabs ordered as:
     *   1. "All"  (always first)
     *   2. The logged-in user's own interests  (promoted to the front)
     *   3. All remaining interests  (alphabetical / DB order)
     *
     * Called by GET /api/feed/tabs  (requires Authorization header)
     */
    public List<FeedTabResponse> getTabs(String userId) {

        // Step 1 — fetch the logged-in user's interest names from UserService
        List<String> userInterests = userServiceClient.getUserInterests(userId);
        // Use a LinkedHashSet to preserve order and enable O(1) contains checks
        Set<String> userInterestSet = new LinkedHashSet<>(userInterests);

        // Step 2 — fetch the master list of all active interests from UserService
        List<Map<String, String>> allInterests = userServiceClient.getAllInterests();

        // Step 3 — build the ordered tab list
        List<FeedTabResponse> tabs = new ArrayList<>();

        // "All" is always pinned at position 0
        tabs.add(new FeedTabResponse("All", TAG_EMOJI.getOrDefault("All", "✨")));

        // User's own interests come next, in registration order
        for (String interest : userInterests) {
            tabs.add(new FeedTabResponse(
                    interest,
                    TAG_EMOJI.getOrDefault(interest, "🏷️")
            ));
        }

        // Remaining interests (not in the user's list), in DB order
        for (Map<String, String> interest : allInterests) {
            String label = interest.get("label");
            if (label != null && !label.equals("All") && !userInterestSet.contains(label)) {
                tabs.add(new FeedTabResponse(
                        label,
                        TAG_EMOJI.getOrDefault(label, "🏷️")
                ));
            }
        }

        return tabs;
    }

    // ─────────────────────────────────────────────────────────────────────────
    // POSTS — CREATE
    // ─────────────────────────────────────────────────────────────────────────

    public FeedPostResponse createPost(
            String userId,
            String content,
            String tag,
            boolean anonymous,
            String eventStatus,
            String eventDate,
            String eventLocation,
            MultipartFile[] images,
            MultipartFile[] videos) throws IOException {

        UserProfileDto profile = userServiceClient.getUserProfile(userId);

        List<String> imageDataList = mediaStorageService.storeImages(images);
        List<String> videoDataList = mediaStorageService.storeVideos(videos);

        FeedPost post = new FeedPost();
        post.setUserId(userId);
        post.setDisplayName(anonymous ? "Anonymous" : profile.getDisplayName());
        post.setAvatar(anonymous ? "?"          : profile.getAvatar());
        post.setAvatarColor(anonymous ? "#8892B0" : profile.getColor());
        post.setAnonymous(anonymous);
        post.setContent(content);
        post.setTag(tag);
        post.setImageDataList(imageDataList.isEmpty() ? null : imageDataList);
        post.setVideoDataList(videoDataList.isEmpty() ? null : videoDataList);
        post.setEventStatus(eventStatus != null ? eventStatus : "none");
        post.setEventDate(eventDate);
        post.setEventLocation(eventLocation);
        post.setLikeCount(0);
        post.setReplyCount(0);
        post.setCreatedAt(Instant.now());
        post.setUpdatedAt(Instant.now());

        FeedPost saved = postRepo.save(post);
        return toPostResponse(saved, userId);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // POSTS — READ (page-based)
    // ─────────────────────────────────────────────────────────────────────────

//    public Page<FeedPostResponse> getFeed(String tag, int page, int size, String requestingUserId) {
//        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
//        Page<FeedPost> posts = (tag == null || tag.equalsIgnoreCase("All"))
//                ? postRepo.findByDeletedFalse(pageable)
//                : postRepo.findByTagAndDeletedFalse(tag, pageable);
//        return posts.map(p -> toPostResponse(p, requestingUserId));
//    }

    public Page<FeedPostResponse> getFeed(String tag, int page, int size, String requestingUserId) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        Page<FeedPost> posts = (tag == null || tag.equalsIgnoreCase("All"))
                ? postRepo.findByDeletedFalse(pageable)
                : postRepo.findByTagAndDeletedFalse(tag, pageable);

        // 1. Pre-fetch live profile values for non-anonymous posters on this page segment
        Set<String> publicUserIds = posts.stream()
                .filter(p -> !p.isAnonymous() && p.getUserId() != null)
                .map(FeedPost::getUserId)
                .collect(Collectors.toSet());

        Map<String, com.hobbyconnect.feedservice.dto.Dtos.UserProfileDto> userProfileMap = publicUserIds.stream()
                .collect(Collectors.toMap(
                        userId -> userId,
                        userId -> {
                            try {
                                return userServiceClient.getUserProfile(userId);
                            } catch (Exception e) {
                                return null;
                            }
                        },
                        (existing, replacement) -> existing
                ));

        // 2. Map to responses passing the corresponding live profile data object
        return posts.map(p -> {
            com.hobbyconnect.feedservice.dto.Dtos.UserProfileDto liveProfile =
                    (p.getUserId() != null) ? userProfileMap.get(p.getUserId()) : null;

            return toPostResponse(p, requestingUserId, liveProfile);
        });
    }

    // ─────────────────────────────────────────────────────────────────────────
    // POSTS — READ (timestamp-cursor)
    // ─────────────────────────────────────────────────────────────────────────

    public TimestampFeedResponse getFeedByTimestamp(
            String tag, String before, int size, String requestingUserId) {

        boolean isAllTags = (tag == null || tag.equalsIgnoreCase("All"));
        Pageable pageable = PageRequest.of(0, size + 1);

        List<FeedPost> raw;
        long totalCount;

        if (before == null || before.isBlank()) {
            raw = isAllTags
                    ? postRepo.findByDeletedFalseOrderByCreatedAtDesc(pageable)
                    : postRepo.findByTagAndDeletedFalseOrderByCreatedAtDesc(tag, pageable);
            totalCount = isAllTags
                    ? postRepo.countByDeletedFalse()
                    : postRepo.countByTagAndDeletedFalse(tag);
        } else {
            Instant cursor = Instant.parse(before);
            raw = isAllTags
                    ? postRepo.findByCreatedAtBeforeAndDeletedFalseOrderByCreatedAtDesc(cursor, pageable)
                    : postRepo.findByTagAndCreatedAtBeforeAndDeletedFalseOrderByCreatedAtDesc(tag, cursor, pageable);
            totalCount = isAllTags
                    ? postRepo.countByCreatedAtBeforeAndDeletedFalse(cursor)
                    : postRepo.countByTagAndCreatedAtBeforeAndDeletedFalse(tag, cursor);
        }

        boolean hasMore = raw.size() > size;
        List<FeedPost> pageList = hasMore ? raw.subList(0, size) : raw;

        List<FeedPostResponse> responses = pageList.stream()
                .map(p -> toPostResponse(p, requestingUserId))
                .collect(Collectors.toList());

        String nextCursor = (hasMore && !pageList.isEmpty())
                ? ISO_FMT.format(pageList.get(pageList.size() - 1).getCreatedAt())
                : null;

        return new TimestampFeedResponse(responses, nextCursor, totalCount, hasMore);
    }

    public FeedPostResponse getPostById(String postId, String requestingUserId) {
        FeedPost post = postRepo.findById(postId)
                .orElseThrow(() -> new ResourceNotFoundException("Post not found: " + postId));
        if (post.isDeleted()) {
            throw new ResourceNotFoundException("Post not found: " + postId);
        }
        return toPostResponse(post, requestingUserId);
    }

    public void deletePost(String postId, String requestingUserId) {
        FeedPost post = postRepo.findById(postId)
                .orElseThrow(() -> new ResourceNotFoundException("Post not found: " + postId));

        if (!post.getUserId().equals(requestingUserId)) {
            throw new UnauthorizedException("You can only delete your own posts");
        }

        if (post.isDeleted()) {
            return;
        }

        post.setDeleted(true);
        post.setDeletedAt(Instant.now());
        postRepo.save(post);
    }

    public FeedPostResponse updatePost(String postId, String requestingUserId, UpdatePostRequest request) {
        FeedPost post = postRepo.findById(postId)
                .orElseThrow(() -> new ResourceNotFoundException("Post not found: " + postId));
        if (post.isDeleted()) {
            throw new ResourceNotFoundException("Post not found: " + postId);
        }
        if (!post.getUserId().equals(requestingUserId)) {
            throw new UnauthorizedException("you can update your own post");
        }
        post.setContent(request.getContent());
        post.setTag(request.getTag());
        post.setAnonymous(request.isAnonymous());
        post.setUpdatedAt(Instant.now());
        FeedPost saved = postRepo.save(post);
        return toPostResponse(saved, requestingUserId);
    }

    public long getPostCountByUserId(String userId) {
        return postRepo.countByUserIdAndDeletedFalse(userId);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // LIKES
    // ─────────────────────────────────────────────────────────────────────────

//    public FeedPostResponse likePost(String postId, String userId) {
//        FeedPost post = postRepo.findById(postId)
//                .orElseThrow(() -> new ResourceNotFoundException("Post not found: " + postId));
//        if (post.isDeleted()) {
//            throw new ResourceNotFoundException("Post not found: " + postId);
//        }
//
//        if (!interactionRepo.existsByUserIdAndPostIdAndType(userId, postId, InteractionType.LIKE)) {
//            PostInteraction like = new PostInteraction();
//            like.setUserId(userId);
//            like.setPostId(postId);
//            like.setType(InteractionType.LIKE);
//            like.setCreatedAt(Instant.now());
//            interactionRepo.save(like);
//            post.setLikeCount(post.getLikeCount() + 1);
//            post.setUpdatedAt(Instant.now());
//            postRepo.save(post);
//        }
//
//        return toPostResponse(post, userId);
//    }
//
//    public FeedPostResponse unlikePost(String postId, String userId) {
//        FeedPost post = postRepo.findById(postId)
//                .orElseThrow(() -> new ResourceNotFoundException("Post not found: " + postId));
//        if (post.isDeleted()) {
//            throw new ResourceNotFoundException("Post not found: " + postId);
//        }
//
//        interactionRepo.findByUserIdAndPostIdAndType(userId, postId, InteractionType.LIKE)
//                .ifPresent(like -> {
//                    interactionRepo.delete(like);
//                    post.setLikeCount(Math.max(0, post.getLikeCount() - 1));
//                    post.setUpdatedAt(Instant.now());
//                    postRepo.save(post);
//                });
//
//        return toPostResponse(post, userId);
//    }


    // ─────────────────────────────────────────────────────────────────────────
    // LIKES
    // ─────────────────────────────────────────────────────────────────────────

//    public FeedPostResponse likePost(String postId, String userId) {
//        FeedPost post = postRepo.findById(postId)
//                .orElseThrow(() -> new ResourceNotFoundException("Post not found: " + postId));
//        if (post.isDeleted()) {
//            throw new ResourceNotFoundException("Post not found: " + postId);
//        }
//
//        if (!interactionRepo.existsByUserIdAndPostIdAndType(userId, postId, InteractionType.LIKE)) {
//            // 1. Record interaction
//            PostInteraction like = new PostInteraction();
//            like.setUserId(userId);
//            like.setPostId(postId);
//            like.setType(InteractionType.LIKE);
//            like.setCreatedAt(Instant.now());
//            interactionRepo.save(like);
//
//            // 2. Initialize likedBy list if null
//            if (post.getLikedBy() == null) {
//                post.setLikedBy(new ArrayList<>());
//            }
//
//            // 3. Append userId to likedBy list
//            if (!post.getLikedBy().contains(userId)) {
//                post.getLikedBy().add(userId);
//            }
//
//            // 4. Update count and timestamp
//            post.setLikeCount(post.getLikeCount() + 1);
//            post.setUpdatedAt(Instant.now());
//            postRepo.save(post);
//        }
//
//        return toPostResponse(post, userId);
//    }


    public FeedPostResponse likePost(String postId, String userId) {
        FeedPost post = postRepo.findById(postId)
                .orElseThrow(() -> new ResourceNotFoundException("Post not found: " + postId));
        if (post.isDeleted()) {
            throw new ResourceNotFoundException("Post not found: " + postId);
        }

        if (!interactionRepo.existsByUserIdAndPostIdAndType(userId, postId, InteractionType.LIKE)) {
            PostInteraction like = new PostInteraction();
            like.setUserId(userId);
            like.setPostId(postId);
            like.setType(InteractionType.LIKE);
            like.setCreatedAt(Instant.now());
            interactionRepo.save(like);

            if (post.getLikedBy() == null) {
                post.setLikedBy(new ArrayList<>());
            }

            if (!post.getLikedBy().contains(userId)) {
                post.getLikedBy().add(userId);
            }

            post.setLikeCount(post.getLikeCount() + 1);
            post.setUpdatedAt(Instant.now());
            postRepo.save(post);

            // 🌟 CREATE NOTIFICATION IF LIKING SOMEONE ELSE'S POST
            if (!post.getUserId().equals(userId)) {
                UserProfileDto likerProfile = userServiceClient.getUserProfile(userId);

                Notification notif = new Notification();
                notif.setRecipientUserId(post.getUserId()); // Post author (User B)
                notif.setActorUserId(userId);                // Liker (User A)
                notif.setActorName(likerProfile.getDisplayName());
                notif.setActorProfilePic(likerProfile.getProfilePicture());
                notif.setPostId(postId);

                // Get the post thumbnail (if the post has an image)
                if (post.getImageDataList() != null && !post.getImageDataList().isEmpty()) {
                    notif.setPostImageThumbnail(post.getImageDataList().get(0));
                }

                notif.setMessage(likerProfile.getDisplayName() + " liked your post.");
                notificationRepo.save(notif);
            }
        }

        return toPostResponse(post, userId);
    }

    public FeedPostResponse unlikePost(String postId, String userId) {
        FeedPost post = postRepo.findById(postId)
                .orElseThrow(() -> new ResourceNotFoundException("Post not found: " + postId));
        if (post.isDeleted()) {
            throw new ResourceNotFoundException("Post not found: " + postId);
        }

        interactionRepo.findByUserIdAndPostIdAndType(userId, postId, InteractionType.LIKE)
                .ifPresent(like -> {
                    interactionRepo.delete(like);

                    // 1. Remove userId from likedBy list if present
                    if (post.getLikedBy() != null) {
                        post.getLikedBy().remove(userId);
                    }

                    // 2. Decrement count
                    post.setLikeCount(Math.max(0, post.getLikeCount() - 1));
                    post.setUpdatedAt(Instant.now());
                    postRepo.save(post);
                });

        return toPostResponse(post, userId);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // BOOKMARKS
    // ─────────────────────────────────────────────────────────────────────────

    public void bookmarkPost(String postId, String userId) {
        FeedPost post = postRepo.findById(postId)
                .orElseThrow(() -> new ResourceNotFoundException("Post not found: " + postId));
        if (post.isDeleted()) {
            throw new ResourceNotFoundException("Post not found: " + postId);
        }

        if (!interactionRepo.existsByUserIdAndPostIdAndType(userId, postId, InteractionType.BOOKMARK)) {
            PostInteraction bm = new PostInteraction();
            bm.setUserId(userId);
            bm.setPostId(postId);
            bm.setType(InteractionType.BOOKMARK);
            bm.setCreatedAt(Instant.now());
            interactionRepo.save(bm);
        }
    }

    public void removeBookmark(String postId, String userId) {
        interactionRepo.findByUserIdAndPostIdAndType(userId, postId, InteractionType.BOOKMARK)
                .ifPresent(interactionRepo::delete);
    }

    public List<FeedPostResponse> getBookmarkedPosts(String userId) {
        List<String> ids = interactionRepo
                .findByUserIdAndType(userId, InteractionType.BOOKMARK)
                .stream()
                .map(PostInteraction::getPostId)
                .collect(Collectors.toList());

        return postRepo.findAllById(ids)
                .stream()
                .filter(p -> !p.isDeleted())
                .map(p -> toPostResponse(p, userId))
                .collect(Collectors.toList());
    }

    // ─────────────────────────────────────────────────────────────────────────
    // REPLIES
    // ─────────────────────────────────────────────────────────────────────────

    public ReplyResponse addReply(String postId, String userId,
                                  String content, boolean anonymous) {
        FeedPost post = postRepo.findById(postId)
                .orElseThrow(() -> new ResourceNotFoundException("Post not found: " + postId));
        if (post.isDeleted()) {
            throw new ResourceNotFoundException("Post not found: " + postId);
        }

        UserProfileDto profile = userServiceClient.getUserProfile(userId);

        Reply reply = new Reply();
        reply.setPostId(postId);
        reply.setUserId(userId);
        reply.setDisplayName(anonymous ? "Anonymous" : profile.getDisplayName());
        reply.setAvatar(anonymous ? "?"          : profile.getAvatar());
        reply.setAvatarColor(anonymous ? "#8892B0" : profile.getColor());
        reply.setAnonymous(anonymous);
        reply.setContent(content);
        reply.setCreatedAt(Instant.now());

        Reply saved = replyRepo.save(reply);
        post.setReplyCount(post.getReplyCount() + 1);
        post.setUpdatedAt(Instant.now());
        postRepo.save(post);
        // 🌟 CREATE NOTIFICATION IF REPLYING TO SOMEONE ELSE'S POST
        if (!post.getUserId().equals(userId)) {
            Notification notif = new Notification();
            notif.setRecipientUserId(post.getUserId()); // Post author
            notif.setActorUserId(userId);                // Commenter
            notif.setActorName(profile.getDisplayName());
            notif.setActorProfilePic(profile.getProfilePicture());
            notif.setPostId(postId);

            if (post.getImageDataList() != null && !post.getImageDataList().isEmpty()) {
                notif.setPostImageThumbnail(post.getImageDataList().get(0));
            }

            notif.setMessage(profile.getDisplayName() + " commented on your post.");
            notificationRepo.save(notif);
        }

        return toReplyResponse(saved);
    }

    public List<ReplyResponse> getReplies(String postId) {
        FeedPost post = postRepo.findById(postId)
                .orElseThrow(() -> new ResourceNotFoundException("Post not found: " + postId));
        if (post.isDeleted()) {
            throw new ResourceNotFoundException("Post not found: " + postId);
        }
        return replyRepo.findByPostIdOrderByCreatedAtAsc(postId)
                .stream()
                .map(this::toReplyResponse)
                .collect(Collectors.toList());
    }

    public void deleteReply(String replyId, String requestingUserId) {
        Reply reply = replyRepo.findById(replyId)
                .orElseThrow(() -> new ResourceNotFoundException("Reply not found: " + replyId));

        if (!reply.getUserId().equals(requestingUserId)) {
            throw new UnauthorizedException("You can only delete your own replies");
        }

        postRepo.findById(reply.getPostId()).ifPresent(post -> {
            post.setReplyCount(Math.max(0, post.getReplyCount() - 1));
            post.setUpdatedAt(Instant.now());
            postRepo.save(post);
        });

        replyRepo.delete(reply);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // USER POSTS
    // ─────────────────────────────────────────────────────────────────────────

    public List<FeedPostResponse> getPostsByUser(String userId, String requestingUserId) {
        return postRepo.findByUserIdAndDeletedFalseOrderByCreatedAtDesc(userId)
                .stream()
                .map(p -> toPostResponse(p, requestingUserId))
                .collect(Collectors.toList());
    }

    // ─────────────────────────────────────────────────────────────────────────
    // MAPPERS
    // ─────────────────────────────────────────────────────────────────────────
//
//    private FeedPostResponse toPostResponse(FeedPost post, String requestingUserId) {
//        FeedPostResponse r = new FeedPostResponse();
//        r.setId(post.getId());
//        r.setUserId(post.isAnonymous() ? null : post.getUserId());
//        r.setDisplayName(post.getDisplayName());
//        r.setAvatar(post.getAvatar());
//        r.setAvatarColor(post.getAvatarColor());
//        r.setAnonymous(post.isAnonymous());
//        r.setContent(post.getContent());
//        r.setTag(post.getTag());
//        r.setImageDataList(post.getImageDataList());
//        r.setVideoDataList(post.getVideoDataList());
//        r.setLikeCount(post.getLikeCount());
//        r.setReplyCount(post.getReplyCount());
//        r.setEventStatus(post.getEventStatus());
//        r.setEventDate(post.getEventDate());
//        r.setEventLocation(post.getEventLocation());
//        r.setCreatedAt(post.getCreatedAt() != null ? ISO_FMT.format(post.getCreatedAt()) : null);
//        r.setUpdatedAt(post.getUpdatedAt() != null ? ISO_FMT.format(post.getUpdatedAt()) : null);
//
//        if (requestingUserId != null) {
//            r.setLikedByMe(interactionRepo.existsByUserIdAndPostIdAndType(
//                    requestingUserId, post.getId(), InteractionType.LIKE));
//            r.setBookmarkedByMe(interactionRepo.existsByUserIdAndPostIdAndType(
//                    requestingUserId, post.getId(), InteractionType.BOOKMARK));
//        }
//
//        return r;
//    }


    private FeedPostResponse toPostResponse(FeedPost post, String requestingUserId, com.hobbyconnect.feedservice.dto.Dtos.UserProfileDto liveProfile) {
        FeedPostResponse r = new FeedPostResponse();
        r.setId(post.getId());
        r.setUserId(post.isAnonymous() ? null : post.getUserId());
        r.setAnonymous(post.isAnonymous());
        r.setContent(post.getContent());
        r.setTag(post.getTag());
        r.setImageDataList(post.getImageDataList());
        r.setVideoDataList(post.getVideoDataList());
        r.setLikeCount(post.getLikeCount());
        r.setReplyCount(post.getReplyCount());
        r.setLikedBy(post.getLikedBy() != null ? post.getLikedBy() : new ArrayList<>());
        r.setEventStatus(post.getEventStatus());
        r.setEventDate(post.getEventDate());
        r.setEventLocation(post.getEventLocation());
        r.setCreatedAt(post.getCreatedAt() != null ? ISO_FMT.format(post.getCreatedAt()) : null);
        r.setUpdatedAt(post.getUpdatedAt() != null ? ISO_FMT.format(post.getUpdatedAt()) : null);

        // ✨ FIXED SECTION: Handle Profile Information Dynamically
        if (post.isAnonymous()) {
            r.setDisplayName("Anonymous");
            r.setAvatar("?");
            r.setAvatarColor("#8892B0");
            r.setProfilePicture(null);
        } else if (liveProfile != null) {
            // Use live values fetched from the User microservice!
            r.setDisplayName(liveProfile.getDisplayName());
            r.setAvatar(liveProfile.getAvatar());
            r.setAvatarColor(liveProfile.getColor());
            r.setProfilePicture(liveProfile.getProfilePicture()); // 🌟 This fixes Abhijeet's picture!
        } else {
            // Fallback to the post's saved historical snapshot if the microservice fails
            r.setDisplayName(post.getDisplayName());
            r.setAvatar(post.getAvatar());
            r.setAvatarColor(post.getAvatarColor());
            r.setProfilePicture(null);
        }

        if (requestingUserId != null) {
            r.setLikedByMe(interactionRepo.existsByUserIdAndPostIdAndType(
                    requestingUserId, post.getId(), InteractionType.LIKE));
            r.setBookmarkedByMe(interactionRepo.existsByUserIdAndPostIdAndType(
                    requestingUserId, post.getId(), InteractionType.BOOKMARK));
        }

        return r;
    }

    // Add this helper method right next to your existing toPostResponse methods:
    private FeedPostResponse toPostResponse(FeedPost post, String requestingUserId) {
        // If called with only 2 arguments, automatically look up the profile or pass null
        com.hobbyconnect.feedservice.dto.Dtos.UserProfileDto liveProfile = null;
        if (!post.isAnonymous() && post.getUserId() != null) {
            try {
                liveProfile = userServiceClient.getUserProfile(post.getUserId());
            } catch (Exception e) {
                // Fallback gracefully if service fails
            }
        }
        return toPostResponse(post, requestingUserId, liveProfile);
    }



    private ReplyResponse toReplyResponse(Reply reply) {
        ReplyResponse r = new ReplyResponse();
        r.setId(reply.getId());
        r.setPostId(reply.getPostId());
        r.setUserId(reply.isAnonymous() ? null : reply.getUserId());
        r.setDisplayName(reply.getDisplayName());
        r.setAvatar(reply.getAvatar());
        r.setAvatarColor(reply.getAvatarColor());
        r.setAnonymous(reply.isAnonymous());
        r.setContent(reply.getContent());
        r.setCreatedAt(reply.getCreatedAt() != null ? ISO_FMT.format(reply.getCreatedAt()) : null);
        return r;
    }
}
