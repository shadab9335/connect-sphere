// // src/screens/app/MyEventsScreen.jsx
// import React, { useState, useEffect } from "react";
// import { COLORS } from "../../constants";
// import {
//     fetchMyHostedEvents,
//     fetchMyJoinedEvents,
//     fetchMyPastEvents,
//     fetchEventAttendees,
//     fetchUserInterests,
// } from "../../services/eventsService";

// const TAG_COLORS = {
//     Cricket: "#6C63FF", Movies: "#FF6584", Travel: "#43E97B",
//     Running: "#FF6584", Cycling: "#38BDF8", Chess: "#FFB347",
//     Gaming: "#6C63FF", Photography: "#43E97B", Music: "#FF6584",
//     Cooking: "#FFB347", Yoga: "#38BDF8", General: "#8892B0",
// };

// const EVENT_GRADIENT = "linear-gradient(135deg, rgb(191 82 127), rgb(28 17 193 / 80%))";

// const TABS = [
//     { id: "hosted", label: "🏠 Hosted by Me" },
//     { id: "joined", label: "✋ Joined"        },
//     { id: "past",   label: "🕐 Past Events"   },
// ];

// // ── Attendee avatar circle — shows profile picture if available, else initials
// function AvatarCircle({ attendee, size = 44 }) {
//     return (
//         <div style={{
//             width: size, height: size, borderRadius: "50%",
//             background: attendee.avatarColor || "#6C63FF",
//             display: "flex", alignItems: "center", justifyContent: "center",
//             color: "white", fontWeight: 800, fontSize: size * 0.36,
//             fontFamily: "'DM Sans', sans-serif",
//             flexShrink: 0, border: "2px solid white",
//             boxShadow: "0 2px 6px rgba(0,0,0,0.15)", overflow: "hidden",
//         }}>
//             {attendee.profilePicture ? (
//                 <img src={attendee.profilePicture} alt={attendee.displayName}
//                     style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
//             ) : (
//                 attendee.avatar || "?"
//             )}
//         </div>
//     );
// }

// // ── Attendees bottom drawer ───────────────────────────────────────────────────
// function AttendeesDrawer({ event, onClose }) {
//     const [attendees, setAttendees] = useState([]);
//     const [interests, setInterests] = useState({}); // userId → string[]
//     const [loading, setLoading]     = useState(true);
//     const [error, setError]         = useState(null);

//     useEffect(() => {
//         if (!event) return;
//         let cancelled = false;
//         setLoading(true);
//         setError(null);

//         fetchEventAttendees(event.id)
//             .then(async json => {
//                 if (cancelled) return;
//                 const list = json?.data?.attendees || [];
//                 setAttendees(list);

//                 // Fetch interests for every attendee in parallel
//                 const results = await Promise.allSettled(
//                     list.map(a =>
//                         fetchUserInterests(a.userId)
//                             .then(r => ({ userId: a.userId, interests: r?.data || [] }))
//                     )
//                 );
//                 if (cancelled) return;
//                 const map = {};
//                 results.forEach(r => {
//                     if (r.status === "fulfilled") map[r.value.userId] = r.value.interests;
//                 });
//                 setInterests(map);
//             })
//             .catch(e => { if (!cancelled) setError(e.message); })
//             .finally(() => { if (!cancelled) setLoading(false); });

//         return () => { cancelled = true; };
//     }, [event]);

//     if (!event) return null;

//     return (
//         <>
//             <div onClick={onClose} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", zIndex: 400 }} />
//             <div style={{
//                 position: "fixed", bottom: 0, left: 0, right: 0,
//                 background: "white", borderRadius: "20px 20px 0 0",
//                 zIndex: 401, maxHeight: "75vh",
//                 display: "flex", flexDirection: "column",
//                 boxShadow: "0 -4px 24px rgba(0,0,0,0.15)",
//             }}>
//                 <div style={{ width: 36, height: 4, borderRadius: 2, background: COLORS.border, margin: "12px auto 0", flexShrink: 0 }} />
//                 <div style={{
//                     display: "flex", justifyContent: "space-between", alignItems: "center",
//                     padding: "14px 18px 10px", borderBottom: `1.5px solid ${COLORS.border}`, flexShrink: 0,
//                 }}>
//                     <div>
//                         <div style={{ fontWeight: 800, fontSize: 16, fontFamily: "'DM Sans', sans-serif", color: COLORS.text }}>
//                             {event.title}
//                         </div>
//                         <div style={{ fontSize: 12, color: COLORS.muted, fontFamily: "'DM Sans', sans-serif", marginTop: 2 }}>
//                             {loading ? "Loading…" : `${attendees.length} attendee${attendees.length !== 1 ? "s" : ""}`}
//                         </div>
//                     </div>
//                     <button onClick={onClose} style={{
//                         background: "#F4F4F8", border: "none", borderRadius: 10,
//                         width: 32, height: 32, cursor: "pointer",
//                         display: "flex", alignItems: "center", justifyContent: "center",
//                     }}>
//                         <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#64748B" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
//                             <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
//                         </svg>
//                     </button>
//                 </div>

