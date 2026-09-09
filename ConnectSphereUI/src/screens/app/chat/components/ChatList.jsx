// import React from "react";
// import Avatar from "../../../../components/Avatar";
// import { COLORS } from "../../../../constants";

// function ChatList({ chats, setActive }) {
//     return (
//         <div style={{ flex: 1, overflowY: "auto", padding: "0 14px", scrollbarWidth: "none" }}>
//             {chats.map(chat => (
//                 <div key={chat.id} onClick={() => setActive(chat.id)} style={{
//                     background: "rgb(247, 240, 240)", borderRadius: 20, padding: "13px 16px", marginBottom: 10,
//                     border: "3px solid rgb(226, 232, 248)", cursor: "pointer",
//                     display: "flex", alignItems: "center", gap: 12,
//                     boxShadow: "rgb(180 121 116) 0px 1px 6px",
//                 }}>
//                     <Avatar initials={chat.avatar} color={chat.color} size={48} online={!chat.group} />
//                     <div style={{ flex: 1, minWidth: 0 }}>
//                         <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 3, alignItems: "center" }}>
//                             <span style={{ fontWeight: 800, fontSize: 14, fontFamily: "'emoji", color: COLORS.text }}>{chat.name}</span>
//                             <span style={{ fontSize: 11, color: COLORS.muted, fontFamily: "'DM Sans', sans-serif", flexShrink: 0 }}>{chat.time}</span>
//                         </div>
//                         <span style={{
//                             fontSize: 12, color: COLORS.muted, fontFamily: "'DM Sans', sans-serif",
//                             display: "block", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
//                         }}>{chat.last}</span>
//                     </div>
//                     {chat.unread > 0 && (
//                         <div style={{
//                             background: "linear-gradient(135deg, #291b5f, rgba(108, 99, 255, 0.8))", color: "white", borderRadius: "50%",
//                             width: 22, height: 22, display: "flex", alignItems: "center", justifyContent: "center",
//                             fontSize: 11, fontWeight: 700, flexShrink: 0,
//                             boxShadow: "0 2px 8px rgba(108,99,255,0.4)",
//                         }}>{chat.unread}</div>
//                     )}
//                 </div>
//             ))}
//             <div style={{ height: 16 }} />
//         </div>
//     );
// }

// export default ChatList;


// by pritam
import React from "react";
import Avatar from "../../../../components/Avatar";
import { COLORS } from "../../../../constants";
import { formatRelativeTime } from "../chatUtils";

function ChatList({
    conversations, onOpen, loading, searching,
    onMarkRead, people = [], peopleLoading, onOpenPerson,
}) {
    if (loading) {
        return <Placeholder text="Loading your chats…" />;
    }

    const hasChats = conversations.length > 0;
    const hasPeople = (people || []).length > 0;

    if (!hasChats && !hasPeople && !peopleLoading) {
        return (
            <Placeholder
                text={searching
                    ? "No connections match that search."
                    : "No conversations yet. Find someone in Discover and tap Message."}
            />
        );
    }

    return (
        <div style={{ flex: 1, overflowY: "auto", padding: "0 14px", scrollbarWidth: "none" }}>
            {conversations.map(chat => (
                <div key={chat.id} onClick={() => onOpen(chat)} style={{
                    background: "rgb(247, 240, 240)", borderRadius: 20, padding: "13px 16px", marginBottom: 10,
                    border: "3px solid rgb(226, 232, 248)", cursor: "pointer",
                    display: "flex", alignItems: "center", gap: 12,
                    boxShadow: "rgb(180 121 116) 0px 1px 6px",
                }}>
                    <Avatar initials={chat.avatar} color={chat.color} size={48} image={chat.image} online={!chat.group && chat.online} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 3, alignItems: "center" }}>
                            <span style={{ fontWeight: 800, fontSize: 14, fontFamily: "'emoji", color: COLORS.text }}>{chat.name}</span>
                            <span style={{ fontSize: 11, color: COLORS.muted, fontFamily: "'DM Sans', sans-serif", flexShrink: 0 }}>
                                {formatRelativeTime(chat.lastMessageAt)}
                            </span>
                        </div>
                        <span style={{
                            fontSize: 12, color: COLORS.muted, fontFamily: "'DM Sans', sans-serif",
                            display: "block", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                        }}>{chat.last || "No messages yet"}</span>
                    </div>
                    {chat.unread > 0 && (
                        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6, flexShrink: 0 }}>
                            <div style={{
                                background: "linear-gradient(135deg, #291b5f, rgba(108, 99, 255, 0.8))", color: "white", borderRadius: "50%",
                                width: 22, height: 22, display: "flex", alignItems: "center", justifyContent: "center",
                                fontSize: 11, fontWeight: 700,
                                boxShadow: "0 2px 8px rgba(108,99,255,0.4)",
                            }}>{chat.unread}</div>
                            <button
                                onClick={(e) => onMarkRead && onMarkRead(chat.id, e)}
                                title="Mark this chat as read"
                                style={{
                                    border: "none", background: "none", cursor: "pointer",
                                    fontSize: 10, fontWeight: 700, color: "#673ab7", padding: 0, lineHeight: 1,
                                    textDecoration: "underline", fontFamily: "'DM Sans', sans-serif",
                                }}
                            >Mark read</button>
                        </div>
                    )}
                </div>
            ))}

            {(hasPeople || peopleLoading) && (
                <>
                    <div style={{
                        fontSize: 11, fontWeight: 700, color: "#8892B0", letterSpacing: 1,
                        fontFamily: "'DM Sans', sans-serif", padding: "4px 2px 8px",
                    }}>
                        START NEW CHAT
                    </div>
                    {peopleLoading && (people || []).length === 0 && (
                        <div style={{ fontSize: 12, color: "#e8e0f0", fontFamily: "'DM Sans', sans-serif", padding: "0 2px 10px" }}>
                            Searching your connections…
                        </div>
                    )}
                    {people.map(person => (
                        <div key={person.userId} onClick={() => onOpenPerson(person)} style={{
                            background: "rgb(247, 240, 240)", borderRadius: 20, padding: "13px 16px", marginBottom: 10,
                            border: "3px dashed rgb(226, 232, 248)", cursor: "pointer",
                            display: "flex", alignItems: "center", gap: 12,
                            boxShadow: "rgb(180 121 116) 0px 1px 6px",
                        }}>
                            <Avatar
                                initials={(person.avatar || person.displayName || "?").slice(0, 2).toUpperCase()}
                                color={COLORS.primary}
                                size={44}
                                image={person.profilePicture}
                                online={person.online}
                            />
                            <div style={{ flex: 1, minWidth: 0 }}>
                                <div style={{ fontWeight: 800, fontSize: 14, fontFamily: "'emoji", color: COLORS.text }}>
                                    {person.displayName}
                                </div>
                                <div style={{ fontSize: 11, color: COLORS.muted, fontFamily: "'DM Sans', sans-serif" }}>
                                    Connected · tap to message
                                </div>
                            </div>
                        </div>
                    ))}
                </>
            )}
            <div style={{ height: 16 }} />
        </div>
    );
}

function Placeholder({ text }) {
    return (
        <div style={{
            flex: 1, display: "flex", alignItems: "center", justifyContent: "center",
            padding: "0 32px", textAlign: "center",
            fontSize: 13, color: "#e8e0f0", fontFamily: "'DM Sans', sans-serif",
        }}>
            {text}
        </div>
    );
}

export default ChatList;

