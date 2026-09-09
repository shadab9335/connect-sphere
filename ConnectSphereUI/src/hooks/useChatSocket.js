import { useCallback, useEffect, useRef, useState } from "react";
import SockJS from "sockjs-client";
import { Client } from "@stomp/stompjs";
import config from "../config";

/**
 * STOMP-over-SockJS connection to ChatService.
 *
 * Server contract (WebSocketConfig + ChatSocketController):
 *   connect   -> /ws-chat?token=<token>   (handshake is rejected without one)
 *   publish   -> /app/chat.send           { conversationId, content }
 *   subscribe -> /topic/conversations/{id}          live messages in a thread
 *   subscribe -> /topic/user/{userId}/notifications everything else you're in
 *
 * The server takes the sender from the handshake Principal, so there is
 * deliberately no senderId in the published payload.
 */
export default function useChatSocket({ token, userId, conversationId, onMessage, onNotification }) {
    const [connected, setConnected] = useState(false);

    const clientRef = useRef(null);
    const onMessageRef = useRef(onMessage);
    const onNotificationRef = useRef(onNotification);

    // Keep the latest callbacks in refs so a re-render doesn't tear down and
    // rebuild the subscriptions on every parent state change.
    useEffect(() => { onMessageRef.current = onMessage; }, [onMessage]);
    useEffect(() => { onNotificationRef.current = onNotification; }, [onNotification]);

    // 1. Connection lifecycle
    useEffect(() => {
        if (!token) return undefined;

        const client = new Client({
            webSocketFactory: () =>
                new SockJS(`${config.CHAT_API}/ws-chat?token=${encodeURIComponent(token)}`),
            reconnectDelay: 4000,
            onConnect: () => setConnected(true),
            onDisconnect: () => setConnected(false),
            onWebSocketClose: () => setConnected(false),
            onStompError: (frame) =>
                console.error("[chat socket] STOMP error", frame.headers, frame.body),
        });

        client.activate();
        clientRef.current = client;

        return () => {
            setConnected(false);
            clientRef.current = null;
            client.deactivate();
        };
    }, [token]);

    // 2. The open thread
    useEffect(() => {
        const client = clientRef.current;
        if (!connected || !client || !conversationId) return undefined;

        const subscription = client.subscribe(`/topic/conversations/${conversationId}`, (frame) => {
            try {
                onMessageRef.current?.(JSON.parse(frame.body));
            } catch (error) {
                console.error("[chat socket] bad message frame", error);
            }
        });

        return () => {
            try { subscription.unsubscribe(); } catch { /* already closed */ }
        };
    }, [connected, conversationId]);

    // 3. Everything else — powers unread badges for conversations that aren't open
    useEffect(() => {
        const client = clientRef.current;
        if (!connected || !client || !userId) return undefined;

        const subscription = client.subscribe(`/topic/user/${userId}/notifications`, (frame) => {
            try {
                onNotificationRef.current?.(JSON.parse(frame.body));
            } catch (error) {
                console.error("[chat socket] bad notification frame", error);
            }
        });

        return () => {
            try { subscription.unsubscribe(); } catch { /* already closed */ }
        };
    }, [connected, userId]);

    /** Returns false if the socket isn't up, so the caller can roll back. */
    const sendMessage = useCallback((targetConversationId, content, attachment) => {
        const client = clientRef.current;
        if (!client || !client.connected) return false;

        client.publish({
            destination: "/app/chat.send",
            body: JSON.stringify({
                conversationId: targetConversationId,
                content: content || null,
                attachment: attachment || null,
            }),
        });
        return true;
    }, []);

    return { connected, sendMessage };
}
