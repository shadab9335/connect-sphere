package com.hobbyconnect.eventsservice.config;

import com.hobbyconnect.eventsservice.model.Event;
import com.hobbyconnect.eventsservice.repository.EventRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

@Slf4j
@Configuration
@RequiredArgsConstructor
public class DataSeeder {

    private final EventRepository eventRepository;

    @Bean
    @Profile("!test")
    public CommandLineRunner seedEvents() {
        return args -> {
            if (eventRepository.count() > 0) {
                log.info("Events collection already has data — skipping seed");
                return;
            }
            log.info("Seeding sample events…");
            List<Event> seeds = List.of(
                buildEvent("Weekend Cricket Match", "Cricket", "🏏",
                        "Cubbon Park, Bengaluru", "2026-06-28", "10:00",
                        22, "E1042", "Arjun Mehta", "AM", "#6C63FF"),
                buildEvent("Lunchtime Chess Club", "Chess", "♟️",
                        "Cafeteria, Floor 5", "2026-06-30", "13:00",
                        8, "E4055", "Sneha Iyer", "SI", "#FFB347"),
                buildEvent("Evening Run – MG Road", "Running", "🏃",
                        "MG Road", "2026-07-02", "18:30",
                        20, "E2031", "Priya Sharma", "PS", "#FF6584"),
                buildEvent("Office Photography Walk", "Photography", "📷",
                        "Campus Grounds", "2026-07-04", "17:00",
                        12, "E3018", "Rahul Nair", "RN", "#43E97B"),
                buildEvent("Beginner Yoga Session", "Yoga", "🧘",
                        "Terrace Garden, G2 Block", "2026-07-05", "07:00",
                        8, "E5009", "Karan Patel", "KP", "#38BDF8")
            );
            eventRepository.saveAll(seeds);
            log.info("Seeded {} sample events", seeds.size());
        };
    }

    private Event buildEvent(String title, String interest, String emoji,
                              String location, String date, String time,
                              int max, String hostId, String hostName,
                              String hostAvatar, String hostAvatarColor) {
        Event ev = new Event();
        ev.setTitle(title); ev.setInterest(interest); ev.setEmoji(emoji);
        ev.setLocation(location); ev.setDate(date); ev.setTime(time);
        ev.setMaxParticipants(max); ev.setHostId(hostId);
        ev.setHostName(hostName); ev.setHostAvatar(hostAvatar);
        ev.setHostAvatarColor(hostAvatarColor);
        List<String> attendees = new ArrayList<>();
        attendees.add(hostId);
        ev.setAttendeeIds(attendees);
        Instant now = Instant.now();
        ev.setCreatedAt(now); ev.setUpdatedAt(now);
        return ev;
    }
}
