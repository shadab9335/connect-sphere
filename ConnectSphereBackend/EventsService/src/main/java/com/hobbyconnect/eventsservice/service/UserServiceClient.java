package com.hobbyconnect.eventsservice.service;

import com.hobbyconnect.eventsservice.dto.Dtos.UserProfileDto;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

@Service
public class UserServiceClient {

    private final RestTemplate restTemplate;
    private final String userServiceBaseUrl;

    public UserServiceClient(RestTemplate restTemplate,
                             @Value("${user.service.base-url}") String userServiceBaseUrl) {
        this.restTemplate = restTemplate;
        this.userServiceBaseUrl = userServiceBaseUrl;
    }

    public UserProfileDto getUserProfile(String userId) {
        try {
            String url = userServiceBaseUrl + "/api/users/" + userId + "/profile";
            return restTemplate.getForObject(url, UserProfileDto.class);
        } catch (Exception e) {
            UserProfileDto fallback = new UserProfileDto();
            fallback.setUserId(userId);
            fallback.setDisplayName("User " + userId);
            fallback.setAvatar(userId.length() >= 2
                    ? userId.substring(0, 2).toUpperCase() : userId.toUpperCase());
            fallback.setColor("#8892B0");
            return fallback;
        }
    }
}
