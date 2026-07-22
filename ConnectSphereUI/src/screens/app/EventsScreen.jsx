import React, { useState, useEffect, useCallback } from "react";
import { COLORS, INTERESTS } from "../../constants";
import { MobileDatePicker } from '@mui/x-date-pickers/MobileDatePicker';
import { MobileTimePicker } from '@mui/x-date-pickers/MobileTimePicker';
import dayjs from 'dayjs';
import { PickersTextField } from '@mui/x-date-pickers/PickersTextField';
import { BaseDatePicker, BaseTimePicker } from '@mui/x-date-pickers';

const API_BASE = "http://localhost:8083/api/events";

const EVENT_COLOR = "linear-gradient(135deg, rgb(191 82 127), rgb(28 17 193 / 80%))";

const TAG_COLORS = {
    Cricket: "#6C63FF", Movies: "#FF6584", Travel: "#43E97B",
    Running: "#FF6584", Cycling: "#38BDF8", Chess: "#FFB347",
    Gaming: "#6C63FF", Photography: "#43E97B", Music: "#FF6584",
    Cooking: "#FFB347", Yoga: "#38BDF8", General: "#8892B0",
};

const EMOJIS = ["🏏", "🎬", "✈️", "🏃", "🚴", "♟️", "🎮", "📷", "🎵", "🍳", "🧘", "⚽", "🏀", "🎯", "🎤", "🏕️", "🎨", "📚"];

function getAuthHeader() {
    const token = localStorage.getItem("token");
    return token ? { Authorization: `Bearer ${token}` } : {};
}

async function fetchEvents() {
    const res = await fetch(API_BASE, { headers: getAuthHeader() });
    const json = await res.json();
    if (!json.success) throw new Error(json.message || "Failed to load events");
    return json.data;
}

async function apiCreateEvent(payload) {
    const res = await fetch(`${API_BASE}/create`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...getAuthHeader() },
        body: JSON.stringify(payload),
    });
    const json = await res.json();
    if (!json.success) throw new Error(json.message || "Failed to create event");
    return json.data;
}

async function apiJoinEvent(eventId) {
    const res = await fetch(`${API_BASE}/${eventId}/join`, {
        method: "POST",
        headers: getAuthHeader(),
    });
    const json = await res.json();
    if (!json.success) throw new Error(json.message || "Failed to join event");
    return json.data;
}

async function apiLeaveEvent(eventId) {
    const res = await fetch(`${API_BASE}/${eventId}/leave`, {
        method: "DELETE",
        headers: getAuthHeader(),
    });
    const json = await res.json();
    if (!json.success) throw new Error(json.message || "Failed to leave event");
    return json.data;
}

// Add this helper function at the top of your screen component files
const formatTo12Hour = (timeStr) => {
    if (!timeStr) return '';
    const [hoursStr, minutesStr] = timeStr.split(':');
    let hours = parseInt(hoursStr, 10);
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12; // The hour '0' should be '12'
    return `${hours}:${minutesStr} ${ampm}`;
};

