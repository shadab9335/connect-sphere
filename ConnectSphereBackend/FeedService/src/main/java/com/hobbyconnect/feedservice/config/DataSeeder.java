package com.hobbyconnect.feedservice.config;

import com.hobbyconnect.feedservice.model.FeedPost;
import com.hobbyconnect.feedservice.repository.FeedPostRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.List;

/**
 * Seeds the feed_posts collection with mock data on first startup.
 * Skips seeding if posts already exist, so it is safe to restart the app.
 *
 * This is your MOCK_FEED from constants.js imported into MongoDB.
 * Delete this class (or set seed.enabled=false) once you have real data.
 */
@Component
@RequiredArgsConstructor
public class DataSeeder implements CommandLineRunner {

    private final FeedPostRepository postRepo;

    @Override
    public void run(String... args) {
        if (postRepo.count() > 0) {
            System.out.println("[DataSeeder] Skipping seed — feed_posts already has data.");
            return;
        }

        Instant now = Instant.now();

        List<FeedPost> mockPosts = List.of(

            post("E1042", "Arjun Mehta",   "AM", "#6C63FF", false,
                 "Calling all cricket lovers! 🏏 We're organizing a weekend match at Cubbon Park. " +
                 "Need 3 more players — all skill levels welcome. Let's make this a regular thing!",
                 "Cricket", 12, 5, "upcoming", "Sat, Apr 5 · 7:00 AM", "Cubbon Park, Bangalore",
                 now.minus(2, ChronoUnit.HOURS)),

            post(null, "Anonymous", "?", "#8892B0", true,
                 "Last night's office movie screening was absolutely amazing! 🎬 We watched Oppenheimer " +
                 "in the conference room. Who's up for a horror movie night next Friday? Drop a 👻 below!",
                 "Movies", 24, 8, "happened", "Yesterday · 7:30 PM", "Conference Hall, Floor 6",
                 now.minus(3, ChronoUnit.HOURS)),

            post("E2031", "Priya Sharma", "PS", "#FF6584", false,
                 "Planning a weekend trek to Coorg with a few colleagues! 🏔️ We have 2 spots left in the carpool. " +
                 "It's going to be epic — misty hills, coffee estates & good company. DM me!",
                 "Travel", 41, 15, "upcoming", "Sun, Apr 6 · 5:30 AM", "Coorg, Karnataka",
                 now.minus(5, ChronoUnit.HOURS)),

            post("E3018", "Rahul Nair", "RN", "#43E97B", false,
                 "Morning run squad! 🏃♂️ We completed 5K today along MG Road — the sunrise was spectacular. " +
                 "Sweat, laughs, and new connections. Join us next Wednesday!",
                 "Running", 18, 3, "happened", "Today · 6:30 AM", "MG Road, Bangalore",
                 now.minus(6, ChronoUnit.HOURS)),

            post(null, "Anonymous", "?", "#8892B0", true,
                 "Chess enthusiasts, unite! ♟️ Starting a lunch chess club every Monday — all levels welcome. " +
                 "Beat your manager at chess? Now's your chance 😄 Reply with your floor!",
                 "Chess", 31, 14, "upcoming", "Mon, Mar 31 · 1:00 PM", "Cafeteria, Floor 5",
                 now.minus(1, ChronoUnit.DAYS)),

            post("E5009", "Karan Patel", "KP", "#38BDF8", false,
                 "Game night recap 🎮 — we had 8 people battle it out in FIFA and it was legendary. " +
                 "Karan won (obviously 😎). Next session: Valorant tournament. Who's in?",
                 "Gaming", 22, 9, "happened", "Yesterday · 8:00 PM", "Office Lounge, Floor 2",
                 now.minus(1, ChronoUnit.DAYS)),

            post("E4055", "Sneha Iyer", "SI", "#FFB347", false,
                 "Sunday cycling crew 🚴 — 20km route from Indiranagar to Nandi Hills is booked! " +
                 "Helmets mandatory, good vibes guaranteed. 4 spots remaining, first come first served!",
                 "Cycling", 16, 6, "upcoming", "Sun, Apr 6 · 6:00 AM", "Nandi Hills Route",
                 now.minus(2, ChronoUnit.DAYS)),

            post("E1099", "Suresh Raina", "SR", "#FF9F43", false,
                 "IPL Season is here! 🏟️ Is anyone up for a screening of the RCB vs CSK match " +
                 "at the office cafeteria this Friday? Pizza is on me!",
                 "Cricket", 24, 8, "upcoming", "Fri, Apr 10 · 7:30 PM", "Main Cafeteria, Floor 4",
                 now.minus(5, ChronoUnit.HOURS)),

            post("E2105", "Sneha Kapoor", "SK", "#4CAF50", false,
                 "Who else is following the Women's Premier League? 🏏 The level of talent this season is insane! " +
                 "Thinking of doing a deep-dive analysis on the spin-bowling trends. Any data nerds want to collab?",
                 "Cricket", 32, 12, "none", null, null,
                 now.minus(45, ChronoUnit.MINUTES)),

            post("E3055", "Vikram Das", "VD", "#00B894", false,
                 "Exploring the hidden gems of North Kolkata this Sunday! 🏛️ Planning a heritage walk " +
                 "through the old zamindar houses and stopping for some authentic telebhaja. Who's in?",
                 "Travel", 22, 7, "upcoming", "Sun, Apr 12 · 8:00 AM", "Shobhabazar, Kolkata",
                 now.minus(1, ChronoUnit.HOURS)),

            post(null, "Anonymous", "?", "#636E72", true,
                 "Just got back from a solo trip to Spiti Valley. 🏔️ The views were life-changing, " +
                 "but the roads are tricky this time of year. Happy to share my itinerary and gear list " +
                 "if anyone is planning a trip!",
                 "Travel", 56, 12, "none", null, null,
                 now.minus(4, ChronoUnit.HOURS)),

            post("E1182", "Ananya Roy", "AR", "#F1C40F", false,
                 "Beach day alert! 🏖️ Thinking of a quick getaway to Mandarmani next weekend to catch the sunrise. " +
                 "Looking for 2 more people to split the cottage costs. Let's go!",
                 "Travel", 34, 9, "upcoming", "Fri, Apr 17 · 6:00 AM", "Mandarmani, West Bengal",
                 now.minus(10, ChronoUnit.HOURS))
        );

        postRepo.saveAll(mockPosts);
        System.out.println("[DataSeeder] Seeded " + mockPosts.size() + " mock posts into feed_posts.");
    }

    // ── Helper to build a FeedPost without repetition ────────────────────────

    private FeedPost post(String userId, String displayName, String avatar, String avatarColor,
                          boolean anonymous, String content, String tag,
                          int likes, int replies,
                          String eventStatus, String eventDate, String eventLocation,
                          Instant createdAt) {
        FeedPost p = new FeedPost();
        p.setUserId(userId);
        p.setDisplayName(displayName);
        p.setAvatar(avatar);
        p.setAvatarColor(avatarColor);
        p.setAnonymous(anonymous);
        p.setContent(content);
        p.setTag(tag);
        p.setLikeCount(likes);
        p.setReplyCount(replies);
        p.setEventStatus(eventStatus != null ? eventStatus : "none");
        p.setEventDate(eventDate);
        p.setEventLocation(eventLocation);
        p.setCreatedAt(createdAt);
        p.setUpdatedAt(createdAt);
        return p;
    }
}
