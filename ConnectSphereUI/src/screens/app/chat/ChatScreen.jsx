// import React, { useState } from "react";
// import ChatHeader from "./components/ChatHeader";
// import MessageList from "./components/MessageList";
// import MessageInput from "./components/MessageInput";
// import ChatListHeader from "./components/ChatListHeader";
// import ChatList from "./components/ChatList";

// const PRIMARY_SOLID = "#6C63FF";
// const BG = "transparent";

// function ChatScreen({ profilePic }) {
//     const chats = [
//         { id: 1, name: "Cricket Group 🏏", last: "Arjun: Who's coming Saturday?", time: "2m", unread: 3, avatar: "CG", color: PRIMARY_SOLID, group: true },
//         { id: 2, name: "Priya Sharma", last: "Sure, see you at the run!", time: "1h", unread: 0, avatar: "PS", color: "#FF6584", group: false },
//         { id: 3, name: "Chess Club ♟️", last: "Sneha: Bring a timer!", time: "3h", unread: 1, avatar: "CC", color: "#FFB347", group: true },
//         { id: 4, name: "Anonymous #42", last: "Are you also from Tower A?", time: "5h", unread: 0, avatar: "?", color: "#8892B0", group: false },
//         { id: 5, name: "Karan Patel", last: "Gaming session tonight?", time: "1d", unread: 0, avatar: "KP", color: "#38BDF8", group: false },
//     ];

//     const [active, setActive] = useState(null);
//     const [msg, setMsg] = useState("");
//     const [messages, setMessages] = useState([
//         { id: 1, from: "them", text: "Hey! Are you joining the cricket match this Saturday?", time: "2:10 PM" },
//         { id: 2, from: "me", text: "Yes definitely! What time are we meeting?", time: "2:12 PM" },
//         { id: 3, from: "them", text: "7 AM at Cubbon Park. We need 3 more players!", time: "2:13 PM" },
//     ]);

//     const sendMessage = () => {
//         if (!msg.trim()) return;
//         setMessages([...messages, { id: Date.now(), from: "me", text: msg, time: "Now" }]);
//         setMsg("");
//     };

//     if (active) {
//         const chat = chats.find(c => c.id === active);
//         return (
//             <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden", background: BG, borderRadius: "25px 25px 0 0" }}>
//                 {/* Chat Header */}
//                 <ChatHeader chat={chat} setActive={setActive} />

//                 {/* Messages */}
//                 <MessageList messages={messages} />

//                 {/* Input Bar */}
//                 <MessageInput msg={msg} setMsg={setMsg} sendMessage={sendMessage} />
//             </div>
//         );
//     }

//     return (
//         <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden", background: BG, borderRadius: "25px 25px 0 0" }}>
//             {/* Header */}
//             <ChatListHeader profilePic={profilePic} />

//             {/* Chat List */}
//             <ChatList chats={chats} setActive={setActive} />
//         </div>
//     );
// }

// export default ChatScreen;



