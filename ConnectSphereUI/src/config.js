// Single source of truth for backend base URLs.
// Every services/* file imports from here. No HTTP URL appears
// anywhere else in the app.

const config = {
    USER_API: "http://localhost:8081",
    FEED_API: "http://localhost:8082",
    CHAT_API: "http://localhost:8084", // added for chat service - pritam
    EVENT_API: "http://localhost:8083", // added for event service - pritam
};

export default config;