function EventsScreen() {
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [leaveConfirmEvent, setLeaveConfirmEvent] = useState(null); // ADDED: leave confirmation
    const [error, setError] = useState(null);
    const [actionError, setActionError] = useState(null);

    const [showCreate, setShowCreate] = useState(false);
    const [creating, setCreating] = useState(false);

    const [title, setTitle] = useState("");
    const [location, setLocation] = useState("");
    const [date, setDate] = useState("");
    const [time, setTime] = useState("");
    const [maxParticipants, setMaxParticipants] = useState("");
    const [selectedInterest, setSelectedInterest] = useState("");
    const [selectedEmoji, setSelectedEmoji] = useState("🎉");
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);

    const resetForm = () => {
        setTitle(""); setLocation(""); setDate(""); setTime("");
        setMaxParticipants(""); setSelectedInterest(""); setSelectedEmoji("🎉");
        setShowEmojiPicker(false);
    };

    const loadEvents = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await fetchEvents();
            setEvents(data);
        } catch (e) {
            setError(e.message);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { loadEvents(); }, [loadEvents]);

    // CHANGED: show confirmation popup instead of leaving immediately
    const handleJoinLeave = async (ev) => {
        if (ev.joinedByMe) {
            setLeaveConfirmEvent(ev);
            return;
        }
        setActionError(null);
        try {
            const updated = await apiJoinEvent(ev.id);
            setEvents(prev => prev.map(e => e.id === updated.id ? updated : e));
        } catch (e) {
            setActionError(e.message);
            setTimeout(() => setActionError(null), 3000);
        }
    };

    // ADDED: called when user confirms leave in the popup
    const handleConfirmLeave = async () => {
        const ev = leaveConfirmEvent;
        setLeaveConfirmEvent(null);
        setActionError(null);
        try {
            const updated = await apiLeaveEvent(ev.id);
            setEvents(prev => prev.map(e => e.id === updated.id ? updated : e));
        } catch (e) {
            setActionError(e.message);
            setTimeout(() => setActionError(null), 3000);
        }
    };

    const handleCreate = async () => {
        if (!title.trim()) return;
        setCreating(true);
        setActionError(null);
        try {
            const payload = {
                title: title.trim(),
                interest: selectedInterest || "General",
                emoji: selectedEmoji,
                location: location.trim(),
                date,
                time,
                maxParticipants: parseInt(maxParticipants, 10) || 20,
            };
            const newEvent = await apiCreateEvent(payload);
            setEvents(prev => [newEvent, ...prev]);
            resetForm();
            setShowCreate(false);
        } catch (e) {
            setActionError(e.message);
        } finally {
            setCreating(false);
        }
    };

    return (
        <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden", position: "relative" }}>
        <div style={{ flex: 1, overflowY: "auto", padding: "16px 16px 0", scrollbarWidth: 'none' }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
                <div style={{ fontSize: 22, fontWeight: 800, color: "#f5efb9", fontFamily: "'DM Sans', sans-serif" }}>Upcoming Events</div>
                <button onClick={() => setShowCreate(true)} style={{
                    background: "linear-gradient(135deg, #F44336, rgb(205 189 49))",
                    color: "white", border: "none", borderRadius: 10,
                    padding: "8px 14px", fontSize: 12, fontWeight: 700,
                    cursor: "pointer", fontFamily: "'DM Sans', sans-serif",
                }}>+ Create</button>
            </div>
            <div style={{ fontSize: 13, color: "#f5efb9", marginBottom: 16, fontFamily: "'DM Sans', sans-serif" }}>Plan activities with colleagues nearby 📍</div>

            {loading && (
                <div style={{ textAlign: "center", color: "#f5efb9", padding: 40, fontFamily: "'DM Sans', sans-serif" }}>
                    Loading events…
                </div>
            )}

            {error && !loading && (
                <div style={{ textAlign: "center", color: "#F44336", padding: 40, fontFamily: "'DM Sans', sans-serif" }}>
                    {error}<br />
                    <button onClick={loadEvents} style={{
                        marginTop: 10, background: COLORS.primary, color: "white",
                        border: "none", borderRadius: 10, padding: "8px 16px",
                        cursor: "pointer", fontFamily: "'DM Sans', sans-serif",
                    }}>Retry</button>
                </div>
            )}

            {!loading && !error && events.length === 0 && (
                <div style={{ textAlign: "center", color: "#f5efb9", padding: 40, fontFamily: "'DM Sans', sans-serif" }}>
                    No events yet. Be the first to create one! 🎉
                </div>
            )}

            {actionError && (
                <div style={{
                    background: "#FFF3F3", border: "1.5px solid #F44336", borderRadius: 10,
                    padding: "10px 14px", marginBottom: 12, fontSize: 12,
                    color: "#F44336", fontFamily: "'DM Sans', sans-serif",
                }}>{actionError}</div>
            )}

            {!loading && !error && events.map(ev => {
                const color = EVENT_COLOR;
                const tagColor = TAG_COLORS[ev.interest] || "#8892B0";

                return (
                    <div key={ev.id} style={{
                        background: "#f7f0f0", borderRadius: 20, marginBottom: 14, overflow: "hidden",
                        border: `1.5px solid ${COLORS.border}`, boxShadow: "0 2px 14px rgba(108,99,255,0.06)",
                    }}>
                        <div style={{
                            background: `linear-gradient(135deg, ${color}22, ${color}44)`,
                            padding: "16px 16px 12px",
                        }}>
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                                <div>
                                    <span style={{ fontSize: 28 }}>{ev.emoji}</span>
                                    <div style={{ fontWeight: 800, fontSize: 16, color: COLORS.text, marginTop: 4, fontFamily: "'emoji" }}>{ev.title}</div>
                                    <div style={{ fontSize: 11, color: tagColor, fontWeight: 700, fontFamily: "'DM Sans', sans-serif", marginTop: 2 }}>#{ev.interest}</div>
                                </div>
                                <div style={{
                                    background: color, color: "white", borderRadius: 10,
                                    padding: "4px 10px", fontSize: 11, fontWeight: 700, textAlign: "center",
                                    fontFamily: "'DM Sans', sans-serif",
                                }}>
                                    <div>{ev.date}</div>
                                    <div style={{ fontSize: 10 }}>{formatTo12Hour(ev.time)}</div>
                                </div>
                            </div>
                        </div>
                        <div style={{ padding: "12px 16px" }}>
                            <div style={{ display: "flex", gap: 16, marginBottom: 10 }}>
                                <div style={{ fontSize: 12, color: "#1b1d23", display: "flex", alignItems: "center", gap: 4, fontFamily: "'DM Sans', sans-serif" }}>
                                    📍 {ev.location}
                                </div>
                                <div style={{ fontSize: 12, color: "#1b1d23", display: "flex", alignItems: "center", gap: 4, fontFamily: "'DM Sans', sans-serif" }}>
                                    👤 {ev.hostName}
                                </div>
                            </div>
                            <div style={{ marginBottom: 10 }}>
                                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                                    <span style={{ fontSize: 11, color: COLORS.muted, fontFamily: "'DM Sans', sans-serif" }}>{ev.joinedCount}/{ev.maxParticipants} joined</span>
                                    <span style={{ fontSize: 11, color: "#12931d", fontWeight: 700, fontFamily: "'DM Sans', sans-serif" }}>{ev.spotsLeft} spots left</span>
                                </div>
                                <div style={{ height: 5, background: COLORS.border, borderRadius: 3 }}>
                                    <div style={{ height: "100%", width: `${(ev.joinedCount / ev.maxParticipants) * 100}%`, background: color, borderRadius: 3 }} />
                                </div>
                            </div>
                            {/* CHANGED: same gradient always, slight opacity when joined, confirmation popup on leave */}
                            <button onClick={() => handleJoinLeave(ev)} style={{
                                width: "100%", padding: "10px 0",
                                background: color,
                                color: "white",
                                border: "none",
                                borderRadius: 12, fontWeight: 700, fontSize: 13, cursor: "pointer",
                                fontFamily: "'DM Sans', sans-serif",
                                opacity: ev.joinedByMe ? 0.82 : 1,
                            }}>
                                {ev.joinedByMe ? "✓ Joined!" : "Join Event"}
                            </button>
                        </div>
                    </div>
                );
            })}
        </div>

        {/* ADDED: Leave confirmation popup */}
        {leaveConfirmEvent && (
            <div onClick={() => setLeaveConfirmEvent(null)} style={{
                position: "absolute", inset: 0, background: "rgba(0,0,0,0.45)",
                display: "flex", alignItems: "center", justifyContent: "center", zIndex: 300,
            }}>
                <div onClick={e => e.stopPropagation()} style={{
                    background: '#fef4ffed', borderRadius: 20, padding: "28px 24px",
                    width: 290, boxShadow: "0 8px 32px rgba(0,0,0,0.18)", textAlign: "center",
                    margin: "0 20px",
                }}>
                    <div style={{ fontSize: 38, marginBottom: 10 }}>🚪</div>
                    <div style={{ fontWeight: 800, fontSize: 17, marginBottom: 8, fontFamily: "'DM Sans', sans-serif", color: COLORS.text }}>
                        Leave Event?
                    </div>
                    <div style={{ fontSize: 13, color: "#64748B", marginBottom: 24, fontFamily: "'DM Sans', sans-serif", lineHeight: 1.5 }}>
                        Are you sure you want to leave <strong>{leaveConfirmEvent.title}</strong>?
                        You can rejoin later if spots are available.
                    </div>
                    <div style={{ display: "flex", gap: 10 }}>
                        <button onClick={() => setLeaveConfirmEvent(null)} style={{
                            flex: 1, padding: "11px 0", borderRadius: 12,
                            border: `1.5px solid ${COLORS.border}`,
                            background: "white", color: COLORS.text, fontWeight: 700,
                            fontSize: 13, cursor: "pointer", fontFamily: "'DM Sans', sans-serif",
                        }}>Cancel</button>
                        <button onClick={handleConfirmLeave} style={{
                            flex: 1, padding: "11px 0", borderRadius: 12, border: "none",
                            background: "#EF4444", color: "white", fontWeight: 700,
                            fontSize: 13, cursor: "pointer", fontFamily: "'DM Sans', sans-serif",
                        }}>Leave</button>
                    </div>
                </div>
            </div>
        )}

        {/* Create Modal
        {showCreate && (
            <div style={{
                position: "absolute", inset: 0, background: "rgba(26,26,46,0.55)", zIndex: 200,
                display: "flex", alignItems: "flex-end",
            }} onClick={() => { setShowCreate(false); resetForm(); }}>
                <div onClick={e => e.stopPropagation()} style={{
                    background: '#fef4ffed', borderRadius: "24px 24px 0 0",
                    padding: "20px 20px 34px", width: "100%", boxSizing: "border-box",
                    maxHeight: "90vh", overflowY: "auto",
                }}>
                    <div style={{ width: 36, height: 4, borderRadius: 2, background: '#fef4ffed', margin: "0 auto 16px" }} />
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
                        <div style={{ fontSize: 16, fontWeight: 800, fontFamily: "'emoji", color: COLORS.text }}>New Event</div>
                        <div style={{ position: "relative" }}>
                            <button onClick={() => setShowEmojiPicker(p => !p)} style={{
                                fontSize: 26, background: "#F4F4F8", border: `1.5px solid ${COLORS.border}`,
                                borderRadius: 12, width: 46, height: 46, cursor: "pointer",
                                display: "flex", alignItems: "center", justifyContent: "center",
                            }}>{selectedEmoji}</button>
                            {showEmojiPicker && (
                                <div style={{
                                    position: "absolute", right: 0, top: 52, background: "white",
                                    border: `1.5px solid ${COLORS.border}`, borderRadius: 14,
                                    padding: 10, display: "flex", flexWrap: "wrap", gap: 6,
                                    width: 200, zIndex: 10, boxShadow: "0 4px 20px rgba(0,0,0,0.12)",
                                }}>
                                    {EMOJIS.map(em => (
                                        <span key={em} onClick={() => { setSelectedEmoji(em); setShowEmojiPicker(false); }}
                                            style={{ fontSize: 22, cursor: "pointer", padding: 2 }}>{em}</span>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                    <input value={title} onChange={e => setTitle(e.target.value)}
                        placeholder="Event title (e.g. Weekend Cricket Match)"
                        style={{ width: "100%", boxSizing: "border-box", border: `1.5px solid ${COLORS.border}`, borderRadius: 12, padding: "12px 14px", fontSize: 13, fontFamily: "'DM Sans', sans-serif", marginBottom: 10, color: COLORS.text, outline: "none" }} />
                    <input value={location} onChange={e => setLocation(e.target.value)}
                        placeholder="📍 Location (e.g. Cubbon Park)"
                        style={{ width: "100%", boxSizing: "border-box", border: `1.5px solid ${COLORS.border}`, borderRadius: 12, padding: "12px 14px", fontSize: 13, fontFamily: "'DM Sans', sans-serif", marginBottom: 10, color: COLORS.text, outline: "none" }} />
                    <div style={{ display: "flex", gap: 10, marginBottom: 10 }}>
                        <input type="date" value={date} onChange={e => setDate(e.target.value)}
                            style={{ flex: 1, border: `1.5px solid ${COLORS.border}`, borderRadius: 12, padding: "12px 14px", fontSize: 13, fontFamily: "'DM Sans', sans-serif", color: date ? COLORS.text : COLORS.muted, outline: "none" }} />
                        <input type="time" value={time} onChange={e => setTime(e.target.value)}
                            style={{ flex: 1, border: `1.5px solid ${COLORS.border}`, borderRadius: 12, padding: "12px 14px", fontSize: 13, fontFamily: "'DM Sans', sans-serif", color: time ? COLORS.text : COLORS.muted, outline: "none" }} />
                    </div>
                    <input type="number" min="1" value={maxParticipants} onChange={e => setMaxParticipants(e.target.value)}
                        placeholder="👥 Max participants (e.g. 20)"
                        style={{ width: "100%", boxSizing: "border-box", border: `1.5px solid ${COLORS.border}`, borderRadius: 12, padding: "12px 14px", fontSize: 13, fontFamily: "'DM Sans', sans-serif", marginBottom: 14, color: COLORS.text, outline: "none" }} />
                    <div style={{ fontSize: 12, color: COLORS.muted, marginBottom: 8, fontFamily: "'DM Sans', sans-serif", fontWeight: 600 }}>Interest Tag</div>
                    <div style={{ display: "flex", gap: 8, overflowX: "auto", paddingBottom: 8, marginBottom: 16, scrollbarWidth: "none" }}>
                        {INTERESTS.map(i => {
                            const isSelected = selectedInterest === i.label;
                            const tColor = TAG_COLORS[i.label] || COLORS.primary;
                            return (
                                <span key={i.id} onClick={() => setSelectedInterest(isSelected ? "" : i.label)}
                                    style={{
                                        padding: "5px 12px", borderRadius: 20,
                                        background: isSelected ? tColor : `${tColor}18`,
                                        color: isSelected ? "white" : tColor,
                                        fontSize: 11, fontWeight: 700, cursor: "pointer",
                                        fontFamily: "'DM Sans', sans-serif",
                                        border: `1.5px solid ${isSelected ? tColor : "transparent"}`,
                                        transition: "all 0.15s", whiteSpace: "nowrap", flexShrink: 0,
                                    }}
                                >{i.emoji} #{i.label}</span>
                            );
                        })}
                    </div>
                    <button onClick={handleCreate} disabled={creating} style={{
                        width: "100%", background: "linear-gradient(135deg, #c860d9, rgb(124, 85, 193))", color: "white", border: "none",
                        borderRadius: 12, padding: "12px 0", fontWeight: 700, fontSize: 13,
                        cursor: creating ? "not-allowed" : "pointer", fontFamily: "'DM Sans', sans-serif",
                        boxShadow: `0 4px 14px ${COLORS.primary}44`,
                    }}>{creating ? "Creating…" : "Create Event 🎉"}</button>
                </div>
            </div> */}
        {/* )} */}
         
         {/* Create Modal */}
{showCreate && (
    <div style={{
        position: "absolute", inset: 0, background: "rgba(26,26,46,0.55)", zIndex: 200,
        display: "flex", alignItems: "flex-end",
    }} onClick={() => { setShowCreate(false); resetForm(); }}>
        <div onClick={e => e.stopPropagation()} style={{
            background: '#fef4ffed', borderRadius: "24px 24px 0 0",
            padding: "20px 20px 34px", width: "100%", boxSizing: "border-box",
            maxHeight: "90vh", overflowY: "auto",
        }}>
            <div style={{ width: 36, height: 4, borderRadius: 2, background: '#fef4ffed', margin: "0 auto 16px" }} />
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
                <div style={{ fontSize: 16, fontWeight: 800, fontFamily: "'emoji", color: COLORS.text }}>New Event</div>
                <div style={{ position: "relative" }}>
                    <button onClick={() => setShowEmojiPicker(p => !p)} style={{
                        fontSize: 26, background: "#F4F4F8", border: `1.5px solid ${COLORS.border}`,
                        borderRadius: 12, width: 46, height: 46, cursor: "pointer",
                        display: "flex", alignItems: "center", justifyContent: "center",
                    }}>{selectedEmoji}</button>
                    {showEmojiPicker && (
                        <div style={{
                            position: "absolute", right: 0, top: 52, background: "white",
                            border: `1.5px solid ${COLORS.border}`, borderRadius: 14,
                            padding: 10, display: "flex", flexWrap: "wrap", gap: 6,
                            width: 200, zIndex: 10, boxShadow: "0 4px 20px rgba(0,0,0,0.12)",
                        }}>
                            {EMOJIS.map(em => (
                                <span key={em} onClick={() => { setSelectedEmoji(em); setShowEmojiPicker(false); }}
                                    style={{ fontSize: 22, cursor: "pointer", padding: 2 }}>{em}</span>
                            ))}
                        </div>
                    )}
                </div>
            </div>
            
            <input value={title} onChange={e => setTitle(e.target.value)}
                placeholder="Event title (e.g. Weekend Cricket Match)"
                style={{ width: "100%", boxSizing: "border-box", border: `1.5px solid ${COLORS.border}`, borderRadius: 12, padding: "12px 14px", fontSize: 13, fontFamily: "'DM Sans', sans-serif", marginBottom: 10, color: COLORS.text, outline: "none" }} />
            
            <input value={location} onChange={e => setLocation(e.target.value)}
                placeholder="📍 Location (e.g. Cubbon Park)"
                style={{ width: "100%", boxSizing: "border-box", border: `1.5px solid ${COLORS.border}`, borderRadius: 12, padding: "12px 14px", fontSize: 13, fontFamily: "'DM Sans', sans-serif", marginBottom: 10, color: COLORS.text, outline: "none" }} />
            
            {/* 🌟 FIXED: Flex container matching your other textboxes exactly */}
{/* 🌟 FIXED: Compliant, modern MUI X style overrides */}
{/* <div style={{ display: "flex", gap: 10, marginBottom: 10, width: "100%" }}> */}
    
    {/* Modern Date Picker */}
    {/* <MobileDatePicker
        value={date ? dayjs(date) : null}
        onChange={(newValue) => setDate(newValue ? newValue.format('YYYY-MM-DD') : '')}
        slotProps={{
            textField: {
                fullWidth: true,
                placeholder: "MM/DD/YYYY",
                sx: {
                    flex: 1,
                    backgroundColor: "#ffffff",
                    borderRadius: '12px',
                    border: `1.5px solid ${COLORS.border}`,
                    '& .MuiInputBase-root': {
                        height: '41px !important',      // Matches the height of title input
                        minHeight: '41px !important',
                        fontSize: '13px',
                        fontFamily: "'DM Sans', sans-serif",
                        color: COLORS.text,
                        boxSizing: 'border-box',
                        '& fieldset': { border: 'none' }, // Removes default MUI outline box
                    },
                    '& .MuiOutlinedInput-input': {
                        padding: '0px 14px !important', // Centers text vertically
                        height: '100% !important',
                        boxSizing: 'border-box',
                        display: 'flex',
                        alignItems: 'center'
                    }
                }
            }
        }}
    /> */}

    {/* Modern Time Picker */}
    {/* <MobileTimePicker
        value={time ? dayjs(`2026-01-01T${time}`) : null}
        onChange={(newValue) => setTime(newValue ? newValue.format('HH:mm') : '')}
        slotProps={{
            textField: {
                fullWidth: true,
                placeholder: "hh:mm aa",
                sx: {
                    flex: 1,
                    backgroundColor: "#ffffff",
                    borderRadius: '12px',
                    border: `1.5px solid ${COLORS.border}`,
                    '& .MuiInputBase-root': {
                        height: '41px !important',      // Matches the height of title input
                        minHeight: '41px !important',
                        fontSize: '13px',
                        fontFamily: "'DM Sans', sans-serif",
                        color: COLORS.text,
                        boxSizing: 'border-box',
                        '& fieldset': { border: 'none' },
                    },
                    '& .MuiOutlinedInput-input': {
                        padding: '0px 14px !important', // Centers text vertically
                        height: '100% !important',
                        boxSizing: 'border-box',
                        display: 'flex',
                        alignItems: 'center'
                    }
                }
            }
        }}
    />

</div> */}

            {/* 🌟 FIXED: Standard compliant pickers with forced layout matching */}
<div style={{ display: "flex", gap: 10, marginBottom: 10, width: "100%" }}>
    
    {/* Modern Date Picker */}
    <MobileDatePicker
        value={date ? dayjs(date) : null}
        onChange={(newValue) => setDate(newValue ? newValue.format('YYYY-MM-DD') : '')}
        slotProps={{
            textField: {
                fullWidth: true,
                placeholder: "MM/DD/YYYY",
                sx: {
                    flex: 1,
                    backgroundColor: "#ffffff",
                    borderRadius: '12px',
                    border: `1.5px solid ${COLORS.border}`,
                    boxSizing: 'border-box',
                    height: '43px', // Forces entire component height
                    '& .MuiOutlinedInput-root': {
                        height: '100%',
                        paddingRight: '10px',
                        '& fieldset': { border: 'none' }, // Removes internal duplicate borders
                    },
                    '& .MuiInputBase-input': {
                        padding: '0 0 0 14px !important', // Removes vertical height padding completely
                        height: '100% !important',
                        fontSize: '13px',
                        fontFamily: "'DM Sans', sans-serif",
                        color: COLORS.text,
                        boxSizing: 'border-box',
                        display: 'flex',
                        alignItems: 'center',
                    },
                    '& input::placeholder': {
                        color: COLORS.muted,
                        opacity: 1,
                    },
                    '& .MuiInputAdornment-root': {
                        margin: 0, // Clears spacing around the calendar icon
                    }
                }
            }
        }}
    />

    {/* Modern Time Picker */}
    <MobileTimePicker
        value={time ? dayjs(`2026-01-01T${time}`) : null}
        onChange={(newValue) => setTime(newValue ? newValue.format('HH:mm') : '')}
        slotProps={{
            textField: {
                fullWidth: true,
                placeholder: "hh:mm aa",
                sx: {
                    flex: 1,
                    backgroundColor: "#ffffff",
                    borderRadius: '12px',
                    border: `1.5px solid ${COLORS.border}`,
                    boxSizing: 'border-box',
                    height: '43px', // Forces entire component height
                    '& .MuiOutlinedInput-root': {
                        height: '100%',
                        paddingRight: '10px',
                        '& fieldset': { border: 'none' },
                    },
                    '& .MuiInputBase-input': {
                        padding: '0 0 0 14px !important', // Removes vertical height padding completely
                        height: '100% !important',
                        fontSize: '13px',
                        fontFamily: "'DM Sans', sans-serif",
                        color: COLORS.text,
                        boxSizing: 'border-box',
                        display: 'flex',
                        alignItems: 'center',
                    },
                    '& input::placeholder': {
                        color: COLORS.muted,
                        opacity: 1,
                    },
                    '& .MuiInputAdornment-root': {
                        margin: 0,
                    }
                }
            }
        }}
    />

</div>

            <input type="number" min="1" value={maxParticipants} onChange={e => setMaxParticipants(e.target.value)}
                placeholder="👥 Max participants (e.g. 20)"
                style={{ width: "100%", boxSizing: "border-box", border: `1.5px solid ${COLORS.border}`, borderRadius: 12, padding: "12px 14px", fontSize: 13, fontFamily: "'DM Sans', sans-serif", marginBottom: 14, color: COLORS.text, outline: "none" }} />
            
            <div style={{ fontSize: 12, color: COLORS.muted, marginBottom: 8, fontFamily: "'DM Sans', sans-serif", fontWeight: 600 }}>Interest Tag</div>
            <div style={{ display: "flex", gap: 8, overflowX: "auto", paddingBottom: 8, marginBottom: 16, scrollbarWidth: "none" }}>
                {INTERESTS.map(i => {
                    const isSelected = selectedInterest === i.label;
                    const tColor = TAG_COLORS[i.label] || COLORS.primary;
                    return (
                        <span key={i.id} onClick={() => setSelectedInterest(isSelected ? "" : i.label)}
                            style={{
                                padding: "5px 12px", borderRadius: 20,
                                background: isSelected ? tColor : `${tColor}18`,
                                color: isSelected ? "white" : tColor,
                                fontSize: 11, fontWeight: 700, cursor: "pointer",
                                fontFamily: "'DM Sans', sans-serif",
                                border: `1.5px solid ${isSelected ? tColor : "transparent"}`,
                                transition: "all 0.15s", whiteSpace: "nowrap", flexShrink: 0,
                            }}
                        >{i.emoji} #{i.label}</span>
                    );
                })}
            </div>
            
            <button onClick={handleCreate} disabled={creating} style={{
                width: "100%", background: "linear-gradient(135deg, #c860d9, rgb(124, 85, 193))", color: "white", border: "none",
                borderRadius: 12, padding: "12px 0", fontWeight: 700, fontSize: 13,
                cursor: creating ? "not-allowed" : "pointer", fontFamily: "'DM Sans', sans-serif",
                boxShadow: `0 4px 14px ${COLORS.primary}44`,
            }}>{creating ? "Creating…" : "Create Event 🎉"}</button>
        </div>
    </div>
)}



        </div>
    );
}
export default EventsScreen;