//                 <div style={{ overflowY: "auto", flex: 1, padding: "10px 16px 24px", scrollbarWidth: "none" }}>
//                     {loading && <div style={{ textAlign: "center", color: COLORS.muted, padding: 32, fontFamily: "'DM Sans', sans-serif", fontSize: 13 }}>Loading attendees…</div>}
//                     {error && !loading && <div style={{ textAlign: "center", color: "#F44336", padding: 32, fontFamily: "'DM Sans', sans-serif", fontSize: 13 }}>{error}</div>}
//                     {!loading && !error && attendees.length === 0 && (
//                         <div style={{ textAlign: "center", color: COLORS.muted, padding: 32, fontFamily: "'DM Sans', sans-serif", fontSize: 13 }}>No attendees yet.</div>
//                     )}
//                     {!loading && !error && attendees.map((a, i) => {
//                         const userInterests = interests[a.userId] || [];
//                         return (
//                             <div key={a.userId} style={{
//                                 display: "flex", alignItems: "flex-start", gap: 12,
//                                 padding: "12px 0",
//                                 borderBottom: i < attendees.length - 1 ? `1.5px solid ${COLORS.border}` : "none",
//                             }}>
//                                 <AvatarCircle attendee={a} size={46} />
//                                 <div style={{ flex: 1, minWidth: 0 }}>
//                                     <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 3 }}>
//                                         <span style={{ fontWeight: 700, fontSize: 14, fontFamily: "'DM Sans', sans-serif", color: COLORS.text, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
//                                             {a.displayName}
//                                         </span>
//                                         {a.host && (
//                                             <span style={{
//                                                 background: EVENT_GRADIENT, color: "white",
//                                                 borderRadius: 6, padding: "1px 7px", fontSize: 9,
//                                                 fontWeight: 800, fontFamily: "'DM Sans', sans-serif", flexShrink: 0,
//                                             }}>HOST</span>
//                                         )}
//                                     </div>
//                                     {userInterests.length > 0 ? (
//                                         <div style={{ display: "flex", flexWrap: "wrap", gap: 4, marginTop: 4 }}>
//                                             {userInterests.map(interest => {
//                                                 const c = TAG_COLORS[interest] || "#8892B0";
//                                                 return (
//                                                     <span key={interest} style={{
//                                                         background: `${c}18`, color: c,
//                                                         borderRadius: 20, padding: "2px 8px",
//                                                         fontSize: 10, fontWeight: 700,
//                                                         fontFamily: "'DM Sans', sans-serif",
//                                                     }}>#{interest}</span>
//                                                 );
//                                             })}
//                                         </div>
//                                     ) : (
//                                         <div style={{ fontSize: 11, color: COLORS.muted, fontFamily: "'DM Sans', sans-serif", marginTop: 3 }}>No interests set</div>
//                                     )}
//                                 </div>
//                             </div>
//                         );
//                     })}
//                 </div>
//             </div>
//         </>
//     );
// }

// // ── Compact event card ────────────────────────────────────────────────────────
// function EventCard({ ev, isHosted }) {
//     const [drawerOpen, setDrawerOpen] = useState(false);

//     const fillPct = ev.maxParticipants > 0
//         ? Math.min(100, (ev.joinedCount / ev.maxParticipants) * 100) : 0;

//     return (
//         <>
//             <div style={{
//                 background: "white", borderRadius: 16, marginBottom: 12,
//                 border: `1.5px solid ${COLORS.border}`,
//                 boxShadow: "0 2px 10px rgba(108,99,255,0.07)", overflow: "hidden",
//             }}>
//                 <div style={{ background: EVENT_GRADIENT, padding: "10px 14px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
//                     <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
//                         <span style={{ fontSize: 22 }}>{ev.emoji}</span>
//                         <div>
//                             <div style={{ fontWeight: 800, fontSize: 14, color: "white", fontFamily: "'DM Sans', sans-serif" }}>{ev.title}</div>
//                             <div style={{ fontSize: 10, color: "rgba(255,255,255,0.8)", fontFamily: "'DM Sans', sans-serif", marginTop: 1, fontWeight: 700 }}>#{ev.interest}</div>
//                         </div>
//                     </div>
//                     <div style={{ background: "rgba(255,255,255,0.22)", borderRadius: 8, padding: "4px 10px", textAlign: "center" }}>
//                         <div style={{ fontSize: 11, color: "white", fontWeight: 700, fontFamily: "'DM Sans', sans-serif" }}>{ev.date}</div>
//                         <div style={{ fontSize: 10, color: "rgba(255,255,255,0.85)", fontFamily: "'DM Sans', sans-serif" }}>{ev.time}</div>
//                     </div>
//                 </div>
//                 <div style={{ padding: "10px 14px" }}>
//                     <div style={{ marginBottom: 6 }}>
//                         <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
//                             {/* Clickable link only on Hosted tab */}
//                             {isHosted ? (
//                                 <span onClick={() => setDrawerOpen(true)} style={{
//                                     fontSize: 11, fontFamily: "'DM Sans', sans-serif",
//                                     color: "#4A3AFF", fontWeight: 700, cursor: "pointer",
//                                     textDecoration: "underline", textDecorationThickness: "1.5px", textUnderlineOffset: "2px",
//                                 }}>👥 {ev.joinedCount}/{ev.maxParticipants} joined</span>
//                             ) : (
//                                 <span style={{ fontSize: 11, color: COLORS.muted, fontFamily: "'DM Sans', sans-serif" }}>
//                                     {ev.joinedCount}/{ev.maxParticipants} joined
//                                 </span>
//                             )}
//                             <span style={{ fontSize: 11, color: "#12931d", fontWeight: 700, fontFamily: "'DM Sans', sans-serif" }}>{ev.spotsLeft} spots left</span>
//                         </div>
//                         <div style={{ height: 5, background: COLORS.border, borderRadius: 3 }}>
//                             <div style={{ height: "100%", width: `${fillPct}%`, background: EVENT_GRADIENT, borderRadius: 3, transition: "width 0.4s ease" }} />
//                         </div>
//                     </div>
//                     <div style={{ fontSize: 11, color: COLORS.muted, fontFamily: "'DM Sans', sans-serif" }}>📍 {ev.location}</div>
//                 </div>
//             </div>
//             {drawerOpen && <AttendeesDrawer event={ev} onClose={() => setDrawerOpen(false)} />}
//         </>
//     );
// }

