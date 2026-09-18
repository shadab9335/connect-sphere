//
//package com.example.UserAndInterest.service;
//
//import com.example.UserAndInterest.dto.ApiResponse;
//import com.example.UserAndInterest.model.Connection;
//import com.example.UserAndInterest.model.User;
//import com.example.UserAndInterest.repository.ConnectionRepository;
//import com.example.UserAndInterest.repository.UserRepository;
//import lombok.RequiredArgsConstructor;
//import org.springframework.dao.DuplicateKeyException;
//import org.springframework.stereotype.Service;
//
//import java.time.Instant;
//import java.util.Collections;
//import java.util.LinkedHashMap;
//import java.util.List;
//import java.util.Map;
//import java.util.Optional;
//import java.util.Set;
//import java.util.stream.Collectors;
//
//
///**
// * "Connect" (Discover screen) is deliberately simple for v1: tapping it
// * connects two people immediately, no request/accept step, exactly the
// * same simplification ChatService made for starting a DM. See
// * Connection.java's class comment for what to add later if the team
// * decides connections need an accept step.
// */
//
//@Service
//@RequiredArgsConstructor
//public class ConnectionService {
//
//    private final ConnectionRepository connectionRepository;
//    private final UserRepository userRepository;
//
//    public ApiResponse connect(String userId, String targetUserId) {
//        if (targetUserId == null || targetUserId.isBlank()) {
//            return ApiResponse.error("targetUserId is required");
//        }
//        if (targetUserId.equals(userId)) {
//            return ApiResponse.error("Cannot connect with yourself");
//        }
//        if (userRepository.findById(targetUserId).isEmpty()) {
//            return ApiResponse.error("No user with id: " + targetUserId);
//        }
//
//        String key = buildConnectionKey(userId, targetUserId);
//        Optional<Connection> existing = connectionRepository.findByConnectionKey(key);
//        if (existing.isPresent()) {
//            // Already connected — tapping Connect again is a no-op success,
//            // not an error, since the end state the caller wants is
//            // already true.
//            return ApiResponse.success("Already connected");
//        }
//
//        Connection connection = new Connection();
//        connection.setConnectionKey(key);
//        connection.setUserIds(sortedPair(userId, targetUserId));
//        connection.setCreatedAt(Instant.now());
//
//        try {
//            connectionRepository.save(connection);
//        } catch (DuplicateKeyException e) {
//            // Two concurrent "Connect" taps raced on the same pair; the
//            // unique index rejected the loser. That's fine — the pair is
//            // connected either way.
//            return ApiResponse.success("Already connected");
//        }
//
//        return ApiResponse.success("Connected");
//    }
//
//
///**
//     * Backs DELETE /api/connections/{firstUserId}/{secondUserId} — the
//     * Discover screen's "Disconnect" button.
//     *
//     * Removing the pair document is enough: it's the single source of
//     * truth for "are these two connected", so both sides lose the
//     * connection at once. Deliberately does NOT touch ChatService — any
//     * DM they already have stays, with its history, exactly like
//     * unfriending someone doesn't erase the messages you exchanged.
//     * Disconnecting only stops them showing up in each other's
//     * connections-scoped chat search.
//     */
//
//    public ApiResponse disconnect(String userId, String targetUserId) {
//        if (targetUserId == null || targetUserId.isBlank()) {
//            return ApiResponse.error("targetUserId is required");
//        }
//
//        Optional<Connection> existing =
//                connectionRepository.findByConnectionKey(buildConnectionKey(userId, targetUserId));
//        if (existing.isEmpty()) {
//            // Same reasoning as connect()'s "Already connected": the end
//            // state the caller wanted is already true, so this is a
//            // no-op success rather than a 400.
//            return ApiResponse.success("Not connected");
//        }
//
//        connectionRepository.delete(existing.get());
//        return ApiResponse.success("Disconnected");
//    }
//
//    public ApiResponse listMyConnections(String userId) {
//        return ApiResponse.success("Connections fetched", connectionProfiles(userId, null, Integer.MAX_VALUE));
//    }
//
//
///**
//     * Backs GET /api/connections/{userId} — the shape the Discover screen
//     * and ProfileScreen already expect: { connectedUsers: [...], count }.
//     * Kept separate from listMyConnections (which returns a bare array
//     * under `data`) so neither caller has to change to suit the other.
//     */
//
//    public ApiResponse connectionsForUser(String userId) {
//        List<Map<String, Object>> connected = connectionProfiles(userId, null, Integer.MAX_VALUE);
//        Map<String, Object> payload = new LinkedHashMap<>();
//        payload.put("connectedUsers", connected);
//        payload.put("count", connected.size());
//        return ApiResponse.success("Connections fetched", payload);
//    }
//
//    public ApiResponse connectionCount(String userId) {
//        long count = connectionRepository.findByUserIdsContaining(userId).size();
//        return ApiResponse.success("Connection count fetched", Map.of("count", count));
//    }
//
//
///**
//     * Backs GET /api/connections/search — ChatService's "search people"
//     * box calls this (never the generic /api/users/search) so a chat can
//     * only ever be started with someone the caller is already connected
//     * to. A blank/null query returns the full connections list (capped by
//     * limit) instead of nothing, so opening the search box with an empty
//     * field still shows "who can I message".
//     */
//
//    public ApiResponse searchMyConnections(String userId, String query, int limit) {
//        return ApiResponse.success("Search results fetched", connectionProfiles(userId, query, Math.max(1, limit)));
//    }
//
//    public boolean areConnected(String userIdA, String userIdB) {
//        return connectionRepository.findByConnectionKey(buildConnectionKey(userIdA, userIdB)).isPresent();
//    }
//
//
///**
//     * Backs GET /api/connections/discover — the Discover screen's "browse
//     * people" list. Unlike searchMyConnections (which only ever returns
//     * people you're ALREADY connected to), this returns every other
//     * registered user, each tagged with whether you're connected to them
//     * yet — so the frontend can show "Connect" or "Connected" correctly
//     * per person. No pagination in v1: returns everyone, minus yourself.
//     * Fine for a company-directory-sized user base; revisit with a
//     * Pageable param if this ever needs to scale to a much larger one.
//     */
//
//    public ApiResponse discoverUsers(String userId) {
//        Set<String> connectedIds = connectionRepository.findByUserIdsContaining(userId).stream()
//                .map(c -> c.getUserIds().stream().filter(id -> !id.equals(userId)).findFirst().orElse(null))
//                .filter(java.util.Objects::nonNull)
//                .collect(Collectors.toSet());
//
//        List<Map<String, Object>> results = userRepository.findAll().stream()
//                .filter(u -> !u.getId().equals(userId))
//                .map(u -> {
//                    Map<String, Object> profile = new LinkedHashMap<>();
//                    profile.put("userId", u.getId());
//                    profile.put("employeeId", u.getEmployeeId());
//                    profile.put("displayName", u.getFullName());
//                    profile.put("avatar", u.getAvatar());
//                    profile.put("color", u.getAvatarColor());
//                    profile.put("profilePicture", u.getProfilePicture());
//                    profile.put("department", u.getDepartment());
//                    profile.put("location", u.getLocation());
//                    profile.put("interests", u.getInterests() == null ? List.of() : u.getInterests().stream()
//                            .map(i -> {
//                                Map<String, Object> interest = new LinkedHashMap<>();
//                                interest.put("id", i.getId());
//                                interest.put("label", i.getInterestName());
//                                interest.put("emoji", i.getPicture());
//                                interest.put("description", i.getDescription());
//                                return interest;
//                            })
//                            .collect(Collectors.toList()));
//                    profile.put("connected", connectedIds.contains(u.getId()));
//                    return profile;
//                })
//                .collect(Collectors.toList());
//
//        return ApiResponse.success("Users fetched", results);
//    }
//
//    // ── HELPERS ───────────────────────────────────────────────────────────
//
//    private List<Map<String, Object>> connectionProfiles(String userId, String query, int limit) {
//        List<Connection> connections = connectionRepository.findByUserIdsContaining(userId);
//        if (connections.isEmpty()) {
//            return Collections.emptyList();
//        }
//
//        List<String> otherUserIds = connections.stream()
//                .map(c -> c.getUserIds().stream().filter(id -> !id.equals(userId)).findFirst().orElse(null))
//                .filter(java.util.Objects::nonNull)
//                .collect(Collectors.toList());
//
//        List<User> matches = (query == null || query.isBlank())
//                ? userRepository.findAllById(otherUserIds)
//                : userRepository.findByIdInAndFullNameContainingIgnoreCase(otherUserIds, query.trim());
//
//        return matches.stream()
//                .limit(limit)
//                .map(user -> {
//                    Map<String, Object> profile = new LinkedHashMap<>();
//                    profile.put("userId", user.getId());
//                    profile.put("displayName", user.getFullName());
//                    profile.put("avatar", user.getAvatar());
//                    profile.put("color", user.getAvatarColor());
//                    profile.put("profilePicture", user.getProfilePicture());
//                    return profile;
//                })
//                .collect(Collectors.toList());
//    }
//
//    private String buildConnectionKey(String userIdA, String userIdB) {
//        return userIdA.compareTo(userIdB) <= 0
//                ? userIdA + "__" + userIdB
//                : userIdB + "__" + userIdA;
//    }
//
//    private List<String> sortedPair(String userIdA, String userIdB) {
//        return userIdA.compareTo(userIdB) <= 0
//                ? List.of(userIdA, userIdB)
//                : List.of(userIdB, userIdA);
//    }
//}


