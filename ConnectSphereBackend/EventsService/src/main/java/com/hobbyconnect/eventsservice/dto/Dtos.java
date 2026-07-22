package com.hobbyconnect.eventsservice.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

public class Dtos {

    @Data
    public static class CreateEventRequest {
        @NotBlank(message = "Event title is required")
        private String title;

        @NotBlank(message = "Interest tag is required")
        private String interest;

        private String emoji;

        @NotBlank(message = "Location is required")
        private String location;

        @NotBlank(message = "Date is required")
        private String date;

        @NotBlank(message = "Time is required")
        private String time;

        @NotNull(message = "Max participants is required")
        @Min(value = 1, message = "Max participants must be at least 1")
        private Integer maxParticipants;
    }

    @Data
    public static class EventResponse {
        private String id;
        private String title;
        private String interest;
        private String emoji;
        private String location;
        private String date;
        private String time;
        private int maxParticipants;
        private int joinedCount;
        private int spotsLeft;
        private String hostId;
        private String hostName;
        private String hostAvatar;
        private String hostAvatarColor;
        private boolean joinedByMe;
        private String createdAt;
        private String updatedAt;
        private boolean timeUpdated;
        private boolean needsNotification; // true if timeUpdated is true AND user hasn't viewed it yet
        private boolean deleted;
        private boolean needsCancellationNotification;
    }

    @Data
    public static class AttendeeResponse {
        private String userId;
        private String displayName;
        private String avatar;
        private String avatarColor;
        private String profilePicture; // ADDED: for attendees drawer profile photo
        private boolean isHost;
    }

    @Data
    public static class AttendeesResponse {
        private String eventId;
        private String eventTitle;
        private int totalAttendees;
        private List<AttendeeResponse> attendees;

        public AttendeesResponse(String eventId, String eventTitle,
                                 int totalAttendees, List<AttendeeResponse> attendees) {
            this.eventId = eventId;
            this.eventTitle = eventTitle;
            this.totalAttendees = totalAttendees;
            this.attendees = attendees;
        }
    }

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

    @Data
    public static class UserProfileDto {
        private String userId;
        private String displayName;
        private String avatar;
        private String color;
        private String profilePicture; // ADDED: returned by UserAndInterest profile endpoint
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class UpdateDateTimeRequest {

        @NotBlank(message = "Date is required")
        @Pattern(
                regexp = "^\\d{4}-\\d{2}-\\d{2}$",
                message = "Date must be in yyyy-MM-dd format"
        )
        private String date;

        @NotBlank(message = "Time is required")
        @Pattern(
                regexp = "^(?:[01]\\d|2[0-3]):[0-5]\\d$",
                message = "Time must be in HH:mm format (24-hour clock)"
        )
        private String time;
    }
}
