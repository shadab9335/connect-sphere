package com.example.UserAndInterest.repository;

import com.example.UserAndInterest.model.WorkLocationConfig;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.Optional;

/**
 * Repository for the singleton WorkLocationConfig document.
 *
 * Because all location data is embedded in ONE document, we do not need
 * derived query methods here — all filtering is done in Java within the
 * service layer after loading that single document.
 *
 * The Aggregation Pipeline approach would be more efficient at DB level
 * for very large datasets, but for the small O(10) scale of this config
 * document, in-memory filtering in the service is simpler and perfectly fine.
 */
@Repository
public interface WorkLocationConfigRepository extends MongoRepository<WorkLocationConfig, String> {

    /**
     * Convenience method: find the one-and-only config document.
     * Equivalent to findAll().stream().findFirst() but slightly cleaner.
     */
    Optional<WorkLocationConfig> findFirstBy();
}