// // ── Main screen ───────────────────────────────────────────────────────────────
// function MyEventsScreen({ onBack }) {
//     const [activeTab, setActiveTab] = useState("hosted");
//     const [data, setData]           = useState({ hosted: [], joined: [], past: [] });
//     const [loading, setLoading]     = useState(true);
//     const [error, setError]         = useState(null);

//     useEffect(() => {
//         let cancelled = false;
//         setLoading(true);
//         setError(null);

//         Promise.all([fetchMyHostedEvents(), fetchMyJoinedEvents(), fetchMyPastEvents()])
//             .then(([hosted, joined, past]) => {
//                 if (cancelled) return;
//                 setData({ hosted: hosted?.data || [], joined: joined?.data || [], past: past?.data || [] });
//             })
//             .catch(e => { if (!cancelled) setError(e.message); })
//             .finally(() => { if (!cancelled) setLoading(false); });

//         return () => { cancelled = true; };
//     }, []);

//     const events = data[activeTab];

//     return (
//         <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden", background: "#F8F7FF" }}>
//             <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "16px 16px 12px", background: "white", borderBottom: `1.5px solid ${COLORS.border}`, flexShrink: 0 }}>
//                 <button onClick={onBack} style={{ background: "none", border: "none", cursor: "pointer", padding: 4, display: "flex", alignItems: "center" }}>
//                     <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#4A3AFF" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
//                         <polyline points="15 18 9 12 15 6" />
//                     </svg>
//                 </button>
//                 <div style={{ fontWeight: 800, fontSize: 17, fontFamily: "'DM Sans', sans-serif", color: COLORS.text }}>My Events</div>
//             </div>

//             <div style={{ display: "flex", background: "white", borderBottom: `1.5px solid ${COLORS.border}`, flexShrink: 0, overflowX: "auto", scrollbarWidth: "none" }}>
//                 {TABS.map(tab => {
//                     const count  = data[tab.id].length;
//                     const active = activeTab === tab.id;
//                     return (
//                         <button key={tab.id} onClick={() => setActiveTab(tab.id)} style={{
//                             flex: 1, minWidth: 100, padding: "10px 6px 8px",
//                             border: "none", background: "none", cursor: "pointer",
//                             borderBottom: active ? "2.5px solid #4A3AFF" : "2.5px solid transparent",
//                             color: active ? "#4A3AFF" : COLORS.muted,
//                             fontWeight: active ? 800 : 600, fontSize: 11,
//                             fontFamily: "'DM Sans', sans-serif", transition: "all 0.15s", whiteSpace: "nowrap",
//                         }}>
//                             {tab.label}
//                             {!loading && (
//                                 <span style={{
//                                     marginLeft: 5,
//                                     background: active ? "#4A3AFF" : COLORS.border,
//                                     color: active ? "white" : COLORS.muted,
//                                     borderRadius: 20, padding: "1px 6px", fontSize: 10, fontWeight: 700,
//                                 }}>{count}</span>
//                             )}
//                         </button>
//                     );
//                 })}
//             </div>

//             <div style={{ flex: 1, overflowY: "auto", padding: "14px 14px 24px", scrollbarWidth: "none" }}>
//                 {loading && <div style={{ textAlign: "center", color: COLORS.muted, padding: 40, fontFamily: "'DM Sans', sans-serif" }}>Loading your events…</div>}
//                 {error && !loading && <div style={{ textAlign: "center", color: "#F44336", padding: 40, fontFamily: "'DM Sans', sans-serif" }}>{error}</div>}
//                 {!loading && !error && events.length === 0 && (
//                     <div style={{ textAlign: "center", padding: 40 }}>
//                         <div style={{ fontSize: 40, marginBottom: 12 }}>
//                             {activeTab === "hosted" ? "🎯" : activeTab === "joined" ? "🤝" : "🕐"}
//                         </div>
//                         <div style={{ fontWeight: 700, fontSize: 15, color: COLORS.text, fontFamily: "'DM Sans', sans-serif", marginBottom: 6 }}>
//                             {activeTab === "hosted" ? "You haven't hosted any events yet"
//                                 : activeTab === "joined" ? "You haven't joined any events yet"
//                                 : "No past events found"}
//                         </div>
//                         <div style={{ fontSize: 13, color: COLORS.muted, fontFamily: "'DM Sans', sans-serif" }}>
//                             {activeTab === "past"
//                                 ? "Events you hosted or joined will appear here after they pass."
//                                 : "Head over to the Events tab to get started!"}
//                         </div>
//                     </div>
//                 )}
//                 {!loading && !error && events.map(ev => (
//                     <EventCard key={ev.id} ev={ev} isHosted={activeTab === "hosted"} />
//                 ))}
//             </div>
//         </div>
//     );
// }

