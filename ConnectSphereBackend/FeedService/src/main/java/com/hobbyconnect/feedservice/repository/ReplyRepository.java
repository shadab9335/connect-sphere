package com.hobbyconnect.feedservice.repository;

import com.hobbyconnect.feedservice.model.Reply;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ReplyRepository extends MongoRepository<Reply, String> {

    List<Reply> findByPostIdOrderByCreatedAtAsc(String postId);

    long countByPostId(String postId);

    void deleteByPostId(String postId);
}
