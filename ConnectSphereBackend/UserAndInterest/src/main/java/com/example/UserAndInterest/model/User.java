////package com.example.UserAndInterest.model;
////
////import jakarta.persistence.*;
////import lombok.*;
////import java.util.HashSet;
////import java.util.Set;
////
////import org.springframework.data.annotation.Id;
////import org.springframework.data.mongodb.core.mapping.Document;
////
////@Document(collection = "users")
//////@Entity
//////@Table(name = "users")
////@Data
////@NoArgsConstructor
////@AllArgsConstructor
////@Builder
////public class User {
////    @Id
////    @GeneratedValue(strategy = GenerationType.IDENTITY)
////    private Long id;
////
////    @Column(unique = true, nullable = false)
////    private String employeeId;
////
////    @Column(nullable = false)
////    private String password;
////
////    @Column(nullable = false)
////    private String fullName;
////
////    @Column(nullable = false)
////    private boolean isAnonymous;
////
////    @ManyToMany(fetch = FetchType.LAZY)
////    @JoinTable(
////            name = "user_interests",
////            joinColumns = @JoinColumn(name = "user_id"),
////            inverseJoinColumns = @JoinColumn(name = "interest_id")
////    )
////    private Set<Interest> interests = new HashSet<>();
////}
////
//
//package com.example.UserAndInterest.model;
//
//import lombok.*;
//import org.springframework.data.annotation.Id;
//import org.springframework.data.mongodb.core.index.Indexed;
//import org.springframework.data.mongodb.core.mapping.Document;
//import org.springframework.data.mongodb.core.mapping.DocumentReference;
//
//import java.util.HashSet;
//import java.util.Set;
//
//@Document(collection = "users") // Replaces @Entity and @Table
//@Data
//@NoArgsConstructor
//@AllArgsConstructor
//@Builder
//public class User {
//
//    @Id // In MongoDB, @Id is usually a String or ObjectId
//    private String id;
//
//    @Indexed(unique = true) // Replaces @Column(unique = true)
//    private String employeeId;
//
//    private String password; // @Column is no longer needed for standard fields
//
//    private String fullName;
//
//    private boolean isAnonymous;
//
//    /**
//     * Option 1: @DocumentReference (Linking)
//     * This stores only the IDs of the interests in the User document.
//     * Use this if 'Interest' is a standalone collection managed elsewhere.
//     */
//    @DocumentReference
//    private Set<Interest> interests = new HashSet<>();
//
//    /* * Option 2: Embedding (Alternative)
//     * If you want the full Interest data stored INSIDE the User document
//     * for faster reads, simply remove the @DocumentReference annotation.
//     */
//}

package com.example.UserAndInterest.model;

import lombok.*;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.DocumentReference;

import java.util.HashSet;
import java.util.Set;

@Document(collection = "users")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class User {

    @Id
    private String id;

    @Indexed(unique = true)
    private String employeeId;

    private String password;

    private String fullName;

    private boolean isAnonymous;

    // Avatar initials — derived from fullName on registration (e.g. "Arjun Mehta" → "AM")
    // FeedService uses this field when building post author display
    private String avatar;

    // Avatar background color — randomly assigned on registration
    // FeedService uses this field when building post author display
    private String avatarColor;

    // Work location — collected at registration via dropdowns on the UI
    private String department;     // e.g. "Application Development"
    private String location;    // e.g. "Bangalore"
    private String building;       // e.g. "G1"
    private String floor;          // e.g. "Floor 3"

    // Optional Base64 data-URI uploaded by the user from the profile screen
    // Format: "data:image/jpeg;base64,..."
    private String profilePicture;

    @DocumentReference
    private Set<Interest> interests = new HashSet<>();
}
