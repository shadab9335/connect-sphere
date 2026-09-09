// import React from "react";
// import Avatar from "../../../../components/Avatar";
// import { COLORS } from "../../../../constants";

// const BG = "transparent";
// const CARD_BG = "#f7f0f0";

// function ChatListHeader({ profilePic }) {
//     return (
//         <div style={{ background: BG, flexShrink: 0 }}>
//             <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "3px 16px 10px" }}>
//                 <div>
//                     <div style={{ fontSize: 25, fontWeight: 800, color: "white", fontFamily: "'emoji" }}>Messages 💬</div>
//                 </div>
//                 <Avatar initials="VK" color="#f7f0f0" backgroundColor="#f7f0f0" size={42} online dotColor="#1e8a4a" image={profilePic} />
//             </div>

//             {/* Search */}
//             <div style={{
//                 background: CARD_BG, border: `1.5px solid ${COLORS.border}`, borderRadius: 14,
//                 display: "flex", alignItems: "center", gap: 10,
//                 padding: "10px 14px", margin: "0 16px 14px",
//                 boxShadow: "0 2px 10px rgba(108,99,255,0.06)",
//             }}>
//                 <span style={{ fontSize: 14 }}>🔍</span>
//                 <input placeholder="Search messages..." style={{
//                     border: "none", outline: "none", fontSize: 13, flex: 1,
//                     fontFamily: "'DM Sans', sans-serif", color: COLORS.text, background: "none",
//                 }} />
//             </div>

//             <div style={{ fontSize: 12, fontWeight: 700, color: "#e8e0f0", letterSpacing: 1, fontFamily: "'DM Sans', sans-serif", padding: "0 16px 8px" }}>
//                 RECENT
//             </div>
//         </div>
//     );
// }

// export default ChatListHeader;


// by pritam
import React from "react";
import { COLORS } from "../../../../constants";

const BG = "transparent";
const CARD_BG = "#f7f0f0";

// profilePic is no longer used here — the global app header (App.js) already
// shows it, so this screen's own header just carries the title, search, and
// the All/Unread tabs, without redrawing the same avatar a second time.
function ChatListHeader({ search, setSearch, filterMode, setFilterMode, unreadTotal }) {
    return (
        <div style={{ background: BG, flexShrink: 0 }}>
            <div style={{ padding: "3px 16px 10px" }}>
                <div style={{ fontSize: 25, fontWeight: 800, color: "white", fontFamily: "'emoji" }}>Messages 💬</div>
            </div>

            {/* Search — filters the list in ChatScreen */}
            <div style={{
                background: CARD_BG, border: `1.5px solid ${COLORS.border}`, borderRadius: 14,
                display: "flex", alignItems: "center", gap: 10,
                padding: "10px 14px", margin: "0 16px 14px",
                boxShadow: "0 2px 10px rgba(108,99,255,0.06)",
            }}>
                <span style={{ fontSize: 14 }}>🔍</span>
                <input
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    placeholder="Search connections or chats..."
                    style={{
                        border: "none", outline: "none", fontSize: 13, flex: 1,
                        fontFamily: "'DM Sans', sans-serif", color: COLORS.text, background: "none",
                    }}
                />
                {search && (
                    <button
                        onClick={() => setSearch("")}
                        style={{
                            border: "none", background: "none", color: COLORS.muted,
                            fontSize: 14, cursor: "pointer", padding: 0, lineHeight: 1,
                        }}
                        aria-label="Clear search"
                    >✕</button>
                )}
            </div>

            {/* All / Unread tabs — WhatsApp-style sectioning of the chat list */}
            <div style={{ display: "flex", gap: 8, padding: "0 16px 10px" }}>
                <FilterTab
                    label="All"
                    active={filterMode === "all"}
                    onClick={() => setFilterMode("all")}
                />
                <FilterTab
                    label={unreadTotal > 0 ? `Unread (${unreadTotal})` : "Unread"}
                    active={filterMode === "unread"}
                    onClick={() => setFilterMode("unread")}
                />
            </div>

            <div style={{ fontSize: 12, fontWeight: 700, color: "#e8e0f0", letterSpacing: 1, fontFamily: "'DM Sans', sans-serif", padding: "0 16px 8px" }}>
                {filterMode === "unread" ? "UNREAD" : "RECENT"}
            </div>
        </div>
    );
}

function FilterTab({ label, active, onClick }) {
    return (
        <button
            onClick={onClick}
            style={{
                border: "none",
                borderRadius: 12,
                padding: "6px 14px",
                fontSize: 12,
                fontWeight: 700,
                cursor: "pointer",
                fontFamily: "'DM Sans', sans-serif",
                background: active ? "linear-gradient(135deg, #291b5f, rgba(108, 99, 255, 0.8))" : "#f7f0f0",
                color: active ? "white" : "#673ab7",
                boxShadow: active ? "0 2px 8px rgba(108,99,255,0.35)" : "none",
            }}
        >
            {label}
        </button>
    );
}

export default ChatListHeader;
