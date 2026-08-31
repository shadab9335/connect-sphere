import React, { useState } from "react";
import ChatHeader from "./components/ChatHeader";
import MessageList from "./components/MessageList";
import MessageInput from "./components/MessageInput";
import ChatListHeader from "./components/ChatListHeader";
import ChatList from "./components/ChatList";

const PRIMARY_SOLID = "#6C63FF";
const BG = "transparent";

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
                <ChatHeader chat={chat} setActive={setActive} />

                {/* Messages */}
                <MessageList messages={messages} />

                {/* Input Bar */}
                <MessageInput msg={msg} setMsg={setMsg} sendMessage={sendMessage} />
            </div>
        );
    }

    return (
        <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden", background: BG, borderRadius: "25px 25px 0 0" }}>
            {/* Header */}
            <ChatListHeader profilePic={profilePic} />

            {/* Chat List */}
            <ChatList chats={chats} setActive={setActive} />
        </div>
    );
}

export default ChatScreen;
