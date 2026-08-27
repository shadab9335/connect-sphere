package com.example.UserAndInterest.service;

import com.example.UserAndInterest.dto.*;
import com.example.UserAndInterest.model.*;
import com.example.UserAndInterest.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.concurrent.ConcurrentHashMap;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final InterestRepository interestRepository;
    private final PasswordEncoder passwordEncoder;

    // In-memory token store: token → MongoDB ObjectId (_id)
    // CHANGED: was token → employeeId; now stores ObjectId hex so EventsService
    // receives a valid 24-char hex string when it calls /auth/validate.
    private final Map<String, String> tokenStore = new ConcurrentHashMap<>();

    private static final List<String> AVATAR_COLORS = List.of(
            "#6C63FF", "#FF6584", "#43E97B", "#FFB347",
            "#38BDF8", "#FF9F43", "#4CAF50", "#F1C40F",
            "#00B894", "#E17055", "#74B9FF", "#A29BFE"
    );

    // ── REGISTER ─────────────────────────────────────────────────────────────

    public ApiResponse registerUser(RegisterRequest request) {
        if (userRepository.existsByEmployeeId(request.getEmployeeId())) {
            return ApiResponse.error("Employee ID already exists");
        }

        String avatar = buildInitials(request.getFullName());
        String avatarColor = AVATAR_COLORS.get(new Random().nextInt(AVATAR_COLORS.size()));

        User user = User.builder()
                .employeeId(request.getEmployeeId())
                .password(passwordEncoder.encode(request.getPassword()))
                .fullName(request.getFullName())
                .isAnonymous(request.getIsAnonymous())
                .avatar(avatar)
                .avatarColor(avatarColor)
                .department(request.getDepartment())
                .location(request.getLocation())
                .building(request.getBuilding())
                .floor(request.getFloor())
                .profilePicture(request.getProfilePicture())
                .interests(mapNamesToInterests(request.getInterests()))
                .build();

        User saved = userRepository.save(user);

        String token = "mock-jwt-" + UUID.randomUUID();
        // CHANGED: store MongoDB _id (ObjectId hex) instead of employeeId
        tokenStore.put(token, saved.getId());

        Map<String, Object> data = new LinkedHashMap<>();
        data.put("token", token);
        data.put("user", buildUserResponseMap(saved));
        return ApiResponse.success("User registered successfully", data);
    }

    // ── LOGIN ─────────────────────────────────────────────────────────────────

    public ApiResponse loginUser(LoginRequest request) {
        return userRepository.findByEmployeeId(request.getEmployeeId())
                .filter(user -> passwordEncoder.matches(request.getPassword(), user.getPassword()))
                .map(user -> {
                    String token = "mock-jwt-" + UUID.randomUUID();
                    // CHANGED: store MongoDB _id (ObjectId hex) instead of employeeId
                    tokenStore.put(token, user.getId());

                    Map<String, Object> data = new LinkedHashMap<>();
                    data.put("token", token);
                    data.put("user", buildUserResponseMap(user));
                    return ApiResponse.success("Login successful", data);
                })
                .orElse(ApiResponse.error("Invalid credentials"));
    }

    // ── VALIDATE TOKEN (called by EventsService / FeedService) ───────────────

    public String validateToken(String token) {
        return tokenStore.get(token);
    }

    // ── GET PROFILE ───────────────────────────────────────────────────────────

    public ApiResponse getMyProfile(String employeeId) {
        return userRepository.findByEmployeeId(employeeId)
                .map(user -> ApiResponse.success("Profile fetched", buildUserResponseMap(user)))
                .orElse(ApiResponse.error("User not found"));
    }

    // ── UPDATE PROFILE ────────────────────────────────────────────────────────

    public ApiResponse updateProfile(String employeeId, ProfileUpdateRequest request) {
        return userRepository.findByEmployeeId(employeeId).map(user -> {
            user.setAnonymous(request.getIsAnonymous());
            user.setInterests(mapNamesToInterests(request.getInterests()));

            if (request.getFullName() != null && !request.getFullName().isBlank()) {
                user.setFullName(request.getFullName());
                user.setAvatar(buildInitials(request.getFullName()));
            }
            if (request.getDepartment() != null && !request.getDepartment().isBlank()) {
                user.setDepartment(request.getDepartment());
            }
            if (request.getBuilding() != null && !request.getBuilding().isBlank()) {
                user.setBuilding(request.getBuilding());
            }
            if (request.getFloor() != null && !request.getFloor().isBlank()) {
                user.setFloor(request.getFloor());
            }
            if (request.getProfilePicture() != null) {
                user.setProfilePicture(request.getProfilePicture());
            }

            userRepository.save(user);
            return ApiResponse.success("Profile updated successfully");
        }).orElse(ApiResponse.error("User not found"));
    }

    // ── GET PROFILE FOR FEEDSERVICE / EVENTSSERVICE ───────────────────────────
    // CHANGED: now resolves by MongoDB _id first, falls back to employeeId.
    // Also returns profilePicture so the attendees drawer can show real photos.

    public ApiResponse getUserProfileForFeed(String userId) {
        // Try MongoDB _id first (EventsService passes ObjectId hex)
        Optional<User> userOpt = userRepository.findById(userId);
        // Fallback: try employeeId (FeedService legacy callers)
        if (userOpt.isEmpty()) {
            userOpt = userRepository.findByEmployeeId(userId);
        }
        return userOpt.map(user -> {
            Map<String, Object> profile = new LinkedHashMap<>();
            profile.put("userId",         user.getId());
            profile.put("displayName",    user.getFullName());
            profile.put("avatar",         user.getAvatar());
            profile.put("color",          user.getAvatarColor());
            profile.put("profilePicture", user.getProfilePicture()); // ADDED for attendees drawer
            return ApiResponse.success("Profile fetched", profile);
        }).orElse(ApiResponse.error("User not found"));
    }

    // ── GET USER INTERESTS ────────────────────────────────────────────────────
    // CHANGED: now resolves by MongoDB _id first, falls back to employeeId.
    // EventsService calls this with ObjectId hex; FeedService calls with employeeId.

    public ApiResponse getUserInterests(String userId) {
        // Try MongoDB _id first (EventsService passes ObjectId hex)
        Optional<User> userOpt = userRepository.findById(userId);
        // Fallback: try employeeId (FeedService / frontend legacy callers)
        if (userOpt.isEmpty()) {
            userOpt = userRepository.findByEmployeeId(userId);
        }
        return userOpt
                .map(user -> {
                    List<String> interestNames = user.getInterests().stream()
                            .filter(Objects::nonNull)
                            .map(Interest::getInterestName)
                            .collect(Collectors.toList());
                    return ApiResponse.success("Interests fetched", interestNames);
                })
                .orElse(ApiResponse.error("User not found"));
    }

    // ── HELPERS ───────────────────────────────────────────────────────────────

    private Set<Interest> mapNamesToInterests(List<String> names) {
        if (names == null) return new HashSet<>();
        return names.stream()
                .map(name -> interestRepository.findByInterestNameIgnoreCase(name).orElse(null))
                .filter(Objects::nonNull)
                .collect(Collectors.toSet());
    }

    private Map<String, Object> buildUserResponseMap(User user) {
        Map<String, Object> map = new LinkedHashMap<>();
        map.put("id",            user.getId());         // ADDED: MongoDB ObjectId for frontend use
        map.put("employeeId",    user.getEmployeeId());
        map.put("fullName",      user.getFullName());
        map.put("avatar",        user.getAvatar());
        map.put("avatarColor",   user.getAvatarColor());
        map.put("department",    user.getDepartment());
        map.put("location",       user.getLocation());
        map.put("building",      user.getBuilding());
        map.put("floor",         user.getFloor());
        map.put("profilePicture", user.getProfilePicture());
        map.put("interests",     user.getInterests().stream()
                .filter(Objects::nonNull)
                .map(Interest::getInterestName)
                .toList());
        return map;
    }

    private String buildInitials(String fullName) {
        if (fullName == null || fullName.isBlank()) return "??";
        String[] parts = fullName.trim().split("\\s+");
        if (parts.length == 1) {
            return parts[0].length() >= 2
                    ? parts[0].substring(0, 2).toUpperCase()
                    : parts[0].toUpperCase();
        }
        return ("" + parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
    }

    // updates:
    public ApiResponse getAllUsers() {

        List<User> users = userRepository.findAll();

        List<Map<String, Object>> response = users.stream()
                .map(user -> {
                    Map<String, Object> userData = new LinkedHashMap<>();

                    userData.put("id", user.getId());
                    userData.put("fullName", user.getFullName());
                    userData.put("employeeId", user.getEmployeeId());
                    userData.put("avatar", user.getAvatar());
                    userData.put("avatarColor", user.getAvatarColor());
                    userData.put("profilePicture", user.getProfilePicture());
                    userData.put("department", user.getDepartment());
                    userData.put("location", user.getLocation());
                    userData.put("building", user.getBuilding());
                    userData.put("floor", user.getFloor());
                    userData.put("interests", user.getInterests());

                    return userData;
                })
                .toList();

        return ApiResponse.success(
                "Users fetched successfully",
                response
        );
    }
}
