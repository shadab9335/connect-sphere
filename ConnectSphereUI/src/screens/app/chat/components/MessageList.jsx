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
import React, { useEffect, useRef } from "react";
import { COLORS } from "../../../../constants";

const PRIMARY_SOLID = "#6C63FF";
const CARD_BG = "#f7f0f0";

function MessageList({ messages, loading }) {
    const bottomRef = useRef(null);

    // Keep the newest message in view as the thread grows.
    useEffect(() => {
        if (bottomRef.current) {
            bottomRef.current.scrollIntoView({ behavior: "smooth", block: "end" });
        }
    }, [messages]);

    return (
        <div style={{ flex: 1, overflowY: "auto", padding: "16px 14px", display: "flex", flexDirection: "column", gap: 10, scrollbarWidth: "none" }}>
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

            {messages.map(m => (
                <div key={m.id} style={{ alignSelf: m.from === "me" ? "flex-end" : "flex-start", maxWidth: "75%", opacity: m.pending ? 0.6 : 1 }}>
                    <div style={{
                        background: m.from === "me" ? PRIMARY_SOLID : CARD_BG,
                        color: m.from === "me" ? "white" : COLORS.text,
                        borderRadius: m.from === "me" ? "18px 18px 4px 18px" : "18px 18px 18px 4px",
                        padding: "10px 14px", fontSize: 13,
                        border: m.from !== "me" ? `1.5px solid ${COLORS.border}` : "none",
                        fontFamily: "'DM Sans', sans-serif",
                        wordBreak: "break-word",
                        boxShadow: m.from === "me"
                            ? "0 4px 14px rgba(108,99,255,0.3)"
                            : "0 2px 10px rgba(108,99,255,0.06)",
                    }}>{m.text}</div>
                    <div style={{
                        fontSize: 10, color: COLORS.muted, marginTop: 3,
                        textAlign: m.from === "me" ? "right" : "left",
                        fontFamily: "'DM Sans', sans-serif",
                    }}>{m.pending ? "Sending…" : m.time}</div>
                </div>
            ))}

            <div ref={bottomRef} />
        </div>
    );
}

export default MessageList;

