package com.example.UserAndInterest.config;

import com.example.UserAndInterest.model.Interest;
import com.example.UserAndInterest.model.WorkLocationConfig;
import com.example.UserAndInterest.model.WorkLocationConfig.BuildingEntry;
import com.example.UserAndInterest.model.WorkLocationConfig.DepartmentLocation;
import com.example.UserAndInterest.model.WorkLocationConfig.LocationEntry;
import com.example.UserAndInterest.repository.InterestRepository;
import com.example.UserAndInterest.repository.WorkLocationConfigRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.util.List;

/**
 * MODIFIED: seedWorkLocationConfig() now uses the new hierarchical structure.
 *
 * The cascade hierarchy seeded here is:
 *
 * Application Development     → Bangalore  → G1 (Floors 1-5), G2 (Floors 1-3)
 *                             → Hyderabad  → H1 (Floors 1-4)
 *                             → Noida      → N1 (Floors 1-3)
 *
 * Cloud & Infrastructure Eng  → Bangalore  → C1 (Floors 1-4), C2 (Floors 1-2)
 *                             → Pune       → P1 (Floors 1-3)
 *
 * Data Engineering & Analytics→ Hyderabad  → H2 (Floors 1-3)
 *                             → Chennai    → CH1 (Floors 1-2)
 *
 * Quality Engineering         → Bangalore  → G1 (Floors 1-2), G2 (Floors 1-2)
 *                             → Noida      → N2 (Floors 1-4)
 *
 * DevOps & Site Reliability   → Bangalore  → C1 (Floors 1-3)
 *                             → Hyderabad  → H1 (Floors 1-2)
 *                             → Pune       → P2 (Floors 1-3)
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class AppDataSeeder implements CommandLineRunner {

    private final InterestRepository interestRepository;
    private final WorkLocationConfigRepository workLocationConfigRepository;

    @Override
    public void run(String... args) {
        seedInterests();
        seedWorkLocationConfig();
    }

    private void seedInterests() {
        if (interestRepository.count() > 0) {
            log.info("[Seeder] Skipping interests — already seeded.");
            return;
        }
        List<Interest> interests = List.of(
                Interest.builder().interestName("Cricket")     .picture("🏏").description("Matches, office leagues & weekend games").active(true).build(),
                Interest.builder().interestName("Chess")       .picture("♟️").description("Casual play, tournaments & tactics").active(true).build(),
                Interest.builder().interestName("Badminton")   .picture("🏸").description("Lunch games & after-work matches").active(true).build(),
                Interest.builder().interestName("Running")     .picture("🏃").description("Morning runs & fitness groups").active(true).build(),
                Interest.builder().interestName("Photography") .picture("📷").description("Office walks, shots & techniques").active(true).build(),
                Interest.builder().interestName("Gaming")      .picture("🎮").description("Console, PC & casual gaming").active(true).build(),
                Interest.builder().interestName("Cooking")     .picture("🍳").description("Recipes, food discussions & tips").active(true).build(),
                Interest.builder().interestName("Movies")      .picture("🎬").description("Movie nights & recommendations").active(true).build(),
                Interest.builder().interestName("Travel")      .picture("✈️").description("Trips, treks & travel stories").active(true).build(),
                Interest.builder().interestName("Music")       .picture("🎵").description("Listening sessions & discussions").active(true).build(),
                Interest.builder().interestName("Yoga")        .picture("🧘").description("Wellness, balance & mindset").active(true).build(),
                Interest.builder().interestName("Cycling")     .picture("🚴").description("Weekend rides & routes").active(true).build()
        );
        interestRepository.saveAll(interests);
        log.info("[Seeder] Seeded {} interests.", interests.size());
    }

    /**
     * REFACTORED: Seeds the new hierarchical WorkLocationConfig.
     * Drop the `work_location_config` collection and restart to re-seed.
     */
    private void seedWorkLocationConfig() {
        if (workLocationConfigRepository.count() > 0) {
            log.info("[Seeder] Skipping work location config — already seeded.");
            return;
        }

        WorkLocationConfig config = WorkLocationConfig.builder()
                .departmentLocations(List.of(

                        DepartmentLocation.builder()
                                .department("Application Development")
                                .locations(List.of(
                                        LocationEntry.builder()
                                                .location("Bangalore")
                                                .buildings(List.of(
                                                        BuildingEntry.builder().building("G1")
                                                                .floors(List.of("Floor 1", "Floor 2", "Floor 3", "Floor 4", "Floor 5")).build(),
                                                        BuildingEntry.builder().building("G2")
                                                                .floors(List.of("Floor 1", "Floor 2", "Floor 3")).build()
                                                )).build(),
                                        LocationEntry.builder()
                                                .location("Hyderabad")
                                                .buildings(List.of(
                                                        BuildingEntry.builder().building("H1")
                                                                .floors(List.of("Floor 1", "Floor 2", "Floor 3", "Floor 4")).build()
                                                )).build(),
                                        LocationEntry.builder()
                                                .location("Noida")
                                                .buildings(List.of(
                                                        BuildingEntry.builder().building("N1")
                                                                .floors(List.of("Floor 1", "Floor 2", "Floor 3")).build()
                                                )).build()
                                )).build(),

                        DepartmentLocation.builder()
                                .department("Cloud & Infrastructure Engineering")
                                .locations(List.of(
                                        LocationEntry.builder()
                                                .location("Bangalore")
                                                .buildings(List.of(
                                                        BuildingEntry.builder().building("C1")
                                                                .floors(List.of("Floor 1", "Floor 2", "Floor 3", "Floor 4")).build(),
                                                        BuildingEntry.builder().building("C2")
                                                                .floors(List.of("Floor 1", "Floor 2")).build()
                                                )).build(),
                                        LocationEntry.builder()
                                                .location("Pune")
                                                .buildings(List.of(
                                                        BuildingEntry.builder().building("P1")
                                                                .floors(List.of("Floor 1", "Floor 2", "Floor 3")).build()
                                                )).build()
                                )).build(),

                        DepartmentLocation.builder()
                                .department("Data Engineering & Analytics")
                                .locations(List.of(
                                        LocationEntry.builder()
                                                .location("Hyderabad")
                                                .buildings(List.of(
                                                        BuildingEntry.builder().building("H2")
                                                                .floors(List.of("Floor 1", "Floor 2", "Floor 3")).build()
                                                )).build(),
                                        LocationEntry.builder()
                                                .location("Chennai")
                                                .buildings(List.of(
                                                        BuildingEntry.builder().building("CH1")
                                                                .floors(List.of("Floor 1", "Floor 2")).build()
                                                )).build()
                                )).build(),

                        DepartmentLocation.builder()
                                .department("Quality Engineering & Testing")
                                .locations(List.of(
                                        LocationEntry.builder()
                                                .location("Bangalore")
                                                .buildings(List.of(
                                                        BuildingEntry.builder().building("G1")
                                                                .floors(List.of("Floor 1", "Floor 2")).build(),
                                                        BuildingEntry.builder().building("G2")
                                                                .floors(List.of("Floor 1", "Floor 2")).build()
                                                )).build(),
                                        LocationEntry.builder()
                                                .location("Noida")
                                                .buildings(List.of(
                                                        BuildingEntry.builder().building("N2")
                                                                .floors(List.of("Floor 1", "Floor 2", "Floor 3", "Floor 4")).build()
                                                )).build()
                                )).build(),

                        DepartmentLocation.builder()
                                .department("DevOps & Site Reliability")
                                .locations(List.of(
                                        LocationEntry.builder()
                                                .location("Bangalore")
                                                .buildings(List.of(
                                                        BuildingEntry.builder().building("C1")
                                                                .floors(List.of("Floor 1", "Floor 2", "Floor 3")).build()
                                                )).build(),
                                        LocationEntry.builder()
                                                .location("Hyderabad")
                                                .buildings(List.of(
                                                        BuildingEntry.builder().building("H1")
                                                                .floors(List.of("Floor 1", "Floor 2")).build()
                                                )).build(),
                                        LocationEntry.builder()
                                                .location("Pune")
                                                .buildings(List.of(
                                                        BuildingEntry.builder().building("P2")
                                                                .floors(List.of("Floor 1", "Floor 2", "Floor 3")).build()
                                                )).build()
                                )).build()

                ))
                .build();

        workLocationConfigRepository.save(config);
        log.info("[Seeder] Seeded hierarchical work location config with {} departments.",
                config.getDepartmentLocations().size());
    }
}

