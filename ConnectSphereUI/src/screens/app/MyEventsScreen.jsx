// src/screens/app/MyEventsScreen.jsx
import React, { useState, useEffect } from "react";
import { COLORS } from "../../constants";
import { MobileDatePicker } from '@mui/x-date-pickers/MobileDatePicker';
import { MobileTimePicker } from '@mui/x-date-pickers/MobileTimePicker';
import dayjs from 'dayjs';
import {
    fetchMyHostedEvents,
    fetchMyJoinedEvents,
    fetchMyPastEvents,
    fetchEventAttendees,
    updateEventDateTime,
    deleteEvent,
    acknowledgeEventUpdate
} from "../../services/eventsService";
import { createDmConversation, hydrateConversation } from "../../services/chatService";
import { fetchUserById } from "../../services/profileService";
import UserProfilePage from "../../components/UserProfilePage";

const TAG_COLORS = {
    Cricket: "#6C63FF", Movies: "#FF6584", Travel: "#43E97B",
    Running: "#FF6584", Cycling: "#38BDF8", Chess: "#FFB347",
    Gaming: "#6C63FF", Photography: "#43E97B", Music: "#FF6584",
    Cooking: "#FFB347", Yoga: "#38BDF8", General: "#8892B0",
};

const GRADIENT = "linear-gradient(135deg, #bf527f, #1c11c1cc)";

function fmtDate(date) {
    if (!date) return "";
    const [y, m, d] = date.split("-");
    return `${d}-${m}-${y}`;
}

function to12hr(time) {
    if (!time) return "";
    const [h, m] = time.split(":").map(Number);
    const ampm = h >= 12 ? "PM" : "AM";
    const hour = h % 12 || 12;
    return `${hour}:${String(m).padStart(2, "0")} ${ampm}`;
}

const TABS = [
    { id: "hosted", label: "Hosted by Me", emoji: "🏠" },
    { id: "joined", label: "Joined",        emoji: "✋" },
    { id: "past",   label: "Past Events",   emoji: "🕐" },
];

function AvatarCircle({ attendee, size = 44 }) {
    return (
        <div style={{
            width: size, height: size, borderRadius: "50%",
            background: attendee.avatarColor || "#6C63FF",
            display: "flex", alignItems: "center", justifyContent: "center",
            color: "white", fontWeight: 800, fontSize: size * 0.36,
            fontFamily: "'DM Sans', sans-serif",
            flexShrink: 0, border: "2.5px solid white",
            boxShadow: "0 2px 8px rgba(0,0,0,0.15)", overflow: "hidden",
        }}>
            {attendee.profilePicture ? (
                <img src={attendee.profilePicture} alt={attendee.displayName}
                    style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
            ) : (attendee.avatar || "?")}
        </div>
    );
}



