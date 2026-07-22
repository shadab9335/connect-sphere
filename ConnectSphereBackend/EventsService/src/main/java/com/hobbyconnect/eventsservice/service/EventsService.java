package com.hobbyconnect.eventsservice.service;

import com.hobbyconnect.eventsservice.dto.Dtos.*;
import com.hobbyconnect.eventsservice.exception.BadRequestException;
import com.hobbyconnect.eventsservice.exception.ResourceNotFoundException;
import com.hobbyconnect.eventsservice.exception.UnauthorizedException;
import com.hobbyconnect.eventsservice.model.Event;
import com.hobbyconnect.eventsservice.repository.EventRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class EventsService {

    private final EventRepository eventRepository;
    private final UserServiceClient userServiceClient;

    // GET /api/events
    public List<EventResponse> getEvents(String requestingUserId) {
        List<Event> events = eventRepository.findByDeletedFalseOrderByCreatedAtDesc();
        return events.stream()
                .map(ev -> toResponse(ev, requestingUserId))
                .collect(Collectors.toList());
    }

    // POST /api/events/create
    // Host is auto-joined and stored as hostId. attendeeIds holds the host on creation.
    public EventResponse createEvent(CreateEventRequest req, String hostId) {
        // Validate hostId is a proper 24-char hex ObjectId (tokenStore now returns ObjectId)
        if (hostId == null || !hostId.matches("^[0-9a-fA-F]{24}$")) {
            throw new BadRequestException("Invalid user session. Please log in again.");
        }

        UserProfileDto profile = userServiceClient.getUserProfile(hostId);

        Event event = new Event();
        event.setTitle(req.getTitle());
        event.setInterest(req.getInterest());
        event.setEmoji(req.getEmoji() != null && !req.getEmoji().isBlank() ? req.getEmoji() : "🎉");
        event.setLocation(req.getLocation());
        event.setDate(req.getDate());
        event.setTime(req.getTime());
        event.setMaxParticipants(req.getMaxParticipants());
        event.setHostId(hostId);
        event.setHostName(profile.getDisplayName());
        event.setHostAvatar(profile.getAvatar());
        event.setHostAvatarColor(profile.getColor());

        // Host is auto-joined on creation
        List<String> attendees = new ArrayList<>();
        attendees.add(hostId);
        event.setAttendeeIds(attendees);

        Instant now = Instant.now();
        event.setCreatedAt(now);
        event.setUpdatedAt(now);

        Event saved = eventRepository.save(event);
        log.debug("Created event {} by host {}", saved.getId(), hostId);
        return toResponse(saved, hostId);
    }

    // POST /api/events/{id}/join
    public EventResponse joinEvent(String eventId, String userId) {
        // Validate userId format
        if (userId == null || !userId.matches("^[0-9a-fA-F]{24}$")) {
            throw new BadRequestException("Invalid User ID format. Please log in again.");
        }

        Event event = findActiveEvent(eventId);

        if (event.getAttendeeIds().contains(userId)) {
            throw new BadRequestException("You have already joined this event");
        }
        if (event.getAttendeeIds().size() >= event.getMaxParticipants()) {
            throw new BadRequestException("This event is full — no spots remaining");
        }

        event.getAttendeeIds().add(userId);
        event.setUpdatedAt(Instant.now());
        Event saved = eventRepository.save(event);
        log.debug("User {} joined event {}", userId, eventId);
        return toResponse(saved, userId);
    }

    // DELETE /api/events/{id}/leave
    // Host cannot leave their own event — they must delete it instead.
    public EventResponse leaveEvent(String eventId, String userId) {
        Event event = findActiveEvent(eventId);

        // ADDED: block host from leaving
        if (event.getHostId().equals(userId)) {
            throw new BadRequestException(
                    "You are the host and cannot leave your own event. Delete it instead.");
        }
        if (!event.getAttendeeIds().contains(userId)) {
            throw new BadRequestException("You have not joined this event");
        }

        event.getAttendeeIds().remove(userId);
        event.setUpdatedAt(Instant.now());
        Event saved = eventRepository.save(event);
        log.debug("User {} left event {}", userId, eventId);
        return toResponse(saved, userId);
    }

    // GET /api/events/{id}/attendees
    // Returns attendee list with profilePicture for the drawer.
    public AttendeesResponse getAttendees(String eventId) {
        Event event = findActiveEvent(eventId);

        List<AttendeeResponse> attendees = event.getAttendeeIds().stream()
                .map(uid -> {
                    UserProfileDto profile = userServiceClient.getUserProfile(uid);
                    AttendeeResponse ar = new AttendeeResponse();
                    ar.setUserId(uid);
                    ar.setDisplayName(profile.getDisplayName());
                    ar.setAvatar(profile.getAvatar());
                    ar.setAvatarColor(profile.getColor());
                    ar.setProfilePicture(profile.getProfilePicture()); // ADDED
                    ar.setHost(uid.equals(event.getHostId()));
                    return ar;
                })
                .collect(Collectors.toList());

        return new AttendeesResponse(eventId, event.getTitle(), attendees.size(), attendees);
    }

//    // DELETE /api/events/{id}  — host only
//    public void deleteEvent(String eventId, String requestingUserId) {
//        Event event = findActiveEvent(eventId);
//        if (!event.getHostId().equals(requestingUserId)) {
//            throw new UnauthorizedException("Only the event host can delete this event");
//        }
//        event.setDeleted(true);
//        event.setDeletedAt(Instant.now());
//        event.setUpdatedAt(Instant.now());
//        eventRepository.save(event);
//        log.debug("Event {} soft-deleted by host {}", eventId, requestingUserId);
//    }

    // DELETE /api/events/{id}  — host only
    public void deleteEvent(String eventId, String requestingUserId) {
        // CHANGED: Use findAnyEvent instead of findActiveEvent
        Event event = findAnyEvent(eventId);

        if (!event.getHostId().equals(requestingUserId)) {
            throw new UnauthorizedException("Only the event host can delete this event");
        }

        event.setDeleted(true);
        event.setDeletedAt(Instant.now());
        event.setUpdatedAt(Instant.now());

        // Initialize tracking list with the host
        event.setAttendeesViewedCancellation(new ArrayList<>(List.of(requestingUserId)));

        eventRepository.save(event);
        log.debug("Event {} soft-deleted by host {}", eventId, requestingUserId);
    }

    // ADDED: GET /api/events/my-hosted
    public List<EventResponse> getMyHostedEvents(String userId) {
        return eventRepository.findByHostIdAndDeletedFalseOrderByCreatedAtDesc(userId)
                .stream()
                .map(ev -> toResponse(ev, userId))
                .collect(Collectors.toList());
    }

//    // ADDED: GET /api/events/my-joined (joined but not hosted, upcoming only)
//    public List<EventResponse> getMyJoinedEvents(String userId) {
//        if (userId == null || !userId.matches("^[0-9a-fA-F]{24}$")) {
//            return new ArrayList<>();
//        }
//        String today = LocalDate.now().format(DateTimeFormatter.ISO_LOCAL_DATE);
//        return eventRepository.findJoinedButNotHosted(userId, userId)
//                .stream()
//                .filter(ev -> ev.getDate() == null || ev.getDate().compareTo(today) >= 0)
//                .map(ev -> toResponse(ev, userId))
//                .collect(Collectors.toList());
//    }

    public List<EventResponse> getMyJoinedEvents(String userId) {
        if (userId == null || !userId.matches("^[0-9a-fA-F]{24}$")) {
            return new ArrayList<>();
        }

        // Fetch standard active joined events
        String today = LocalDate.now().format(DateTimeFormatter.ISO_LOCAL_DATE);
        List<Event> activeEvents = eventRepository.findJoinedButNotHosted(userId, userId).stream()
                .filter(ev -> ev.getDate() == null || ev.getDate().compareTo(today) >= 0)
                .collect(Collectors.toList());

        // ALSO fetch soft-deleted events where this user is an attendee but hasn't viewed the cancellation popup yet
        List<Event> canceledButUnread = eventRepository.findByAttendeeIdsContainsAndDeletedTrue(userId).stream()
                .filter(ev -> ev.getAttendeesViewedCancellation() == null || !ev.getAttendeesViewedCancellation().contains(userId))
                .collect(Collectors.toList());

        // Combine both lists
        activeEvents.addAll(canceledButUnread);

        return activeEvents.stream()
                .map(ev -> toResponse(ev, userId))
                .collect(Collectors.toList());
    }

    // ADDED: GET /api/events/my-past (date before today, host or attendee)
    public List<EventResponse> getMyPastEvents(String userId) {
        if (userId == null || !userId.matches("^[0-9a-fA-F]{24}$")) {
            return new ArrayList<>();
        }
        String today = LocalDate.now().format(DateTimeFormatter.ISO_LOCAL_DATE);
        return eventRepository.findPastEventsForUser(today, userId)
                .stream()
                .map(ev -> toResponse(ev, userId))
                .collect(Collectors.toList());
    }

    // ── helpers ──────────────────────────────────────────────────────────────

    private Event findActiveEvent(String eventId) {
        Event event = eventRepository.findById(eventId)
                .orElseThrow(() -> new ResourceNotFoundException("Event not found: " + eventId));
        if (event.isDeleted()) {
            throw new ResourceNotFoundException("Event not found: " + eventId);
        }
        return event;
    }



    private EventResponse toResponse(Event ev, String requestingUserId) {
        EventResponse r = new EventResponse();
        r.setId(ev.getId());
        r.setTitle(ev.getTitle());
        r.setInterest(ev.getInterest());
        r.setEmoji(ev.getEmoji());
        r.setLocation(ev.getLocation());
        r.setDate(ev.getDate());
        r.setTime(ev.getTime());
        r.setMaxParticipants(ev.getMaxParticipants());
        int joined = ev.getAttendeeIds() != null ? ev.getAttendeeIds().size() : 0;
        r.setJoinedCount(joined);
        r.setSpotsLeft(Math.max(0, ev.getMaxParticipants() - joined));
        r.setHostId(ev.getHostId());
        r.setHostName(ev.getHostName());
        r.setHostAvatar(ev.getHostAvatar());
        r.setHostAvatarColor(ev.getHostAvatarColor());
        r.setJoinedByMe(ev.getAttendeeIds() != null && ev.getAttendeeIds().contains(requestingUserId));
        r.setCreatedAt(ev.getCreatedAt() != null ? ev.getCreatedAt().toString() : null);
        r.setUpdatedAt(ev.getUpdatedAt() != null ? ev.getUpdatedAt().toString() : null);

        r.setTimeUpdated(ev.isTimeUpdated());
        // User needs notification if the event changed and they aren't on the viewed list
        boolean viewed = ev.getAttendeesViewed() != null && ev.getAttendeesViewed().contains(requestingUserId);
        r.setNeedsNotification(ev.isTimeUpdated() && !viewed);

        r.setDeleted(ev.isDeleted());

        boolean viewedCancellation = ev.getAttendeesViewedCancellation() != null
                && ev.getAttendeesViewedCancellation().contains(requestingUserId);

        // The attendee needs a notification if the event is deleted and they haven't dismissed it
        r.setNeedsCancellationNotification(ev.isDeleted() && !viewedCancellation);
        return r;
    }

    public void acknowledgeCancellation(String eventId, String userId) {
        // Re-use your new helper method to bypass standard active filters
        Event event = findAnyEvent(eventId);

        if (event.getAttendeeIds().contains(userId)) {
            if (event.getAttendeesViewedCancellation() == null) {
                event.setAttendeesViewedCancellation(new java.util.ArrayList<>());
            }

            if (!event.getAttendeesViewedCancellation().contains(userId)) {
                event.getAttendeesViewedCancellation().add(userId);
                eventRepository.save(event);
                log.debug("User {} acknowledged cancellation of event {}", userId, eventId);
            }
        }
    }

    // PUT /api/events/{id}/datetime
    public EventResponse updateEventDateTime(String eventId, UpdateDateTimeRequest req, String requestingUserId) {
        Event event = findActiveEvent(eventId);

        if (!event.getHostId().equals(requestingUserId)) {
            throw new UnauthorizedException("Only the event host can edit this event");
        }

        // Update values
        event.setDate(req.getDate());
        event.setTime(req.getTime());
        event.setUpdatedAt(Instant.now());

        // Trigger notification state for attendees (exclude the host)
        event.setTimeUpdated(true);
        event.setAttendeesViewed(new ArrayList<>(List.of(requestingUserId)));

        Event saved = eventRepository.save(event);
        log.debug("Event {} date/time updated by host {}", eventId, requestingUserId);
        return toResponse(saved, requestingUserId);
    }

    // POST /api/events/{id}/acknowledge-update
    public void acknowledgeUpdate(String eventId, String userId) {
        Event event = findActiveEvent(eventId);
        if (event.getAttendeeIds().contains(userId) && !event.getAttendeesViewed().contains(userId)) {
            event.getAttendeesViewed().add(userId);
            eventRepository.save(event);
        }
    }

    private Event findAnyEvent(String eventId) {
        return eventRepository.findById(eventId)
                .orElseThrow(() -> new ResourceNotFoundException("Event not found: " + eventId));
    }
}
