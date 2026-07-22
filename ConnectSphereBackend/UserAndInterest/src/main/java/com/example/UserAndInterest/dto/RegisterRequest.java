package com.example.UserAndInterest.dto;

import jakarta.validation.constraints.*;
import lombok.Data;
import java.util.List;

@Data
public class RegisterRequest {
    @NotBlank(message = "Employee ID is required")
    private String employeeId;

    @NotBlank(message = "Password is required")
    @Size(min = 6, message = "Password must be at least 6 characters")
    private String password;

    @NotBlank(message = "Full name is required")
    private String fullName;

    @NotNull(message = "isAnonymous field is required")
    private Boolean isAnonymous;

    @NotBlank(message = "Department is required")
    private String department;

    @NotBlank(message = "Building is required")
    private String building;

    @NotBlank(message = "Floor is required")
    private String floor;

    // Optional Base64 data-URI; user can skip and add later from profile screen
    private String profilePicture;

    // Frontend will send a list of Names or IDs to link
    private List<String> interests;

    @NotBlank(message = "Location is required")
    private String location;
}
