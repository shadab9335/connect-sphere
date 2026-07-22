package com.example.UserAndInterest.controller;

import com.example.UserAndInterest.dto.ApiResponse;
import com.example.UserAndInterest.service.WorkLocationConfigService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 * REFACTORED: Exposes four cascading dropdown endpoints.
 *
 * All endpoints are under /auth/** so they are publicly accessible
 * (no JWT required) — the signup screen calls them before the user has a token.
 *
 * Cascade hierarchy:
 *   Step 1 → GET /auth/cascade/departments
 *   Step 2 → GET /auth/cascade/locations?department=...
 *   Step 3 → GET /auth/cascade/buildings?department=...&location=...
 *   Step 4 → GET /auth/cascade/floors?department=...&location=...&building=...
 */
@RestController
@CrossOrigin(origins = "*")
@RequiredArgsConstructor
@Slf4j
@RequestMapping("/auth/cascade")
public class WorkLocationConfigController {

    private final WorkLocationConfigService workLocationConfigService;

    /** Step 1 — Populate the Department dropdown. No parent param needed. */
    @GetMapping("/departments")
    public ResponseEntity<ApiResponse> getDepartments() {
        log.info("[CascadeDropdown] Fetching all departments");
        return ResponseEntity.ok(workLocationConfigService.getDepartments());
    }

    /**
     * Step 2 — Populate the Location dropdown after Department is chosen.
     * @param department Selected in Step 1.
     */
    @GetMapping("/locations")
    public ResponseEntity<ApiResponse> getLocations(@RequestParam String department) {
        log.info("[CascadeDropdown] Fetching locations for department='{}'", department);
        return ResponseEntity.ok(workLocationConfigService.getLocations(department));
    }

    /**
     * Step 3 — Populate the Building dropdown after Location is chosen.
     * @param department Selected in Step 1.
     * @param location   Selected in Step 2.
     */
    @GetMapping("/buildings")
    public ResponseEntity<ApiResponse> getBuildings(
            @RequestParam String department,
            @RequestParam String location) {
        log.info("[CascadeDropdown] Fetching buildings for department='{}', location='{}'", department, location);
        return ResponseEntity.ok(workLocationConfigService.getBuildings(department, location));
    }

    /**
     * Step 4 — Populate the Floor dropdown after Building is chosen.
     * @param department Selected in Step 1.
     * @param location   Selected in Step 2.
     * @param building   Selected in Step 3.
     */
    @GetMapping("/floors")
    public ResponseEntity<ApiResponse> getFloors(
            @RequestParam String department,
            @RequestParam String location,
            @RequestParam String building) {
        log.info("[CascadeDropdown] Fetching floors for department='{}', location='{}', building='{}'",
                department, location, building);
        return ResponseEntity.ok(workLocationConfigService.getFloors(department, location, building));
    }
}
