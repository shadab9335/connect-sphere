import React, { useEffect, useRef, useState } from "react";
import { COLORS } from "../../../../constants";

const PRIMARY_SOLID = "#6C63FF";
const CARD_BG = "#f7f0f0";

/**
 * Checks whether two timestamps belong to the same calendar day
 * in the user's local timezone.
 */
const isSameDay = (a, b) => {
    if (!a || !b) return false;
    const dateA = a instanceof Date ? a : new Date(a);
    const dateB = b instanceof Date ? b : new Date(b);
    if (Number.isNaN(dateA.getTime()) || Number.isNaN(dateB.getTime())) return false;
    return (
        dateA.getFullYear() === dateB.getFullYear() &&
        dateA.getMonth() === dateB.getMonth() &&
        dateA.getDate() === dateB.getDate()
    );
};

/**
 * Formats the date separator shown between message groups.
 *
 * Examples:
 * Today
 * Yesterday
 * 19 Sep 2026
 */
const formatMessageDate = (sentAt) => {
    if (!sentAt) return "";
    const date = new Date(sentAt);
    if (Number.isNaN(date.getTime())) return "";
    const today = new Date();
    if (isSameDay(date, today)) return "Today";
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);
    if (isSameDay(date, yesterday)) return "Yesterday";
    return date.toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" });
};

