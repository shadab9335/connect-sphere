import React, { useState } from "react";
import Avatar from "../../components/Avatar";
import { COLORS } from "../../constants";

const PRIMARY_SOLID = "#6C63FF";
const BG = "transparent";
const CARD_BG = "#f7f0f0";

function ChatScreen({ profilePic }) {
    const chats = [
        { id: 1, name: "Cricket Group 🏏", last: "Arjun: Who's coming Saturday?", time: "2m", unread: 3, avatar: "CG", color: PRIMARY_SOLID, group: true },
        { id: 2, name: "Priya Sharma", last: "Sure, see you at the run!", time: "1h", unread: 0, avatar: "PS", color: "#FF6584", group: false },
        { id: 3, name: "Chess Club ♟️", last: "Sneha: Bring a timer!", time: "3h", unread: 1, avatar: "CC", color: "#FFB347", group: true },
        { id: 4, name: "Anonymous #42", last: "Are you also from Tower A?", time: "5h", unread: 0, avatar: "?", color: "#8892B0", group: false },
        { id: 5, name: "Karan Patel", last: "Gaming session tonight?", time: "1d", unread: 0, avatar: "KP", color: "#38BDF8", group: false },
    ];

    const [active, setActive] = useState(null);
    const [msg, setMsg] = useState("");
    const [messages, setMessages] = useState([
        { id: 1, from: "them", text: "Hey! Are you joining the cricket match this Saturday?", time: "2:10 PM" },
        { id: 2, from: "me", text: "Yes definitely! What time are we meeting?", time: "2:12 PM" },
        { id: 3, from: "them", text: "7 AM at Cubbon Park. We need 3 more players!", time: "2:13 PM" },
    ]);

    const sendMessage = () => {
        if (!msg.trim()) return;
        setMessages([...messages, { id: Date.now(), from: "me", text: msg, time: "Now" }]);
        setMsg("");
    };

    if (active) {
        const chat = chats.find(c => c.id === active);
        return (
            <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden", background: BG, borderRadius: "25px 25px 0 0" }}>
                {/* Chat Header */}
                <div style={{
                    background: "linear-gradient(135deg, rgb(41 27 95), rgba(108, 99, 255, 0.8))",
                    padding: "14px 16px",
                    display: "flex", alignItems: "center", gap: 12,
                    boxShadow: "0 2px 14px rgba(108,99,255,0.18)",
                }}>
                    <button onClick={() => setActive(null)} style={{
                        border: "none", background: "rgba(255,255,255,0.2)", borderRadius: 10,
                        width: 34, height: 34, fontSize: 16, cursor: "pointer", color: "white",
                        display: "flex", alignItems: "center", justifyContent: "center",
                    }}>←</button>
                    <Avatar initials={chat.avatar} color={chat.color} size={38} online={!chat.group} />
                    <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 800, fontSize: 15, fontFamily: "'emoji", color: "white" }}>{chat.name}</div>
                        <div style={{ fontSize: 11, color: "rgba(255,255,255,0.75)", fontFamily: "'DM Sans', sans-serif", display: "flex", alignItems: "center", gap: 4 }}>
                            <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#43E97B", display: "inline-block" }} />
                            Online
                        </div>
                    </div>
                    <button style={{
                        border: "none", background: "rgba(255,255,255,0.15)", borderRadius: 10,
                        width: 34, height: 34, fontSize: 18, cursor: "pointer", color: "white",
                    }}>⋯</button>
                </div>

                {/* Messages */}
                <div style={{ flex: 1, overflowY: "auto", padding: "16px 14px", display: "flex", flexDirection: "column", gap: 10, scrollbarWidth: "none" }}>
                    <div style={{ textAlign: "center", marginBottom: 8 }}>
                        <span style={{
                            background: CARD_BG, border: `1.5px solid ${COLORS.border}`,
                            borderRadius: 20, padding: "3px 12px",
                            fontSize: 11, color: COLORS.muted, fontFamily: "'DM Sans', sans-serif",
                            boxShadow: "0 1px 6px rgba(108,99,255,0.06)",
                        }}>Today</span>
                    </div>
                    {messages.map(m => (
                        <div key={m.id} style={{ alignSelf: m.from === "me" ? "flex-end" : "flex-start", maxWidth: "75%" }}>
                            <div style={{
                                background: m.from === "me" ? PRIMARY_SOLID : CARD_BG,
                                color: m.from === "me" ? "white" : COLORS.text,
                                borderRadius: m.from === "me" ? "18px 18px 4px 18px" : "18px 18px 18px 4px",
                                padding: "10px 14px", fontSize: 13,
                                border: m.from !== "me" ? `1.5px solid ${COLORS.border}` : "none",
                                fontFamily: "'DM Sans', sans-serif",
                                boxShadow: m.from === "me"
                                    ? "0 4px 14px rgba(108,99,255,0.3)"
                                    : "0 2px 10px rgba(108,99,255,0.06)",
                            }}>{m.text}</div>
                            <div style={{
                                fontSize: 10, color: COLORS.muted, marginTop: 3,
                                textAlign: m.from === "me" ? "right" : "left",
                                fontFamily: "'DM Sans', sans-serif",
                            }}>{m.time}</div>
                        </div>
                    ))}
                </div>

                {/* Input Bar */}
                <div style={{
                    padding: "12px 14px",
                    background: "transparent", display: "flex", gap: 10, alignItems: "center",
                }}>
                    <input
                        value={msg}
                        onChange={e => setMsg(e.target.value)}
                        placeholder="Type a message..."
                        onKeyDown={e => e.key === "Enter" && sendMessage()}
                        style={{
                            flex: 1, border: `1.5px solid ${COLORS.border}`, borderRadius: 14,
                            padding: "10px 14px", fontSize: 13, outline: "none",
                            fontFamily: "'DM Sans', sans-serif", color: COLORS.text, background: "white",
                        }}
                    />
                    <button onClick={sendMessage} style={{
                        background: "linear-gradient(135deg, rgb(41 27 95), rgba(108, 99, 255, 0.8))",
                        border: "none", borderRadius: 14,
                        width: 44, height: 44, color: "white", fontSize: 18, cursor: "pointer",
                        boxShadow: "0 4px 14px rgba(108,99,255,0.35)",
                        display: "flex", alignItems: "center", justifyContent: "center",
                    }}>➤</button>
                </div>
            </div>
        );
    }

    return (
        <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden", background: BG, borderRadius: "25px 25px 0 0" }}>
            {/* Header */}
            <div style={{ background: BG, flexShrink: 0 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "3px 16px 10px" }}>
                    <div>
                        <div style={{ fontSize: 25, fontWeight: 800, color: "white", fontFamily: "'emoji" }}>Messages 💬</div>
                    </div>
                    <Avatar initials="VK" color="#f7f0f0" backgroundColor="#f7f0f0" size={42} online dotColor="#1e8a4a" image={profilePic} />
                </div>

                {/* Search */}
                <div style={{
                    background: CARD_BG, border: `1.5px solid ${COLORS.border}`, borderRadius: 14,
                    display: "flex", alignItems: "center", gap: 10,
                    padding: "10px 14px", margin: "0 16px 14px",
                    boxShadow: "0 2px 10px rgba(108,99,255,0.06)",
                }}>
                    <span style={{ fontSize: 14 }}>🔍</span>
                    <input placeholder="Search messages..." style={{
                        border: "none", outline: "none", fontSize: 13, flex: 1,
                        fontFamily: "'DM Sans', sans-serif", color: COLORS.text, background: "none",
                    }} />
                </div>

                <div style={{ fontSize: 12, fontWeight: 700, color: "#e8e0f0", letterSpacing: 1, fontFamily: "'DM Sans', sans-serif", padding: "0 16px 8px" }}>
                    RECENT
                </div>
            </div>

            {/* Chat List */}
            <div style={{ flex: 1, overflowY: "auto", padding: "0 14px", scrollbarWidth: "none" }}>
                {chats.map(chat => (
                    <div key={chat.id} onClick={() => setActive(chat.id)} style={{
                        background: "rgb(247, 240, 240)", borderRadius: 20, padding: "13px 16px", marginBottom: 10,
                        border: "3px solid rgb(226, 232, 248)", cursor: "pointer",
                        display: "flex", alignItems: "center", gap: 12,
                        boxShadow: "rgb(180 121 116) 0px 1px 6px",
                    }}>
                        <Avatar initials={chat.avatar} color={chat.color} size={48} online={!chat.group} />
                        <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 3, alignItems: "center" }}>
                                <span style={{ fontWeight: 800, fontSize: 14, fontFamily: "'emoji", color: COLORS.text }}>{chat.name}</span>
                                <span style={{ fontSize: 11, color: COLORS.muted, fontFamily: "'DM Sans', sans-serif", flexShrink: 0 }}>{chat.time}</span>
                            </div>
                            <span style={{
                                fontSize: 12, color: COLORS.muted, fontFamily: "'DM Sans', sans-serif",
                                display: "block", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                            }}>{chat.last}</span>
                        </div>
                        {chat.unread > 0 && (
                            <div style={{
                                background: "linear-gradient(135deg, #291b5f, rgba(108, 99, 255, 0.8))", color: "white", borderRadius: "50%",
                                width: 22, height: 22, display: "flex", alignItems: "center", justifyContent: "center",
                                fontSize: 11, fontWeight: 700, flexShrink: 0,
                                boxShadow: "0 2px 8px rgba(108,99,255,0.4)",
                            }}>{chat.unread}</div>
                        )}
                    </div>
                ))}
                <div style={{ height: 16 }} />
            </div>
        </div>
    );
}

export default ChatScreen;
