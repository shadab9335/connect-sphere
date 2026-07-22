package com.example.UserAndInterest.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Data;
import java.util.List;

@Data
public class ProfileUpdateRequest {
    // Optional — only updated when present and non-blank.
    // When updated, the backend also rebuilds the avatar initials from the new name.
    private String fullName;

    // We allow an empty list if a user wants to remove all interests
    private List<String> interests;

    @NotNull(message = "isAnonymous flag is required")
    private Boolean isAnonymous;

    // All four below are optional — only updated when the request includes them
    private String department;
    private String building;
    private String floor;
    private String profilePicture;
}

