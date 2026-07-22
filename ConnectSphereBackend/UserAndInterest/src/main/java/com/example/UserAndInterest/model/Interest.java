//package com.example.UserAndInterest.model;
//
//import com.fasterxml.jackson.annotation.JsonIgnore;
//import jakarta.persistence.*;
//import lombok.*;
//import java.util.HashSet;
//import java.util.Set;
//
//import org.springframework.data.annotation.Id;
//import org.springframework.data.mongodb.core.mapping.Document;
//
//
// //@Entity
// //@Table(name = "interests")
//@Document(collection = "interests")
//@Data
//@NoArgsConstructor
//@AllArgsConstructor
//@Builder
//public class Interest {
//    @Id
//    @GeneratedValue(strategy = GenerationType.IDENTITY)
//    private Long id;
//
//    @Column(unique = true, nullable = false)
//    private String interestName;
//
//    private String picture; // Emoji
//    private String description;
//
//    @Column(name = "is_active")
//    private boolean active = true;
//
//    @ManyToMany(mappedBy = "interests")
//    @JsonIgnore
//    private Set<User> users = new HashSet<>();
//}
package com.example.UserAndInterest.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.*;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.DocumentReference;

import java.util.HashSet;
import java.util.Set;

@Document(collection = "interests") // Replaces @Entity and @Table
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@JsonIgnoreProperties({"users"})
public class Interest {

    @Id // Standard MongoDB ID
    private String id;

    @Indexed(unique = true) // Replaces @Column(unique = true)
    private String interestName;

    private String picture; // Emoji
    private String description;

    private boolean active = true;

    /**
     * In NoSQL, we typically don't store the full 'Set<User>' here
     * because a single interest could have thousands of users,
     * which would exceed the 16MB MongoDB document limit.
     */

    @DocumentReference(lazy = true)
    private Set<User> users = new HashSet();
}