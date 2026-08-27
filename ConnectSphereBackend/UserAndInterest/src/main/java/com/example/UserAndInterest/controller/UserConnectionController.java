
package com.example.UserAndInterest.controller;

import com.example.UserAndInterest.dto.ApiResponse;
import com.example.UserAndInterest.service.UserConnectionService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/connections")
@CrossOrigin(origins = "*")
@RequiredArgsConstructor
@Slf4j
public class UserConnectionController {

    private final UserConnectionService userConnectionService;

    @PostMapping("/{requesterUserId}/{recipientUserId}")
    public ResponseEntity<ApiResponse> connectUser(
            @PathVariable String requesterUserId,
            @PathVariable String recipientUserId) {

        log.info(
                "Connection request received. Requester user ID: {}, Recipient user ID: {}",
                requesterUserId,
                recipientUserId
        );

        ApiResponse response =
                userConnectionService.connectUser(requesterUserId, recipientUserId);

        if (response.isSuccess()) {
            return ResponseEntity.ok(response);
        }

        return ResponseEntity
                .status(resolveFailureStatus(response.getMessage()))
                .body(response);
    }

    @GetMapping("/{userId}/count")
    public ResponseEntity<ApiResponse> getConnectionCount(
            @PathVariable String userId) {
        log.info("Connection count requested for user ID: {}", userId);
        ApiResponse response =
                userConnectionService.getConnectionCount(userId);
        if (response.isSuccess()) {
            return ResponseEntity.ok(response);
        }
        return ResponseEntity
                .status(resolveFailureStatus(response.getMessage()))
                .body(response);
    }

    private HttpStatus resolveFailureStatus(String message) {
        if (message == null) {
            return HttpStatus.BAD_REQUEST;
        }

        String normalizedMessage = message.toLowerCase();

        if (normalizedMessage.contains("not found")) {
            return HttpStatus.NOT_FOUND;
        }

        return HttpStatus.BAD_REQUEST;
    }

    /*for user list*/
    @GetMapping("/{userId}")
    public ResponseEntity<ApiResponse> getConnectionsForUser(
            @PathVariable String userId
    ) {
        log.info(
                "Connections requested for user ID: {}",
                userId
        );

        ApiResponse response =
                userConnectionService.getConnectionsForUser(userId);

        if (response.isSuccess()) {
            return ResponseEntity.ok(response);
        }

        return ResponseEntity
                .status(resolveFailureStatus(response.getMessage()))
                .body(response);
    }

    @DeleteMapping("/{firstUserId}/{secondUserId}")
    public ResponseEntity<ApiResponse> disconnectUsers(
            @PathVariable String firstUserId,
            @PathVariable String secondUserId
    ) {
        log.info(
                "Disconnect request received. First user ID: {}, Second user ID: {}",
                firstUserId,
                secondUserId
        );

        ApiResponse response =
                userConnectionService.disconnectUsers(
                        firstUserId,
                        secondUserId
                );

        if (response.isSuccess()) {
            return ResponseEntity.ok(response);
        }

        return ResponseEntity
                .status(resolveFailureStatus(response.getMessage()))
                .body(response);
    }
}

