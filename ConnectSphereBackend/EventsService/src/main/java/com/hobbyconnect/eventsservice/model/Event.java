package com.hobbyconnect.eventsservice.model;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.index.Indexed;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "events")
public class Event {

    @Id
    private String id;

    private String title;

    @Indexed
    private String interest;

    private String emoji;
    private String location;
    private String date;   // yyyy-MM-dd
    private String time;   // HH:mm
    private int maxParticipants;

    @Indexed
    private String hostId;
    private String hostName;
    private String hostAvatar;
    private String hostAvatarColor;

    private List<String> attendeeIds = new ArrayList<>();

    private boolean deleted = false;
    private Instant deletedAt;
    private List<String> attendeesViewedCancellation = new ArrayList<>();

    @Indexed
    private Instant createdAt;
    private Instant updatedAt;

    // Track tracking update state for notifications
    private boolean timeUpdated = false;
    private List<String> attendeesViewed = new ArrayList<>();
}
