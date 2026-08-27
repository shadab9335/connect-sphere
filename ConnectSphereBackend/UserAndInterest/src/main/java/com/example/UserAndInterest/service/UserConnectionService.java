/*
package com.example.UserAndInterest.service;

import com.example.UserAndInterest.dto.ApiResponse;
import com.example.UserAndInterest.model.User;
import com.example.UserAndInterest.model.UserConnection;
import com.example.UserAndInterest.repository.UserConnectionRepository;
import com.example.UserAndInterest.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.bson.types.ObjectId;
import org.springframework.dao.DuplicateKeyException;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.*;
import java.util.function.Function;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class UserConnectionService {

    private static final String CONNECTION_KEY_SEPARATOR = "::";

    private final UserRepository userRepository;
    private final UserConnectionRepository userConnectionRepository;

    public ApiResponse connectUser(
            String requesterUserId,
            String recipientUserId
    ) {
        String normalizedRequesterId = normalizeUserId(requesterUserId);
        String normalizedRecipientId = normalizeUserId(recipientUserId);

        ApiResponse validationResponse = validateConnectionRequest(
                normalizedRequesterId,
                normalizedRecipientId
        );

        if (validationResponse != null) {
            return validationResponse;
        }

        Optional<User> requesterOptional =
                userRepository.findById(normalizedRequesterId);

        if (requesterOptional.isEmpty()) {
            log.warn(
                    "Connection request failed. Requester not found: {}",
                    normalizedRequesterId
            );

            return ApiResponse.error(
                    "Requester user not found: " + normalizedRequesterId
            );
        }

        Optional<User> recipientOptional =
                userRepository.findById(normalizedRecipientId);

        if (recipientOptional.isEmpty()) {
            log.warn(
                    "Connection request failed. Recipient not found: {}",
                    normalizedRecipientId
            );

            return ApiResponse.error(
                    "Recipient user not found: " + normalizedRecipientId
            );
        }

        User requester = requesterOptional.get();
        User recipient = recipientOptional.get();

        String connectionKey = buildConnectionKey(
                normalizedRequesterId,
                normalizedRecipientId
        );

        boolean connectionExists =
                userConnectionRepository.existsByConnectionKey(connectionKey);

        if (connectionExists) {
            long connectionCount =
                    countConnectionsForUser(normalizedRequesterId);

            log.info(
                    "Connection already exists. Connection key: {}",
                    connectionKey
            );

            return buildConnectionResponse(
                    requester,
                    recipient,
                    false,
                    connectionCount,
                    "Users are already connected"
            );
        }

        UserConnection userConnection = UserConnection.builder()
                .connectionKey(connectionKey)
                .requesterUserId(normalizedRequesterId)
                .recipientUserId(normalizedRecipientId)
                .createdAt(Instant.now())
                .build();

        boolean newlyCreated;

        try {
            userConnectionRepository.save(userConnection);
            newlyCreated = true;

            log.info(
                    "Connection created successfully. Requester: {}, Recipient: {}",
                    normalizedRequesterId,
                    normalizedRecipientId
            );
        } catch (DuplicateKeyException exception) {
            newlyCreated = false;

            log.info(
                    "Duplicate concurrent connection request detected. Key: {}",
                    connectionKey
            );
        }

        long updatedConnectionCount =
                countConnectionsForUser(normalizedRequesterId);

        String responseMessage = newlyCreated
                ? "Connection created successfully"
                : "Users are already connected";

        return buildConnectionResponse(
                requester,
                recipient,
                newlyCreated,
                updatedConnectionCount,
                responseMessage
        );
    }

    public ApiResponse getConnectionCount(String userId) {
        String normalizedUserId = normalizeUserId(userId);

        if (normalizedUserId == null) {
            return ApiResponse.error("User ID is required");
        }

        if (!userRepository.existsById(normalizedUserId)) {
            log.warn(
                    "Unable to fetch connection count. User not found: {}",
                    normalizedUserId
            );

            return ApiResponse.error(
                    "User not found: " + normalizedUserId
            );
        }

        long connectionCount =
                countConnectionsForUser(normalizedUserId);

        Map<String, Object> responseData = new LinkedHashMap<>();
        responseData.put("userId", normalizedUserId);
        responseData.put("connectionCount", connectionCount);

        return ApiResponse.success(
                "Connection count fetched successfully",
                responseData
        );
    }

    private ApiResponse validateConnectionRequest(
            String requesterUserId,
            String recipientUserId
    ) {
        if (requesterUserId == null) {
            return ApiResponse.error(
                    "Requester user ID is required"
            );
        }

        if (recipientUserId == null) {
            return ApiResponse.error(
                    "Recipient user ID is required"
            );
        }

        if (requesterUserId.equals(recipientUserId)) {
            log.warn(
                    "Self-connection attempt rejected for user: {}",
                    requesterUserId
            );

            return ApiResponse.error(
                    "A user cannot connect with themselves"
            );
        }

        return null;
    }

    private String buildConnectionKey(
            String firstUserId,
            String secondUserId
    ) {
        if (firstUserId.compareTo(secondUserId) < 0) {
            return firstUserId
                    + CONNECTION_KEY_SEPARATOR
                    + secondUserId;
        }

        return secondUserId
                + CONNECTION_KEY_SEPARATOR
                + firstUserId;
    }

    private long countConnectionsForUser(String userId) {
        return userConnectionRepository
                .countByRequesterUserIdOrRecipientUserId(
                        userId,
                        userId
                );
    }

    private ApiResponse buildConnectionResponse(
            User requester,
            User recipient,
            boolean newlyCreated,
            long connectionCount,
            String message
    ) {
        Map<String, Object> responseData = new LinkedHashMap<>();

        responseData.put("requesterUserId", requester.getId());
        responseData.put("requesterName", requester.getFullName());
        responseData.put("recipientUserId", recipient.getId());
        responseData.put("recipientName", recipient.getFullName());
        responseData.put("connected", true);
        responseData.put("newlyCreated", newlyCreated);
        responseData.put("connectionCount", connectionCount);

        return ApiResponse.success(message, responseData);
    }

    private String normalizeUserId(String userId) {
        if (userId == null || userId.isBlank()) {
            return null;
        }

        return userId.trim();
    }

    private ApiResponse validateSingleUserId(String userId) {
        if (userId == null || userId.isBlank()) {
            return ApiResponse.error("User ID is required");
        }

        if (!ObjectId.isValid(userId)) {
            return ApiResponse.error(
                    "Invalid MongoDB ObjectId: " + userId
            );
        }

        return null;
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

        List<UserConnection> connectionRecords =
                userConnectionRepository
                        .findByRequesterUserIdOrRecipientUserIdOrderByCreatedAtDesc(
                                normalizedUserId,
                                normalizedUserId
                        );

        Set<String> connectedUserIds = connectionRecords.stream()
                .map(connection ->
                        extractConnectedUserId(
                                connection,
                                normalizedUserId
                        )
                )
                .filter(Objects::nonNull)
                .collect(
                        Collectors.toCollection(
                                LinkedHashSet::new
                        )
                );

        Map<String, User> usersById =
                userRepository
                        .findAllById(connectedUserIds)
                        .stream()
                        .collect(Collectors.toMap(
                                User::getId,
                                Function.identity()
                        ));

        List<Map<String, Object>> connectedUsers =
                connectedUserIds.stream()
                        .map(usersById::get)
                        .filter(Objects::nonNull)
                        .map(this::buildConnectedUserMap)
                        .toList();

        User selectedUser = selectedUserOptional.get();

        Map<String, Object> responseData =
                new LinkedHashMap<>();

        responseData.put("userId", selectedUser.getId());
        responseData.put("fullName", selectedUser.getFullName());
        responseData.put("avatar", selectedUser.getAvatar());
        responseData.put(
                "avatarColor",
                selectedUser.getAvatarColor()
        );
        responseData.put(
                "profilePicture",
                selectedUser.getProfilePicture()
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

    public ApiResponse disconnectUsers(
            String firstUserId,
            String secondUserId
    ) {
        String normalizedFirstUserId =
                normalizeUserId(firstUserId);

        String normalizedSecondUserId =
                normalizeUserId(secondUserId);

        ApiResponse validationResponse =
                validateConnectionRequest(
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

        String connectionKey = buildConnectionKey(
                normalizedFirstUserId,
                normalizedSecondUserId
        );

        Optional<UserConnection> connectionOptional =
                userConnectionRepository.findByConnectionKey(
                        connectionKey
                );

        if (connectionOptional.isEmpty()) {
            long firstUserConnectionCount =
                    countConnectionsForUser(
                            normalizedFirstUserId
                    );

            long secondUserConnectionCount =
                    countConnectionsForUser(
                            normalizedSecondUserId
                    );

            return buildDisconnectResponse(
                    normalizedFirstUserId,
                    normalizedSecondUserId,
                    false,
                    firstUserConnectionCount,
                    secondUserConnectionCount,
                    "Users are not connected"
            );
        }

        userConnectionRepository.delete(
                connectionOptional.get()
        );

        long firstUserConnectionCount =
                countConnectionsForUser(
                        normalizedFirstUserId
                );

        long secondUserConnectionCount =
                countConnectionsForUser(
                        normalizedSecondUserId
                );

        log.info(
                "Users disconnected successfully. First user: {}, Second user: {}",
                normalizedFirstUserId,
                normalizedSecondUserId
        );

        return buildDisconnectResponse(
                normalizedFirstUserId,
                normalizedSecondUserId,
                true,
                firstUserConnectionCount,
                secondUserConnectionCount,
                "Users disconnected successfully"
        );
    }

    private String extractConnectedUserId(
            UserConnection connection,
            String selectedUserId
    ) {
        if (selectedUserId.equals(
                connection.getRequesterUserId()
        )) {
            return connection.getRecipientUserId();
        }

        if (selectedUserId.equals(
                connection.getRecipientUserId()
        )) {
            return connection.getRequesterUserId();
        }

        return null;
    }

    private ApiResponse buildDisconnectResponse(
            String firstUserId,
            String secondUserId,
            boolean removed,
            long firstUserConnectionCount,
            long secondUserConnectionCount,
            String message
    ) {
        Map<String, Object> responseData =
                new LinkedHashMap<>();

        responseData.put("firstUserId", firstUserId);
        responseData.put("secondUserId", secondUserId);
        responseData.put("connected", false);
        responseData.put("removed", removed);

        responseData.put(
                "firstUserConnectionCount",
                firstUserConnectionCount
        );

        responseData.put(
                "secondUserConnectionCount",
                secondUserConnectionCount
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
        connectedUser.put("fullName", user.getFullName());
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
        connectedUser.put("location", user.getLocation());
        connectedUser.put("building", user.getBuilding());
        connectedUser.put("floor", user.getFloor());

        return connectedUser;
    }

}

*/




// proposed approach.
package com.example.UserAndInterest.service;

import com.example.UserAndInterest.dto.ApiResponse;
import com.example.UserAndInterest.model.User;
import com.example.UserAndInterest.model.UserConnection;
import com.example.UserAndInterest.repository.UserConnectionRepository;
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
public class UserConnectionService {

    private final UserRepository userRepository;
    private final UserConnectionRepository userConnectionRepository;
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
                UserConnection.class
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
                    UserConnection.class
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

        Optional<UserConnection> connectionOptional =
                userConnectionRepository.findByUserId(
                        normalizedUserId
                );

        List<String> connectedUserIds = connectionOptional
                .map(UserConnection::getConnectedUserIds)
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
                UserConnection.class
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
                UserConnection.class
        );
    }

    private boolean wasDocumentChanged(
            UpdateResult updateResult
    ) {
        return updateResult.getModifiedCount() > 0
                || updateResult.getUpsertedId() != null;
    }

    private long getConnectionCountValue(String userId) {
        return userConnectionRepository
                .findByUserId(userId)
                .map(UserConnection::getConnectedUserIds)
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
}
