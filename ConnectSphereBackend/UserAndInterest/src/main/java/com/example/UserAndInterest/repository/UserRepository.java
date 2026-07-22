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
import org.springframework.data.mongodb.repository.MongoRepository; // Changed import
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
// Changed: Extends MongoRepository instead of JpaRepository
public interface UserRepository extends MongoRepository<User, String> {

    Optional<User> findByEmployeeId(String employeeId);

    boolean existsByEmployeeId(String employeeId);
}
