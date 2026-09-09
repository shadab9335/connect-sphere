//package com.example.UserAndInterest.repository;
//
//import com.example.UserAndInterest.model.User;
//import org.springframework.data.jpa.repository.JpaRepository;
//import org.springframework.stereotype.Repository;
//import java.util.Optional;
//
//@Repository
//public interface UserRepository extends JpaRepository<User, String> {
//
//    /**
//     * Finds a user by their unique employee ID.
//     * Used during Login and Profile fetching.
//     */
//    Optional<User> findByEmployeeId(String employeeId);
//
//    /**
//     * Checks if an employee ID is already taken.
//     * Used during Registration to prevent duplicates.
//     */
//    boolean existsByEmployeeId(String employeeId);
//}
//

package com.example.UserAndInterest.repository;

import com.example.UserAndInterest.model.User;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.repository.MongoRepository; // Changed import
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
// Changed: Extends MongoRepository instead of JpaRepository
public interface UserRepository extends MongoRepository<User, String> {

    Optional<User> findByEmployeeId(String employeeId);

    boolean existsByEmployeeId(String employeeId);

    // Backs the connections-scoped search (ConnectionService.searchMyConnections):
    // "of these specific userIds (my connections), which ones have a
    // fullName matching this query" — a name filter applied ON TOP OF an
    // id allowlist, so search never returns someone who isn't a connection.
    List<User> findByIdInAndFullNameContainingIgnoreCase(java.util.Collection<String> ids, String query);

    // Backs GET /api/users/search?query=... (used by ChatService's "search
    // people" flow). Case-insensitive substring match on fullName, with the
    // requesting user's own id excluded so people don't see themselves in
    // their own search results. Pageable caps how many rows come back
    // (ChatService currently asks for 20) instead of returning everyone
    // matching a broad query like "a".
    List<User> findByFullNameContainingIgnoreCaseAndIdNot(String query, String excludeId, Pageable pageable);
}
