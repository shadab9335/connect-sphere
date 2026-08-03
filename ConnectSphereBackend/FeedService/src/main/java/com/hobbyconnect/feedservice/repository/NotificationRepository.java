package com.hobbyconnect.feedservice.repository;

import com.hobbyconnect.feedservice.model.Notification;
import org.springframework.data.mongodb.repository.MongoRepository;
import java.util.List;

public interface NotificationRepository extends MongoRepository<Notification, String> {
    // Find unread notifications for the logged-in user
    List<Notification> findByRecipientUserIdAndReadFalseOrderByCreatedAtDesc(String recipientUserId);

    void deleteByRecipientUserIdAndId(String recipientUserId, String notificationId);
    void deleteAllByRecipientUserId(String recipientUserId);
}