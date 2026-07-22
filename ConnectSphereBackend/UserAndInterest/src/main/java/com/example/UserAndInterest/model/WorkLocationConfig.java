package com.example.UserAndInterest.model;

import lombok.*;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.util.List;

/**
 * REFACTORED: Now stores hierarchical location data instead of three flat lists.
 *
 * OLD structure (flat):
 *   { departments: [...], buildings: [...], floors: [...] }
 *
 * NEW structure (nested):
 *   { departmentLocations: [
 *       {
 *         department: "Application Development",
 *         locations: [
 *           {
 *             location: "Bangalore",
 *             buildings: [
 *               { building: "G1", floors: ["Floor 1", "Floor 2", "Floor 3"] },
 *               { building: "G2", floors: ["Floor 1", "Floor 2"] }
 *             ]
 *           }
 *         ]
 *       }
 *   ]}
 *
 * This is still stored as a SINGLETON document in the work_location_config collection.
 */
@Document(collection = "work_location_config")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class WorkLocationConfig {

    @Id
    private String id;

    /** The top-level list. Each entry represents one department and all locations/buildings/floors under it. */
    private List<DepartmentLocation> departmentLocations;

    // ── Nested static classes (embedded sub-documents) ──────────────────────

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class DepartmentLocation {
        private String department;             // e.g. "Application Development"
        private List<LocationEntry> locations; // cities where this dept exists
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class LocationEntry {
        private String location;               // e.g. "Bangalore"
        private List<BuildingEntry> buildings; // buildings in this city for this dept
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class BuildingEntry {
        private String building;    // e.g. "G1"
        private List<String> floors; // e.g. ["Floor 1", "Floor 2", "Floor 3"]
    }
}

