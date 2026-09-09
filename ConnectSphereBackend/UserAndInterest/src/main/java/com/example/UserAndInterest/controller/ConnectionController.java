package com.example.UserAndInterest.controller;

import com.example.UserAndInterest.dto.ApiResponse;
import com.example.UserAndInterest.service.ConnectionService;
import com.example.UserAndInterest.service.UserService;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

/**
 * Base path /api/connections. Every endpoint here identifies the caller
 * from "Authorization: Bearer <token>" (the same mock-jwt token issued by
 * /auth/login and /auth/register) rather than the X-User-Id header the
 * older profile endpoints use — X-User-Id carries employeeId, but
 * connections (and ChatService's Conversation.participantIds) are keyed
 * by the MongoDB _id, and validateToken() already resolves straight to
 * that _id with no extra lookup.
 */
@RestController
@RequestMapping("/api/connections")
@RequiredArgsConstructor
@Slf4j
public class ConnectionController {

    private final ConnectionService connectionService;
    private final UserService userService;

    // POST /api/connections/connect  (Header: Authorization: Bearer <token>)
    // Body: { "targetUserId": "..." }
    // Called by Discover screen's "Connect" button.
    @PostMapping("/connect")
    public ResponseEntity<ApiResponse> connect(HttpServletRequest request,
                                               @RequestBody Map<String, String> body) {
        String userId = requireUserId(request);
        return respond(connectionService.connect(userId, body.get("targetUserId")));
    }

    // GET /api/connections/mine  (Header: Authorization: Bearer <token>)
    // Returns every person the caller is connected with.
    @GetMapping("/mine")
    public ResponseEntity<ApiResponse> mine(HttpServletRequest request) {
        String userId = requireUserId(request);
        return respond(connectionService.listMyConnections(userId));
    }

    // GET /api/connections/search?query=...&limit=20  (Header: Authorization: Bearer <token>)
    // Called by ChatService (see UserSearchController there) — restricts
    // "search people" in the chat section to the caller's own connections.
    // Blank query -> full connections list, same as /mine.
    @GetMapping("/search")
    public ResponseEntity<ApiResponse> search(HttpServletRequest request,
                                              @RequestParam(required = false) String query,
                                              @RequestParam(required = false, defaultValue = "20") int limit) {
        String userId = requireUserId(request);
        return respond(connectionService.searchMyConnections(userId, query, limit));
    }

    // GET /api/connections/status?targetUserId=...  (Header: Authorization: Bearer <token>)
    // Lets Discover show "Connected" vs "Connect" on the button correctly.
    @GetMapping("/status")
    public ResponseEntity<ApiResponse> status(HttpServletRequest request,
                                              @RequestParam String targetUserId) {
        String userId = requireUserId(request);
        boolean connected = connectionService.areConnected(userId, targetUserId);
        return ResponseEntity.ok(ApiResponse.success("Status fetched", Map.of("connected", connected)));
    }

    // GET /api/connections/discover  (Header: Authorization: Bearer <token>)
    // Backs the Discover screen's people list — every registered user
    // except yourself, each tagged with whether you're already connected.
    @GetMapping("/discover")
    public ResponseEntity<ApiResponse> discover(HttpServletRequest request) {
        String userId = requireUserId(request);
        return respond(connectionService.discoverUsers(userId));
    }

    // ─────────────────────────────────────────────────────────────────────
    // EXPLICIT-ID VARIANTS
    //
    // These four take both user ids in the path and need no
    // Authorization header. They exist because that's the contract the
    // Discover screen and ProfileScreen were already written against
    // (connectionService.js: connectUser / disconnectUser /
    // getConnectionsForUser / getConnectionCount), and the frontend for
    // those screens is deliberately not being changed.
    //
    // Note the trade-off: because the caller states who the requester is
    // instead of proving it with a token, these can't tell a genuine
    // request from a forged one. That's the same posture as the other
    // X-User-Id-header endpoints in this service, and it's why the
    // token-authenticated variants above (/connect, /mine, /status,
    // /discover, /search) are the ones ChatService is pointed at. If
    // this service ever gets real auth, these four are the first things
    // to retire.
    // ─────────────────────────────────────────────────────────────────────

    // POST /api/connections/{requesterUserId}/{recipientUserId}
    @PostMapping("/{requesterUserId}/{recipientUserId}")
    public ResponseEntity<ApiResponse> connectByIds(@PathVariable String requesterUserId,
                                                    @PathVariable String recipientUserId) {
        return respond(connectionService.connect(requesterUserId, recipientUserId));
    }

    // DELETE /api/connections/{firstUserId}/{secondUserId}
    @DeleteMapping("/{firstUserId}/{secondUserId}")
    public ResponseEntity<ApiResponse> disconnectByIds(@PathVariable String firstUserId,
                                                       @PathVariable String secondUserId) {
        return respond(connectionService.disconnect(firstUserId, secondUserId));
    }

    // GET /api/connections/{userId} -> { data: { connectedUsers, count } }
    // The literal paths above (/mine, /search, /status, /discover) are more
    // specific than this template, so Spring still routes those to their
    // own handlers rather than treating "mine" as a userId.
    @GetMapping("/{userId}")
    public ResponseEntity<ApiResponse> connectionsForUser(@PathVariable String userId) {
        return respond(connectionService.connectionsForUser(userId));
    }

    // GET /api/connections/{userId}/count -> { data: { count } }
    @GetMapping("/{userId}/count")
    public ResponseEntity<ApiResponse> connectionCount(@PathVariable String userId) {
        return respond(connectionService.connectionCount(userId));
    }

    // ── HELPERS ───────────────────────────────────────────────────────────

    private String requireUserId(HttpServletRequest request) {
        String header = request.getHeader("Authorization");
        String token = (header != null && header.startsWith("Bearer "))
                ? header.substring("Bearer ".length())
                : null;

        String userId = token != null ? userService.validateToken(token) : null;
        if (userId == null) {
            throw new IllegalStateException("UNAUTHORIZED");
        }
        return userId;
    }

    // Small, local exception -> 401 mapping. requireUserId() only ever
    // throws this with message "UNAUTHORIZED", so no need for a broader
    // @RestControllerAdvice shared with the X-User-Id-based controllers.
    @ExceptionHandler(IllegalStateException.class)
    public ResponseEntity<ApiResponse> handleUnauthorized(IllegalStateException ex) {
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body(ApiResponse.error("Missing or invalid Authorization token"));
    }

    private ResponseEntity<ApiResponse> respond(ApiResponse response) {
        return response.isSuccess()
                ? ResponseEntity.ok(response)
                : ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
    }
}
