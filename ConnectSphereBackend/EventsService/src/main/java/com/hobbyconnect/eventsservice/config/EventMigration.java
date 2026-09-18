package com.hobbyconnect.eventsservice.config;
import jakarta.annotation.PostConstruct;

import lombok.RequiredArgsConstructor;

import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.data.mongodb.core.query.Update;
import org.springframework.stereotype.Component;

import com.hobbyconnect.eventsservice.model.Event;

@Component
@RequiredArgsConstructor
public class EventMigration {

    private final MongoTemplate mongoTemplate;

    @PostConstruct
    public void addCompletedField() {

        Query query = Query.query(
                Criteria.where("completed").exists(false));

        Update update = new Update()
                .set("completed", false);

        mongoTemplate.updateMulti(query, update, Event.class);
    }
}
