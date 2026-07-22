# FeedService — HobbyConnect

Spring Boot microservice that powers the `FeedScreen.jsx` feed.  
Runs on **port 8082**. Requires MongoDB and a running `UserAndInterest` service on port 8081.

---

## Project Structure

```
FeedService/
├── pom.xml
├── FeedService.postman_collection.json   ← import into Postman to test immediately
└── src/main/java/com/hobbyconnect/feedservice/
    ├── FeedServiceApplication.java
    ├── config/
    │   ├── AppConfig.java              ← RestTemplate bean + static image serving
    │   ├── MongoIndexConfig.java       ← creates all MongoDB indexes on startup
    │   └── DataSeeder.java             ← seeds MOCK_FEED data on first run
    ├── controller/
    │   └── FeedController.java         ← all REST endpoints
    ├── service/
    │   ├── FeedService.java            ← core business logic
    │   ├── FileStorageService.java     ← image upload/delete on disk
    │   └── UserServiceClient.java      ← inter-service call to UserAndInterest
    ├── repository/
    │   ├── FeedPostRepository.java
    │   ├── ReplyRepository.java
    │   └── PostInteractionRepository.java
    ├── model/
    │   ├── FeedPost.java               ← feed_posts collection
    │   ├── Reply.java                  ← post_replies collection
    │   └── PostInteraction.java        ← post_interactions collection (likes + bookmarks)
    ├── dto/
    │   └── Dtos.java                   ← all request/response DTOs in one file
    ├── util/
    │   └── JwtUtil.java                ← extracts userId from Bearer token
    └── exception/
        ├── ResourceNotFoundException.java
        ├── UnauthorizedException.java
        └── GlobalExceptionHandler.java
```

---

## Prerequisites

| Requirement | Version |
|-------------|---------|
| Java        | 17+     |
| Maven       | 3.8+    |
| MongoDB     | 6+      |
| UserAndInterest service | running on port 8081 |

---

## Configuration (`application.properties`)

```properties
server.port=8082
spring.data.mongodb.uri=mongodb://localhost:27017/feeddb

# MUST match the jwt.secret in your UserAndInterest service
jwt.secret=YourSuperSecretKeyThatIsAtLeast256BitsLongForHMACSHA

# Image upload directory (created automatically on startup)
file.upload-dir=uploads/feed

# UserAndInterest service URL
user.service.base-url=http://localhost:8081
```

> **Important:** `jwt.secret` must be identical in both services, otherwise token
> validation will fail with a 401 error in FeedService.

---

## Running the Service

```bash
# From the FeedService/ directory
mvn spring-boot:run
```

On first startup:
- MongoDB collections `feed_posts`, `post_replies`, `post_interactions` are created automatically.
- All indexes are created by `MongoIndexConfig`.
- `DataSeeder` seeds 12 mock posts from your original `MOCK_FEED` constant. It skips seeding on subsequent restarts.
- The `uploads/feed/` directory is created for image storage.

---

## API Endpoints — Quick Reference

All endpoints except `GET /api/feed/tabs` require:
```
Authorization: Bearer <JWT token from UserAndInterest login>
```

### Posts
| Method | URL | Body / Params | Notes |
|--------|-----|---------------|-------|
| `GET`  | `/api/feed/tabs` | — | No auth required |
| `GET`  | `/api/feed/posts` | `?tag=Cricket&page=0&size=20` | Omit tag for "All" |
| `POST` | `/api/feed/posts` | `multipart/form-data` | See fields below |
| `GET`  | `/api/feed/posts/{id}` | — | Single post |
| `DELETE` | `/api/feed/posts/{id}` | — | Owner only |

#### POST /api/feed/posts — form-data fields

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `content` | text | ✅ | Max 1000 chars |
| `tag` | text | ✅ | Cricket / Movies / Travel / etc. |
| `anonymous` | text | — | `"true"` or `"false"` (default false) |
| `eventStatus` | text | — | `"upcoming"` / `"happened"` / `"none"` |
| `eventDate` | text | — | e.g. `"Sat, Apr 5 · 7:00 AM"` |
| `eventLocation` | text | — | e.g. `"Cubbon Park, Bangalore"` |
| `image` | file | — | JPEG / PNG / GIF / WEBP · max 5 MB |

### Likes
| Method | URL |
|--------|-----|
| `POST` | `/api/feed/posts/{id}/like` |
| `DELETE` | `/api/feed/posts/{id}/like` |

### Bookmarks
| Method | URL |
|--------|-----|
| `POST` | `/api/feed/posts/{id}/bookmark` |
| `DELETE` | `/api/feed/posts/{id}/bookmark` |
| `GET` | `/api/feed/user/{userId}/bookmarks` |

### Replies
| Method | URL | Body |
|--------|-----|------|
| `GET` | `/api/feed/posts/{id}/replies` | — |
| `POST` | `/api/feed/posts/{id}/replies` | `{ "content": "...", "anonymous": false }` |
| `DELETE` | `/api/feed/replies/{replyId}` | — |

### User-scoped
| Method | URL |
|--------|-----|
| `GET` | `/api/feed/user/{userId}/posts` |
| `GET` | `/api/feed/user/{userId}/bookmarks` |

---

## Image Upload & Access

When you upload an image with a post, the response contains:

```json
{
  "imageUrl": "/uploads/feed/3f8a1c2d-photo.jpg"
}
```

The image is directly accessible at:
```
http://localhost:8082/uploads/feed/3f8a1c2d-photo.jpg
```

In your React frontend, use it as:
```jsx
{post.imageUrl && (
  <img src={`http://localhost:8082${post.imageUrl}`} alt="post" />
)}
```

Images are stored on disk under `uploads/feed/` in the working directory and deleted automatically when the post is deleted.

---

## Postman Setup (Step-by-Step)

1. **Import** `FeedService.postman_collection.json` into Postman.
2. Open the collection and click **Variables**.
3. Set `token` to the JWT returned by your UserAndInterest `/api/auth/login` endpoint.
4. Run **GET /tabs** — no auth needed, confirms the service is up.
5. Run **GET /posts** — should return the 12 seeded mock posts.
6. Run **POST /posts** (text only) — copy the `id` from the response.
7. Paste that `id` as the `postId` collection variable.
8. Test like, unlike, bookmark, reply endpoints using that postId.
9. For image upload, select the **POST /posts (with image)** request and attach a file.

---

## Running Tests

```bash
mvn test
```

---

## MongoDB Collections

```
feeddb
├── feed_posts          ← main posts
├── post_replies        ← replies to posts
└── post_interactions   ← likes and bookmarks (unique per user+post+type)
```

You can inspect the data directly with:
```bash
mongosh feeddb
db.feed_posts.find().pretty()
db.post_interactions.find({ type: "LIKE" })
db.post_replies.find({ postId: "<postId>" })
```
