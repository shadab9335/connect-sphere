package com.example.UserAndInterest.repository;

import com.example.UserAndInterest.model.Connection;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;
import java.util.Optional;

@org.springframework.stereotype.Repository
public interface ConnectionRepository extends MongoRepository<Connection, String> {

    Optional<Connection> findByConnectionKey(String connectionKey);

    // Backs "GET /api/connections/mine" and the connections-scoped search —
    // every connection document where this userId appears in the pair.
    List<Connection> findByUserIdsContaining(String userId);
}
