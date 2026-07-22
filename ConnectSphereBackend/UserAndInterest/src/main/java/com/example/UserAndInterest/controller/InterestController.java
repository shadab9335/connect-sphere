package com.example.UserAndInterest.controller;

import com.example.UserAndInterest.dto.ApiResponse;
import com.example.UserAndInterest.model.Interest;
import com.example.UserAndInterest.service.InterestService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/interests")
@RequiredArgsConstructor
@CrossOrigin("*")
public class InterestController {

    private final InterestService interestService;

    // Requirement: Add or modify master interests
    @PostMapping("/manage")
    public ResponseEntity<ApiResponse> manageInterests(@RequestBody List<Interest> interests) {
        return ResponseEntity.ok(interestService.addOrUpdateInterests(interests));
    }

    // Requirement: Fetch for frontend cards
    @GetMapping("/active")
    public ResponseEntity<ApiResponse> getActiveInterests() {
        return ResponseEntity.ok(interestService.getActiveInterests());
    }
}