// by pritam.
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import ChatHeader from "./components/ChatHeader";
import MessageList from "./components/MessageList";
import MessageInput from "./components/MessageInput";
import ChatListHeader from "./components/ChatListHeader";
import ChatList from "./components/ChatList";
import useChatSocket from "../../../hooks/useChatSocket";
import {
    createDmConversation,
    currentUserId,
    fetchMessages,
    hydrateConversation,
    hydrateConversations,
    listConversations,
    markConversationRead,
    resolveHydratedConversation,
    searchPeople,
    setConversationNickname,
    uploadAttachment,
} from "../../../services/chatService";
import { initialsOf, mergeMessage, normalizeMessage, previewFor } from "./chatUtils";

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
    const [hasMoreMessages, setHasMoreMessages] = useState(true);
    const [loadingMoreMessages, setLoadingMoreMessages] = useState(false);
    const [msg, setMsg] = useState("");
    const [search, setSearch] = useState("");
    const [error, setError] = useState("");
    const [filterMode, setFilterMode] = useState("all"); // "all" | "unread"
    const [uploadingAttachment, setUploadingAttachment] = useState(false);

    // Connections search (the chat search box) — separate from the local
    // name-filter above: this hits GET /users/search so a query can surface
    // people to start a NEW chat with, not just existing threads.
    const [people, setPeople] = useState([]);
    const [peopleLoading, setPeopleLoading] = useState(false);

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
        setHasMoreMessages(true);
        setConversations(prev => prev.map(c => (c.id === conversation.id ? { ...c, unread: 0 } : c)));

        try {
            const res = await fetchMessages(conversation.id);
            // MessageService sorts newest-first for cursor pagination; the UI
            // reads oldest-first.
            const thread = (res?.data || []).map(m => normalizeMessage(m, myId)).reverse();
            setMessages(thread);
            // A short first page usually means there's nothing older anyway;
            // loadOlderMessages() double-checks against the server either way.
            if (thread.length === 0) setHasMoreMessages(false);

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

    // WhatsApp-style "load earlier messages": MessageService's history is
    // permanent and paginated (30 at a time, cursor = oldest visible
    // message's id), so a chat with real history needs this to ever show
    // more than the most recent page.
    const loadOlderMessages = useCallback(async () => {
        if (!active || loadingMoreMessages || !hasMoreMessages) return;
        const oldest = messages[0];
        if (!oldest) return;

        setLoadingMoreMessages(true);
        try {
            const res = await fetchMessages(active.id, oldest.id);
            const older = (res?.data || []).map(m => normalizeMessage(m, myId)).reverse();
            if (older.length === 0) {
                setHasMoreMessages(false);
            } else {
                setMessages(prev => [...older, ...prev]);
            }
        } catch (err) {
            console.error("Failed to load older messages", err);
            setError("Couldn't load earlier messages.");
        } finally {
            setLoadingMoreMessages(false);
        }
    }, [active, messages, loadingMoreMessages, hasMoreMessages, myId]);

    // Arriving from DiscoverScreen's Message button: the conversation already
    // exists (POST /conversations is find-or-create), so just open it. The
    // POST response is a bare Conversation though, so resolve it against a
    // fresh GET /conversations to pick up presence/nickname/unread too.
    useEffect(() => {
        if (!chatTarget || !myId) return undefined;

        let cancelled = false;
        (async () => {
            const conversation = await resolveHydratedConversation(chatTarget, myId);
            if (cancelled) return;

            setConversations(prev => (
                prev.some(c => c.id === conversation.id)
                    ? prev.map(c => (c.id === conversation.id ? conversation : c))
                    : [conversation, ...prev]
            ));
            openConversation(conversation);
            if (onChatTargetHandled) onChatTargetHandled();
        })();

        return () => { cancelled = true; };
    }, [chatTarget, myId, openConversation, onChatTargetHandled]);

    // Chat search box: debounce against GET /users/search (connections-only —
    // see UserSearchController). Blank query -> full connections list, which
    // is what lets the box show "who can I message" before typing anything.
    useEffect(() => {
        if (!search.trim()) {
            setPeople([]);
            setPeopleLoading(false);
            return undefined;
        }

        let cancelled = false;
        setPeopleLoading(true);
        const timer = setTimeout(async () => {
            try {
                const res = await searchPeople(search.trim());
                if (!cancelled) setPeople(res?.data || []);
            } catch (err) {
                console.error("People search failed", err);
                if (!cancelled) setPeople([]);
            } finally {
                if (!cancelled) setPeopleLoading(false);
            }
        }, 300);

        return () => { cancelled = true; clearTimeout(timer); };
    }, [search]);

    // Only offer people who don't already have a thread — those already show
    // up in the filtered conversation list above, so this avoids duplicates.
    const newPeople = useMemo(() => people.filter(p => !p.existingConversationId), [people]);

    // Only if connected: GET /users/search is itself connections-scoped, so
    // anyone it returns is already a connection — tapping them here always
    // opens an existing DM or safely creates one.
    const openPerson = useCallback(async (person) => {
        setError("");
        try {
            let conversation = conversations.find(c => c.id === person.existingConversationId);
            if (!conversation && person.existingConversationId) {
                const res = await listConversations();
                const match = (res?.data || []).find(c => c.id === person.existingConversationId);
                if (match) conversation = await hydrateConversation(match, myId);
            }
            if (!conversation) {
                const res = await createDmConversation(person.userId);
                conversation = await resolveHydratedConversation(res.data, myId);
            }
            setConversations(prev => (
                prev.some(c => c.id === conversation.id)
                    ? prev.map(c => (c.id === conversation.id ? conversation : c))
                    : [conversation, ...prev]
            ));
            setSearch("");
            openConversation(conversation);
        } catch (err) {
            console.error("Couldn't open chat with person", err);
            setError("Couldn't start that chat.");
        }
    }, [conversations, myId, openConversation]);

    // "Mark as read" from the chat list — no thread opened, no message id,
    // just zero the badge (POST /conversations/{id}/read with no body).
    const markAsRead = useCallback((conversationId, e) => {
        if (e) e.stopPropagation();
        setConversations(prev => prev.map(c => (c.id === conversationId ? { ...c, unread: 0 } : c)));
        markConversationRead(conversationId).catch(err => console.error("Mark as read failed", err));
    }, []);

    // Nickname rename — one-sided, PUT /conversations/{id}/nickname. Blank
    // clears it and reverts to the person's real name (the default).
    const renameConversation = useCallback(async (conversationId, nickname) => {
        const clean = (nickname || "").trim();
        try {
            await setConversationNickname(conversationId, clean);
            const apply = (c) => (c.id === conversationId
                ? { ...c, nickname: clean || null, name: clean || c.realName, avatar: initialsOf(clean || c.realName) }
                : c);
            setConversations(prev => prev.map(apply));
            setActive(prev => (prev && prev.id === conversationId ? apply(prev) : prev));
        } catch (err) {
            console.error("Failed to set nickname", err);
            setError("Couldn't update the nickname.");
        }
    }, []);

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

    // Photo/video (or file) sharing: upload first (REST, multipart — see
    // AttachmentService's size/type limits on the backend), then publish
    // the returned Attachment reference over the same socket path a text
    // message uses. Two steps because the backend was already built this
    // way (POST /conversations/{id}/attachments -> then /app/chat.send
    // with that reference) — this just wires the frontend to it.
    const sendAttachment = async (file) => {
        if (!file || !active) return;
        if (!connected) {
            setError("Not connected — try again in a moment.");
            return;
        }

        setUploadingAttachment(true);
        setError("");
        const placeholderId = `pending-${Date.now()}`;

        try {
            const res = await uploadAttachment(active.id, file);
            const attachment = res.data;

            setMessages(prev => [...prev, {
                id: placeholderId, from: "me", text: "", attachment, time: "Now", pending: true,
            }]);
            setConversations(prev => prev.map(c => (
                c.id === active.id
                    ? { ...c, last: previewFor("", attachment), lastMessageAt: new Date().toISOString() }
                    : c
            )));

            if (!publish(active.id, "", attachment)) {
                setMessages(prev => prev.filter(m => m.id !== placeholderId));
                setError("Not connected — that didn't send.");
            }
        } catch (err) {
            console.error("Attachment upload failed", err);
            // AttachmentService rejects unsupported types / oversized files
            // with a plain-text 400 body (e.g. "IMAGE attachment too large.
            // Max size: 10 MB") — surface that directly since it's already
            // written for a human to read, rather than a generic message.
            const serverMessage = typeof err?.response?.data === "string" ? err.response.data : null;
            setError(serverMessage || "Couldn't upload that file.");
        } finally {
            setUploadingAttachment(false);
        }
    };

    const closeConversation = () => {
        setActive(null);
        setMessages([]);
    };

    // "Last active" + "Seen" receipts for the open thread, and presence
    // for every row on the chat LIST too — all three come from the same
    // GET /conversations refresh, so one periodic call covers all of it
    // instead of a narrower poll that only ever refreshed the open thread.
    // (Presence used to look permanently stuck offline for exactly this
    // reason: the list was never re-fetched after its first load.)
    useEffect(() => {
        const interval = setInterval(loadConversations, 20000);
        return () => clearInterval(interval);
    }, [loadConversations]);

    // Keep the open thread's header (online dot, "Seen" receipt) in sync
    // with whatever the periodic refresh above just fetched, without
    // resetting scroll/messages the way re-running openConversation would.
    useEffect(() => {
        if (!active) return;
        const fresh = conversations.find(c => c.id === active.id);
        if (!fresh) return;
        setActive(prev => (prev && prev.id === fresh.id
            ? {
                ...prev,
                online: fresh.online,
                lastSeenAt: fresh.lastSeenAt,
                otherLastReadMessageId: fresh.otherLastReadMessageId,
            }
            : prev));
        // Only re-run when the LIST refreshes or a different thread opens —
        // not on every `active` change, which would just be this effect's
        // own update feeding back into itself.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [conversations, active?.id]);const unreadTotal = useMemo(() => conversations.reduce((sum, c) => sum + (c.unread || 0), 0), [conversations]);

    const visibleConversations = useMemo(() => {
        const term = search.trim().toLowerCase();
        return conversations
            .filter(c => !term || c.name.toLowerCase().includes(term))
            .filter(c => filterMode !== "unread" || c.unread > 0)
            .sort((a, b) => new Date(b.lastMessageAt || 0) - new Date(a.lastMessageAt || 0));
    }, [conversations, search, filterMode]);

    if (active) {
        return (
            <div style={SHELL}>
                <ChatHeader
                    chat={active}
                    onBack={closeConversation}
                    connected={connected}
                    onRename={renameConversation}
                />
                <MessageList
                    messages={messages}
                    loading={loadingMessages}
                    hasMore={hasMoreMessages}
                    loadingMore={loadingMoreMessages}
                    onLoadMore={loadOlderMessages}
                    otherLastReadMessageId={active.otherLastReadMessageId}
                />
                {error && <ErrorStrip text={error} />}
                <MessageInput
                    msg={msg}
                    setMsg={setMsg}
                    sendMessage={sendMessage}
                    onAttach={sendAttachment}
                    uploading={uploadingAttachment}
                    disabled={!connected}
                />
            </div>
        );
    }

    return (
        <div style={SHELL}>
            <ChatListHeader
                profilePic={profilePic}
                search={search}
                setSearch={setSearch}
                filterMode={filterMode}
                setFilterMode={setFilterMode}
                unreadTotal={unreadTotal}
            />
            {error && <ErrorStrip text={error} />}
            <ChatList
                conversations={visibleConversations}
                onOpen={openConversation}
                loading={loadingChats}
                searching={Boolean(search.trim())}
                onMarkRead={markAsRead}
                people={newPeople}
                peopleLoading={peopleLoading}
                onOpenPerson={openPerson}
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

