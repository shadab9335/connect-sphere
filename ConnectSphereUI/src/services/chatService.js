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

export const listConversations = () =>
    axios.get(BASE, { headers: authHeader() });

export const fetchMessages = (conversationId, before) =>
    axios.get(`${BASE}/${conversationId}/messages`, {
        params: before ? { before } : {},
        headers: authHeader(),
    });

export const markConversationRead = (conversationId, messageId) =>
    axios.post(`${BASE}/${conversationId}/read`, { messageId }, { headers: authHeader() });

// ── Display-name hydration ────────────────────────────────────────────────
// GET /conversations returns the raw Conversation document — participantIds
// only, no names. Until ChatService exposes its users_cache in that response,
// we resolve names here against UserAndInterest and cache them for the session
// so it's one call per person, not one per render.

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

/** Backend Conversation -> what ChatList and ChatHeader render. */
export const hydrateConversation = async (raw, myId) => {
    const participantIds = raw.participantIds || [];
    const isGroup = raw.type === "GROUP";
    const otherUserId = participantIds.find((id) => id !== myId) || participantIds[0] || null;

    // If ChatService starts returning an enriched summary (displayName /
    // unreadCount), prefer it and skip the extra round-trip entirely.
    let name = raw.displayName || (isGroup ? raw.name : null);
    let image = raw.profilePicture || null;
    let color = raw.color || null;

    if (!name && !isGroup && otherUserId) {
        const profile = await fetchUserProfile(otherUserId);
        name = profile.displayName || profile.fullName || "Unknown user";
        image = profile.profilePicture || null;
        color = profile.color || null;
    }

    return {
        id: raw.id,
        name: name || "Conversation",
        avatar: initialsOf(name),
        color: color || colorFor(otherUserId || raw.id),
        image,
        group: isGroup,
        last: raw.lastMessagePreview || "",
        lastMessageAt: raw.lastMessageAt,
        unread: raw.unreadCount || 0,
        participantIds,
        otherUserId,
    };
};

export const hydrateConversations = (rawList, myId) =>
    Promise.all((rawList || []).map((raw) => hydrateConversation(raw, myId)));
