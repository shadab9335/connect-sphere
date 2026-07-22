package com.hobbyconnect.feedservice;

import com.hobbyconnect.feedservice.dto.Dtos.FeedPostResponse;
import com.hobbyconnect.feedservice.dto.Dtos.UserProfileDto;
import com.hobbyconnect.feedservice.model.FeedPost;
import com.hobbyconnect.feedservice.repository.FeedPostRepository;
import com.hobbyconnect.feedservice.repository.PostInteractionRepository;
import com.hobbyconnect.feedservice.repository.ReplyRepository;
import com.hobbyconnect.feedservice.service.FeedService;
import com.hobbyconnect.feedservice.service.MediaStorageService;
import com.hobbyconnect.feedservice.service.UserServiceClient;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.*;
import org.springframework.data.domain.*;

import java.io.IOException;
import java.time.Instant;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

class FeedServiceTest {

    @Mock private FeedPostRepository postRepo;
    @Mock private ReplyRepository replyRepo;
    @Mock private PostInteractionRepository interactionRepo;
    @Mock private MediaStorageService mediaStorageService;
    @Mock private UserServiceClient userServiceClient;

    @InjectMocks private FeedService feedService;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
    }

    @Test
    void createPost_savesPostWithCorrectUserId() throws IOException {
        // Arrange
        UserProfileDto profile = new UserProfileDto();
        profile.setUserId("E1042");
        profile.setDisplayName("Arjun Mehta");
        profile.setAvatar("AM");
        profile.setColor("#6C63FF");

        when(userServiceClient.getUserProfile("E1042")).thenReturn(profile);
        when(postRepo.save(any(FeedPost.class))).thenAnswer(inv -> {
            FeedPost p = inv.getArgument(0);
            p.setId("mock-id-001");
            return p;
        });

        // Act
        FeedPostResponse result = feedService.createPost(
                "E1042", "Test post content", "Cricket",
                false, "none", null, null, null, null);

        // Assert
        assertThat(result.getUserId()).isEqualTo("E1042");
        assertThat(result.getDisplayName()).isEqualTo("Arjun Mehta");
        assertThat(result.getTag()).isEqualTo("Cricket");
        assertThat(result.isAnonymous()).isFalse();
        assertThat(result.getLikeCount()).isEqualTo(0);

        verify(postRepo, times(1)).save(any(FeedPost.class));
    }

    @Test
    void createPost_anonymousPost_hidesUserId() throws IOException {
        // Arrange
        UserProfileDto profile = new UserProfileDto();
        profile.setUserId("E1042");
        profile.setDisplayName("Arjun Mehta");
        profile.setAvatar("AM");
        profile.setColor("#6C63FF");

        when(userServiceClient.getUserProfile("E1042")).thenReturn(profile);
        when(postRepo.save(any(FeedPost.class))).thenAnswer(inv -> {
            FeedPost p = inv.getArgument(0);
            p.setId("mock-id-002");
            return p;
        });

        // Act
        FeedPostResponse result = feedService.createPost(
                "E1042", "Anon post", "Movies",
                true, "none", null, null, null, null);

        // Assert — userId must be null in the response for anonymous posts
        assertThat(result.getUserId()).isNull();
        assertThat(result.getDisplayName()).isEqualTo("Anonymous");
        assertThat(result.getAvatar()).isEqualTo("?");
        assertThat(result.isAnonymous()).isTrue();
    }

    @Test
    void getFeed_returnsPagedResults() {
        // Arrange
        FeedPost mockPost = new FeedPost();
        mockPost.setId("post-1");
        mockPost.setUserId("E1042");
        mockPost.setDisplayName("Arjun Mehta");
        mockPost.setAvatar("AM");
        mockPost.setAvatarColor("#6C63FF");
        mockPost.setContent("Test content");
        mockPost.setTag("Cricket");
        mockPost.setLikeCount(5);
        mockPost.setReplyCount(2);
        mockPost.setEventStatus("none");
        mockPost.setCreatedAt(Instant.now());
        mockPost.setUpdatedAt(Instant.now());

        Page<FeedPost> mockPage = new PageImpl<>(List.of(mockPost));
        when(postRepo.findAll(any(Pageable.class))).thenReturn(mockPage);

        // Act
        Page<FeedPostResponse> result = feedService.getFeed(null, 0, 20, "E9999");

        // Assert
        assertThat(result.getContent()).hasSize(1);
        assertThat(result.getContent().get(0).getId()).isEqualTo("post-1");
    }
}
