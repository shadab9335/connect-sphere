package com.example.UserAndInterest.service;

import com.example.UserAndInterest.dto.ApiResponse;
import com.example.UserAndInterest.dto.CascadingLocationDtos.*;
import com.example.UserAndInterest.model.WorkLocationConfig;
import com.example.UserAndInterest.model.WorkLocationConfig.BuildingEntry;
import com.example.UserAndInterest.model.WorkLocationConfig.DepartmentLocation;
import com.example.UserAndInterest.model.WorkLocationConfig.LocationEntry;
import com.example.UserAndInterest.repository.WorkLocationConfigRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.Collections;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

/**
 * REFACTORED: Cascading filter service for the 4-step dropdown flow.
 *
 * Data flow:
 *   [Department] ──→ getLocations(dept)
 *                 ──→ getBuildings(dept, location)
 *                 ──→ getFloors(dept, location, building)
 *
 * All four methods load the singleton config document once, then filter
 * the nested structure in memory — no extra DB round-trips.
 */
@Service
@RequiredArgsConstructor
public class WorkLocationConfigService {

    private final WorkLocationConfigRepository configRepository;

    // ── Helper: load the singleton config ──────────────────────────────────

    private Optional<WorkLocationConfig> loadConfig() {
        return configRepository.findFirstBy();
    }

    // ── Step 1: all department names ────────────────────────────────────────

    /**
     * GET /auth/cascade/departments
     * Returns a flat list of all department names.
     */
    public ApiResponse getDepartments() {
        return loadConfig()
                .map(cfg -> {
                    List<String> depts = cfg.getDepartmentLocations()
                            .stream()
                            .map(DepartmentLocation::getDepartment)
                            .collect(Collectors.toList());
                    return ApiResponse.success("Departments fetched",
                            DepartmentsResponse.builder().departments(depts).build());
                })
                .orElse(ApiResponse.error("Work location config not found. Please seed the database."));
    }

    // ── Step 2: locations filtered by department ─────────────────────────────

    /**
     * GET /auth/cascade/locations?department=Application+Development
     * Returns all city/location names where the given department exists.
     */
    public ApiResponse getLocations(String department) {
        return loadConfig()
                .map(cfg -> {
                    List<String> locations = cfg.getDepartmentLocations()
                            .stream()
                            .filter(dl -> dl.getDepartment().equalsIgnoreCase(department))
                            .findFirst()
                            .map(dl -> dl.getLocations()
                                    .stream()
                                    .map(LocationEntry::getLocation)
                                    .collect(Collectors.toList()))
                            .orElse(Collections.emptyList());

                    if (locations.isEmpty()) {
                        return ApiResponse.error("No locations found for department: " + department);
                    }
                    return ApiResponse.success("Locations fetched",
                            LocationsResponse.builder()
                                    .department(department)
                                    .locations(locations)
                                    .build());
                })
                .orElse(ApiResponse.error("Work location config not found."));
    }

    // ── Step 3: buildings filtered by department + location ──────────────────

    /**
     * GET /auth/cascade/buildings?department=Application+Development&location=Bangalore
     * Returns all building names for the given dept + location.
     */
    public ApiResponse getBuildings(String department, String location) {
        return loadConfig()
                .map(cfg -> {
                    List<String> buildings = cfg.getDepartmentLocations()
                            .stream()
                            .filter(dl -> dl.getDepartment().equalsIgnoreCase(department))
                            .findFirst()
                            .flatMap(dl -> dl.getLocations()
                                    .stream()
                                    .filter(le -> le.getLocation().equalsIgnoreCase(location))
                                    .findFirst())
                            .map(le -> le.getBuildings()
                                    .stream()
                                    .map(BuildingEntry::getBuilding)
                                    .collect(Collectors.toList()))
                            .orElse(Collections.emptyList());

                    if (buildings.isEmpty()) {
                        return ApiResponse.error(
                                "No buildings found for department: " + department + ", location: " + location);
                    }
                    return ApiResponse.success("Buildings fetched",
                            BuildingsResponse.builder()
                                    .department(department)
                                    .location(location)
                                    .buildings(buildings)
                                    .build());
                })
                .orElse(ApiResponse.error("Work location config not found."));
    }

    // ── Step 4: floors filtered by department + location + building ──────────

    /**
     * GET /auth/cascade/floors?department=Application+Development&location=Bangalore&building=G1
     * Returns all floor names for the given dept + location + building.
     */
    public ApiResponse getFloors(String department, String location, String building) {
        return loadConfig()
                .map(cfg -> {
                    List<String> floors = cfg.getDepartmentLocations()
                            .stream()
                            .filter(dl -> dl.getDepartment().equalsIgnoreCase(department))
                            .findFirst()
                            .flatMap(dl -> dl.getLocations()
                                    .stream()
                                    .filter(le -> le.getLocation().equalsIgnoreCase(location))
                                    .findFirst())
                            .flatMap(le -> le.getBuildings()
                                    .stream()
                                    .filter(be -> be.getBuilding().equalsIgnoreCase(building))
                                    .findFirst())
                            .map(BuildingEntry::getFloors)
                            .orElse(Collections.emptyList());

                    if (floors.isEmpty()) {
                        return ApiResponse.error(
                                "No floors found for dept: " + department + ", location: " + location + ", building: " + building);
                    }
                    return ApiResponse.success("Floors fetched",
                            FloorsResponse.builder()
                                    .department(department)
                                    .location(location)
                                    .building(building)
                                    .floors(floors)
                                    .build());
                })
                .orElse(ApiResponse.error("Work location config not found."));
    }

    // ── Admin / seeder helper ────────────────────────────────────────────────

    /**
     * Upsert: replaces the singleton config document with a new hierarchical structure.
     * Called from AppDataSeeder on first startup.
     */
    public ApiResponse saveHierarchicalConfig(List<DepartmentLocation> departmentLocations) {
        WorkLocationConfig cfg = configRepository.findFirstBy()
                .orElse(new WorkLocationConfig());
        cfg.setDepartmentLocations(departmentLocations);
        configRepository.save(cfg);
        return ApiResponse.success("Work location config saved", null);
    }
}
