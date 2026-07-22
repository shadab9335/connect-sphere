//package com.example.UserAndInterest.repository;
//
//import com.example.UserAndInterest.model.Interest;
//import org.springframework.data.jpa.repository.JpaRepository;
//import java.util.List;
//import java.util.Optional;
//
//public interface InterestRepository extends JpaRepository<Interest, String> {
//    // For case-insensitive checks (Requirement: "cricket" matches "Cricket")
//    Optional<Interest> findByInterestNameIgnoreCase(String interestName);
//
//    // For the frontend to fetch cards
//    List<Interest> findByActiveTrue();
//}
//

package com.example.UserAndInterest.repository;

import com.example.UserAndInterest.model.Interest;
import org.springframework.data.mongodb.repository.MongoRepository; // Changed import
import java.util.List;
import java.util.Optional;

// Changed: Extends MongoRepository instead of JpaRepository
public interface InterestRepository extends MongoRepository<Interest, String> {

    Optional<Interest> findByInterestNameIgnoreCase(String interestName);

    List<Interest> findByActiveTrue();
}
