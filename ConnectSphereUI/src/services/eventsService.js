// src/services/eventsService.js
// Mirrors profileService.js / feedService.js pattern — calls EventsService microservice.

const EVENTS_BASE = "http://localhost:8083/api/events";

function authHeader() {
    const token = localStorage.getItem("token");
    return token ? { Authorization: `Bearer ${token}` } : {};
}

/** All upcoming events (used by EventsScreen). */
export async function fetchAllEvents() {
    const res = await fetch(EVENTS_BASE, { headers: authHeader() });
    return res.json();
}

/** Events hosted by the logged-in user. */
export async function fetchMyHostedEvents() {
    const res = await fetch(`${EVENTS_BASE}/my-hosted`, { headers: authHeader() });
    return res.json();
}

/** Events the logged-in user joined (but did not host). */
export async function fetchMyJoinedEvents() {
    const res = await fetch(`${EVENTS_BASE}/my-joined`, { headers: authHeader() });
    return res.json();
}

/** Past events (before today) where the user was host or attendee. */
export async function fetchMyPastEvents() {
    const res = await fetch(`${EVENTS_BASE}/my-past`, { headers: authHeader() });
    return res.json();
}

/** Attendee list for a specific event (used by attendees drawer in MyEventsScreen). */
export async function fetchEventAttendees(eventId) {
    const res = await fetch(`${EVENTS_BASE}/${eventId}/attendees`, { headers: authHeader() });
    return res.json();
}

/** Interests for a specific user by their MongoDB ObjectId (used by attendees drawer). */
export async function fetchUserInterests(userId) {
    const res = await fetch(`http://localhost:8081/api/users/${userId}/interests`, {
        headers: authHeader(),
    });
    return res.json();
}

/** Delete an event (Host functionality). */
export async function deleteEvent(eventId) {
    const res = await fetch(`${EVENTS_BASE}/${eventId}`, {
        method: "DELETE",
        headers: authHeader(),
    });
    return res.json();
}

/** Update Date and Time of an event (Host functionality). */
export async function updateEventDateTime(eventId, date, time) {
    const res = await fetch(`${EVENTS_BASE}/${eventId}/datetime`, {
        method: "PUT",
        headers: { ...authHeader(), "Content-Type": "application/json" },
        body: JSON.stringify({ date, time }),
    });
    return res.json();
}

/** Acknowledge reading an update notice. */
export async function acknowledgeEventUpdate(eventId) {
    const res = await fetch(`${EVENTS_BASE}/${eventId}/acknowledge`, {
        method: "POST",
        headers: authHeader(),
    });
    return res.json();
}

export async function acknowledgeEventCancellation(eventId) {
    const res = await fetch(`${EVENTS_BASE}/${eventId}/acknowledge-cancellation`, {
        method: "POST",
        headers: authHeader(),
    });
    return res.json();
}

/** Dismiss all updates/cancellations at once */
export async function acknowledgeAllEventNotices(eventList) {
    const promises = eventList.map(ev => {
        if (ev.needsCancellationNotification) {
            return acknowledgeEventCancellation(ev.id);
        }
        if (ev.needsNotification) {
            return acknowledgeEventUpdate(ev.id);
        }
        return Promise.resolve();
    });
    return Promise.all(promises);
}