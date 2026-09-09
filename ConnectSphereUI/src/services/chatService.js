import axios from "axios";
import config from "../config";
import { colorFor, initialsOf } from "../screens/app/chat/chatUtils";

const BASE = `${config.CHAT_API}/conversations`;

// ChatService resolves "Bearer <token>" against UserAndInterest's
// /auth/validate, which maps the mock token to the user's Mongo _id — the same
// id DiscoverScreen passes around. No real JWT is involved yet.
const authHeader = () => ({
    Authorization: `Bearer ${localStorage.getItem("token") || ""}`,
});

/** The logged-in user's Mongo _id, matching what /auth/validate returns. */
export const currentUserId = () => {
    try {
        return JSON.parse(localStorage.getItem("user") || "{}").id || null;
    } catch {
        return null;
    }
};

/**
 * POST /conversations — find-or-create. Safe to call on every click: the
 * backend's unique sparse index on dmKey reuses the existing DM between the
 * same two users instead of making a duplicate.
 */
export const createDmConversation = (otherUserId) =>
    axios.post(BASE, { type: "DM", participantIds: [otherUserId] }, { headers: authHeader() });

/** GET /conversations — now returns ConversationSummaryDTO[] (see hydrateConversation). */
export const listConversations = () =>
    axios.get(BASE, { headers: authHeader() });

export const fetchMessages = (conversationId, before) =>
    axios.get(`${BASE}/${conversationId}/messages`, {
        params: before ? { before } : {},
        headers: authHeader(),
    });

/**
 * POST /conversations/{id}/attachments — uploads one image/video/file to
 * ImageKit and returns an Attachment reference (never the raw bytes).
 * The caller sends that reference over the WebSocket next (see
 * useChatSocket's sendMessage) — upload first, then publish, same two-step
 * flow the backend was already built for.
 */
export const uploadAttachment = (conversationId, file) => {
    const formData = new FormData();
    formData.append("file", file);
    return axios.post(`${BASE}/${conversationId}/attachments`, formData, {
        headers: { ...authHeader(), "Content-Type": "multipart/form-data" },
    });
};

/**
 * POST /conversations/{id}/read. messageId is optional — pass it when a
 * thread was just opened (advances the read cursor too); omit it for a
 * plain "Mark as read" tap from the chat list, which should just zero the
 * badge.
 */
export const markConversationRead = (conversationId, messageId) =>
    axios.post(`${BASE}/${conversationId}/read`, messageId ? { messageId } : {}, { headers: authHeader() });

/**
 * PUT /conversations/{id}/nickname — rename the person on this end only.
 * Passing an empty/blank nickname clears it and reverts to their real name.
 */
export const setConversationNickname = (conversationId, nickname) =>
    axios.put(`${BASE}/${conversationId}/nickname`, { nickname: nickname || "" }, { headers: authHeader() });

/**
 * GET /users/search — connections-scoped. A blank query returns the
 * caller's full connections list, which is what powers "who can I
 * message" the moment the chat search box is opened. Every result here is
 * someone the user is already connected with; the backend never returns a
 * match for a non-connection, so there's nothing extra to filter on the
 * frontend to enforce "only if connected".
 */
export const searchPeople = (query) =>
    axios.get(`${config.CHAT_API}/users/search`, {
        params: query ? { query } : {},
        headers: authHeader(),
    });

/** GET /presence?userIds=a,b,c — batched presence/last-seen lookup. */
export const getPresence = (userIds) => {
    const ids = (userIds || []).filter(Boolean);
    if (ids.length === 0) return Promise.resolve({ data: [] });
    return axios.get(`${config.CHAT_API}/presence`, {
        params: { userIds: ids.join(",") },
        headers: authHeader(),
    });
};

// ── Display-name hydration ────────────────────────────────────────────────
// GET /conversations returns ConversationSummaryDTO: for a DM it nests an
// `otherParticipant` object (displayName/avatar/profilePicture/online/
// lastSeenAt) and a per-user `nickname`, plus `unreadCount`. That's the
// normal path below.
//
// The one case that DOESN'T come back in that shape is the bare
// `Conversation` entity POST /conversations returns when a brand-new DM is
// created (only participantIds, no nested profile/nickname/unread yet) —
// that's handled by the legacy fallback further down, resolved once against
// UserAndInterest and cached for the session.

const profileCache = new Map();

const fetchUserProfile = async (userId) => {
    if (profileCache.has(userId)) return profileCache.get(userId);
    try {
        const res = await axios.get(`${config.USER_API}/api/users/${userId}/profile`);
        const profile = res?.data || {};
        profileCache.set(userId, profile);
        return profile;
    } catch (error) {
        console.error("Failed to resolve chat participant", userId, error);
        return {};
    }
};

/** Backend Conversation / ConversationSummaryDTO -> what the chat UI renders. */
export const hydrateConversation = async (raw, myId) => {
    const isGroup = raw.type === "GROUP";
    const other = raw.otherParticipant || null; // present on ConversationSummaryDTO, DM only
    const realName = isGroup ? raw.name : other?.displayName;

    let otherUserId = other?.userId || null;
    let image = other?.profilePicture || null;
    let online = other?.online || false;
    let lastSeenAt = other?.lastSeenAt || null;
    let otherLastReadMessageId = other?.lastReadMessageId || null;
    let resolvedRealName = realName;

    // Bare Conversation (fresh off POST /conversations) — no otherParticipant
    // to lean on yet, so fall back to the old direct profile lookup just for
    // this one render; the next GET /conversations refresh replaces it with
    // the enriched summary (presence, nickname, unread count and all).
    if (!isGroup && !other) {
        const participantIds = raw.participantIds || [];
        otherUserId = participantIds.find((id) => id !== myId) || participantIds[0] || null;
        if (otherUserId) {
            const profile = await fetchUserProfile(otherUserId);
            resolvedRealName = profile.displayName || profile.fullName || "Unknown user";
            image = image || profile.profilePicture || null;
        }
    }

    // Nickname (this user's own rename of the conversation) wins over the
    // real name everywhere in the UI; the real name stays available so
    // "reset nickname" and the rename dialog's placeholder both have it.
    const nickname = raw.nickname || null;
    const displayName = nickname || resolvedRealName || "Conversation";

    return {
        id: raw.id,
        name: displayName,
        realName: resolvedRealName || displayName,
        nickname,
        avatar: initialsOf(displayName),
        color: colorFor(otherUserId || raw.id),
        image,
        group: isGroup,
        last: raw.lastMessagePreview || "",
        lastMessageAt: raw.lastMessageAt,
        unread: raw.unreadCount || 0,
        otherUserId,
        online,
        lastSeenAt,
        otherLastReadMessageId,
    };
};

export const hydrateConversations = (rawList, myId) =>
    Promise.all((rawList || []).map((raw) => hydrateConversation(raw, myId)));

/**
 * Find-or-create's response is a bare Conversation without the enriched
 * fields the list view has. Rather than render a half-populated row, pull
 * the fresh, fully-hydrated summary out of a real GET /conversations —
 * falling back to the bare hydration only if it's somehow not there yet
 * (e.g. read-replica lag).
 */
export const resolveHydratedConversation = async (bareConversation, myId) => {
    try {
        const res = await listConversations();
        const match = (res?.data || []).find((c) => c.id === bareConversation.id);
        if (match) return hydrateConversation(match, myId);
    } catch (error) {
        console.error("Failed to refresh conversation list", error);
    }
    return hydrateConversation(bareConversation, myId);
};
