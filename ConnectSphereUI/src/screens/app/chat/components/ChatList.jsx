import React from "react";
import Avatar from "../../../../components/Avatar";
import { COLORS } from "../../../../constants";

function ChatList({ chats, setActive }) {
    return (
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
    );
}

export default ChatList;