// export default MyEventsScreen;


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
    fetchUserInterests,
    updateEventDateTime,
    deleteEvent,
    acknowledgeEventUpdate
} from "../../services/eventsService";

const TAG_COLORS = {
    Cricket: "#6C63FF", Movies: "#FF6584", Travel: "#43E97B",
    Running: "#FF6584", Cycling: "#38BDF8", Chess: "#FFB347",
    Gaming: "#6C63FF", Photography: "#43E97B", Music: "#FF6584",
    Cooking: "#FFB347", Yoga: "#38BDF8", General: "#8892B0",
};

const EVENT_GRADIENT = "linear-gradient(135deg, rgb(191 82 127), rgb(28 17 193 / 80%))";

const TABS = [
    { id: "hosted", label: "🏠 Hosted by Me" },
    { id: "joined", label: "✋ Joined"        },
    { id: "past",   label: "🕐 Past Events"   },
];

function AvatarCircle({ attendee, size = 44 }) {
    return (
        <div style={{
            width: size, height: size, borderRadius: "50%",
            background: attendee.avatarColor || "#6C63FF",
            display: "flex", alignItems: "center", justifyContent: "center",
            color: "white", fontWeight: 800, fontSize: size * 0.36,
            fontFamily: "'DM Sans', sans-serif",
            flexShrink: 0, border: "2px solid white",
            boxShadow: "0 2px 6px rgba(0,0,0,0.15)", overflow: "hidden",
        }}>
            {attendee.profilePicture ? (
                <img src={attendee.profilePicture} alt={attendee.displayName}
                    style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
            ) : (
                attendee.avatar || "?"
            )}
        </div>
    );
}

