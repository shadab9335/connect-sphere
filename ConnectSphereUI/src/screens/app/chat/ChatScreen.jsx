// // import React, { useState } from "react";
// // import ChatHeader from "./components/ChatHeader";
// // import MessageList from "./components/MessageList";
// // import MessageInput from "./components/MessageInput";
// // import ChatListHeader from "./components/ChatListHeader";
// // import ChatList from "./components/ChatList";

// // const PRIMARY_SOLID = "#6C63FF";
// // const BG = "transparent";

// // function ChatScreen({ profilePic }) {
// //     const chats = [
// //         { id: 1, name: "Cricket Group 🏏", last: "Arjun: Who's coming Saturday?", time: "2m", unread: 3, avatar: "CG", color: PRIMARY_SOLID, group: true },
// //         { id: 2, name: "Priya Sharma", last: "Sure, see you at the run!", time: "1h", unread: 0, avatar: "PS", color: "#FF6584", group: false },
// //         { id: 3, name: "Chess Club ♟️", last: "Sneha: Bring a timer!", time: "3h", unread: 1, avatar: "CC", color: "#FFB347", group: true },
// //         { id: 4, name: "Anonymous #42", last: "Are you also from Tower A?", time: "5h", unread: 0, avatar: "?", color: "#8892B0", group: false },
// //         { id: 5, name: "Karan Patel", last: "Gaming session tonight?", time: "1d", unread: 0, avatar: "KP", color: "#38BDF8", group: false },
// //     ];

// //     const [active, setActive] = useState(null);
// //     const [msg, setMsg] = useState("");
// //     const [messages, setMessages] = useState([
// //         { id: 1, from: "them", text: "Hey! Are you joining the cricket match this Saturday?", time: "2:10 PM" },
// //         { id: 2, from: "me", text: "Yes definitely! What time are we meeting?", time: "2:12 PM" },
// //         { id: 3, from: "them", text: "7 AM at Cubbon Park. We need 3 more players!", time: "2:13 PM" },
// //     ]);

// //     const sendMessage = () => {
// //         if (!msg.trim()) return;
// //         setMessages([...messages, { id: Date.now(), from: "me", text: msg, time: "Now" }]);
// //         setMsg("");
// //     };

// //     if (active) {
// //         const chat = chats.find(c => c.id === active);
// //         return (
// //             <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden", background: BG, borderRadius: "25px 25px 0 0" }}>
// //                 {/* Chat Header */}
// //                 <ChatHeader chat={chat} setActive={setActive} />

// //                 {/* Messages */}
// //                 <MessageList messages={messages} />

// //                 {/* Input Bar */}
// //                 <MessageInput msg={msg} setMsg={setMsg} sendMessage={sendMessage} />
// //             </div>
// //         );
// //     }

// //     return (
// //         <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden", background: BG, borderRadius: "25px 25px 0 0" }}>
// //             {/* Header */}
// //             <ChatListHeader profilePic={profilePic} />

// //             {/* Chat List */}
// //             <ChatList chats={chats} setActive={setActive} />
// //         </div>
// //     );
// // }

// // export default ChatScreen;



// // by pritam ----------------------------------------------
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import ChatHeader from "./components/ChatHeader";
import MessageList from "./components/MessageList";
import MessageInput from "./components/MessageInput";
import ChatListHeader from "./components/ChatListHeader";
import ChatList from "./components/ChatList";
import useChatSocket from "../../../hooks/useChatSocket";
import {
    currentUserId,
    fetchMessages,
    hydrateConversation,
    hydrateConversations,
    listConversations,
    markConversationRead,
} from "../../../services/chatService";
import { mergeMessage, normalizeMessage } from "./chatUtils";

const BG = "transparent";

const SHELL = {
    flex: 1, display: "flex", flexDirection: "column",
    overflow: "hidden", background: BG, borderRadius: "25px 25px 0 0",
};

