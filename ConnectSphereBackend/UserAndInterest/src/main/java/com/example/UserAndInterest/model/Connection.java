package com.example.UserAndInterest.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;
import java.util.List;

/**
 * One document per connected PAIR of users — created when someone taps
 * "Connect" on the Discover screen. There is no accept/reject step yet
 * (same simplification ChatService made for DMs): tapping Connect makes
 * the connection immediately, both ways, no pending state. If the team
 * later wants a request/accept flow, add a `status` field here
 * (PENDING/ACCEPTED) the same way ChatService's own README suggests doing
 * for DMs — don't silently bolt it on.
 *
 * connectionKey is a deterministic, order-independent fingerprint of the
 * two user ids (sorted, joined with "__"), unique-indexed so the same two
 * people can never end up with two separate connection documents no
 * matter who taps Connect first — mirrors ChatService's Conversation.dmKey
 * exactly, same reasoning.
 *
 * userIds additionally stores the same two ids as a plain list (not just
 * baked into the key) specifically so "find all connections involving
 * me" can be a simple, indexed $in-style query
 * (findByUserIdsContaining) instead of parsing connectionKey strings.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "connections")
public class Connection {

    @Id
    private String id;

    @Indexed(unique = true)
    private String connectionKey;

    @Indexed
    private List<String> userIds; // always exactly 2, sorted

    private Instant createdAt;
}