function AttendeesDrawer({ event, onClose }) {
    const [attendees, setAttendees] = useState([]);
    const [interests, setInterests] = useState({});
    const [loading, setLoading]     = useState(true);
    const [error, setError]         = useState(null);

    useEffect(() => {
        if (!event) return;
        let cancelled = false;
        setLoading(true);
        setError(null);

        fetchEventAttendees(event.id)
            .then(async json => {
                if (cancelled) return;
                const list = json?.data?.attendees || [];
                setAttendees(list);

                const results = await Promise.allSettled(
                    list.map(a =>
                        fetchUserInterests(a.userId)
                            .then(r => ({ userId: a.userId, interests: r?.data || [] }))
                    )
                );
                if (cancelled) return;
                const map = {};
                results.forEach(r => {
                    if (r.status === "fulfilled") map[r.value.userId] = r.value.interests;
                });
                setInterests(map);
            })
            .catch(e => { if (!cancelled) setError(e.message); })
            .finally(() => { if (!cancelled) setLoading(false); });

        return () => { cancelled = true; };
    }, [event]);

    if (!event) return null;

    return (
        <>
            <div onClick={onClose} style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.4)", zIndex: 400 , borderRadius: "inherit "}} />
            <div style={{
                position: "absolute", bottom: 0, left: 0, right: 0,
                background: "white", borderRadius: "20px 20px 0 0",
                zIndex: 401, maxHeight: "75vh",
                display: "flex", flexDirection: "column",
                boxShadow: "0 -4px 24px rgba(0,0,0,0.15)",
            }}>
                <div style={{ width: 36, height: 4, borderRadius: 2, background: COLORS.border, margin: "12px auto 0", flexShrink: 0 }} />
                <div style={{
                    display: "flex", justifyContent: "space-between", alignItems: "center",
                    padding: "14px 18px 10px", borderBottom: `1.5px solid ${COLORS.border}`, flexShrink: 0,
                }}>
                    <div>
                        <div style={{ fontWeight: 800, fontSize: 16, fontFamily: "'DM Sans', sans-serif", color: COLORS.text }}>
                            {event.title}
                        </div>
                        <div style={{ fontSize: 12, color: COLORS.muted, fontFamily: "'DM Sans', sans-serif", marginTop: 2 }}>
                            {loading ? "Loading…" : `${attendees.length} attendee${attendees.length !== 1 ? "s" : ""}`}
                        </div>
                    </div>
                    <button onClick={onClose} style={{
                        background: "#F4F4F8", border: "none", borderRadius: 10,
                        width: 32, height: 32, cursor: "pointer",
                        display: "flex", alignItems: "center", justifyContent: "center",
                    }}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#64748B" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                        </svg>
                    </button>
                </div>

                <div style={{ overflowY: "auto", flex: 1, padding: "10px 16px 24px", scrollbarWidth: "none" }}>
                    {loading && <div style={{ textAlign: "center", color: COLORS.muted, padding: 32, fontFamily: "'DM Sans', sans-serif", fontSize: 13 }}>Loading attendees…</div>}
                    {error && !loading && <div style={{ textAlign: "center", color: "#F44336", padding: 32, fontFamily: "'DM Sans', sans-serif", fontSize: 13 }}>{error}</div>}
                    {!loading && !error && attendees.length === 0 && (
                        <div style={{ textAlign: "center", color: COLORS.muted, padding: 32, fontFamily: "'DM Sans', sans-serif", fontSize: 13 }}>No attendees yet.</div>
                    )}
                    {!loading && !error && attendees.map((a, i) => {
                        const userInterests = interests[a.userId] || [];
                        return (
                            <div key={a.userId} style={{
                                display: "flex", alignItems: "flex-start", gap: 12,
                                padding: "12px 0",
                                borderBottom: i < attendees.length - 1 ? `1.5px solid ${COLORS.border}` : "none",
                            }}>
                                <AvatarCircle attendee={a} size={46} />
                                <div style={{ flex: 1, minWidth: 0 }}>
                                    <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 3 }}>
                                        <span style={{ fontWeight: 700, fontSize: 14, fontFamily: "'DM Sans', sans-serif", color: COLORS.text, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                                            {a.displayName}
                                        </span>
                                        {a.host && (
                                            <span style={{
                                                background: EVENT_GRADIENT, color: "white",
                                                borderRadius: 6, padding: "1px 7px", fontSize: 9,
                                                fontWeight: 800, fontFamily: "'DM Sans', sans-serif", flexShrink: 0,
                                            }}>HOST</span>
                                        )}
                                    </div>
                                    {userInterests.length > 0 ? (
                                        <div style={{ display: "flex", flexWrap: "wrap", gap: 4, marginTop: 4 }}>
                                            {userInterests.map(interest => {
                                                const c = TAG_COLORS[interest] || "#8892B0";
                                                return (
                                                    <span key={interest} style={{
                                                        background: `${c}18`, color: c,
                                                        borderRadius: 20, padding: "2px 8px",
                                                        fontSize: 10, fontWeight: 700,
                                                        fontFamily: "'DM Sans', sans-serif",
                                                    }}>#{interest}</span>
                                                );
                                            })}
                                        </div>
                                    ) : (
                                        <div style={{ fontSize: 11, color: COLORS.muted, fontFamily: "'DM Sans', sans-serif", marginTop: 3 }}>No interests set</div>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </>
    );
}

function EventCard({ ev, isHosted, isJoined, onRefresh, onTriggerEdit, onTriggerDelete }) {
    const [drawerOpen, setDrawerOpen] = useState(false);
    const [menuOpen, setMenuOpen] = useState(false);

    const fillPct = ev.maxParticipants > 0 ? Math.min(100, (ev.joinedCount / ev.maxParticipants) * 100) : 0;

    const handleCardInteraction = async () => {
        if (isJoined && ev.needsNotification) {
            try {
                await acknowledgeEventUpdate(ev.id);
                onRefresh();
            } catch (err) {
                console.error("Failed to dismiss update flag notification:", err);
            }
        }
    };

    return (
        <>
            <div 
                onClick={handleCardInteraction}
                style={{
                    background: "white", borderRadius: 16, marginBottom: 12,
                    border: ev.needsNotification ? "2px solid #FF6584" : `1.5px solid ${COLORS.border}`,
                    boxShadow: ev.needsNotification ? "0 4px 14px rgba(255, 101, 132, 0.25)" : "0 2px 10px rgba(108,99,255,0.07)", 
                    overflow: "hidden", position: "relative"
                }}
            >
                {isJoined && ev.needsNotification && (
                    <div style={{
                        background: "#FF6584", color: "white", padding: "4px 12px",
                        fontSize: "10px", fontWeight: "800", textAlign: "center",
                        fontFamily: "'DM Sans', sans-serif", letterSpacing: "0.5px"
                    }}>
                        ⚠️ HOST CHANGED EVENT DATE / TIME
                    </div>
                )}

                <div style={{ background: EVENT_GRADIENT, padding: "10px 14px", display: "flex", justifyContent: "space-between", alignItems: "center", position: "relative" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <span style={{ fontSize: 22 }}>{ev.emoji}</span>
                        <div>
                            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                                <div style={{ fontWeight: 800, fontSize: 14, color: "white", fontFamily: "'DM Sans', sans-serif" }}>{ev.title}</div>
                                
                                {isHosted && (
                                    <div style={{ position: "relative" }}>
                                        <button 
                                            onClick={(e) => { e.stopPropagation(); setMenuOpen(p => !p); }} 
                                            style={{ background: "none", border: "none", color: "white", fontSize: 16, cursor: "pointer", padding: "0 4px", fontWeight: "bold" }}
                                        >
                                            ⋮
                                        </button>
                                        {menuOpen && (
                                            <>
                                                <div onClick={(e) => { e.stopPropagation(); setMenuOpen(false); }} style={{ position: "fixed", inset: 0, zIndex: 90 }} />
                                                <div style={{
                                                    position: "absolute", top: 20, left: 0, background: "white",
                                                    border: `1.5px solid ${COLORS.border}`, borderRadius: 8, padding: "4px 0",
                                                    display: "flex", flexDirection: "column", minWidth: 85, zIndex: 95,
                                                    boxShadow: "0 4px 12px rgba(0,0,0,0.15)"
                                                }}>
                                                    <button onClick={(e) => { e.stopPropagation(); setMenuOpen(false); onTriggerEdit(ev); }} style={{ background: "none", border: "none", padding: "6px 12px", fontSize: 12, textAlign: "left", cursor: "pointer", fontFamily: "'DM Sans', sans-serif", color: COLORS.text }}>✏️ Edit</button>
                                                    <button onClick={(e) => { e.stopPropagation(); setMenuOpen(false); onTriggerDelete(ev); }} style={{ background: "none", border: "none", padding: "6px 12px", fontSize: 12, textAlign: "left", cursor: "pointer", fontFamily: "'DM Sans', sans-serif", color: "#EF4444" }}>🗑️ Delete</button>
                                                </div>
                                            </>
                                        )}
                                    </div>
                                )}
                            </div>
                            <div style={{ fontSize: 10, color: "rgba(255,255,255,0.8)", fontFamily: "'DM Sans', sans-serif", marginTop: 1, fontWeight: 700 }}>#{ev.interest}</div>
                        </div>
                    </div>
                    <div style={{ background: "rgba(255,255,255,0.22)", borderRadius: 8, padding: "4px 10px", textAlign: "center" }}>
                        <div style={{ fontSize: 11, color: "white", fontWeight: 700, fontFamily: "'DM Sans', sans-serif" }}>{ev.date}</div>
                        <div style={{ fontSize: 10, color: "rgba(255,255,255,0.85)", fontFamily: "'DM Sans', sans-serif" }}>{ev.time}</div>
                    </div>
                </div>
                <div style={{ padding: "10px 14px" }}>
                    <div style={{ marginBottom: 6 }}>
                        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                            {isHosted ? (
                                <span onClick={() => setDrawerOpen(true)} style={{
                                    fontSize: 11, fontFamily: "'DM Sans', sans-serif",
                                    color: "#4A3AFF", fontWeight: 700, cursor: "pointer",
                                    textDecoration: "underline", textDecorationThickness: "1.5px", textUnderlineOffset: "2px",
                                }}>👥 {ev.joinedCount}/{ev.maxParticipants} joined</span>
                            ) : (
                                <span style={{ fontSize: 11, color: COLORS.muted, fontFamily: "'DM Sans', sans-serif" }}>
                                    {ev.joinedCount}/{ev.maxParticipants} joined
                                </span>
                            )}
                            <span style={{ fontSize: 11, color: "#12931d", fontWeight: 700, fontFamily: "'DM Sans', sans-serif" }}>{ev.spotsLeft} spots left</span>
                        </div>
                        <div style={{ height: 5, background: COLORS.border, borderRadius: 3 }}>
                            <div style={{ height: "100%", width: `${fillPct}%`, background: EVENT_GRADIENT, borderRadius: 3, transition: "width 0.4s ease" }} />
                        </div>
                    </div>
                    <div style={{ fontSize: 11, color: COLORS.muted, fontFamily: "'DM Sans', sans-serif" }}>📍 {ev.location}</div>
                </div>
            </div>
            {drawerOpen && <AttendeesDrawer event={ev} onClose={() => setDrawerOpen(false)} />}
        </>
    );
}

function MyEventsScreen({ onBack }) {
    const [activeTab, setActiveTab] = useState("hosted");
    const [data, setData]           = useState({ hosted: [], joined: [], past: [] });
    const [loading, setLoading]     = useState(true);
    const [error, setError]         = useState(null);

    // Edit Modal Workflow States
    const [editEvent, setEditEvent] = useState(null);
    const [editDate, setEditDate]   = useState("");
    const [editTime, setEditTime]   = useState("");
    const [updating, setUpdating]   = useState(false);

    // Delete Popover Workflow States
    const [deleteConfirmEvent, setDeleteConfirmEvent] = useState(null);

    const loadScreenData = () => {
        setLoading(true);
        setError(null);
        Promise.all([fetchMyHostedEvents(), fetchMyJoinedEvents(), fetchMyPastEvents()])
            .then(([hosted, joined, past]) => {
                setData({ 
                    hosted: hosted?.data || [], 
                    joined: joined?.data || [], 
                    past: past?.data || [] 
                });
            })
            .catch(e => setError(e.message))
            .finally(() => setLoading(false));
    };

    useEffect(() => {
        loadScreenData();
    }, []);

    const triggerEditModal = (targetEvent) => {
        setEditEvent(targetEvent);
        setEditDate(targetEvent.date);
        setEditTime(targetEvent.time);
    };

    // const handleSaveEdit = async () => {
    //     setUpdating(true);
    //     try {
    //         await updateEventDateTime(editEvent.id, editDate, editTime);
    //         setEditEvent(null);
    //         loadScreenData();
    //     } catch (err) {
    //         alert(err.message || "Failed to update event.");
    //     } finally {
    //         setUpdating(false);
    //     }
    // };


           const handleSaveEdit = async () => {
    setUpdating(true);
    try {
        // 1. Await the response from your service function
        const res = await updateEventDateTime(editEvent.id, editDate, editTime);
        
        // 2. Check if the backend response wrapper indicates success
        if (res && (res.success || res.status === "OK")) {
            setEditEvent(null);
            loadScreenData(); // Refresh list contents from the database
        } else {
            alert(res?.message || "Failed to update event details.");
        }
    } catch (err) {
        console.error("Error during update event payload dispatch:", err);
        alert(err.message || "An unexpected network error occurred.");
    } finally {
        setUpdating(false);
    }
};
    const handleConfirmDelete = async () => {
        const targetId = deleteConfirmEvent.id;
        setDeleteConfirmEvent(null);
        try {
            await deleteEvent(targetId);
            loadScreenData();
        } catch (err) {
            alert(err.message || "Failed to cancel event.");
        }
    };

    const events = data[activeTab];

    return (
        <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden", background: "#F8F7FF", position: "relative" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "16px 16px 12px", background: "white", borderBottom: `1.5px solid ${COLORS.border}`, flexShrink: 0 }}>
                <button onClick={onBack} style={{ background: "none", border: "none", cursor: "pointer", padding: 4, display: "flex", alignItems: "center" }}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#4A3AFF" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="15 18 9 12 15 6" />
                    </svg>
                </button>
                <div style={{ fontWeight: 800, fontSize: 17, fontFamily: "'DM Sans', sans-serif", color: COLORS.text }}>My Events</div>
            </div>

            <div style={{ display: "flex", background: "white", borderBottom: `1.5px solid ${COLORS.border}`, flexShrink: 0, overflowX: "auto", scrollbarWidth: "none" }}>
                {TABS.map(tab => {
                    const count  = data[tab.id].length;
                    const active = activeTab === tab.id;
                    return (
                        <button key={tab.id} onClick={() => setActiveTab(tab.id)} style={{
                            flex: 1, minWidth: 100, padding: "10px 6px 8px",
                            border: "none", background: "none", cursor: "pointer",
                            borderBottom: active ? "2.5px solid #4A3AFF" : "2.5px solid transparent",
                            color: active ? "#4A3AFF" : COLORS.muted,
                            fontWeight: active ? 800 : 600, fontSize: 11,
                            fontFamily: "'DM Sans', sans-serif", transition: "all 0.15s", whiteSpace: "nowrap",
                        }}>
                            {tab.label}
                            {!loading && (
                                <span style={{
                                    marginLeft: 5,
                                    background: active ? "#4A3AFF" : COLORS.border,
                                    color: active ? "white" : COLORS.muted,
                                    borderRadius: 20, padding: "1px 6px", fontSize: 10, fontWeight: 700,
                                }}>{count}</span>
                            )}
                        </button>
                    );
                })}
            </div>

            <div style={{ flex: 1, overflowY: "auto", padding: "14px 14px 24px", scrollbarWidth: "none" }}>
                {loading && <div style={{ textAlign: "center", color: COLORS.muted, padding: 40, fontFamily: "'DM Sans', sans-serif" }}>Loading your events…</div>}
                {error && !loading && <div style={{ textAlign: "center", color: "#F44336", padding: 40, fontFamily: "'DM Sans', sans-serif" }}>{error}</div>}
                {!loading && !error && events.length === 0 && (
                    <div style={{ textAlign: "center", padding: 40 }}>
                        <div style={{ fontSize: 40, marginBottom: 12 }}>
                            {activeTab === "hosted" ? "🎯" : activeTab === "joined" ? "🤝" : "🕐"}
                        </div>
                        <div style={{ fontWeight: 700, fontSize: 15, color: COLORS.text, fontFamily: "'DM Sans', sans-serif", marginBottom: 6 }}>
                            {activeTab === "hosted" ? "You haven't hosted any events yet"
                                : activeTab === "joined" ? "You haven't joined any events yet"
                                : "No past events found"}
                        </div>
                        <div style={{ fontSize: 13, color: COLORS.muted, fontFamily: "'DM Sans', sans-serif" }}>
                            {activeTab === "past"
                                ? "Events you hosted or joined will appear here after they pass."
                                : "Head over to the Events tab to get started!"}
                        </div>
                    </div>
                )}
                {!loading && !error && events.map(ev => (
                    <EventCard 
                        key={ev.id} 
                        ev={ev} 
                        isHosted={activeTab === "hosted"} 
                        isJoined={activeTab === "joined"}
                        onRefresh={loadScreenData}
                        onTriggerEdit={triggerEditModal}
                        onTriggerDelete={setDeleteConfirmEvent}
                    />
                ))}
            </div>

            {/* Reusable Visual Template for Delete Confirmation Popover Component */}
            {deleteConfirmEvent && (
                <div onClick={() => setDeleteConfirmEvent(null)} style={{
                    position: "absolute", inset: 0, background: "rgba(0,0,0,0.45)",
                    display: "flex", alignItems: "center", justifyContent: "center", zIndex: 300,
                }}>
                    <div onClick={e => e.stopPropagation()} style={{
                        background: '#fef4ffed', borderRadius: 20, padding: "28px 24px",
                        width: 290, boxShadow: "0 8px 32px rgba(0,0,0,0.18)", textAlign: "center",
                        margin: "0 20px",
                    }}>
                        <div style={{ fontSize: 38, marginBottom: 10 }}>🗑️</div>
                        <div style={{ fontWeight: 800, fontSize: 17, marginBottom: 8, fontFamily: "'DM Sans', sans-serif", color: COLORS.text }}>
                            Delete Event?
                        </div>
                        <div style={{ fontSize: 13, color: "#64748B", marginBottom: 24, fontFamily: "'DM Sans', sans-serif", lineHeight: 1.5 }}>
                            Do you really want to delete this event? This action will cancel <strong>{deleteConfirmEvent.title}</strong> completely.
                        </div>
                        <div style={{ display: "flex", gap: 10 }}>
                            <button onClick={() => setDeleteConfirmEvent(null)} style={{
                                flex: 1, padding: "11px 0", borderRadius: 12,
                                border: `1.5px solid ${COLORS.border}`,
                                background: "white", color: COLORS.text, fontWeight: 700,
                                fontSize: 13, cursor: "pointer", fontFamily: "'DM Sans', sans-serif",
                            }}>No</button>
                            <button onClick={handleConfirmDelete} style={{
                                flex: 1, padding: "11px 0", borderRadius: 12, border: "none",
                                background: "#EF4444", color: "white", fontWeight: 700,
                                fontSize: 13, cursor: "pointer", fontFamily: "'DM Sans', sans-serif",
                            }}>Delete</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Structured Override Edit Modal Component */}
            {editEvent && (
                <div style={{
                    position: "absolute", inset: 0, background: "rgba(26,26,46,0.55)", zIndex: 200,
                    display: "flex", alignItems: "flex-end",
                }} onClick={() => setEditEvent(null)}>
                    <div onClick={e => e.stopPropagation()} style={{
                        background: '#fef4ffed', borderRadius: "24px 24px 0 0",
                        padding: "20px 20px 34px", width: "100%", boxSizing: "border-box",
                        maxHeight: "90vh", overflowY: "auto",
                    }}>
                        <div style={{ width: 36, height: 4, borderRadius: 2, background: '#fef4ffed', margin: "0 auto 16px" }} />
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
                            <div style={{ fontSize: 16, fontWeight: 800, fontFamily: "'DM Sans', sans-serif", color: COLORS.text }}>Edit Event Schedule</div>
                            <button style={{
                                fontSize: 26, background: "#EAEAEF", border: `1.5px solid ${COLORS.border}`,
                                borderRadius: 12, width: 46, height: 46, cursor: "not-allowed",
                                display: "flex", alignItems: "center", justifyContent: "center",
                            }} disabled>{editEvent.emoji}</button>
                        </div>
                        
                        {/* Disabled fields to prevent unauthorized editing */}
                        <input value={editEvent.title} disabled
                            style={{ width: "100%", boxSizing: "border-box", border: `1.5px solid ${COLORS.border}`, borderRadius: 12, padding: "12px 14px", fontSize: 13, fontFamily: "'DM Sans', sans-serif", marginBottom: 10, color: COLORS.muted, background: "#F4F4F8", outline: "none" }} />
                        
                        <input value={`📍 ${editEvent.location}`} disabled
                            style={{ width: "100%", boxSizing: "border-box", border: `1.5px solid ${COLORS.border}`, borderRadius: 12, padding: "12px 14px", fontSize: 13, fontFamily: "'DM Sans', sans-serif", marginBottom: 10, color: COLORS.muted, background: "#F4F4F8", outline: "none" }} />
                        
                        {/* Interactive Timing Pickers */}
                        <div style={{ display: "flex", gap: 10, marginBottom: 14, width: "100%" }}>
                            <MobileDatePicker
                                value={editDate ? dayjs(editDate) : null}
                                onChange={(newValue) => setEditDate(newValue ? newValue.format('YYYY-MM-DD') : '')}
                                slotProps={{
                                    textField: {
                                        fullWidth: true,
                                        placeholder: "MM/DD/YYYY",
                                        sx: {
                                            flex: 1, backgroundColor: "#ffffff", borderRadius: '12px', border: `1.5px solid ${COLORS.border}`, boxSizing: 'border-box', height: '43px',
                                            '& .MuiOutlinedInput-root': { height: '100%', paddingRight: '10px', '& fieldset': { border: 'none' } },
                                            '& .MuiInputBase-input': { padding: '0 0 0 14px !important', height: '100% !important', fontSize: '13px', fontFamily: "'DM Sans', sans-serif", color: COLORS.text, boxSizing: 'border-box', display: 'flex', alignItems: 'center' }
                                        }
                                    }
                                }}
                            />

                            <MobileTimePicker
                                value={editTime ? dayjs(`2026-01-01T${editTime}`) : null}
                                onChange={(newValue) => setEditTime(newValue ? newValue.format('HH:mm') : '')}
                                slotProps={{
                                    textField: {
                                        fullWidth: true,
                                        placeholder: "hh:mm aa",
                                        sx: {
                                            flex: 1, backgroundColor: "#ffffff", borderRadius: '12px', border: `1.5px solid ${COLORS.border}`, boxSizing: 'border-box', height: '43px',
                                            '& .MuiOutlinedInput-root': { height: '100%', paddingRight: '10px', '& fieldset': { border: 'none' } },
                                            '& .MuiInputBase-input': { padding: '0 0 0 14px !important', height: '100% !important', fontSize: '13px', fontFamily: "'DM Sans', sans-serif", color: COLORS.text, boxSizing: 'border-box', display: 'flex', alignItems: 'center' }
                                        }
                                    }
                                }}
                            />
                        </div>

                        <button onClick={handleSaveEdit} disabled={updating} style={{
                            width: "100%", background: "linear-gradient(135deg, #c860d9, rgb(124, 85, 193))", color: "white", border: "none",
                            borderRadius: 12, padding: "12px 0", fontWeight: 700, fontSize: 13,
                            cursor: updating ? "not-allowed" : "pointer", fontFamily: "'DM Sans', sans-serif",
                        }}>{updating ? "Updating Schedule…" : "Update Schedule Changes 🗓️"}</button>
                    </div>
                </div>
            )}
        </div>
    );
}

export default MyEventsScreen;