function MessageList({ messages, loading, hasMore, loadingMore, onLoadMore, otherLastReadMessageId, initialUnreadCount }) {
    const containerRef = useRef(null);
    const bottomRef = useRef(null);
    const firstUnreadRef = useRef(null);
    const prependingRef = useRef(false);
    const prevScrollHeightRef = useRef(0);
    const isInitialLoadRef = useRef(false);
    const initialMeCountRef = useRef(null);
    const firstUnreadIdRef = useRef(null);  // pinned message id, not index
    const [ready, setReady] = useState(false);
    const [dividerVisible, setDividerVisible] = useState(initialUnreadCount > 0);

    // Snapshot the first-unread message id and initial me-count once messages load
    useEffect(() => {
        if (messages.length === 0) return;
        if (initialMeCountRef.current === null) {
            initialMeCountRef.current = messages.filter(m => m.from === "me").length;
            if (initialUnreadCount > 0) {
                const idx = messages.length - initialUnreadCount;
                firstUnreadIdRef.current = messages[idx]?.id ?? null;
            }
            return;
        }
        if (dividerVisible && messages.filter(m => m.from === "me").length > initialMeCountRef.current) {
            setDividerVisible(false);
        }
    }, [messages]);

    useEffect(() => {
        const container = containerRef.current;
        if (prependingRef.current) {
            prependingRef.current = false;
            if (container) {
                container.scrollTop = container.scrollHeight - prevScrollHeightRef.current;
            }
            return;
        }
        if (!isInitialLoadRef.current) {
            if (messages.length === 0) return;
            isInitialLoadRef.current = true;
            const target = (initialUnreadCount > 0 && firstUnreadRef.current) ? firstUnreadRef.current : bottomRef.current;
            if (target) target.scrollIntoView({ behavior: "instant", block: "start" });
            setReady(true);
            return;
        }
        if (bottomRef.current) {
            bottomRef.current.scrollIntoView({ behavior: "smooth", block: "end" });
        }
    }, [messages]);

    const handleScroll = () => {
        const container = containerRef.current;
        if (!container || !hasMore || loadingMore || !onLoadMore) return;
        if (container.scrollTop < 60) {
            prependingRef.current = true;
            prevScrollHeightRef.current = container.scrollHeight;
            onLoadMore();
        }
    };

    const isSeen = (messageId) => Boolean(
        otherLastReadMessageId && messageId && messageId <= otherLastReadMessageId
    );

    return (
        <div
            ref={containerRef}
            onScroll={handleScroll}
            style={{ flex: 1, overflowY: "auto", padding: "16px 14px", display: "flex", flexDirection: "column", gap: 10, scrollbarWidth: "none", visibility: ready ? "visible" : "hidden" }}
        >
            {/* Load earlier messages */}
            {hasMore && messages.length > 0 && (
                <div style={{ textAlign: "center", marginBottom: 4 }}>
                    {loadingMore ? (
                        <span style={{ fontSize: 11, color: COLORS.muted, fontFamily: "'DM Sans', sans-serif" }}>
                            Loading earlier messages…
                        </span>
                    ) : (
                        <button
                            onClick={onLoadMore}
                            style={{
                                border: "none", background: "none", color: PRIMARY_SOLID,
                                fontSize: 11, fontWeight: 700, cursor: "pointer",
                                fontFamily: "'DM Sans', sans-serif", textDecoration: "underline",
                            }}
                        >
                            Load earlier messages
                        </button>
                    )}
                </div>
            )}

            {/* Initial loading */}
            {loading && (
                <div style={{ textAlign: "center", marginBottom: 8 }}>
                    <span style={{
                        background: CARD_BG, border: `1.5px solid ${COLORS.border}`,
                        borderRadius: 20, padding: "3px 12px",
                        fontSize: 11, color: COLORS.muted, fontFamily: "'DM Sans', sans-serif",
                        boxShadow: "0 1px 6px rgba(108,99,255,0.06)",
                    }}>
                        Loading…
                    </span>
                </div>
            )}

            {/* Empty state */}
            {!loading && messages.length === 0 && (
                <div style={{
                    textAlign: "center", padding: "20px 24px",
                    fontSize: 12, color: "#64748B", fontFamily: "'DM Sans', sans-serif",
                    background: "rgba(255,255,255,0.75)", borderRadius: 12,
                    margin: "0 auto", maxWidth: 200,
                }}>
                    No messages yet — say hello 👋
                </div>
            )}

            {/* Messages */}
            {!loading && messages.map((m, i) => {
                const previousMessage = messages[i - 1];
                const showDateSeparator = !previousMessage || !isSameDay(m.sentAt, previousMessage.sentAt);
                const isFirstUnread = dividerVisible && m.id === firstUnreadIdRef.current;

                return (
                    <React.Fragment key={m.id}>
                        {/* Unread divider */}
                        {isFirstUnread && (
                            <div ref={firstUnreadRef} style={{ textAlign: "center", margin: "8px 0" }}>
                                <span style={{
                                    background: "#6C63FF", borderRadius: 20,
                                    padding: "4px 14px", fontSize: 11, color: "#fff",
                                    fontFamily: "'DM Sans', sans-serif", fontWeight: 600,
                                    boxShadow: "0 2px 8px rgba(108,99,255,0.35)",
                                }}>
                                    {initialUnreadCount} unread message{initialUnreadCount !== 1 ? "s" : ""}
                                </span>
                            </div>
                        )}

                        {/* Date separator */}
                        {showDateSeparator && m.sentAt && (
                            <div style={{ textAlign: "center", margin: i === 0 ? "0 0 8px" : "8px 0" }}>
                                <span style={{
                                    background: CARD_BG, border: `1.5px solid ${COLORS.border}`,
                                    borderRadius: 20, padding: "3px 12px",
                                    fontSize: 11, color: COLORS.muted, fontFamily: "'DM Sans', sans-serif",
                                    boxShadow: "0 1px 6px rgba(108,99,255,0.06)",
                                }}>
                                    {formatMessageDate(m.sentAt)}
                                </span>
                            </div>
                        )}

                        {/* Message bubble */}
                        <div style={{ alignSelf: m.from === "me" ? "flex-end" : "flex-start", maxWidth: "75%", opacity: m.pending ? 0.6 : 1 }}>
                            <div style={{
                                background: m.from === "me" ? PRIMARY_SOLID : CARD_BG,
                                color: m.from === "me" ? "white" : COLORS.text,
                                borderRadius: m.from === "me" ? "18px 18px 4px 18px" : "18px 18px 18px 4px",
                                padding: m.attachment && !m.text ? 6 : "10px 14px 6px 14px",
                                fontSize: 13,
                                border: m.from !== "me" ? `1.5px solid ${COLORS.border}` : "none",
                                fontFamily: "'DM Sans', sans-serif",
                                wordBreak: "break-word",
                                boxShadow: m.from === "me"
                                    ? "0 4px 14px rgba(108,99,255,0.3)"
                                    : "0 2px 10px rgba(108,99,255,0.06)",
                            }}>
                                {m.attachment && (
                                    <AttachmentPreview attachment={m.attachment} hasCaption={Boolean(m.text)} />
                                )}
                                {m.text && <div style={{ paddingBottom: 2 }}>{m.text}</div>}

                                {/* WhatsApp-style time + ticks inside bubble */}
                                <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: 3, marginTop: 2 }}>
                                    <span style={{
                                        fontSize: 9,
                                        color: m.from === "me" ? "rgba(255,255,255,0.7)" : "#94A3B8",
                                        fontFamily: "'DM Sans', sans-serif",
                                        lineHeight: 1,
                                    }}>
                                        {m.pending ? "Sending…" : m.time}
                                    </span>
                                    {m.from === "me" && (
                                        m.pending ? (
                                            // Single grey tick — sending
                                            <svg width="10" height="9" viewBox="0 0 10 9" fill="none">
                                                <path d="M1 4.5L4 7.5L9 1" stroke="rgba(255,255,255,0.5)" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
                                            </svg>
                                        ) : isSeen(m.id) ? (
                                            // Double blue ticks — seen
                                            <svg width="16" height="9" viewBox="0 0 16 9" fill="none">
                                                <path d="M1 4.5L4.5 8L10 1" stroke="#60CDFF" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
                                                <path d="M5 4.5L8.5 8L14 1" stroke="#60CDFF" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
                                            </svg>
                                        ) : (
                                            // Double grey ticks — delivered
                                            <svg width="16" height="9" viewBox="0 0 16 9" fill="none">
                                                <path d="M1 4.5L4.5 8L10 1" stroke="rgba(255,255,255,0.6)" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
                                                <path d="M5 4.5L8.5 8L14 1" stroke="rgba(255,255,255,0.6)" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
                                            </svg>
                                        )
                                    )}
                                </div>
                            </div>
                        </div>
                    </React.Fragment>
                );
            })}

            <div ref={bottomRef} />
        </div>
    );
}

function AttachmentPreview({ attachment, hasCaption }) {
    const boxStyle = { borderRadius: 12, display: "block", marginBottom: hasCaption ? 6 : 0, maxWidth: 220 };

    if (attachment.type === "IMAGE") {
        return <img src={attachment.url} alt={attachment.fileName || "Shared photo"} style={{ ...boxStyle, maxHeight: 240, objectFit: "cover" }} />;
    }
    if (attachment.type === "VIDEO") {
        return <video src={attachment.url} controls style={{ ...boxStyle, maxHeight: 240 }} />;
    }
    return (
        <a
            href={attachment.url}
            target="_blank"
            rel="noreferrer"
            style={{
                display: "flex", alignItems: "center", gap: 6, color: "inherit",
                textDecoration: "underline", fontSize: 12, marginBottom: hasCaption ? 6 : 0,
            }}
        >
            📄 {attachment.fileName || "Download file"}
        </a>
    );
}

export default MessageList;
