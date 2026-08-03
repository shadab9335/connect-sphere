package com.hobbyconnect.eventsservice.controller;

import com.hobbyconnect.eventsservice.dto.Dtos.*;
import com.hobbyconnect.eventsservice.repository.EventRepository;
import com.hobbyconnect.eventsservice.service.EventsService;
import com.hobbyconnect.eventsservice.util.JwtUtil;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import java.util.List;

@RestController
@RequestMapping("/api/events")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class EventsController {

    private final EventsService eventsService;
    private final EventRepository eventRepository;
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


    // GET /api/events
    @GetMapping
    public ResponseEntity<ApiResponse<List<EventResponse>>> getEvents(
            @RequestHeader("Authorization") String authHeader) {
        String userId = jwtUtil.extractUserIdFromHeader(authHeader);
        return ResponseEntity.ok(ApiResponse.ok(eventsService.getEvents(userId)));
    }

    // POST /api/events/create
    @PostMapping("/create")
    public ResponseEntity<ApiResponse<EventResponse>> createEvent(
            @RequestHeader("Authorization") String authHeader,
            @Valid @RequestBody CreateEventRequest req) {
        String userId = jwtUtil.extractUserIdFromHeader(authHeader);
        EventResponse created = eventsService.createEvent(req, userId);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok("Event created successfully", created));
    }

    // ADDED: GET /api/events/my-hosted — events where caller is host
    // NOTE: must be declared BEFORE /{id} mappings to avoid Spring treating
    // "my-hosted" as a path variable.
    @GetMapping("/my-hosted")
    public ResponseEntity<ApiResponse<List<EventResponse>>> getMyHostedEvents(
            @RequestHeader("Authorization") String authHeader) {
        String userId = jwtUtil.extractUserIdFromHeader(authHeader);
        return ResponseEntity.ok(ApiResponse.ok(eventsService.getMyHostedEvents(userId)));
    }

    // ADDED: GET /api/events/my-joined — events caller joined but did not host
    @GetMapping("/my-joined")
    public ResponseEntity<ApiResponse<List<EventResponse>>> getMyJoinedEvents(
            @RequestHeader("Authorization") String authHeader) {
        String userId = jwtUtil.extractUserIdFromHeader(authHeader);
        return ResponseEntity.ok(ApiResponse.ok(eventsService.getMyJoinedEvents(userId)));
    }

    // ADDED: GET /api/events/my-past — past events (before today) for caller
    @GetMapping("/my-past")
    public ResponseEntity<ApiResponse<List<EventResponse>>> getMyPastEvents(
            @RequestHeader("Authorization") String authHeader) {
        String userId = jwtUtil.extractUserIdFromHeader(authHeader);
        return ResponseEntity.ok(ApiResponse.ok(eventsService.getMyPastEvents(userId)));
    }

    // POST /api/events/{id}/join
    @PostMapping("/{id}/join")
    public ResponseEntity<ApiResponse<EventResponse>> joinEvent(
            @RequestHeader("Authorization") String authHeader,
            @PathVariable String id) {
        String userId = jwtUtil.extractUserIdFromHeader(authHeader);
        return ResponseEntity.ok(ApiResponse.ok("Joined event successfully",
                eventsService.joinEvent(id, userId)));
    }

    // DELETE /api/events/{id}/leave
    @DeleteMapping("/{id}/leave")
    public ResponseEntity<ApiResponse<EventResponse>> leaveEvent(
            @RequestHeader("Authorization") String authHeader,
            @PathVariable String id) {
        String userId = jwtUtil.extractUserIdFromHeader(authHeader);
        return ResponseEntity.ok(ApiResponse.ok("Left event successfully",
                eventsService.leaveEvent(id, userId)));
    }

    // GET /api/events/{id}/attendees
    @GetMapping("/{id}/attendees")
    public ResponseEntity<ApiResponse<AttendeesResponse>> getAttendees(
            @RequestHeader("Authorization") String authHeader,
            @PathVariable String id) {
        jwtUtil.extractUserIdFromHeader(authHeader); // auth check only
        return ResponseEntity.ok(ApiResponse.ok(eventsService.getAttendees(id)));
    }

    // DELETE /api/events/{id}  — host only
    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteEvent(
            @RequestHeader("Authorization") String authHeader,
            @PathVariable String id) {
        String userId = jwtUtil.extractUserIdFromHeader(authHeader);
        eventsService.deleteEvent(id, userId);
        return ResponseEntity.ok(ApiResponse.ok("Event deleted successfully", null));
    }

    // PUT /api/events/{id}/datetime — host only
    @PutMapping("/{id}/datetime")
    public ResponseEntity<ApiResponse<EventResponse>> updateEventDateTime(
            @RequestHeader("Authorization") String authHeader,
            @PathVariable String id,
            @Valid @RequestBody UpdateDateTimeRequest req) {
        String userId = jwtUtil.extractUserIdFromHeader(authHeader);
        EventResponse updated = eventsService.updateEventDateTime(id, req, userId);
        return ResponseEntity.ok(ApiResponse.ok("Event timing updated successfully", updated));
    }

    // POST /api/events/{id}/acknowledge — attendee only
    @PostMapping("/{id}/acknowledge")
    public ResponseEntity<ApiResponse<Void>> acknowledgeUpdate(
            @RequestHeader("Authorization") String authHeader,
            @PathVariable String id) {
        String userId = jwtUtil.extractUserIdFromHeader(authHeader);
        eventsService.acknowledgeUpdate(id, userId);
        return ResponseEntity.ok(ApiResponse.ok("Notification cleared", null));
    }

    // POST /api/events/{id}/acknowledge-cancellation
    @PostMapping("/{id}/acknowledge-cancellation")
    public ResponseEntity<ApiResponse<Void>> acknowledgeCancellation(
            @RequestHeader("Authorization") String authHeader,
            @PathVariable String id) {
        String userId = jwtUtil.extractUserIdFromHeader(authHeader);

        // Let the service layer handle database operations
        eventsService.acknowledgeCancellation(id, userId);

        return ResponseEntity.ok(ApiResponse.ok("Cancellation notice dismissed", null));
    }
}
