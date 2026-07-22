package com.example.UserAndInterest.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * UI-shaped representation of an Interest.
 *
 * The internal {@link com.example.UserAndInterest.model.Interest} document
 * uses domain field names (interestName, picture). The UI's tile grid uses
 * (label, emoji). This DTO is the translation layer between them — it
 * keeps the Mongo schema stable while letting the frontend consume names
 * that match its own vocabulary.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class InterestResponse {
    private String id;          // same value as label — lets the UI key React tiles by id
    private String label;       // mapped from Interest.interestName
    private String emoji;       // mapped from Interest.picture
    private String description; // pass-through
}