function AttendeesDrawer({ event, onClose, onNavigateToChat }) {
    const myId = (() => { try { return JSON.parse(localStorage.getItem("user") || "{}").id || null; } catch { return null; } })();
    const [attendees, setAttendees] = useState([]);
    const [departments, setDepartments] = useState({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedAttendee, setSelectedAttendee] = useState(null);

    useEffect(() => {
        if (!event) return;
        let cancelled = false;
        setLoading(true); setError(null);
        fetchEventAttendees(event.id)
            .then(async json => {
                if (cancelled) return;
                const list = json?.data?.attendees || [];
                setAttendees(list);
                const results = await Promise.allSettled(
                    list.map(a => fetchUserById(a.userId).then(r => {
                        const data = r?.data?.data ?? r?.data ?? {};
                        const userData = (data && data.success !== undefined && data.data) ? data.data : data;
                        return { userId: a.userId, department: userData?.department || "" };
                    }))
                );
                if (cancelled) return;
                const map = {};
                results.forEach(r => { if (r.status === "fulfilled") map[r.value.userId] = r.value.department; });
                setDepartments(map);
            })
            .catch(e => { if (!cancelled) setError(e.message); })
            .finally(() => { if (!cancelled) setLoading(false); });
        return () => { cancelled = true; };
    }, [event]);

    if (!event) return null;

    return (
        <>
            <div onClick={onClose} style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.45)", zIndex: 400 }} />
            <div style={{
                position: "absolute", bottom: 0, left: 0, right: 0,
                background: "white", borderRadius: "24px 24px 0 0",
                zIndex: 401, maxHeight: "78vh",
                display: "flex", flexDirection: "column",
                boxShadow: "0 -8px 32px rgba(108,99,255,0.13)",
            }}>
                <div style={{ width: 40, height: 4, borderRadius: 2, background: "#E2E8F8", margin: "14px auto 0", flexShrink: 0 }} />
                <div style={{
                    display: "flex", justifyContent: "space-between", alignItems: "center",
                    padding: "14px 20px 12px", borderBottom: "1.5px solid #E2E8F8", flexShrink: 0,
                }}>
                    <div>
                        <div style={{ fontWeight: 800, fontSize: 16, fontFamily: "'DM Sans', sans-serif", color: COLORS.text }}>{event.title}</div>
                        <div style={{ fontSize: 12, color: COLORS.muted, fontFamily: "'DM Sans', sans-serif", marginTop: 2 }}>
                            {loading ? "Loading…" : `${attendees.length} attendee${attendees.length !== 1 ? "s" : ""}`}
                        </div>
                    </div>
                    <button onClick={onClose} style={{
                        background: "#F4F4F8", border: "none", borderRadius: 10,
                        width: 34, height: 34, cursor: "pointer",
                        display: "flex", alignItems: "center", justifyContent: "center",
                    }}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#64748B" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                        </svg>
                    </button>
                </div>
                <div style={{ overflowY: "auto", flex: 1, padding: "8px 18px 28px", scrollbarWidth: "none" }}>
                    {loading && <div style={{ textAlign: "center", color: COLORS.muted, padding: 36, fontFamily: "'DM Sans', sans-serif", fontSize: 13 }}>Loading attendees…</div>}
                    {error && !loading && <div style={{ textAlign: "center", color: "#EF4444", padding: 36, fontFamily: "'DM Sans', sans-serif", fontSize: 13 }}>{error}</div>}
                    {!loading && !error && attendees.length === 0 && (
                        <div style={{ textAlign: "center", color: COLORS.muted, padding: 36, fontFamily: "'DM Sans', sans-serif", fontSize: 13 }}>No attendees yet.</div>
                    )}
                    {!loading && !error && attendees.map((a, i) => {
                        const dept = departments[a.userId] || "";
                        const isSelf = a.userId === myId;
                        return (
                            <div key={a.userId} onClick={() => setSelectedAttendee(a)} style={{
                                display: "flex", alignItems: "flex-start", gap: 12,
                                padding: "13px 0", cursor: "pointer",
                                borderBottom: i < attendees.length - 1 ? "1.5px solid #F0F4FF" : "none",
                            }}>
                                <AvatarCircle attendee={a} size={46} />
                                <div style={{ flex: 1, minWidth: 0 }}>
                                    <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 6 }}>
                                        <div style={{ display: "flex", alignItems: "center", gap: 5, flex: 1, minWidth: 0 }}>
                                            <span style={{ fontWeight: 700, fontSize: 14, fontFamily: "'DM Sans', sans-serif", color: COLORS.text, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                                                {a.displayName}
                                            </span>
                                            {a.host && (
                                                <span style={{
                                                    background: GRADIENT, color: "white",
                                                    borderRadius: 6, padding: "2px 8px", fontSize: 9,
                                                    fontWeight: 800, fontFamily: "'DM Sans', sans-serif", flexShrink: 0, letterSpacing: "0.5px",
                                                }}>HOST</span>
                                            )}
                                        </div>
                                        {!isSelf && onNavigateToChat && (
                                            <button
                                                onClick={async (e) => {
                                                    e.stopPropagation();
                                                    try {
                                                        const myId2 = (() => { try { return JSON.parse(localStorage.getItem("user") || "{}").id || null; } catch { return null; } })();
                                                        const res = await createDmConversation(a.userId);
                                                        const hydrated = await hydrateConversation(res.data, myId2);
                                                        onClose();
                                                        onNavigateToChat(hydrated);
                                                    } catch (err) {
                                                        console.error("Couldn't open chat", err);
                                                    }
                                                }}
                                                style={{
                                                    background: "#F0F4FF", border: "1.5px solid #E2E8F8",
                                                    borderRadius: 8, width: 30, height: 30, cursor: "pointer",
                                                    display: "flex", alignItems: "center", justifyContent: "center",
                                                    flexShrink: 0,
                                                }}
                                                title={`Message ${a.displayName}`}
                                            >
                                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#6C63FF" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                                                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                                                </svg>
                                            </button>
                                        )}
                                    </div>
                                    {dept ? (
                                        <div style={{ fontSize: 12, color: COLORS.muted, fontFamily: "'DM Sans', sans-serif" }}>{dept}</div>
                                    ) : null}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
            {selectedAttendee && (
                <div style={{
                    position: "absolute", inset: 0, zIndex: 500,
                    background: "#F4F6FF", display: "flex", flexDirection: "column",
                }}>
                    <UserProfilePage
                        userId={selectedAttendee.userId}
                        isHost={selectedAttendee.host}
                        onClose={() => setSelectedAttendee(null)}
                        onNavigateToChat={onNavigateToChat}
                    />
                </div>
            )}
        </>
    );
}

function EventDetailDrawer({ ev, isHosted, isJoined, onClose, onRefresh, onTriggerEdit, onTriggerDelete, onNavigateToChat }) {
    const [attendeesOpen, setAttendeesOpen] = useState(false);
    const [menuOpen, setMenuOpen] = useState(false);
    const fillPct = ev.maxParticipants > 0 ? Math.min(100, (ev.joinedCount / ev.maxParticipants) * 100) : 0;
    const isFull = ev.spotsLeft === 0;

    const handleDismiss = async () => {
        if (isJoined && ev.needsNotification) {
            try { await acknowledgeEventUpdate(ev.id); onRefresh(); } catch (_) {}
        }
        onClose();
    };

    return (
        <>
            <div onClick={handleDismiss} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)", zIndex: 400 }} />
            <div style={{
                position: "fixed", top: "50%", left: "50%", transform: "translate(-50%, -50%)",
                background: "white", borderRadius: 20, zIndex: 401,
                width: "88%", maxWidth: 360,
                boxShadow: "0 16px 48px rgba(0,0,0,0.2)", overflow: "hidden",
            }}>

                <div style={{ background: GRADIENT, margin: "14px 16px 0", borderRadius: 16, padding: "14px 16px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 10, flex: 1, minWidth: 0 }}>
                            <div style={{
                                width: 44, height: 44, borderRadius: 14,
                                background: "rgba(255,255,255,0.18)",
                                display: "flex", alignItems: "center", justifyContent: "center",
                                fontSize: 22, flexShrink: 0,
                            }}>{ev.emoji}</div>
                            <div style={{ minWidth: 0 }}>
                                <div style={{ display: "flex", alignItems: "flex-start", gap: 6 }}>
                                    <div style={{
                                        fontWeight: 800, fontSize: 15, color: "white",
                                        fontFamily: "'DM Sans', sans-serif", wordBreak: "break-word",
                                    }}>{ev.title}</div>
                                    {isHosted && (
                                        <div style={{ position: "relative", flexShrink: 0 }}>
                                            <button onClick={e => { e.stopPropagation(); setMenuOpen(p => !p); }} style={{
                                                background: "rgba(255,255,255,0.2)", border: "none",
                                                borderRadius: 8, width: 28, height: 28, cursor: "pointer",
                                                display: "flex", alignItems: "center", justifyContent: "center",
                                                color: "white", fontSize: 16, fontWeight: 800,
                                            }}>⋮</button>
                                            {menuOpen && (
                                                <>
                                                    <div onClick={e => { e.stopPropagation(); setMenuOpen(false); }} style={{ position: "fixed", inset: 0, zIndex: 90 }} />
                                                    <div style={{
                                                        position: "absolute", top: 32, right: 0, background: "white",
                                                        border: "1.5px solid #E2E8F8", borderRadius: 12, padding: "6px 0",
                                                        minWidth: 110, zIndex: 95, boxShadow: "0 8px 24px rgba(0,0,0,0.12)",
                                                    }}>
                                                        <button onClick={e => { e.stopPropagation(); setMenuOpen(false); onClose(); onTriggerEdit(ev); }} style={{ background: "none", border: "none", padding: "8px 14px", fontSize: 13, textAlign: "left", cursor: "pointer", fontFamily: "'DM Sans', sans-serif", color: COLORS.text, width: "100%", display: "flex", alignItems: "center", gap: 6 }}>✏️ Edit</button>
                                                        <button onClick={e => { e.stopPropagation(); setMenuOpen(false); onClose(); onTriggerDelete(ev); }} style={{ background: "none", border: "none", padding: "8px 14px", fontSize: 13, textAlign: "left", cursor: "pointer", fontFamily: "'DM Sans', sans-serif", color: "#EF4444", width: "100%", display: "flex", alignItems: "center", gap: 6 }}>🗑️ Delete</button>
                                                    </div>
                                                </>
                                            )}
                                        </div>
                                    )}
                                </div>
                                <span style={{
                                    display: "inline-block", marginTop: 4,
                                    background: "rgba(255,255,255,0.2)", color: "rgba(255,255,255,0.95)",
                                    borderRadius: 20, padding: "2px 10px",
                                    fontSize: 10, fontWeight: 700, fontFamily: "'DM Sans', sans-serif",
                                }}>#{ev.interest}</span>
                            </div>
                        </div>
                        <div style={{
                            background: "rgba(255,255,255,0.18)", borderRadius: 12,
                            padding: "8px 12px", textAlign: "center", flexShrink: 0, marginLeft: 10,
                        }}>
                            <div style={{ fontSize: 11, color: "white", fontWeight: 800, fontFamily: "'DM Sans', sans-serif", whiteSpace: "nowrap" }}>{fmtDate(ev.date)}</div>
                            <div style={{ fontSize: 10, color: "rgba(255,255,255,0.85)", fontFamily: "'DM Sans', sans-serif", marginTop: 2 }}>{to12hr(ev.time)}</div>
                        </div>
                    </div>
                </div>

                {/* Details */}
                <div style={{ padding: "14px 16px 20px" }}>
                    {isJoined && ev.needsNotification && (
                        <div style={{
                            background: "linear-gradient(90deg,#FF6584,#ff8fab)",
                            color: "white", padding: "7px 14px", borderRadius: 10, marginBottom: 12,
                            fontSize: 10, fontWeight: 800, textAlign: "center",
                            fontFamily: "'DM Sans', sans-serif", letterSpacing: "0.6px",
                        }}>⚠️ HOST UPDATED THE DATE / TIME — TAP BACKDROP TO DISMISS</div>
                    )}

                    {/* Location */}
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
                        <span style={{ fontSize: 14 }}>📍</span>
                        <span style={{ fontSize: 13, color: COLORS.text, fontFamily: "'DM Sans', sans-serif", fontWeight: 500 }}>{ev.location}</span>
                    </div>

                    {/* Host name — shown on joined & past tabs */}
                    {!isHosted && ev.hostName && (
                        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
                            <span style={{ fontSize: 14 }}>👤</span>
                            <span style={{ fontSize: 13, fontFamily: "'DM Sans', sans-serif", color: COLORS.muted }}>Hosted by </span>
                            <span style={{ fontSize: 13, fontFamily: "'DM Sans', sans-serif", fontWeight: 700, color: COLORS.text }}>{ev.hostName}</span>
                        </div>
                    )}

                    {/* Description if available */}
                    {ev.description && (
                        <div style={{ fontSize: 12, color: COLORS.muted, fontFamily: "'DM Sans', sans-serif", lineHeight: 1.6, marginBottom: 10, background: "#F8F9FF", borderRadius: 10, padding: "8px 12px" }}>
                            {ev.description}
                        </div>
                    )}

                    {/* Divider */}
                    <div style={{ height: 1, background: "#E2E8F8", marginBottom: 10 }} />

                    {/* Joined / spots */}
                    <div>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                            <span onClick={() => setAttendeesOpen(true)} style={{
                                fontSize: 12, fontFamily: "'DM Sans', sans-serif",
                                color: "#6C63FF", fontWeight: 700, cursor: "pointer",
                                display: "flex", alignItems: "center", gap: 5,
                            }}>
                                <span style={{ fontSize: 14, lineHeight: 1 }}>👥</span>
                                <span>{ev.joinedCount}/{ev.maxParticipants} joined</span>
                            </span>
                            <span style={{
                                fontSize: 11, fontWeight: 700, fontFamily: "'DM Sans', sans-serif",
                                color: isFull ? "#EF4444" : "#10B981",
                                background: isFull ? "#FEF2F2" : "#ECFDF5",
                                borderRadius: 20, padding: "2px 10px",
                            }}>{isFull ? "Full" : `${ev.spotsLeft} left`}</span>
                        </div>
                        <div style={{ height: 6, background: "#F0F4FF", borderRadius: 4, overflow: "hidden" }}>
                            <div style={{
                                height: "100%", width: `${fillPct}%`,
                                background: isFull ? "linear-gradient(90deg,#EF4444,#f87171)" : GRADIENT,
                                borderRadius: 4, transition: "width 0.4s ease",
                            }} />
                        </div>
                    </div>
                </div>
            </div>
            {attendeesOpen && <AttendeesDrawer event={ev} onClose={() => setAttendeesOpen(false)} onNavigateToChat={onNavigateToChat} />}
        </>
    );
}

function EventCard({ ev, isHosted, isJoined, onRefresh, onTriggerEdit, onTriggerDelete, onNavigateToChat }) {
    const [detailOpen, setDetailOpen] = useState(false);

    return (
        <>
            <div onClick={() => setDetailOpen(true)} style={{
                background: "white", borderRadius: 14, marginBottom: 10,
                border: ev.needsNotification ? "2px solid #FF6584" : "1.5px solid #E2E8F8",
                boxShadow: "0 2px 10px rgba(108,99,255,0.07)",
                overflow: "hidden", cursor: "pointer",
                borderLeft: `4px solid #bf527f`,
            }}>
                <div style={{ padding: "11px 14px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10, minWidth: 0, flex: 1 }}>
                        <div style={{
                            width: 36, height: 36, borderRadius: 10,
                            background: "#F0F4FF",
                            display: "flex", alignItems: "center", justifyContent: "center",
                            fontSize: 18, flexShrink: 0,
                        }}>{ev.emoji}</div>
                        <div style={{
                            fontWeight: 700, fontSize: 14, color: COLORS.text,
                            fontFamily: "'DM Sans', sans-serif",
                            overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                        }}>{ev.title}</div>
                    </div>
                    <div style={{
                        background: "#F0F4FF", borderRadius: 10,
                        padding: "6px 10px", textAlign: "center", flexShrink: 0,
                    }}>
                        <div style={{ fontSize: 11, color: COLORS.text, fontWeight: 800, fontFamily: "'DM Sans', sans-serif", whiteSpace: "nowrap" }}>{fmtDate(ev.date)}</div>
                        <div style={{ fontSize: 11, color: "#6C63FF", fontFamily: "'DM Sans', sans-serif", fontWeight: 600, marginTop: 1 }}>{to12hr(ev.time)}</div>
                    </div>
                </div>
                {ev.needsNotification && (
                    <div style={{
                        background: "linear-gradient(90deg,#FF6584,#ff8fab)",
                        color: "white", padding: "4px 14px",
                        fontSize: 10, fontWeight: 800, textAlign: "center",
                        fontFamily: "'DM Sans', sans-serif", letterSpacing: "0.5px",
                    }}>⚠️ HOST UPDATED — TAP TO VIEW</div>
                )}
            </div>
            {detailOpen && (
                <EventDetailDrawer
                    ev={ev} isHosted={isHosted} isJoined={isJoined}
                    onClose={() => setDetailOpen(false)}
                    onRefresh={onRefresh}
                    onTriggerEdit={onTriggerEdit}
                    onTriggerDelete={onTriggerDelete}
                    onNavigateToChat={onNavigateToChat}
                />
            )}
        </>
    );
}

function MyEventsScreen({ onBack, onNavigateToChat }) {
    const [activeTab, setActiveTab] = useState("hosted");
    const [data, setData] = useState({ hosted: [], joined: [], past: [] });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [editEvent, setEditEvent] = useState(null);
    const [editDate, setEditDate] = useState("");
    const [editTime, setEditTime] = useState("");
    const [updating, setUpdating] = useState(false);
    const [deleteConfirmEvent, setDeleteConfirmEvent] = useState(null);
    const [pastSearch, setPastSearch] = useState("");
    const [filterOpen, setFilterOpen] = useState(false);
    const [filterFields, setFilterFields] = useState({ dateFrom: "", dateTo: "", place: "", hostname: "", interest: "" });

    const loadScreenData = () => {
        setLoading(true); setError(null);
        Promise.all([fetchMyHostedEvents(), fetchMyJoinedEvents(), fetchMyPastEvents()])
            .then(([hosted, joined, past]) => {
                setData({ hosted: hosted?.data || [], joined: joined?.data || [], past: past?.data || [] });
            })
            .catch(e => setError(e.message))
            .finally(() => setLoading(false));
    };

    useEffect(() => { loadScreenData(); }, []);

    const triggerEditModal = (targetEvent) => {
        setEditEvent(targetEvent);
        setEditDate(targetEvent.date);
        setEditTime(targetEvent.time); // stored as HH:mm for the picker
    };

    const handleSaveEdit = async () => {
        setUpdating(true);
        try {
            const res = await updateEventDateTime(editEvent.id, editDate, editTime);
            if (res && (res.success || res.status === "OK")) {
                setEditEvent(null); loadScreenData();
            } else {
                alert(res?.message || "Failed to update event.");
            }
        } catch (err) {
            alert(err.message || "An unexpected error occurred.");
        } finally {
            setUpdating(false);
        }
    };

    const handleConfirmDelete = async () => {
        const targetId = deleteConfirmEvent.id;
        setDeleteConfirmEvent(null);
        try { await deleteEvent(targetId); loadScreenData(); }
        catch (err) { alert(err.message || "Failed to delete event."); }
    };

    const sortedEvents = (list) => [...list].sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0));
    const events = activeTab === "past"
        ? sortedEvents(data.past).filter(ev => {
            const q = pastSearch.toLowerCase();
            const matchesSearch = !q || ev.title?.toLowerCase().includes(q) || ev.location?.toLowerCase().includes(q) || ev.interest?.toLowerCase().includes(q);
            const matchesDate = (!filterFields.dateFrom && !filterFields.dateTo) || (() => { const d = ev.date; return (!filterFields.dateFrom || d >= filterFields.dateFrom) && (!filterFields.dateTo || d <= filterFields.dateTo); })();
            const matchesPlace = !filterFields.place || ev.location?.toLowerCase().includes(filterFields.place.toLowerCase());
            const matchesHost = !filterFields.hostname || ev.hostName?.toLowerCase().includes(filterFields.hostname.toLowerCase());
            const matchesInterest = !filterFields.interest || ev.interest?.toLowerCase().includes(filterFields.interest.toLowerCase());
            return matchesSearch && matchesDate && matchesPlace && matchesHost && matchesInterest;
          })
        : sortedEvents(data[activeTab]);

    const EMPTY_STATE = {
        hosted: { emoji: "🎯", title: "No hosted events yet", sub: "Head to the Events tab to create one!" },
        joined: { emoji: "🤝", title: "No joined events yet", sub: "Head to the Events tab to find one!" },
        past:   { emoji: "🕐", title: "No past events", sub: "Events you hosted or joined will appear here after they pass." },
    };

    return (
        <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden", background: "#F0F4FF", position: "relative" }}>

            {/* Header */}
            <div style={{
                display: "flex", alignItems: "center", gap: 12,
                padding: "10px 16px 10px",
                background: "white",
                borderBottom: "1.5px solid #E2E8F8",
                flexShrink: 0,
            }}>
                <button onClick={onBack} style={{
                    background: "none", border: "none", borderRadius: 10,
                    width: 36, height: 36, cursor: "pointer",
                    display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#6C63FF" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="15 18 9 12 15 6" />
                    </svg>
                </button>
                <div style={{ fontWeight: 800, fontSize: 18, fontFamily: "'DM Sans', sans-serif", color: COLORS.text }}>My Events</div>
            </div>

            {/* Tabs */}
            <div style={{
                display: "flex", background: "white",
                borderBottom: "1.5px solid #E2E8F8", flexShrink: 0,
                boxShadow: "0 4px 12px rgba(108,99,255,0.08)",
            }}>
                {TABS.map(tab => {
                    const count = data[tab.id].length;
                    const active = activeTab === tab.id;
                    return (
                        <button key={tab.id} onClick={() => setActiveTab(tab.id)} style={{
                            flex: 1, padding: "9px 4px",
                            border: "none", background: "none", cursor: "pointer",
                            borderBottom: active ? "2.5px solid #6C63FF" : "2.5px solid transparent",
                            color: active ? "#6C63FF" : COLORS.muted,
                            fontWeight: active ? 800 : 600, fontSize: 11,
                            fontFamily: "'DM Sans', sans-serif", transition: "all 0.15s",
                            display: "flex", alignItems: "center", justifyContent: "center", gap: 4,
                            whiteSpace: "nowrap",
                        }}>
                            <span style={{ fontSize: 13 }}>{tab.emoji}</span>
                            <span>{tab.label}</span>
                            {!loading && (
                                <span style={{
                                    background: active ? "#6C63FF" : "#E2E8F8",
                                    color: active ? "white" : COLORS.muted,
                                    borderRadius: 20, padding: "1px 6px",
                                    fontSize: 10, fontWeight: 700,
                                }}>{count}</span>
                            )}
                        </button>
                    );
                })}
            </div>

            {/* Past filter bar */}
            {activeTab === "past" && (
                <div style={{ padding: "10px 14px 0", background: "#F0F4FF", flexShrink: 0 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <div style={{ flex: 1, display: "flex", alignItems: "center", background: "white", borderRadius: 12, border: `1.5px solid ${pastSearch ? "#6C63FF" : "#E2E8F8"}`, padding: "0 12px", gap: 8 }}>
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={pastSearch ? "#6C63FF" : "#8892B0"} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
                            </svg>
                            <input value={pastSearch} onChange={e => setPastSearch(e.target.value)} placeholder="Search past events…"
                                style={{ flex: 1, border: "none", outline: "none", padding: "11px 0", fontSize: 13, fontFamily: "'DM Sans', sans-serif", color: COLORS.text, background: "transparent" }}
                            />
                            {pastSearch && (
                                <button onClick={() => setPastSearch("")} style={{ background: "none", border: "none", cursor: "pointer", padding: 0, display: "flex", alignItems: "center" }}>
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#8892B0" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
                                </button>
                            )}
                        </div>
                        <button onClick={() => setFilterOpen(p => !p)} style={{
                            width: 42, height: 42, borderRadius: 12, border: `1.5px solid ${Object.values(filterFields).some(v => v) ? "#6C63FF" : "#E2E8F8"}`,
                            background: Object.values(filterFields).some(v => v) ? "#6C63FF" : "white", cursor: "pointer",
                            display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
                        }}>
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={Object.values(filterFields).some(v => v) ? "white" : "#8892B0"} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
                            </svg>
                        </button>
                    </div>


                </div>
            )}

            {/* Content */}
            <div style={{ flex: 1, overflowY: "auto", padding: "16px 14px 28px", scrollbarWidth: "none" }}>
                {loading && (
                    <div style={{ textAlign: "center", color: COLORS.muted, padding: 48, fontFamily: "'DM Sans', sans-serif", fontSize: 13 }}>
                        Loading your events…
                    </div>
                )}
                {error && !loading && (
                    <div style={{ textAlign: "center", color: "#EF4444", padding: 48, fontFamily: "'DM Sans', sans-serif", fontSize: 13 }}>{error}</div>
                )}
                {!loading && !error && events.length === 0 && (() => {
                    const s = EMPTY_STATE[activeTab];
                    return (
                        <div style={{ textAlign: "center", padding: "56px 24px" }}>
                            <div style={{
                                width: 72, height: 72, borderRadius: 24,
                                background: "white", border: "1.5px solid #E2E8F8",
                                display: "flex", alignItems: "center", justifyContent: "center",
                                fontSize: 34, margin: "0 auto 16px",
                                boxShadow: "0 4px 16px rgba(108,99,255,0.1)",
                            }}>{s.emoji}</div>
                            <div style={{ fontWeight: 800, fontSize: 16, color: COLORS.text, fontFamily: "'DM Sans', sans-serif", marginBottom: 8 }}>{s.title}</div>
                            <div style={{ fontSize: 13, color: COLORS.muted, fontFamily: "'DM Sans', sans-serif", lineHeight: 1.6 }}>{s.sub}</div>
                        </div>
                    );
                })()}
                {!loading && !error && events.map(ev => (
                    <EventCard
                        key={ev.id} ev={ev}
                        isHosted={activeTab === "hosted"}
                        isJoined={activeTab === "joined"}
                        onRefresh={loadScreenData}
                        onTriggerEdit={triggerEditModal}
                        onTriggerDelete={setDeleteConfirmEvent}
                        onNavigateToChat={onNavigateToChat}
                    />
                ))}
            </div>

            {/* Filter popup */}
            {filterOpen && (
                <div onClick={() => setFilterOpen(false)} style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.35)", zIndex: 300, display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <div onClick={e => e.stopPropagation()} style={{ background: "white", borderRadius: 20, padding: "20px 18px", width: "82%", maxWidth: 300, boxShadow: "0 16px 48px rgba(0,0,0,0.18)" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                            <span style={{ fontWeight: 800, fontSize: 14, fontFamily: "'DM Sans', sans-serif", color: COLORS.text }}>Filter Events</span>
                            <button onClick={() => setFilterOpen(false)} style={{ background: "none", border: "none", cursor: "pointer", padding: 0, display: "flex" }}>
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#8892B0" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
                            </button>
                        </div>
                        <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 18 }}>
                            {[
                                { key: "place", label: "Place", placeholder: "e.g. Mumbai", type: "text" },
                                { key: "hostname", label: "Host Name", placeholder: "e.g. Rahul", type: "text" },
                                { key: "interest", label: "Interest", placeholder: "e.g. Cricket", type: "text" },
                            ].map(({ key, label, placeholder, type }) => {
                                const active = !!filterFields[key];
                                return (
                                    <div key={key} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                                        <div onClick={() => setFilterFields(p => ({ ...p, [key]: active ? "" : p[key] }))}
                                            style={{
                                                width: 16, height: 16, borderRadius: 4, flexShrink: 0, cursor: "pointer",
                                                border: `2px solid ${active ? "#6C63FF" : "#E2E8F8"}`,
                                                background: active ? "#6C63FF" : "white",
                                                display: "flex", alignItems: "center", justifyContent: "center",
                                            }}>
                                            {active && <svg width="9" height="9" viewBox="0 0 12 12" fill="none"><polyline points="2,6 5,9 10,3" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>}
                                        </div>
                                        <div style={{ flex: 1, minWidth: 0 }}>
                                            <div style={{ fontSize: 11, fontWeight: 700, color: active ? "#6C63FF" : COLORS.muted, fontFamily: "'DM Sans', sans-serif", marginBottom: 3 }}>{label}</div>
                                            <input type={type} value={filterFields[key]} placeholder={placeholder}
                                                onChange={e => setFilterFields(p => ({ ...p, [key]: e.target.value }))}
                                                style={{ width: "100%", boxSizing: "border-box", border: `1.5px solid ${active ? "#6C63FF" : "#E2E8F8"}`, borderRadius: 8, padding: "7px 10px", fontSize: 12, fontFamily: "'DM Sans', sans-serif", color: COLORS.text, outline: "none", background: "#F8F9FF" }}
                                            />
                                        </div>
                                    </div>
                                );
                            })}
                            {/* Date range */}
                            {(() => {
                                const active = !!(filterFields.dateFrom || filterFields.dateTo);
                                return (
                                    <div style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
                                        <div onClick={() => setFilterFields(p => ({ ...p, dateFrom: "", dateTo: "" }))}
                                            style={{
                                                width: 16, height: 16, borderRadius: 4, flexShrink: 0, cursor: "pointer", marginTop: 18,
                                                border: `2px solid ${active ? "#6C63FF" : "#E2E8F8"}`,
                                                background: active ? "#6C63FF" : "white",
                                                display: "flex", alignItems: "center", justifyContent: "center",
                                            }}>
                                            {active && <svg width="9" height="9" viewBox="0 0 12 12" fill="none"><polyline points="2,6 5,9 10,3" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>}
                                        </div>
                                        <div style={{ flex: 1, minWidth: 0 }}>
                                            <div style={{ fontSize: 11, fontWeight: 700, color: active ? "#6C63FF" : COLORS.muted, fontFamily: "'DM Sans', sans-serif", marginBottom: 3 }}>Date Range</div>
                                            <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                                                <input type="date" value={filterFields.dateFrom} onChange={e => setFilterFields(p => ({ ...p, dateFrom: e.target.value }))}
                                                    style={{ flex: 1, border: `1.5px solid ${filterFields.dateFrom ? "#6C63FF" : "#E2E8F8"}`, borderRadius: 8, padding: "7px 6px", fontSize: 11, fontFamily: "'DM Sans', sans-serif", color: COLORS.text, outline: "none", background: "#F8F9FF" }} />
                                                <span style={{ fontSize: 11, color: COLORS.muted, flexShrink: 0 }}>→</span>
                                                <input type="date" value={filterFields.dateTo} onChange={e => setFilterFields(p => ({ ...p, dateTo: e.target.value }))}
                                                    style={{ flex: 1, border: `1.5px solid ${filterFields.dateTo ? "#6C63FF" : "#E2E8F8"}`, borderRadius: 8, padding: "7px 6px", fontSize: 11, fontFamily: "'DM Sans', sans-serif", color: COLORS.text, outline: "none", background: "#F8F9FF" }} />
                                            </div>
                                        </div>
                                    </div>
                                );
                            })()}
                        </div>
                        <div style={{ display: "flex", gap: 8 }}>
                            <button onClick={() => { setFilterFields({ dateFrom: "", dateTo: "", place: "", hostname: "", interest: "" }); setFilterOpen(false); }}
                                style={{ flex: 1, padding: "10px 0", borderRadius: 10, border: "1.5px solid #E2E8F8", background: "white", color: COLORS.muted, fontSize: 12, fontWeight: 700, fontFamily: "'DM Sans', sans-serif", cursor: "pointer" }}>Clear</button>
                            <button onClick={() => setFilterOpen(false)}
                                style={{ flex: 1, padding: "10px 0", borderRadius: 10, border: "none", background: GRADIENT, color: "white", fontSize: 12, fontWeight: 700, fontFamily: "'DM Sans', sans-serif", cursor: "pointer" }}>Apply</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Delete confirm modal */}
            {deleteConfirmEvent && (
                <div onClick={() => setDeleteConfirmEvent(null)} style={{
                    position: "absolute", inset: 0, background: "rgba(0,0,0,0.45)",
                    display: "flex", alignItems: "center", justifyContent: "center", zIndex: 300,
                }}>
                    <div onClick={e => e.stopPropagation()} style={{
                        background: "white", borderRadius: 24, padding: "28px 24px",
                        width: 300, boxShadow: "0 16px 48px rgba(0,0,0,0.18)", textAlign: "center",
                        margin: "0 20px",
                    }}>
                        <div style={{
                            width: 60, height: 60, borderRadius: 20,
                            background: "#FEF2F2", display: "flex", alignItems: "center",
                            justifyContent: "center", fontSize: 28, margin: "0 auto 14px",
                        }}>🗑️</div>
                        <div style={{ fontWeight: 800, fontSize: 17, marginBottom: 8, fontFamily: "'DM Sans', sans-serif", color: COLORS.text }}>Delete Event?</div>
                        <div style={{ fontSize: 13, color: "#64748B", marginBottom: 24, fontFamily: "'DM Sans', sans-serif", lineHeight: 1.6 }}>
                            This will permanently cancel <strong>{deleteConfirmEvent.title}</strong> for all participants.
                        </div>
                        <div style={{ display: "flex", gap: 10 }}>
                            <button onClick={() => setDeleteConfirmEvent(null)} style={{
                                flex: 1, padding: "12px 0", borderRadius: 12,
                                border: "1.5px solid #E2E8F8", background: "white",
                                color: COLORS.text, fontWeight: 700, fontSize: 13,
                                cursor: "pointer", fontFamily: "'DM Sans', sans-serif",
                            }}>Cancel</button>
                            <button onClick={handleConfirmDelete} style={{
                                flex: 1, padding: "12px 0", borderRadius: 12, border: "none",
                                background: "linear-gradient(135deg,#EF4444,#f87171)",
                                color: "white", fontWeight: 700, fontSize: 13,
                                cursor: "pointer", fontFamily: "'DM Sans', sans-serif",
                            }}>Delete</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Edit modal */}
            {editEvent && (
                <div style={{
                    position: "absolute", inset: 0, background: "rgba(26,26,46,0.55)", zIndex: 200,
                    display: "flex", alignItems: "flex-end",
                }} onClick={() => setEditEvent(null)}>
                    <div onClick={e => e.stopPropagation()} style={{
                        background: "white", borderRadius: "24px 24px 0 0",
                        padding: "20px 20px 36px", width: "100%", boxSizing: "border-box",
                        maxHeight: "90vh", overflowY: "auto",
                        boxShadow: "0 -8px 32px rgba(108,99,255,0.15)",
                    }}>
                        <div style={{ width: 40, height: 4, borderRadius: 2, background: "#E2E8F8", margin: "0 auto 18px" }} />
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 18 }}>
                            <div style={{ fontSize: 16, fontWeight: 800, fontFamily: "'DM Sans', sans-serif", color: COLORS.text }}>Edit Schedule</div>
                            <div style={{
                                width: 44, height: 44, borderRadius: 14,
                                background: "#F0F4FF", display: "flex", alignItems: "center",
                                justifyContent: "center", fontSize: 22,
                            }}>{editEvent.emoji}</div>
                        </div>

                        <input value={editEvent.title} disabled style={{
                            width: "100%", boxSizing: "border-box",
                            border: "1.5px solid #E2E8F8", borderRadius: 12,
                            padding: "12px 14px", fontSize: 13, fontFamily: "'DM Sans', sans-serif",
                            marginBottom: 10, color: COLORS.muted, background: "#F8F9FF", outline: "none",
                        }} />
                        <input value={`📍 ${editEvent.location}`} disabled style={{
                            width: "100%", boxSizing: "border-box",
                            border: "1.5px solid #E2E8F8", borderRadius: 12,
                            padding: "12px 14px", fontSize: 13, fontFamily: "'DM Sans', sans-serif",
                            marginBottom: 14, color: COLORS.muted, background: "#F8F9FF", outline: "none",
                        }} />

                        <div style={{ fontSize: 11, fontWeight: 700, color: COLORS.muted, fontFamily: "'DM Sans', sans-serif", marginBottom: 8, letterSpacing: "0.5px", textTransform: "uppercase" }}>New Date & Time</div>
                        <div style={{ display: "flex", gap: 10, marginBottom: 18 }}>
                            {[{ Picker: MobileDatePicker, value: editDate ? dayjs(editDate) : null, onChange: v => setEditDate(v ? v.format("YYYY-MM-DD") : "") },
                              { Picker: MobileTimePicker, value: editTime ? dayjs(`2026-01-01T${editTime}`) : null, onChange: v => setEditTime(v ? v.format("HH:mm") : "") }
                            ].map(({ Picker, value, onChange }, i) => (
                                <Picker key={i} value={value} onChange={onChange}
                                    slotProps={{
                                        textField: {
                                            fullWidth: true,
                                            variant: "outlined",
                                            sx: {
                                                flex: 1,
                                                "& .MuiOutlinedInput-root": {
                                                    height: 46,
                                                    borderRadius: "12px",
                                                    fontSize: 13,
                                                    fontFamily: "'DM Sans', sans-serif",
                                                    color: COLORS.text,
                                                    background: "#fff",
                                                    alignItems: "center",
                                                    "& fieldset": { borderColor: "#E2E8F8", borderWidth: "1.5px" },
                                                    "&:hover fieldset": { borderColor: "#E2E8F8" },
                                                    "&.Mui-focused fieldset": { borderColor: "#6C63FF", borderWidth: "1.5px" },
                                                },
                                                "& .MuiInputBase-input": {
                                                    padding: "0 0 0 14px !important",
                                                    fontSize: 13,
                                                    fontFamily: "'DM Sans', sans-serif",
                                                    color: COLORS.text,
                                                    height: 46,
                                                    boxSizing: "border-box",
                                                    display: "flex",
                                                    alignItems: "center",
                                                },
                                                "& .MuiInputAdornment-root": { height: 46, maxHeight: 46, alignItems: "center" },
                                            }
                                        }
                                    }}
                                />
                            ))}
                        </div>

                        <button onClick={handleSaveEdit} disabled={updating} style={{
                            width: "100%", background: GRADIENT,
                            color: "white", border: "none", borderRadius: 14,
                            padding: "14px 0", fontWeight: 800, fontSize: 14,
                            cursor: updating ? "not-allowed" : "pointer",
                            fontFamily: "'DM Sans', sans-serif",
                            opacity: updating ? 0.7 : 1,
                        }}>{updating ? "Saving…" : "Save Changes 🗓️"}</button>
                    </div>
                </div>
            )}
        </div>
    );
}

export default MyEventsScreen;
