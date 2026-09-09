// import React from "react";
// import Avatar from "../../../../components/Avatar";

// function ChatHeader({ chat, setActive }) {
//     return (
//         <div style={{
//             background: "linear-gradient(135deg, rgb(41 27 95), rgba(108, 99, 255, 0.8))",
//             padding: "14px 16px",
//             display: "flex", alignItems: "center", gap: 12,
//             boxShadow: "0 2px 14px rgba(108,99,255,0.18)",
//         }}>
//             <button onClick={() => setActive(null)} style={{
//                 border: "none", background: "rgba(255,255,255,0.2)", borderRadius: 10,
//                 width: 34, height: 34, fontSize: 16, cursor: "pointer", color: "white",
//                 display: "flex", alignItems: "center", justifyContent: "center",
//             }}>←</button>
//             <Avatar initials={chat.avatar} color={chat.color} size={38} online={!chat.group} />
//             <div style={{ flex: 1 }}>
//                 <div style={{ fontWeight: 800, fontSize: 15, fontFamily: "'emoji", color: "white" }}>{chat.name}</div>
//                 <div style={{ fontSize: 11, color: "rgba(255,255,255,0.75)", fontFamily: "'DM Sans', sans-serif", display: "flex", alignItems: "center", gap: 4 }}>
//                     <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#43E97B", display: "inline-block" }} />
//                     Online
//                 </div>
//             </div>
//             <button style={{
//                 border: "none", background: "rgba(255,255,255,0.15)", borderRadius: 10,
//                 width: 34, height: 34, fontSize: 18, cursor: "pointer", color: "white",
//             }}>⋯</button>
//         </div>
//     );
// }

// export default ChatHeader;


// by pritam
import React, { useState } from "react";
import Avatar from "../../../../components/Avatar";
import { formatLastSeen } from "../chatUtils";

function ChatHeader({ chat, onBack, connected, onRename }) {
    const [editing, setEditing] = useState(false);
    const [draft, setDraft] = useState(chat.nickname || chat.realName || chat.name);
    const [menuOpen, setMenuOpen] = useState(false);

    const startEdit = () => {
        setDraft(chat.nickname || chat.realName || chat.name);
        setEditing(true);
        setMenuOpen(false);
    };

    const save = () => {
        setEditing(false);
        if (onRename) onRename(chat.id, draft.trim());
    };

    const resetToRealName = () => {
        setEditing(false);
        if (onRename) onRename(chat.id, "");
    };

    // Presence (last active) is the primary status line — falls back to the
    // socket's own connect state only while presence hasn't loaded yet.
    const statusText = !chat.group
        ? formatLastSeen(chat.online, chat.lastSeenAt)
        : (connected ? "Connected" : "Connecting…");
    const statusDotColor = !chat.group
        ? (chat.online ? "#43E97B" : "#8892B0")
        : (connected ? "#43E97B" : "#FFB347");

    return (
        <div style={{
            background: "linear-gradient(135deg, rgb(41 27 95), rgba(108, 99, 255, 0.8))",
            padding: "14px 16px",
            display: "flex", alignItems: "center", gap: 12,
            boxShadow: "0 2px 14px rgba(108,99,255,0.18)",
            flexShrink: 0,
            position: "relative",
        }}>
            <button onClick={onBack} style={{
                border: "none", background: "rgba(255,255,255,0.2)", borderRadius: 10,
                width: 34, height: 34, fontSize: 16, cursor: "pointer", color: "white",
                display: "flex", alignItems: "center", justifyContent: "center",
            }}>←</button>
            <Avatar initials={chat.avatar} color={chat.color} size={38} image={chat.image} online={!chat.group && chat.online} />
            <div style={{ flex: 1, minWidth: 0 }}>
                {editing ? (
                    <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                        <input
                            autoFocus
                            value={draft}
                            onChange={e => setDraft(e.target.value)}
                            onKeyDown={e => e.key === "Enter" && save()}
                            placeholder={chat.realName || "Nickname"}
                            maxLength={40}
                            style={{
                                flex: 1, border: "1.5px solid rgba(255,255,255,0.5)", borderRadius: 8,
                                padding: "4px 8px", fontSize: 13, outline: "none",
                                fontFamily: "'DM Sans', sans-serif", color: "white", background: "rgba(255,255,255,0.12)",
                            }}
                        />
                        <button onClick={save} style={{ border: "none", background: "none", color: "#43E97B", fontSize: 13, fontWeight: 700, cursor: "pointer" }}>Save</button>
                        <button onClick={() => setEditing(false)} style={{ border: "none", background: "none", color: "rgba(255,255,255,0.7)", fontSize: 13, cursor: "pointer" }}>✕</button>
                    </div>
                ) : (
                    <div style={{
                        fontWeight: 800, fontSize: 15, fontFamily: "'emoji", color: "white",
                        overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                        display: "flex", alignItems: "center", gap: 6,
                    }}>
                        <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{chat.name}</span>
                        {chat.nickname && (
                            <span style={{ fontSize: 10, fontWeight: 600, color: "rgba(255,255,255,0.6)", fontFamily: "'DM Sans', sans-serif" }}>
                                (nickname)
                            </span>
                        )}
                    </div>
                )}
                {/* Real presence (online / last seen) — not the socket connection. */}
                <div style={{ fontSize: 11, color: "rgba(255,255,255,0.75)", fontFamily: "'DM Sans', sans-serif", display: "flex", alignItems: "center", gap: 4 }}>
                    <span style={{
                        width: 6, height: 6, borderRadius: "50%",
                        background: statusDotColor, display: "inline-block",
                    }} />
                    {statusText}
                </div>
            </div>
            {!chat.group && !editing && (
                <div style={{ position: "relative" }}>
                    <button onClick={() => setMenuOpen(v => !v)} style={{
                        border: "none", background: "rgba(255,255,255,0.15)", borderRadius: 10,
                        width: 34, height: 34, fontSize: 18, cursor: "pointer", color: "white",
                    }}>⋯</button>
                    {menuOpen && (
                        <div style={{
                            position: "absolute", top: 40, right: 0, background: "white", borderRadius: 12,
                            boxShadow: "0 6px 20px rgba(0,0,0,0.2)", overflow: "hidden", zIndex: 5, minWidth: 170,
                        }}>
                            <MenuItem label="Rename / set nickname" onClick={startEdit} />
                            {chat.nickname && <MenuItem label="Reset to real name" onClick={resetToRealName} />}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

function MenuItem({ label, onClick }) {
    return (
        <button
            onClick={onClick}
            style={{
                display: "block", width: "100%", textAlign: "left", border: "none", background: "white",
                padding: "10px 14px", fontSize: 12, fontWeight: 600, color: "#242939", cursor: "pointer",
                fontFamily: "'DM Sans', sans-serif",
            }}
        >
            {label}
        </button>
    );
}

export default ChatHeader;

