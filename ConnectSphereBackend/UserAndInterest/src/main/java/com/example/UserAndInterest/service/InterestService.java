//package com.example.UserAndInterest.service;
//
//
//import com.example.UserAndInterest.dto.ApiResponse;
//import com.example.UserAndInterest.model.Interest;
//import com.example.UserAndInterest.repository.InterestRepository;
//import lombok.RequiredArgsConstructor;
//import org.springframework.stereotype.Service;
//import org.springframework.transaction.annotation.Transactional;
//import java.util.ArrayList;
//import java.util.List;
//import java.util.Optional;
//
//@Service
//@RequiredArgsConstructor
//public class InterestService {
//    private final InterestRepository interestRepository;
//
//    @Transactional
//    public ApiResponse addOrUpdateInterests(List<Interest> incomingInterests) {
//        if (incomingInterests == null || incomingInterests.isEmpty()) {
//            return ApiResponse.error("Interest list cannot be empty");
//        }
//
//        List<Interest> processed = new ArrayList<>();
//        for (Interest input : incomingInterests) {
//            Optional<Interest> existing = interestRepository
//                    .findByInterestNameIgnoreCase(input.getInterestName());
//
//            if (existing.isPresent()) {
//                // Update metadata but keep the original Name casing
//                Interest record = existing.get();
//                record.setPicture(input.getPicture());
//                record.setDescription(input.getDescription());
//                record.setActive(input.isActive());
//                processed.add(interestRepository.save(record));
//            } else {
//                processed.add(interestRepository.save(input));
//            }
//        }
//        return ApiResponse.success("Interests synced successfully", processed);
//    }
//
//    public ApiResponse getActiveInterests() {
//        return ApiResponse.success("Fetched active interests", interestRepository.findByActiveTrue());
//    }
//}



package com.example.UserAndInterest.service;

import com.example.UserAndInterest.dto.ApiResponse;
import com.example.UserAndInterest.dto.InterestResponse;
import com.example.UserAndInterest.model.Interest;
import com.example.UserAndInterest.repository.InterestRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class InterestService {
    private final InterestRepository interestRepository;

    // Note: @Transactional in Mongo requires a TransactionManager Bean
    // and a Replica Set setup. For local dev, it's often omitted.
    public ApiResponse addOrUpdateInterests(List<Interest> incomingInterests) {
        if (incomingInterests == null || incomingInterests.isEmpty()) {
            return ApiResponse.error("Interest list cannot be empty");
        }

        List<Interest> processed = new ArrayList<>();
        for (Interest input : incomingInterests) {
            if(input.getInterestName()==null || input.getInterestName().isBlank()){
                return ApiResponse.error("Each interest must have non blank name");
            }
            Optional<Interest> existing = interestRepository
                    .findByInterestNameIgnoreCase(input.getInterestName());

            if (existing.isPresent()) {
                Interest record = existing.get();
                record.setPicture(input.getPicture());
                record.setDescription(input.getDescription());
                record.setActive(input.isActive());
                processed.add(interestRepository.save(record));
            } else {
                // Ensure ID is null so Mongo generates a new ObjectId
                input.setId(null);
                processed.add(interestRepository.save(input));
            }
        }
        return ApiResponse.success("Interests synced successfully", processed);
    }

    public ApiResponse getActiveInterests() {
        // Translate each domain Interest to the UI-shaped InterestResponse so
        // the frontend receives { id, label, emoji, description } directly
        // instead of having to remap { interestName, picture } on its side.
        List<InterestResponse> dtos = interestRepository.findByActiveTrue()
                .stream()
                .map(i -> InterestResponse.builder()
                        .id(i.getInterestName())   // UI keys tiles by id — using the name keeps it stable & readable
                        .label(i.getInterestName())
                        .emoji(i.getPicture())
                        .description(i.getDescription())
                        .build())
                .toList();
        return ApiResponse.success("Fetched active interests", dtos);
    }
}