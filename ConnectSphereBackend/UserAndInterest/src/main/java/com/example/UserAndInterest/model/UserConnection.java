/*
package com.example.UserAndInterest.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.Field;
import org.springframework.data.mongodb.core.mapping.FieldType;

import java.time.Instant;

@Document(collection = "user_connections")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserConnection {

    @Id
    private String id;

    @Indexed(unique = true)
    private String connectionKey;

    @Indexed
    @Field(targetType = FieldType.OBJECT_ID)
    private String requesterUserId;

    @Indexed
    @Field(targetType = FieldType.OBJECT_ID)
    private String recipientUserId;

    private Instant createdAt;
}

*/


package com.example.UserAndInterest.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.Field;
import org.springframework.data.mongodb.core.mapping.FieldType;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

@Document(collection = "user_connections")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserConnection {

    @Id
    private String id;

    @Indexed(unique = true)
    @Field(targetType = FieldType.OBJECT_ID)
    private String userId;

    @Builder.Default
    @Field(targetType = FieldType.OBJECT_ID)
    private List<String> connectedUserIds = new ArrayList<>();

    private Instant updatedAt;
}