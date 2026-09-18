// src/components/UserProfilePage.jsx
// Reusable full-page user profile view.
// Props:
//   userId          – MongoDB ObjectId of the user to display
//   isHost          – (optional) show HOST badge
//   onClose         – called when back button is pressed
//   onNavigateToChat – (optional) if provided, shows Message button
import React, { useState, useEffect } from "react";
import { COLORS } from "../constants";
import { fetchUserById, fetchAllUsers } from "../services/profileService";
import { connectUser, disconnectUser, getConnectionsForUser } from "../services/connectionService";
import { createDmConversation, hydrateConversation } from "../services/chatService";

const GRADIENT = "linear-gradient(135deg, #bf527f, #1c11c1cc)";

const TAG_COLORS = {
    Cricket: "#6C63FF", Movies: "#FF6584", Travel: "#43E97B",
    Running: "#FF6584", Cycling: "#38BDF8", Chess: "#FFB347",
    Gaming: "#6C63FF", Photography: "#43E97B", Music: "#FF6584",
    Cooking: "#FFB347", Yoga: "#38BDF8", General: "#8892B0",
};

export default function UserProfilePage({ userId, isHost, onClose, onNavigateToChat }) {
    const myId = (() => { try { return JSON.parse(localStorage.getItem("user") || "{}").id || null; } catch { return null; } })();
    const isSelf = userId === myId;

    const [user, setUser] = useState(null);
    const [connected, setConnected] = useState(false);
    const [connecting, setConnecting] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!userId) return;
        let cancelled = false;
        setLoading(true);
        setError(null);

        const loadUser = async () => {
            try {
                // Try the dedicated endpoint first
                let userData = null;
                try {
                    const res = await fetchUserById(userId);
                    // ApiResponse: { success, message, data: { fullName, ... } }
                    userData = res?.data?.data ?? res?.data ?? null;
                    // If it came back as ApiResponse wrapper, unwrap
                    if (userData && userData.success !== undefined && userData.data) {
                        userData = userData.data;
                    }
                } catch (_) {}

                // Fallback: fetch all users and find by id
                if (!userData || !userData.fullName) {
                    const allRes = await fetchAllUsers();
                    // ApiResponse: { success, message, data: [...] }
                    const raw = allRes?.data;
                    const allUsers = Array.isArray(raw?.data) ? raw.data : (Array.isArray(raw) ? raw : []);
                    userData = allUsers.find(u => u.id === userId || u.userId === userId) || null;
                }

                if (cancelled) return;
                setUser(userData);

                if (!isSelf && myId) {
                    try {
                        const connRes = await getConnectionsForUser(myId);
                        const raw = connRes?.data?.data?.connectedUsers || connRes?.data?.data || connRes?.data || [];
                        const conns = Array.isArray(raw) ? raw : [];
                        setConnected(conns.some(c => c.id === userId || c.userId === userId));
                    } catch (_) {}
                }
            } catch (e) {
                if (!cancelled) setError(e.message);
            } finally {
                if (!cancelled) setLoading(false);
            }
        };

        loadUser();
        return () => { cancelled = true; };
    }, [userId]);

    const handleConnect = async () => {
        setConnecting(true);
        try {
            if (connected) { await disconnectUser(myId, userId); setConnected(false); }
            else { await connectUser(myId, userId); setConnected(true); }
        } catch (_) {}
        setConnecting(false);
    };

    const handleMessage = async () => {
        try {
            const myId2 = (() => { try { return JSON.parse(localStorage.getItem("user") || "{}").id || null; } catch { return null; } })();
            const res = await createDmConversation(userId);
            const hydrated = await hydrateConversation(res.data, myId2);
            onClose();
            onNavigateToChat(hydrated);
        } catch (_) {}
    };

    const u = user || {};
    const name = u.fullName || u.displayName || "";
    const pic = u.profilePicture || null;
    const initials = u.avatar || (name ? name.split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2) : "?");
    const color = u.avatarColor || u.color || "#6C63FF";
    const interests = Array.isArray(u.interests)
        ? u.interests.map(i => (typeof i === "string" ? i : i?.interestName)).filter(Boolean)
        : [];
    const infoRows = [
        { icon: "🪪", label: "Employee ID", val: u.employeeId },
        { icon: "🏢", label: "Department",  val: u.department },
        { icon: "🏗️", label: "Building",    val: u.building },
        { icon: "🔢", label: "Floor",        val: u.floor },
        { icon: "🌍", label: "Location",     val: u.location },
    ].filter(r => r.val);

    return (
        <div style={{
            flex: 1, display: "flex", flexDirection: "column",
            overflow: "hidden", background: "#F4F6FF",
            fontFamily: "'DM Sans', sans-serif",
            position: "relative",
        }}>
            {/* Banner */}
            <div style={{ background: GRADIENT, height: 100, position: "relative", flexShrink: 0 }}>
                <button onClick={onClose} style={{
                    position: "absolute", top: 12, left: 12,
                    background: "rgba(255,255,255,0.18)", border: "none",
                    borderRadius: 10, width: 32, height: 32, cursor: "pointer",
                    display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="15 18 9 12 15 6" />
                    </svg>
                </button>
                {isHost && (
                    <span style={{
                        position: "absolute", top: 14, right: 14,
                        background: "rgba(255,255,255,0.22)", color: "white",
                        borderRadius: 20, padding: "3px 10px", fontSize: 10,
                        fontWeight: 800, letterSpacing: "0.8px",
                    }}>⭐ HOST</span>
                )}
                {/* Avatar overlapping banner bottom */}
                <div style={{
                    position: "absolute", bottom: -34, left: "50%", transform: "translateX(-50%)",
                    width: 68, height: 68, borderRadius: "50%",
                    background: color, border: "3px solid white",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    color: "white", fontWeight: 800, fontSize: 22, overflow: "hidden",
                    boxShadow: "0 4px 14px rgba(0,0,0,0.18)",
                }}>
                    {pic ? <img src={pic} alt={name} style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : initials}
                </div>
            </div>

            {/* Name block */}
            <div style={{ textAlign: "center", paddingTop: 42, paddingBottom: 12, background: "#F4F6FF", flexShrink: 0 }}>
                <div style={{ fontWeight: 800, fontSize: 18, color: COLORS.text, letterSpacing: "-0.3px" }}>{name}</div>
                {u.department && (
                    <div style={{ fontSize: 12, color: COLORS.muted, marginTop: 3 }}>{u.department}</div>
                )}
            </div>

            {/* Scrollable body */}
            <div style={{ flex: 1, overflowY: "auto", scrollbarWidth: "none", paddingBottom: isSelf ? 24 : 88, paddingTop: 4 }}>
                {loading ? (
                    <div style={{ textAlign: "center", padding: "48px 0", color: COLORS.muted, fontSize: 13 }}>Loading profile…</div>
                ) : error ? (
                    <div style={{ textAlign: "center", color: "#EF4444", padding: "48px 20px", fontSize: 13 }}>{error}</div>
                ) : (
                    <>
                        {/* About card */}
                        {infoRows.length > 0 && (
                            <div style={{ margin: "0 16px 14px", background: "white", borderRadius: 18, boxShadow: "0 2px 12px rgba(108,99,255,0.07)", overflow: "hidden" }}>
                                <div style={{ padding: "12px 16px 6px", fontSize: 11, fontWeight: 700, color: "#6C63FF", textTransform: "uppercase", letterSpacing: "0.7px" }}>About</div>
                                {infoRows.map((r, i) => (
                                    <div key={r.label} style={{
                                        display: "flex", alignItems: "center", gap: 14,
                                        padding: "11px 16px",
                                        borderTop: i === 0 ? "none" : "1px solid #F0F4FF",
                                    }}>
                                        <div style={{
                                            width: 36, height: 36, borderRadius: 10,
                                            background: "#EEF0FF",
                                            display: "flex", alignItems: "center", justifyContent: "center",
                                            fontSize: 16, flexShrink: 0,
                                        }}>{r.icon}</div>
                                        <div>
                                            <div style={{ fontSize: 10, fontWeight: 700, color: COLORS.muted, textTransform: "uppercase", letterSpacing: "0.5px" }}>{r.label}</div>
                                            <div style={{ fontSize: 14, fontWeight: 600, color: COLORS.text, marginTop: 2 }}>{r.val}</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Interests */}
                        {interests.length > 0 && (
                            <div style={{ margin: "0 16px 16px", background: "white", borderRadius: 18, boxShadow: "0 2px 12px rgba(108,99,255,0.07)", padding: "12px 16px 16px" }}>
                                <div style={{ fontSize: 11, fontWeight: 700, color: "#6C63FF", textTransform: "uppercase", letterSpacing: "0.7px", marginBottom: 12 }}>Interests</div>
                                <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                                    {interests.map(interest => (
                                        <span key={interest} style={{
                                            background: "#EEF0FF", color: "#6C63FF",
                                            borderRadius: 20, padding: "6px 14px",
                                            fontSize: 13, fontWeight: 700,
                                            border: "1px solid #D0D3FF",
                                        }}>#{interest}</span>
                                    ))}
                                </div>
                            </div>
                        )}

                        {infoRows.length === 0 && interests.length === 0 && (
                            <div style={{ textAlign: "center", color: COLORS.muted, padding: "32px 0", fontSize: 13 }}>No additional details available.</div>
                        )}
                    </>
                )}
            </div>

            {/* Action buttons — pinned bottom, hidden for self */}
            {!isSelf && onNavigateToChat && (
                <div style={{
                    position: "absolute", bottom: 0, left: 0, right: 0,
                    padding: "12px 16px 20px",
                    background: "white", borderTop: "1.5px solid #E2E8F8",
                    display: "flex", gap: 10,
                    boxShadow: "0 -4px 20px rgba(108,99,255,0.08)",
                }}>
                    <button onClick={handleConnect} disabled={connecting} style={{
                        flex: 1, padding: "13px 0", borderRadius: 14, cursor: "pointer",
                        border: connected ? "1.5px solid #D0D3FF" : "none",
                        background: connected ? "#F4F6FF" : GRADIENT,
                        color: connected ? "#6C63FF" : "white",
                        fontWeight: 700, fontSize: 14,
                        opacity: connecting ? 0.6 : 1,
                        boxShadow: connected ? "none" : "0 4px 14px rgba(108,99,255,0.3)",
                    }}>
                        {connecting ? "…" : connected ? "✓ Connected" : "+ Connect"}
                    </button>
                    <button onClick={handleMessage} style={{
                        flex: 1, padding: "13px 0", borderRadius: 14, cursor: "pointer",
                        border: "1.5px solid #6C63FF", background: "white",
                        color: "#6C63FF", fontWeight: 700, fontSize: 14,
                        display: "flex", alignItems: "center", justifyContent: "center", gap: 7,
                    }}>
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#6C63FF" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                        </svg>
                        Message
                    </button>
                </div>
            )}
        </div>
    );
}
