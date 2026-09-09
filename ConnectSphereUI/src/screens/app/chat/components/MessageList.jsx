// import React from "react";
// import { COLORS } from "../../../../constants";

// const PRIMARY_SOLID = "#6C63FF";
// const CARD_BG = "#f7f0f0";

// function MessageList({ messages }) {
//     return (
//         <div style={{ flex: 1, overflowY: "auto", padding: "16px 14px", display: "flex", flexDirection: "column", gap: 10, scrollbarWidth: "none" }}>
//             <div style={{ textAlign: "center", marginBottom: 8 }}>
//                 <span style={{
//                     background: CARD_BG, border: `1.5px solid ${COLORS.border}`,
//                     borderRadius: 20, padding: "3px 12px",
//                     fontSize: 11, color: COLORS.muted, fontFamily: "'DM Sans', sans-serif",
//                     boxShadow: "0 1px 6px rgba(108,99,255,0.06)",
//                 }}>Today</span>
//             </div>
//             {messages.map(m => (
//                 <div key={m.id} style={{ alignSelf: m.from === "me" ? "flex-end" : "flex-start", maxWidth: "75%" }}>
//                     <div style={{
//                         background: m.from === "me" ? PRIMARY_SOLID : CARD_BG,
//                         color: m.from === "me" ? "white" : COLORS.text,
//                         borderRadius: m.from === "me" ? "18px 18px 4px 18px" : "18px 18px 18px 4px",
//                         padding: "10px 14px", fontSize: 13,
//                         border: m.from !== "me" ? `1.5px solid ${COLORS.border}` : "none",
//                         fontFamily: "'DM Sans', sans-serif",
//                         boxShadow: m.from === "me"
//                             ? "0 4px 14px rgba(108,99,255,0.3)"
//                             : "0 2px 10px rgba(108,99,255,0.06)",
//                     }}>{m.text}</div>
//                     <div style={{
//                         fontSize: 10, color: COLORS.muted, marginTop: 3,
//                         textAlign: m.from === "me" ? "right" : "left",
//                         fontFamily: "'DM Sans', sans-serif",
//                     }}>{m.time}</div>
//                 </div>
//             ))}
//         </div>
//     );
// }

// export default MessageList;


// by pritam
import React, { useEffect, useMemo, useRef } from "react";
import { COLORS } from "../../../../constants";

const PRIMARY_SOLID = "#6C63FF";
const CARD_BG = "#f7f0f0";

function MessageList({ messages, loading, hasMore, loadingMore, onLoadMore, otherLastReadMessageId }) {
    const containerRef = useRef(null);
    const bottomRef = useRef(null);
    // When we prepend older messages, the browser keeps scrollTop fixed by
    // default, which visually yanks the view down to whatever was at that
    // pixel offset before — feels like the chat jumped. This tracks that we
    // just prepended so the effect below can re-anchor scroll position
    // instead of running the normal "scroll to newest" behaviour.
    const prependingRef = useRef(false);
    const prevScrollHeightRef = useRef(0);

    useEffect(() => {
        const container = containerRef.current;
        if (prependingRef.current) {
            prependingRef.current = false;
            if (container) {
                container.scrollTop = container.scrollHeight - prevScrollHeightRef.current;
            }
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

    // Only the LAST message you sent gets a "Seen"/"Sent" label under it —
    // same as WhatsApp, rather than stamping every single bubble.
    const lastMineIndex = useMemo(() => {
        for (let i = messages.length - 1; i >= 0; i--) {
            if (messages[i].from === "me" && !messages[i].pending) return i;
        }
        return -1;
    }, [messages]);

    // Message ids are Mongo ObjectId strings, which sort chronologically as
    // plain strings — so "have they read at least up to this message" is
    // just a string comparison against their read cursor, no timestamp
    // parsing needed.
    const isSeen = (messageId) => Boolean(
        otherLastReadMessageId && messageId && messageId <= otherLastReadMessageId
    );

    return (
        <div
            ref={containerRef}
            onScroll={handleScroll}
            style={{ flex: 1, overflowY: "auto", padding: "16px 14px", display: "flex", flexDirection: "column", gap: 10, scrollbarWidth: "none" }}
        >
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

            <div style={{ textAlign: "center", marginBottom: 8 }}>
                <span style={{
                    background: CARD_BG, border: `1.5px solid ${COLORS.border}`,
                    borderRadius: 20, padding: "3px 12px",
                    fontSize: 11, color: COLORS.muted, fontFamily: "'DM Sans', sans-serif",
                    boxShadow: "0 1px 6px rgba(108,99,255,0.06)",
                }}>
                    {loading ? "Loading…" : "Today"}
                </span>
            </div>

            {!loading && messages.length === 0 && (
                <div style={{
                    textAlign: "center", padding: "20px 24px",
                    fontSize: 12, color: COLORS.muted, fontFamily: "'DM Sans', sans-serif",
                }}>
                    No messages yet — say hello 👋
                </div>
            )}

            {messages.map((m, i) => (
                <div key={m.id} style={{ alignSelf: m.from === "me" ? "flex-end" : "flex-start", maxWidth: "75%", opacity: m.pending ? 0.6 : 1 }}>
                    <div style={{
                        background: m.from === "me" ? PRIMARY_SOLID : CARD_BG,
                        color: m.from === "me" ? "white" : COLORS.text,
                        borderRadius: m.from === "me" ? "18px 18px 4px 18px" : "18px 18px 18px 4px",
                        padding: m.attachment && !m.text ? 6 : "10px 14px", fontSize: 13,
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
                        {m.text && <div>{m.text}</div>}
                    </div>
                    <div style={{
                        fontSize: 10, color: COLORS.muted, marginTop: 3,
                        textAlign: m.from === "me" ? "right" : "left",
                        fontFamily: "'DM Sans', sans-serif",
                    }}>
                        {m.pending ? "Sending…" : m.time}
                        {i === lastMineIndex && (isSeen(m.id) ? " · Seen" : " · Sent")}
                    </div>
                </div>
            ))}

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
    // FILE (documents, zips, etc.)
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