package com.example.UserAndInterest.service;

import com.example.UserAndInterest.dto.ApiResponse;
import com.example.UserAndInterest.model.User;
import com.example.UserAndInterest.model.Connection;
import com.example.UserAndInterest.repository.ConnectionRepository;
import com.example.UserAndInterest.repository.UserRepository;
import com.mongodb.client.result.UpdateResult;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.bson.types.ObjectId;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.data.mongodb.core.query.Update;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.*;
import java.util.function.Function;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class ConnectionService {

    private final UserRepository userRepository;
    private final ConnectionRepository connectionRepository;
    private final MongoTemplate mongoTemplate;

    public ApiResponse connectUser(
            String firstUserId,
            String secondUserId
    ) {
        String normalizedFirstUserId = normalizeUserId(firstUserId);
        String normalizedSecondUserId = normalizeUserId(secondUserId);

        ApiResponse validationResponse = validateConnectionRequest(
                normalizedFirstUserId,
                normalizedSecondUserId
        );

        if (validationResponse != null) {
            return validationResponse;
        }

        Optional<User> firstUserOptional =
                userRepository.findById(normalizedFirstUserId);

        if (firstUserOptional.isEmpty()) {
            return ApiResponse.error(
                    "User not found: " + normalizedFirstUserId
            );
        }

        Optional<User> secondUserOptional =
                userRepository.findById(normalizedSecondUserId);

        if (secondUserOptional.isEmpty()) {
            return ApiResponse.error(
                    "User not found: " + normalizedSecondUserId
            );
        }

        User firstUser = firstUserOptional.get();
        User secondUser = secondUserOptional.get();

        Query firstUserQuery = buildUserConnectionQuery(
                normalizedFirstUserId
        );

        Update firstUserUpdate = new Update()
                .setOnInsert(
                        "userId",
                        new ObjectId(normalizedFirstUserId)
                )
                .addToSet(
                        "connectedUserIds",
                        new ObjectId(normalizedSecondUserId)
                )
                .set("updatedAt", Instant.now());

        UpdateResult firstUpdateResult = mongoTemplate.upsert(
                firstUserQuery,
                firstUserUpdate,
                Connection.class
        );

        boolean firstUserChanged =
                wasDocumentChanged(firstUpdateResult);

        try {
            Query secondUserQuery = buildUserConnectionQuery(
                    normalizedSecondUserId
            );

            Update secondUserUpdate = new Update()
                    .setOnInsert(
                            "userId",
                            new ObjectId(normalizedSecondUserId)
                    )
                    .addToSet(
                            "connectedUserIds",
                            new ObjectId(normalizedFirstUserId)
                    )
                    .set("updatedAt", Instant.now());

            UpdateResult secondUpdateResult = mongoTemplate.upsert(
                    secondUserQuery,
                    secondUserUpdate,
                    Connection.class
            );

            boolean secondUserChanged =
                    wasDocumentChanged(secondUpdateResult);

            boolean newlyCreated =
                    firstUserChanged || secondUserChanged;

            long connectionCount =
                    getConnectionCountValue(normalizedFirstUserId);

            String message = newlyCreated
                    ? "Users connected successfully"
                    : "Users are already connected";

            log.info(
                    "Connect completed. First user: {}, Second user: {}",
                    normalizedFirstUserId,
                    normalizedSecondUserId
            );

            return buildConnectionResponse(
                    firstUser,
                    secondUser,
                    newlyCreated,
                    connectionCount,
                    message
            );
        } catch (Exception exception) {
            if (firstUserChanged) {
                removeConnectedUser(
                        normalizedFirstUserId,
                        normalizedSecondUserId
                );
            }

            log.error(
                    "Failed to update both users during Connect",
                    exception
            );

            return ApiResponse.error(
                    "Unable to connect users"
            );
        }
    }

    public ApiResponse disconnectUsers(
            String firstUserId,
            String secondUserId
    ) {
        String normalizedFirstUserId = normalizeUserId(firstUserId);
        String normalizedSecondUserId = normalizeUserId(secondUserId);

        ApiResponse validationResponse = validateConnectionRequest(
                normalizedFirstUserId,
                normalizedSecondUserId
        );

        if (validationResponse != null) {
            return validationResponse;
        }

        if (!userRepository.existsById(normalizedFirstUserId)) {
            return ApiResponse.error(
                    "User not found: " + normalizedFirstUserId
            );
        }

        if (!userRepository.existsById(normalizedSecondUserId)) {
            return ApiResponse.error(
                    "User not found: " + normalizedSecondUserId
            );
        }

        UpdateResult firstUpdateResult = removeConnectedUser(
                normalizedFirstUserId,
                normalizedSecondUserId
        );

        boolean firstUserChanged =
                firstUpdateResult.getModifiedCount() > 0;

        try {
            UpdateResult secondUpdateResult = removeConnectedUser(
                    normalizedSecondUserId,
                    normalizedFirstUserId
            );

            boolean secondUserChanged =
                    secondUpdateResult.getModifiedCount() > 0;

            boolean removed =
                    firstUserChanged || secondUserChanged;

            long connectionCount =
                    getConnectionCountValue(normalizedFirstUserId);

            String message = removed
                    ? "Users disconnected successfully"
                    : "Users are not connected";

            log.info(
                    "Disconnect completed. First user: {}, Second user: {}",
                    normalizedFirstUserId,
                    normalizedSecondUserId
            );

            return buildDisconnectResponse(
                    normalizedFirstUserId,
                    normalizedSecondUserId,
                    removed,
                    connectionCount,
                    message
            );
        } catch (Exception exception) {
            if (firstUserChanged) {
                addConnectedUser(
                        normalizedFirstUserId,
                        normalizedSecondUserId
                );
            }

            log.error(
                    "Failed to update both users during Disconnect",
                    exception
            );

            return ApiResponse.error(
                    "Unable to disconnect users"
            );
        }
    }

    public ApiResponse getConnectionCount(String userId) {
        String normalizedUserId = normalizeUserId(userId);

        ApiResponse validationResponse =
                validateSingleUserId(normalizedUserId);

        if (validationResponse != null) {
            return validationResponse;
        }

        if (!userRepository.existsById(normalizedUserId)) {
            return ApiResponse.error(
                    "User not found: " + normalizedUserId
            );
        }

        long connectionCount =
                getConnectionCountValue(normalizedUserId);

        Map<String, Object> responseData =
                new LinkedHashMap<>();

        responseData.put("userId", normalizedUserId);
        responseData.put(
                "connectionCount",
                connectionCount
        );

        return ApiResponse.success(
                "Connection count fetched successfully",
                responseData
        );
    }

    public ApiResponse getConnectionsForUser(String userId) {
        String normalizedUserId = normalizeUserId(userId);

        ApiResponse validationResponse =
                validateSingleUserId(normalizedUserId);

        if (validationResponse != null) {
            return validationResponse;
        }

        Optional<User> selectedUserOptional =
                userRepository.findById(normalizedUserId);

        if (selectedUserOptional.isEmpty()) {
            return ApiResponse.error(
                    "User not found: " + normalizedUserId
            );
        }

        Optional<Connection> connectionOptional =
                connectionRepository.findByUserId(
                        normalizedUserId
                );

        List<String> connectedUserIds = connectionOptional
                .map(Connection::getConnectedUserIds)
                .orElse(Collections.emptyList());

        if (connectedUserIds == null) {
            connectedUserIds = Collections.emptyList();
        }

        Map<String, User> connectedUsersById =
                userRepository
                        .findAllById(connectedUserIds)
                        .stream()
                        .collect(Collectors.toMap(
                                User::getId,
                                Function.identity()
                        ));

        List<Map<String, Object>> connectedUsers =
                connectedUserIds.stream()
                        .map(connectedUsersById::get)
                        .filter(Objects::nonNull)
                        .map(this::buildConnectedUserMap)
                        .toList();

        User selectedUser = selectedUserOptional.get();

        Map<String, Object> responseData =
                new LinkedHashMap<>();

        responseData.put(
                "userId",
                selectedUser.getId()
        );

        responseData.put(
                "fullName",
                selectedUser.getFullName()
        );

        responseData.put(
                "connectionCount",
                connectedUsers.size()
        );

        responseData.put(
                "connectedUsers",
                connectedUsers
        );

        return ApiResponse.success(
                "Connections fetched successfully",
                responseData
        );
    }

    private Query buildUserConnectionQuery(String userId) {
        return Query.query(
                Criteria.where("userId")
                        .is(new ObjectId(userId))
        );
    }

    private UpdateResult addConnectedUser(
            String userId,
            String connectedUserId
    ) {
        Query query = buildUserConnectionQuery(userId);

        Update update = new Update()
                .setOnInsert(
                        "userId",
                        new ObjectId(userId)
                )
                .addToSet(
                        "connectedUserIds",
                        new ObjectId(connectedUserId)
                )
                .set("updatedAt", Instant.now());

        return mongoTemplate.upsert(
                query,
                update,
                Connection.class
        );
    }

    private UpdateResult removeConnectedUser(
            String userId,
            String connectedUserId
    ) {
        Query query = buildUserConnectionQuery(userId);

        Update update = new Update()
                .pull(
                        "connectedUserIds",
                        new ObjectId(connectedUserId)
                )
                .set("updatedAt", Instant.now());

        return mongoTemplate.updateFirst(
                query,
                update,
                Connection.class
        );
    }

    private boolean wasDocumentChanged(
            UpdateResult updateResult
    ) {
        return updateResult.getModifiedCount() > 0
                || updateResult.getUpsertedId() != null;
    }

    private long getConnectionCountValue(String userId) {
        return connectionRepository
                .findByUserId(userId)
                .map(Connection::getConnectedUserIds)
                .filter(Objects::nonNull)
                .map(List::size)
                .orElse(0);
    }

    private ApiResponse validateConnectionRequest(
            String firstUserId,
            String secondUserId
    ) {
        ApiResponse firstUserValidation =
                validateSingleUserId(firstUserId);

        if (firstUserValidation != null) {
            return firstUserValidation;
        }

        ApiResponse secondUserValidation =
                validateSingleUserId(secondUserId);

        if (secondUserValidation != null) {
            return secondUserValidation;
        }

        if (firstUserId.equals(secondUserId)) {
            return ApiResponse.error(
                    "A user cannot connect with themselves"
            );
        }

        return null;
    }

    private ApiResponse validateSingleUserId(String userId) {
        if (userId == null) {
            return ApiResponse.error(
                    "User ID is required"
            );
        }

        if (!ObjectId.isValid(userId)) {
            return ApiResponse.error(
                    "Invalid MongoDB ObjectId: " + userId
            );
        }

        return null;
    }

    private ApiResponse buildConnectionResponse(
            User firstUser,
            User secondUser,
            boolean newlyCreated,
            long connectionCount,
            String message
    ) {
        Map<String, Object> responseData =
                new LinkedHashMap<>();

        responseData.put(
                "firstUserId",
                firstUser.getId()
        );

        responseData.put(
                "firstUserName",
                firstUser.getFullName()
        );

        responseData.put(
                "secondUserId",
                secondUser.getId()
        );

        responseData.put(
                "secondUserName",
                secondUser.getFullName()
        );

        responseData.put("connected", true);
        responseData.put(
                "newlyCreated",
                newlyCreated
        );

        responseData.put(
                "connectionCount",
                connectionCount
        );

        return ApiResponse.success(
                message,
                responseData
        );
    }

    private ApiResponse buildDisconnectResponse(
            String firstUserId,
            String secondUserId,
            boolean removed,
            long connectionCount,
            String message
    ) {
        Map<String, Object> responseData =
                new LinkedHashMap<>();

        responseData.put(
                "firstUserId",
                firstUserId
        );

        responseData.put(
                "secondUserId",
                secondUserId
        );

        responseData.put("connected", false);
        responseData.put("removed", removed);

        responseData.put(
                "connectionCount",
                connectionCount
        );

        return ApiResponse.success(
                message,
                responseData
        );
    }

    private Map<String, Object> buildConnectedUserMap(
            User user
    ) {
        Map<String, Object> connectedUser =
                new LinkedHashMap<>();

        connectedUser.put("userId", user.getId());
        connectedUser.put(
                "fullName",
                user.getFullName()
        );
        connectedUser.put("avatar", user.getAvatar());
        connectedUser.put(
                "avatarColor",
                user.getAvatarColor()
        );
        connectedUser.put(
                "profilePicture",
                user.getProfilePicture()
        );
        connectedUser.put(
                "department",
                user.getDepartment()
        );
        connectedUser.put(
                "location",
                user.getLocation()
        );
        connectedUser.put(
                "building",
                user.getBuilding()
        );
        connectedUser.put("floor", user.getFloor());

        return connectedUser;
    }

    private String normalizeUserId(String userId) {
        if (userId == null || userId.isBlank()) {
            return null;
        }

        return userId.trim();
    }

    // ── Token-authenticated variants, for ChatService ───────────────────────
    // Same underlying two-write logic as connectUser/disconnectUsers — just
    // resolving the caller's id from a Bearer token instead of a path param.

    public ApiResponse connect(String userId, String targetUserId) {
        return connectUser(userId, targetUserId);
    }

    public ApiResponse disconnect(String userId, String targetUserId) {
        return disconnectUsers(userId, targetUserId);
    }

    public boolean areConnected(String userIdA, String userIdB) {
        return connectionRepository.findByUserId(userIdA)
                .map(Connection::getConnectedUserIds)
                .map(ids -> ids.contains(userIdB))
                .orElse(false);
    }

    /** Full connections list, profile-shaped — backs GET /mine and ChatService's search box. */
    public ApiResponse listMyConnections(String userId) {
        return ApiResponse.success("Connections fetched", connectionProfiles(userId, null, Integer.MAX_VALUE));
    }

    public ApiResponse searchMyConnections(String userId, String query, int limit) {
        return ApiResponse.success("Search results fetched", connectionProfiles(userId, query, Math.max(1, limit)));
    }

    /** Every other registered user, tagged with whether userId is already connected to them. */
    public ApiResponse discoverUsers(String userId) {
        List<String> connectedIds = connectionRepository.findByUserId(userId)
                .map(Connection::getConnectedUserIds)
                .orElse(Collections.emptyList());
        Set<String> connectedSet = new HashSet<>(connectedIds);

        List<Map<String, Object>> results = userRepository.findAll().stream()
                .filter(u -> !u.getId().equals(userId))
                .map(u -> {
                    Map<String, Object> profile = new LinkedHashMap<>();
                    profile.put("userId", u.getId());
                    profile.put("displayName", u.getFullName());
                    profile.put("avatar", u.getAvatar());
                    profile.put("profilePicture", u.getProfilePicture());
                    profile.put("connected", connectedSet.contains(u.getId()));
                    return profile;
                })
                .collect(Collectors.toList());

        return ApiResponse.success("Users fetched", results);
    }

    private List<Map<String, Object>> connectionProfiles(String userId, String query, int limit) {
        List<String> connectedIds = connectionRepository.findByUserId(userId)
                .map(Connection::getConnectedUserIds)
                .orElse(Collections.emptyList());
        if (connectedIds.isEmpty()) return Collections.emptyList();

        List<User> matches = (query == null || query.isBlank())
                ? userRepository.findAllById(connectedIds)
                : userRepository.findByIdInAndFullNameContainingIgnoreCase(connectedIds, query.trim());

        return matches.stream()
                .limit(limit)
                .map(user -> {
                    Map<String, Object> profile = new LinkedHashMap<>();
                    profile.put("userId", user.getId());
                    profile.put("displayName", user.getFullName());
                    profile.put("avatar", user.getAvatar());
                    profile.put("profilePicture", user.getProfilePicture());
                    return profile;
                })
                .collect(Collectors.toList());
    }
}

