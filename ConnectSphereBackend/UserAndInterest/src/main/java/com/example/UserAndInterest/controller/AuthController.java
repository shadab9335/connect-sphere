package com.example.UserAndInterest.controller;

import com.example.UserAndInterest.dto.*;
import com.example.UserAndInterest.service.UserService;
import com.example.UserAndInterest.service.InterestService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@CrossOrigin(origins = "*")
@RequiredArgsConstructor
@Slf4j
public class AuthController {

    private final UserService userService;
    private final InterestService interestService;

    // =========================================================================
    // AUTH ENDPOINTS  —  base path: /auth
    // =========================================================================

    // POST /auth/register
    @PostMapping("/auth/register")
    public ResponseEntity<ApiResponse> register(@Valid @RequestBody RegisterRequest request) {
        log.info("Registering user: {}", request.getEmployeeId());
        ApiResponse response = userService.registerUser(request);
        return response.isSuccess()
                ? ResponseEntity.status(HttpStatus.CREATED).body(response)
                : ResponseEntity.status(HttpStatus.CONFLICT).body(response);
    }

    // POST /auth/login
    @PostMapping("/auth/login")
    public ResponseEntity<ApiResponse> login(@Valid @RequestBody LoginRequest request) {
        log.info("Login attempt for: {}", request.getEmployeeId());
        ApiResponse response = userService.loginUser(request);
        return response.isSuccess()
                ? ResponseEntity.ok(response)
                : ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(response);
    }

    // GET /auth/validate?token=mock-jwt-xxxx
    // Called by FeedService to resolve a token → userId
    @GetMapping("/auth/validate")
    public ResponseEntity<?> validateToken(@RequestParam String token) {
        log.info("Validating token: {}", token);
        String userId = userService.validateToken(token);
        if (userId == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("error", "Invalid or expired token"));
        }
        return ResponseEntity.ok(Map.of("userId", userId));
    }

    // GET /auth/profile/me  (Header: X-User-Id: E1042)
    @GetMapping("/auth/profile/me")
    public ResponseEntity<ApiResponse> getMe(@RequestHeader("X-User-Id") String employeeId) {
        log.info("Fetching profile for: {}", employeeId);
        ApiResponse response = userService.getMyProfile(employeeId);
        return response.isSuccess()
                ? ResponseEntity.ok(response)
                : ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
    }

    // PUT /auth/profile/update  (Header: X-User-Id: E1042)
    @PutMapping("/auth/profile/update")
    public ResponseEntity<ApiResponse> updateProfile(
            @RequestHeader("X-User-Id") String employeeId,
            @Valid @RequestBody ProfileUpdateRequest request) {
        log.info("Updating profile for: {}", employeeId);
        ApiResponse response = userService.updateProfile(employeeId, request);
        return response.isSuccess()
                ? ResponseEntity.ok(response)
                : ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
    }

    // GET /auth/interests
    @GetMapping("/auth/interests")
    public ResponseEntity<ApiResponse> getActiveInterests() {
        log.info("Fetching master list of active interests");
        return ResponseEntity.ok(interestService.getActiveInterests());
    }

    // =========================================================================
    // USER PROFILE & INTERESTS ENDPOINTS  —  called by FeedService
    // =========================================================================

    // GET /api/users/{userId}/profile
    // Returns: { userId, displayName, avatar, color }
    @GetMapping("/api/users/{userId}/profile")
    public ResponseEntity<?> getUserProfileForFeed(@PathVariable String userId) {
        log.info("FeedService requesting profile for userId: {}", userId);
        ApiResponse response = userService.getUserProfileForFeed(userId);
        if (response.isSuccess()) {
            return ResponseEntity.ok(response.getData());
        }
        return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(Map.of("error", "User not found: " + userId));
    }

    // GET /api/users/{userId}/interests
    // Returns: { success, data: ["Cricket", "Gaming", ...] }
    // Called by FeedService to personalise the tab ordering for the logged-in user.
    @GetMapping("/api/users/{userId}/interests")
    public ResponseEntity<?> getUserInterests(@PathVariable String userId) {
        log.info("FeedService requesting interests for userId: {}", userId);
        ApiResponse response = userService.getUserInterests(userId);
        if (response.isSuccess()) {
            return ResponseEntity.ok(response);
        }
        return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(Map.of("error", "User not found: " + userId));
    }
}
