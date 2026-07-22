package com.hobbyconnect.eventsservice.repository;

import com.hobbyconnect.eventsservice.model.Event;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface EventRepository extends MongoRepository<Event, String> {

    List<Event> findByDeletedFalseOrderByCreatedAtDesc();

    List<Event> findByInterestAndDeletedFalseOrderByCreatedAtDesc(String interest);

    @Query("{ 'attendeeIds': ?0, 'deleted': false }")
    List<Event> findByAttendeeAndDeletedFalse(String userId);

    // ADDED: events hosted by a specific user
    List<Event> findByHostIdAndDeletedFalseOrderByCreatedAtDesc(String hostId);

    // ADDED: events user joined but did NOT host (for "Joined" tab)
    @Query("{ 'attendeeIds': { $elemMatch: { $eq: ?0 } }, 'hostId': { $ne: ?1 }, 'deleted': false }")
    List<Event> findJoinedButNotHosted(String userId, String hostId);

    // ADDED: past events (date before today) where user was host or attendee
    // date stored as yyyy-MM-dd so lexicographic < works correctly
    @Query("{ $and: [ { 'deleted': false }, { 'date': { $lt: ?0 } }, { $or: [ { 'hostId': ?1 }, { 'attendeeIds': { $elemMatch: { $eq: ?1 } } } ] } ] }")
    List<Event> findPastEventsForUser(String todayStr, String userId);

    List<Event> findByAttendeeIdsContainsAndDeletedTrue(String userId);
}