function ChatScreen({ profilePic, chatTarget, onChatTargetHandled }) {
    const myId = useMemo(() => currentUserId(), []);
    const token = useMemo(() => localStorage.getItem("token"), []);

    const [conversations, setConversations] = useState([]);
    const [loadingChats, setLoadingChats] = useState(true);
    const [active, setActive] = useState(null);   // the hydrated conversation, not an id
    const [messages, setMessages] = useState([]);
    const [loadingMessages, setLoadingMessages] = useState(false);
    const [msg, setMsg] = useState("");
    const [search, setSearch] = useState("");
    const [error, setError] = useState("");

    // Socket callbacks fire outside the render cycle, so they read the open
    // conversation from a ref instead of a stale closure over `active`.
    const activeIdRef = useRef(null);
    const knownIdsRef = useRef(new Set());
    const hasConnectedRef = useRef(false);

    useEffect(() => { activeIdRef.current = active ? active.id : null; }, [active]);
    useEffect(() => { knownIdsRef.current = new Set(conversations.map(c => c.id)); }, [conversations]);

    const loadConversations = useCallback(async () => {
        if (!myId) {
            setLoadingChats(false);
            setError("You're signed out — log in again to see your chats.");
            return;
        }
        try {
            const res = await listConversations();
            setConversations(await hydrateConversations(res?.data || [], myId));
            setError("");
        } catch (err) {
            console.error("Failed to load conversations", err);
            setError("Couldn't load your chats.");
        } finally {
            setLoadingChats(false);
        }
    }, [myId]);

    useEffect(() => { loadConversations(); }, [loadConversations]);

    const openConversation = useCallback(async (conversation) => {
        setActive(conversation);
        setMessages([]);
        setLoadingMessages(true);
        setConversations(prev => prev.map(c => (c.id === conversation.id ? { ...c, unread: 0 } : c)));

        try {
            const res = await fetchMessages(conversation.id);
            // MessageService sorts newest-first for cursor pagination; the UI
            // reads oldest-first.
            const thread = (res?.data || []).map(m => normalizeMessage(m, myId)).reverse();
            setMessages(thread);

            const newest = thread[thread.length - 1];
            if (newest) {
                markConversationRead(conversation.id, newest.id).catch(() => { /* badge only */ });
            }
        } catch (err) {
            console.error("Failed to load messages", err);
            setError("Couldn't load this conversation.");
        } finally {
            setLoadingMessages(false);
        }
    }, [myId]);

    // Arriving from DiscoverScreen's Message button: the conversation already
    // exists (POST /conversations is find-or-create), so just open it.
    useEffect(() => {
        if (!chatTarget || !myId) return undefined;

        let cancelled = false;
        (async () => {
            const conversation = await hydrateConversation(chatTarget, myId);
            if (cancelled) return;

            setConversations(prev => (
                prev.some(c => c.id === conversation.id) ? prev : [conversation, ...prev]
            ));
            openConversation(conversation);
            if (onChatTargetHandled) onChatTargetHandled();
        })();

        return () => { cancelled = true; };
    }, [chatTarget, myId, openConversation, onChatTargetHandled]);

    // A message in the thread that's currently open.
    const handleIncoming = useCallback((raw) => {
        const message = normalizeMessage(raw, myId);
        setMessages(prev => mergeMessage(prev, message));
        setConversations(prev => prev.map(c => (
            c.id === raw.conversationId
                ? { ...c, last: message.text, lastMessageAt: raw.sentAt }
                : c
        )));
    }, [myId]);

    // A message in any other thread — bump the badge, or pull in a
    // conversation someone just started with us.
    const handleNotification = useCallback((raw) => {
        if (raw.conversationId === activeIdRef.current) return; // handleIncoming has it
        if (!knownIdsRef.current.has(raw.conversationId)) {
            loadConversations();
            return;
        }
        setConversations(prev => prev.map(c => (
            c.id === raw.conversationId
                ? { ...c, last: raw.content, lastMessageAt: raw.sentAt, unread: c.unread + 1 }
                : c
        )));
    }, [loadConversations]);

    const { connected, sendMessage: publish } = useChatSocket({
        token,
        userId: myId,
        conversationId: active ? active.id : null,
        onMessage: handleIncoming,
        onNotification: handleNotification,
    });

    // The socket only pushes live messages. After a reconnect we may have
    // missed some, so refetch — the README leaves this backfill to the client.
    useEffect(() => {
        if (!connected) return;
        if (hasConnectedRef.current) {
            loadConversations();
            if (active) openConversation(active);
        }
        hasConnectedRef.current = true;
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [connected]);

    const sendMessage = () => {
        const text = msg.trim();
        if (!text || !active) return;

        const placeholderId = `pending-${Date.now()}`;
        setMessages(prev => [...prev, { id: placeholderId, from: "me", text, time: "Now", pending: true }]);
        setConversations(prev => prev.map(c => (
            c.id === active.id ? { ...c, last: text, lastMessageAt: new Date().toISOString() } : c
        )));
        setMsg("");

        if (publish(active.id, text)) {
            setError("");
        } else {
            setMessages(prev => prev.filter(m => m.id !== placeholderId));
            setError("Not connected — message wasn't sent.");
        }
    };

    const closeConversation = () => {
        setActive(null);
        setMessages([]);
    };

    const visibleConversations = useMemo(() => {
        const term = search.trim().toLowerCase();
        return conversations
            .filter(c => !term || c.name.toLowerCase().includes(term))
            .sort((a, b) => new Date(b.lastMessageAt || 0) - new Date(a.lastMessageAt || 0));
    }, [conversations, search]);

    if (active) {
        return (
            <div style={SHELL}>
                <ChatHeader chat={active} onBack={closeConversation} connected={connected} />
                <MessageList messages={messages} loading={loadingMessages} />
                {error && <ErrorStrip text={error} />}
                <MessageInput
                    msg={msg}
                    setMsg={setMsg}
                    sendMessage={sendMessage}
                    disabled={!connected}
                />
            </div>
        );
    }

    return (
        <div style={SHELL}>
            <ChatListHeader profilePic={profilePic} search={search} setSearch={setSearch} />
            {error && <ErrorStrip text={error} />}
            <ChatList
                conversations={visibleConversations}
                onOpen={openConversation}
                loading={loadingChats}
                searching={Boolean(search.trim())}
            />
        </div>
    );
}

function ErrorStrip({ text }) {
    return (
        <div style={{
            margin: "0 14px 8px", padding: "8px 12px",
            background: "#FEF2F2", border: "1.5px solid #FCA5A5", borderRadius: 12,
            fontSize: 11, color: "#B91C1C", fontFamily: "'DM Sans', sans-serif",
            flexShrink: 0,
        }}>
            {text}
        </div>
    );
}

export default ChatScreen;




