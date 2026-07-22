package com.example.UserAndInterest.dto;

import lombok.*;
import java.util.List;

/**
 * DTOs for the cascading dropdown endpoints.
 *
 * Flow: Departments → Locations (by dept) → Buildings (by dept+location) → Floors (by dept+location+building)
 */
public class CascadingLocationDtos {

    // ── Response: GET /auth/cascade/departments ─────────────────────────────
    /** Returns the list of all department names for the first dropdown. */
    @Data @Builder @NoArgsConstructor @AllArgsConstructor
    public static class DepartmentsResponse {
        private List<String> departments;
    }

    // ── Response: GET /auth/cascade/locations?department=... ────────────────
    /** Returns the city/location names that have the selected department. */
    @Data @Builder @NoArgsConstructor @AllArgsConstructor
    public static class LocationsResponse {
        private String department;        // echoed back for the client's reference
        private List<String> locations;
    }

    // ── Response: GET /auth/cascade/buildings?department=...&location=... ───
    /** Returns the building names for the selected dept + location. */
    @Data @Builder @NoArgsConstructor @AllArgsConstructor
    public static class BuildingsResponse {
        private String department;
        private String location;
        private List<String> buildings;
    }

    // ── Response: GET /auth/cascade/floors?department=...&location=...&building=... ──
    /** Returns the floor list for the selected dept + location + building. */
    @Data @Builder @NoArgsConstructor @AllArgsConstructor
    public static class FloorsResponse {
        private String department;
        private String location;
        private String building;
        private List<String> floors;
    }
}
