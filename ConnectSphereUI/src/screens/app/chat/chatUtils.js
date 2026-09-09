// Pure presentation helpers for the chat screen. No API calls here —
// chatService.js owns the network, these just reshape what it returns.

const AVATAR_COLORS = ["#6C63FF", "#FF6584", "#FFB347", "#38BDF8", "#43E97B", "#8892B0"];

/** "Priya Sharma" -> "PS". Falls back to "?" for empty/unknown names. */
export const initialsOf = (name) => {
    if (!name) return "?";
    const words = name.trim().split(/\s+/).filter(Boolean);
    if (words.length === 0) return "?";
    if (words.length === 1) return words[0].slice(0, 2).toUpperCase();
    return (words[0][0] + words[words.length - 1][0]).toUpperCase();
};

/** Stable per-user colour so the same person always gets the same avatar tint. */
export const colorFor = (seed) => {
    if (!seed) return AVATAR_COLORS[0];
    let hash = 0;
    for (let i = 0; i < seed.length; i++) {
        hash = (hash * 31 + seed.charCodeAt(i)) % 100000;
    }
    return AVATAR_COLORS[hash % AVATAR_COLORS.length];
};

/** Inbox timestamps: "2m", "1h", "3d", then a date once it's over a week old. */
export const formatRelativeTime = (isoString) => {
    if (!isoString) return "";
    const then = new Date(isoString).getTime();
    if (Number.isNaN(then)) return "";

    const seconds = Math.floor((Date.now() - then) / 1000);
    if (seconds < 60) return "now";
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h`;
    if (seconds < 604800) return `${Math.floor(seconds / 86400)}d`;
    return new Date(then).toLocaleDateString(undefined, { day: "numeric", month: "short" });
};

/** WhatsApp-style presence line: "Online" or "Last seen 3h ago". */
export const formatLastSeen = (online, lastSeenAt) => {
    if (online) return "Online";
    if (!lastSeenAt) return "Offline";
    const rel = formatRelativeTime(lastSeenAt);
    if (!rel) return "Offline";
    return rel === "now" ? "Last seen just now" : `Last seen ${rel} ago`;
};

/** Bubble timestamps: "2:13 PM". */
export const formatClockTime = (isoString) => {
    if (!isoString) return "";
    const date = new Date(isoString);
    if (Number.isNaN(date.getTime())) return "";
    return date.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" });
};

/**
 * Backend Message -> what MessageList renders. `from` is derived by comparing
 * senderId to the logged-in user's Mongo _id, which is what ChatService
 * resolves the token to.
 */
export const normalizeMessage = (raw, myId) => ({
    id: raw.id,
    senderId: raw.senderId,
    from: raw.senderId === myId ? "me" : "them",
    text: raw.content,
    attachment: raw.attachment || null,
    time: formatClockTime(raw.sentAt),
    sentAt: raw.sentAt,
    readBy: raw.readBy || [],
});

/** Chat-list preview text for a message that's an attachment, not text — mirrors ChatSocketController's previewOf(). */
export const previewFor = (text, attachment) => {
    if (text && text.trim()) return text;
    if (!attachment) return "";
    if (attachment.type === "IMAGE") return "📷 Photo";
    if (attachment.type === "VIDEO") return "🎥 Video";
    return `📄 ${attachment.fileName || "File"}`;
};

/**
 * Adds an incoming message to a thread without duplicating it. Two things to
 * guard against: the same message arriving twice (socket re-delivery), and our
 * own optimistic placeholder still sitting in the list when the real,
 * server-assigned copy comes back.
 */
export const mergeMessage = (existing, message) => {
    if (existing.some((m) => m.id === message.id)) return existing;

    // A placeholder "matches" the real message if it's the same kind of
    // send: same text for a text message, or same uploaded file for an
    // attachment (compared by ImageKit's fileId, which is stable — unlike
    // text, two different attachments could coincidentally share a
    // fileName, so fileId is the safe key here).
    const isMatchingPlaceholder = (m) => {
        if (!m.pending) return false;
        if (message.attachment || m.attachment) {
            return m.attachment?.fileId && m.attachment?.fileId === message.attachment?.fileId;
        }
        return m.text === message.text;
    };

    const withoutPlaceholder = message.from === "me"
        ? existing.filter((m) => !isMatchingPlaceholder(m))
        : existing;

    return [...withoutPlaceholder, message];
};
