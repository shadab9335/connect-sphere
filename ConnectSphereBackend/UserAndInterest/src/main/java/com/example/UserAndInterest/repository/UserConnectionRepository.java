/*
package com.example.UserAndInterest.repository;

import com.example.UserAndInterest.model.UserConnection;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserConnectionRepository
        extends MongoRepository<UserConnection, String> {

    boolean existsByConnectionKey(String connectionKey);

    Optional<UserConnection> findByConnectionKey(
            String connectionKey
    );

    long countByRequesterUserIdOrRecipientUserId(
            String requesterUserId,
            String recipientUserId
    );

    List<UserConnection>
    findByRequesterUserIdOrRecipientUserIdOrderByCreatedAtDesc(
            String requesterUserId,
            String recipientUserId
    );
}

*/


package com.example.UserAndInterest.repository;

import com.example.UserAndInterest.model.UserConnection;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UserConnectionRepository
        extends MongoRepository<UserConnection, String> {

    Optional<UserConnection> findByUserId(String userId);
    boolean existsByUserId(String userId);
    void deleteByUserId(String userId);
}