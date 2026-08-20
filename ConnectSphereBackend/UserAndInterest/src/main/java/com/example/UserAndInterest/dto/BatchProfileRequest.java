package com.example.UserAndInterest.dto;

import lombok.Data;
import java.util.List;

@Data
public class BatchProfileRequest {
    private List<String> userIds;
}