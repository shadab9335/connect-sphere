import React, { useState, useEffect } from "react";
import { COLORS, DEPARTMENTS, BUILDINGS, FLOORS } from "../../constants";
import BackgroundImage from '../../images/background_img.png';
import { fetchMyProfile, updateProfile } from "../../services/profileService";
import { fetchInterests } from "../../services/authService"; // ← master list from backend
import { fetchUserPosts, fetchUserBookmarks } from "../../services/feedService";
import MyPostsScreen from "./MyPostsScreen";
import MyEventsScreen from "./MyEventsScreen"; // ADDED — Shadab's events feature
import { fetchMyHostedEvents } from "../../services/eventsService"; // ADDED — Shadab's events feature

const PRIMARY_SOLID = "#6C63FF";
const CARD_BG = "#f7f0f0";

// Reusable styles for the edit-mode inputs/dropdowns
const inputStyle = {
    width: "100%",
    padding: "10px 12px",
    borderRadius: 10,
    border: "1.5px solid #E2E8F8",
    fontSize: 13,
    fontFamily: "'DM Sans', sans-serif",
    color: COLORS.text,
    background: "white",
    outline: "none",
    boxSizing: "border-box",
};

const fieldLabelStyle = {
    fontSize: 11,
    fontWeight: 700,
    color: COLORS.muted,
    fontFamily: "'DM Sans', sans-serif",
    marginBottom: 4,
    textTransform: "uppercase",
    letterSpacing: 0.5,
};

const fieldValueStyle = {
    fontSize: 14,
    color: COLORS.text,
    fontFamily: "'DM Sans', sans-serif",
    fontWeight: 600,
};

function Pill({ label, active, color, onClick, disabled }) {
    return (
        <button onClick={onClick} disabled={disabled} style={{
            padding: "6px 14px",
            borderRadius: active ? 30 : 20,
            border: active ? "2px solid #4A3AFF" : `1.5px solid ${COLORS.border}`,
            background: "white",
            color: active ? "#4A3AFF" : COLORS.muted,
            fontSize: 12,
            fontWeight: 700,
            cursor: disabled ? "default" : "pointer",
            opacity: disabled ? 0.85 : 1,
            fontFamily: "'DM Sans', sans-serif", whiteSpace: "nowrap",
            display: "inline-flex", alignItems: "center", justifyContent: "center",
            boxShadow: active ? "0 2px 8px rgba(74,58,255,0.2)" : "none",
            transition: "all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)",
        }}
            onMouseEnter={e => {
                if (active && !disabled) {
                    e.currentTarget.style.transform = "scale(1.05)";
                    e.currentTarget.style.boxShadow = "0 4px 12px rgba(74,58,255,0.25)";
                }
            }}
            onMouseLeave={e => {
                e.currentTarget.style.transform = "scale(1)";
                e.currentTarget.style.boxShadow = active ? "0 2px 8px rgba(74,58,255,0.2)" : "none";
            }}
        >{label}</button>
    );
}

function ProfileScreen({ myInterests, setMyInterests, profilePic, setProfilePic, onLogout }) {
    // ── Top-level state ─────────────────────────────────────────────────
    const [editMode, setEditMode] = useState(false);
    const [saving, setSaving] = useState(false);
    const [saveError, setSaveError] = useState("");
    const [privacy, setPrivacy] = useState({ empId: true, anonMsg: true, location: false });

    // Initialize from localStorage for instant first paint, then refresh from API.
    const [profile, setProfile] = useState(() => {
        try { return JSON.parse(localStorage.getItem('user') || 'null'); }
        catch { return null; }
    });

    // My posts — fetched once on mount so the stat card shows the real count
    // and so MyPostsScreen can mount with the data already in hand (no second fetch).
    const [myPosts, setMyPosts] = useState([]);
    const [showMyPosts, setShowMyPosts] = useState(false);

    // Saved posts — same idea: fetched on mount so the "Saved" stat tile
    // shows the real count and MyPostsScreen can mount in saved-mode without re-fetching.
    const [savedPosts, setSavedPosts] = useState([]);
    const [showSavedPosts, setShowSavedPosts] = useState(false);

    // Hosted events — count shown on the "Events" stat tile; tapping it drills into MyEventsScreen. (ADDED)
    const [myHostedEvents, setMyHostedEvents] = useState([]);
    const [showMyEvents, setShowMyEvents] = useState(false);

    // Master list of all available interests — fetched from backend on mount.
    const [availableInterests, setAvailableInterests] = useState([]);

    // Form state — ONE object holding ALL editable fields. Populated on Edit click,
    // sent in ONE PUT request on Save click.
    const [form, setForm] = useState({
        fullName: "",
        department: "",
        building: "",
        floor: "",
        isAnonymous: false,
        profilePicture: "",
        interests: [],
    });

    // ── Load profile + posts + interests on mount ───────────────────────
    useEffect(() => {
        fetchMyProfile()
            .then(res => {
                const fresh = res.data.data;
                setProfile(fresh);
                // Strip profilePicture (base64) before caching — too large for localStorage.
                const { profilePicture, ...slim } = fresh || {};
                localStorage.setItem('user', JSON.stringify(slim));
            })
            .catch(err => console.error('Failed to load profile', err));

        const stored = JSON.parse(localStorage.getItem('user') || '{}');
        if (stored.id) {
            fetchUserPosts(stored.id)
                .then(r => setMyPosts(r.data.data || []))
                .catch(err => console.error('Failed to load my posts', err));

            fetchUserBookmarks(stored.id)
                .then(r => setSavedPosts(r.data.data || []))
                .catch(err => console.error('Failed to load saved posts', err));
        }

        // Hosted events count for the "Events" stat tile. (ADDED — Shadab's events feature)
        fetchMyHostedEvents()
            .then(json => setMyHostedEvents(json?.data || []))
            .catch(err => console.error('Failed to load my events', err));

        // Fetch master interests list from backend (same source as SignupInterestsScreen).
        // No fallback — if backend is empty/down, the pills section stays empty.
        console.log("%c[ProfileScreen] 🚀 fetching available interests from backend", "color: purple; font-weight: bold");
        fetchInterests()
            .then(res => {
                const list = res.data?.data || [];
                console.log("[ProfileScreen]   • backend interest list length:", list.length);
                if (list.length === 0) {
                    console.warn("%c[ProfileScreen] ⚠ backend returned 0 interests — pills section will be empty", "color: orange");
                } else {
                    console.log("%c[ProfileScreen] ✓ using BACKEND interests", "color: green; font-weight: bold");
                }
                setAvailableInterests(list);
            })
            .catch(err => {
                console.error("%c[ProfileScreen] ✗ failed to fetch interests", "color: red; font-weight: bold", err);
                setAvailableInterests([]);
            });
    }, []);

    // // ── Avatar picker ─────────────────────────────────────────────────────
    // const handlePickAvatar = (e) => {
    //     const file = e.target.files && e.target.files[0];
    //     if (!file) return;
    //     const reader = new FileReader();
    //     reader.onload = () => {
    //         setProfilePic(reader.result);
    //         // If editing, also stage the new picture into the form so Save sends it.
    //         if (editMode) setForm(f => ({ ...f, profilePicture: reader.result }));
    //     };
    //     reader.readAsDataURL(file);
    //     e.target.value = "";
    // };

    // ── Avatar picker with auto-save ──────────────────────────────────────
    const handlePickAvatar = (e) => {
        const file = e.target.files && e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = async () => {
            const base64Image = reader.result;
            
            // 1. Update local UI immediately for responsiveness
            setProfilePic(base64Image);
            
            if (editMode) {
                // Scenario A: User is in Edit Mode -> Stage it in the form to save with other fields
                setForm(f => ({ ...f, profilePicture: base64Image }));
            } else {
                // Scenario B: User is in View Mode -> Auto-save directly to the database right now!
                try {
                    console.log("%c[ProfileScreen] 📸 Auto-saving profile picture...", "color: cyan; font-weight: bold");
                    
                    // Construct a snapshot of the current profile data plus the new picture
                    await updateProfile({
                        isAnonymous: profile?.isAnonymous ?? false,
                        fullName: profile?.fullName || "",
                        department: profile?.department || "",
                        building: profile?.building || "",
                        floor: profile?.floor || "",
                        interests: profile?.interests?.map(String) || [],
                        profilePicture: base64Image // Send the base64 string
                    });

                    // Refresh profile from backend to sync state
                    const fresh = await fetchMyProfile();
                    setProfile(fresh.data.data);
                    console.log("%c[ProfileScreen] ✓ Profile picture auto-saved successfully!", "color: green; font-weight: bold");
                } catch (err) {
                    console.error("Failed to auto-save profile picture", err);
                    alert("Failed to save profile picture. Please try again.");
                }
            }
        };
        reader.readAsDataURL(file);
        e.target.value = "";
    };

    // ── Edit / Cancel / Save handlers ─────────────────────────────────────
    // Enter edit mode: copy current profile values into form state.
    const handleEdit = () => {
        setSaveError("");
        setForm({
            fullName:       profile?.fullName || "",
            department:     profile?.department || "",
            building:       profile?.building || "",
            floor:          profile?.floor || "",
            isAnonymous:    profile?.isAnonymous ?? false,
            profilePicture: profile?.profilePicture || profilePic || "",
            interests:      profile?.interests?.map(String) || [],
        });
        setEditMode(true);
    };

    // Exit edit mode without saving any change.
    const handleCancel = () => {
        setSaveError("");
        setEditMode(false);
    };

    // Save all fields at once via ONE PUT call.
    const handleSave = async () => {
        setSaveError("");

        // Frontend validation: name must not be empty.
        if (!form.fullName.trim()) {
            setSaveError("Full Name cannot be empty");
            return;
        }

        setSaving(true);
        try {
            console.log("%c[ProfileScreen] 💾 saving profile", "color: orange; font-weight: bold", form);
            await updateProfile(form);

            // Re-fetch profile so UI shows whatever the backend now has (including derived fields like avatar initials).
            const fresh = await fetchMyProfile();
            const freshData = fresh.data.data;
            setProfile(freshData);
            setMyInterests(freshData.interests || []);
            // Strip profilePicture (base64) before caching — too large for localStorage.
            const { profilePicture, ...slim } = freshData || {};
            localStorage.setItem('user', JSON.stringify(slim));
            console.log("%c[ProfileScreen] ✅ save complete + profile reloaded", "color: green; font-weight: bold");

            setEditMode(false);
        } catch (err) {
            const msg = err.response?.data?.message || "Save failed. Please try again.";
            console.error("%c[ProfileScreen] ✗ save error:", "color: red", msg);
            setSaveError(msg);
        } finally {
            setSaving(false);
        }
    };

    // Toggle a single interest in the form (only effective in edit mode).
    const handleToggleInterest = (interest) => {
        if (!editMode) return;
        setForm(f => {
            const current = f.interests || [];
            const isActive = current.includes(interest.id) || current.includes(interest.label);
            const next = isActive
                ? current.filter(name => name !== interest.id && name !== interest.label)
                : [...current, interest.label];
            return { ...f, interests: next };
        });
    };

    const privacyItems = [
        { key: "empId", label: "Show my Emp ID publicly", sub: "Others can see E0001" },
        { key: "anonMsg", label: "Allow anonymous messaging", sub: "Receive msgs from anon users" },
        { key: "location", label: "Location visibility", sub: "Show my floor & tower" },
    ];

    // Which interest names are currently "selected" (shown as pink active pills).
    // View mode → from saved profile (backend truth).
    // Edit mode → from form (in-progress edits the user hasn't saved yet).
    const selectedInterestNames = editMode
        ? form.interests
        : (profile?.interests?.map(String)
            || (myInterests || []).map(x => (typeof x === "string" ? x : x?.id || x?.label)));

    // Drilldown: tapping the "Events" stat replaces this screen with MyEventsScreen. (ADDED)
    if (showMyEvents) {
        return <MyEventsScreen onBack={() => setShowMyEvents(false)} />;
    }

    // Drilldown: tapping the "Posts" stat replaces this screen with MyPostsScreen.
    if (showMyPosts) {
        return (
            <MyPostsScreen
                mode="own"
                initialPosts={myPosts}
                onPostsChanged={(updatedPosts) => setMyPosts(updatedPosts)}
                onBack={() => setShowMyPosts(false)}
                profilePic={profilePic}
            />
        );
    }

    // Drilldown: tapping the "Saved" stat replaces this screen with MyPostsScreen in saved mode.
    if (showSavedPosts) {
        return (
            <MyPostsScreen
                mode="saved"
                initialPosts={savedPosts}
                onPostsChanged={(updatedPosts) => setSavedPosts(updatedPosts)}
                onBack={() => setShowSavedPosts(false)}
                profilePic={profilePic}
            />
        );
    }

    return (
        <div style={{ flex: 1, overflowY: "auto", scrollbarWidth: "none", backgroundImage: `url(${BackgroundImage})`, backgroundSize: "cover", backgroundPosition: "center", borderRadius: "25px 25px 0 0" }}>

            {/* ── Hero Banner: Avatar + Stats (swapped per the new layout) ── */}
            <div style={{
                background: "transparent",
                padding: "10px 20px 50px",
            }}>
                <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                    {/* Avatar */}
                    <div style={{ position: "relative", flexShrink: 0 }}>
                        <div style={{
                            width: 68, height: 68, borderRadius: "50%",
                            background: "rgba(255,255,255,0.2)",
                            border: "3px solid rgba(255,255,255,0.6)",
                            display: "flex", alignItems: "center", justifyContent: "center",
                            color: "white", fontWeight: 800, fontSize: 24,
                            fontFamily: "'DM Sans', sans-serif",
                            boxShadow: "0 4px 20px rgba(0,0,0,0.2)",
                            overflow: "hidden",
                        }}>
                            {(profile?.profilePicture || profilePic) ? (
                                <img src={profile?.profilePicture || profilePic} alt="profile" style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
                            ) : (profile?.avatar || "??")}
                        </div>
                        <div onClick={() => document.getElementById('avatarInput').click()} style={{
                            position: "absolute", bottom: 0, right: 0,
                            width: 22, height: 22, borderRadius: "50%",
                            background: "white",
                            border: "1.5px solid #E2E8F8",
                            display: "flex", alignItems: "center", justifyContent: "center",
                            cursor: "pointer",
                            boxShadow: "0 2px 6px rgba(0,0,0,0.15)",
                        }}>
                            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#2a1b91" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
                                <circle cx="12" cy="13" r="4" />
                            </svg>
                        </div>
                        <input id="avatarInput" type="file" accept="image/*" style={{ display: "none" }} onChange={handlePickAvatar} />
                    </div>

                    {/* Stats card — now sits beside the avatar in the hero banner */}
                    <div style={{
                        flex: 1,
                        background: "rgb(97 141 172)",
                        borderRadius: 16,
                        padding: "14px 14px",
                        boxShadow: "0 4px 14px rgba(0,0,0,0.15)",
                        display: "flex",
                    }}>
                        {[
                            { count: String(savedPosts.length), label: "Saved", onClick: () => setShowSavedPosts(true) },
                            { count: String(myHostedEvents.length), label: "Events", onClick: () => setShowMyEvents(true) },
                            { count: String(myPosts.length), label: "Posts", onClick: () => setShowMyPosts(true) },
                        ].map((s, i, arr) => (
                            <div key={s.label}
                                onClick={s.onClick || undefined}
                                style={{
                                    flex: 1, textAlign: "center",
                                    borderRight: i < arr.length - 1 ? `2px solid rgba(255,255,255,0.3)` : "none",
                                    cursor: s.onClick ? "pointer" : "default",
                                    transition: "transform 0.15s ease",
                                }}
                                onMouseEnter={e => { if (s.onClick) e.currentTarget.style.transform = "scale(1.05)"; }}
                                onMouseLeave={e => { e.currentTarget.style.transform = "scale(1)"; }}
                            >
                                <div style={{
                                    fontWeight: 800, fontSize: 20, color: "white",
                                    fontFamily: "'emoji",
                                    textDecoration: s.onClick ? "underline" : "none",
                                    textDecorationColor: "white",
                                    textDecorationThickness: "2px",
                                    textUnderlineOffset: "3px",
                                }}>{s.count}</div>
                                <div style={{ fontSize: 11, color: "rgb(239 211 235)", fontFamily: "'DM Sans', sans-serif", marginTop: 2 }}>{s.label}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <div style={{ padding: "0 16px 24px", marginTop: -24 }}>

                {/* ── Profile Details Card (View OR Edit) ── */}
                {/* In edit mode, this card visually "links" with My Interests below — ONE Save button covers BOTH. */}
                <div style={{
                    background: CARD_BG, borderRadius: 20, padding: 16, marginBottom: 14,
                    border: editMode ? "3px solid #4A3AFF" : "3px solid rgb(226, 232, 248)",
                    boxShadow: editMode ? "0 0 0 4px rgba(74,58,255,0.12)" : "rgb(180 121 116) 0px 1px 6px",
                    transition: "all 0.3s ease",
                }}>
                    {/* Header row — title + (Edit) OR (Cancel + Save) buttons */}
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                        <div style={{ fontWeight: 800, fontSize: 15, fontFamily: "'emoji", color: COLORS.text }}>
                            {editMode ? "Edit Profile" : "Profile Details"}
                        </div>
                        {editMode ? (
                            <div style={{ display: "flex", gap: 8 }}>
                                <button onClick={handleCancel} disabled={saving} style={{
                                    padding: "6px 14px",
                                    borderRadius: 10,
                                    border: "1.5px solid #FF6584",
                                    background: "white",
                                    color: "#FF6584",
                                    fontWeight: 700, fontSize: 12,
                                    cursor: saving ? "not-allowed" : "pointer",
                                    fontFamily: "'DM Sans', sans-serif",
                                    opacity: saving ? 0.6 : 1,
                                }}>Cancel</button>
                                <button onClick={handleSave} disabled={saving} style={{
                                    padding: "6px 14px",
                                    borderRadius: 10,
                                    border: "none",
                                    background: saving ? "#aaa" : "linear-gradient(to right, #4A3AFF, #D63384)",
                                    color: "white",
                                    fontWeight: 700, fontSize: 12,
                                    cursor: saving ? "not-allowed" : "pointer",
                                    fontFamily: "'DM Sans', sans-serif",
                                }}>{saving ? "Saving..." : "💾 Save"}</button>
                            </div>
                        ) : (
                            <button onClick={handleEdit} style={{
                                padding: "6px 14px",
                                borderRadius: 10,
                                border: "2px solid transparent",
                                background: "white",
                                color: "#4A3AFF",
                                fontWeight: 700, fontSize: 12,
                                cursor: "pointer",
                                fontFamily: "'DM Sans', sans-serif",
                                backgroundImage: "linear-gradient(white, white), linear-gradient(to right, #4A3AFF, #D63384)",
                                backgroundOrigin: "border-box",
                                backgroundClip: "padding-box, border-box",
                                display: "inline-flex", alignItems: "center", gap: 4,
                            }}>✏️ Edit</button>
                        )}
                    </div>

                    {/* Inline error banner (only in edit mode if save failed) */}
                    {saveError && (
                        <div style={{
                            background: "#FFE5E5", color: "#D32F2F",
                            padding: "8px 12px", borderRadius: 8, marginBottom: 12,
                            fontSize: 12, fontFamily: "'DM Sans', sans-serif", fontWeight: 600,
                        }}>⚠ {saveError}</div>
                    )}

                    {/* Full Name */}
                    <div style={{ marginBottom: 14 }}>
                        <div style={fieldLabelStyle}>Full Name</div>
                        {editMode ? (
                            <input
                                type="text"
                                value={form.fullName}
                                onChange={e => setForm({ ...form, fullName: e.target.value })}
                                style={inputStyle}
                                placeholder="Your full name"
                            />
                        ) : (
                            <div style={fieldValueStyle}>{profile?.fullName || "—"}</div>
                        )}
                    </div>

                    {/* Employee ID — always locked, no edit input */}
                    <div style={{ marginBottom: 14 }}>
                        <div style={fieldLabelStyle}>Employee ID 🔒</div>
                        <div style={{ ...fieldValueStyle, color: COLORS.muted }}>{profile?.employeeId || "—"}</div>
                    </div>

                    {/* Department */}
                    <div style={{ marginBottom: 14 }}>
                        <div style={fieldLabelStyle}>Department</div>
                        {editMode ? (
                            <select
                                value={form.department}
                                onChange={e => setForm({ ...form, department: e.target.value })}
                                style={inputStyle}
                            >
                                <option value="">Select department</option>
                                {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
                            </select>
                        ) : (
                            <div style={fieldValueStyle}>🏢 {profile?.department || "—"}</div>
                        )}
                    </div>

                    {/* Building + Floor (side by side) */}
                    <div style={{ display: "flex", gap: 12 }}>
                        <div style={{ flex: 1 }}>
                            <div style={fieldLabelStyle}>Building</div>
                            {editMode ? (
                                <select
                                    value={form.building}
                                    onChange={e => setForm({ ...form, building: e.target.value })}
                                    style={inputStyle}
                                >
                                    <option value="">Select</option>
                                    {BUILDINGS.map(b => <option key={b} value={b}>{b}</option>)}
                                </select>
                            ) : (
                                <div style={fieldValueStyle}>{profile?.building || "—"}</div>
                            )}
                        </div>
                        <div style={{ flex: 1 }}>
                            <div style={fieldLabelStyle}>Floor</div>
                            {editMode ? (
                                <select
                                    value={form.floor}
                                    onChange={e => setForm({ ...form, floor: e.target.value })}
                                    style={inputStyle}
                                >
                                    <option value="">Select</option>
                                    {FLOORS.map(f => <option key={f} value={f}>{f}</option>)}
                                </select>
                            ) : (
                                <div style={fieldValueStyle}>📍 {profile?.floor || "—"}</div>
                            )}
                        </div>
                    </div>
                </div>

                {/* ── My Interests (pills) ── */}
                {/* In edit mode, this card visually "links" with Profile Details — both share the same Save button at the top. */}
                <div style={{
                    background: CARD_BG, borderRadius: 20, padding: 16, marginBottom: 14,
                    border: editMode ? "3px solid #4A3AFF" : "3px solid rgb(226, 232, 248)",
                    boxShadow: editMode ? "0 0 0 4px rgba(74,58,255,0.12)" : "rgb(180 121 116) 0px 1px 6px",
                    transition: "all 0.3s ease",
                }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
                        <div>
                            <div style={{ fontWeight: 800, fontSize: 15, fontFamily: "'emoji", color: COLORS.text }}>
                                My Interests {editMode && <span style={{ color: "#4A3AFF" }}>(editing)</span>}
                            </div>
                            <div style={{ fontSize: 11, color: editMode ? "#4A3AFF" : COLORS.muted, fontFamily: "'DM Sans', sans-serif", marginTop: 2, fontWeight: editMode ? 700 : 400 }}>
                                {selectedInterestNames.length} selected {editMode ? "· click pills to add/remove · saved with Profile Details" : ""}
                            </div>
                        </div>
                        {editMode && (
                            <span style={{
                                background: "linear-gradient(to right, #4A3AFF, #D63384)",
                                color: "white", fontWeight: 700, fontSize: 10,
                                padding: "4px 10px", borderRadius: 12,
                                fontFamily: "'DM Sans', sans-serif",
                                textTransform: "uppercase", letterSpacing: 0.5,
                            }}>Edit Mode</span>
                        )}
                    </div>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                        {availableInterests.map(i => {
                            const active =
                                selectedInterestNames.includes(i.id) ||
                                selectedInterestNames.includes(i.label);
                            return (
                                <Pill
                                    key={i.id}
                                    label={i.label}
                                    active={active}
                                    color={PRIMARY_SOLID}
                                    disabled={!editMode}
                                    onClick={() => handleToggleInterest(i)}
                                />
                            );
                        })}
                    </div>
                </div>

                {/* ── Recent Activity (unchanged) ── */}
                <div style={{
                    background: CARD_BG, borderRadius: 20, padding: 16, marginBottom: 14,
                    border: "3px solid rgb(226, 232, 248)",
                    boxShadow: "rgb(180 121 116) 0px 1px 6px",
                }}>
                    <div style={{ fontWeight: 800, fontSize: 15, fontFamily: "'emoji", color: COLORS.text, marginBottom: 14 }}>
                        Recent Activity
                    </div>
                    {[
                        { emoji: "🏏", label: "Joined Weekend Cricket Match", time: "2d ago", color: PRIMARY_SOLID },
                        { emoji: "💬", label: "Posted in #Running", time: "3d ago", color: "#FF6584" },
                        { emoji: "🤝", label: "Connected with Priya Sharma", time: "5d ago", color: "#43E97B" },
                    ].map((item, i, arr) => (
                        <div key={item.label} style={{
                            display: "flex", alignItems: "center", gap: 12,
                            paddingBottom: i < arr.length - 1 ? 12 : 0,
                            marginBottom: i < arr.length - 1 ? 12 : 0,
                            borderBottom: i < arr.length - 1 ? `2px solid rgba(210, 52, 184, 0.3)` : "none",
                        }}>
                            <div style={{
                                width: 38, height: 38, borderRadius: 12,
                                background: `${item.color}15`,
                                display: "flex", alignItems: "center", justifyContent: "center",
                                fontSize: 18, flexShrink: 0,
                            }}>{item.emoji}</div>
                            <div style={{ flex: 1 }}>
                                <div style={{ fontSize: 13, fontWeight: 600, color: COLORS.text, fontFamily: "'DM Sans', sans-serif" }}>{item.label}</div>
                                <div style={{ fontSize: 11, color: COLORS.muted, fontFamily: "'DM Sans', sans-serif", marginTop: 2 }}>{item.time}</div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* ── Privacy Settings (unchanged) ── */}
                <div style={{
                    background: CARD_BG, borderRadius: 20, padding: 16, marginBottom: 14,
                    border: "3px solid rgb(226, 232, 248)",
                    boxShadow: "rgb(180 121 116) 0px 1px 6px",
                }}>
                    <div style={{ fontWeight: 800, fontSize: 15, fontFamily: "'emoji", color: COLORS.text, marginBottom: 14 }}>
                        Privacy Settings 🔒
                    </div>
                    {privacyItems.map((item, i, arr) => (
                        <div key={item.key} style={{
                            display: "flex", justifyContent: "space-between", alignItems: "center",
                            paddingBottom: i < arr.length - 1 ? 14 : 0,
                            marginBottom: i < arr.length - 1 ? 14 : 0,
                            borderBottom: i < arr.length - 1 ? `2px solid rgba(210, 52, 184, 0.3)` : "none",
                        }}>
                            <div>
                                <div style={{ fontWeight: 600, fontSize: 13, color: COLORS.text, fontFamily: "'DM Sans', sans-serif" }}>{item.label}</div>
                                <div style={{ fontSize: 11, color: COLORS.muted, fontFamily: "'DM Sans', sans-serif", marginTop: 2 }}>{item.sub}</div>
                            </div>
                            <div
                                onClick={() => setPrivacy(p => ({ ...p, [item.key]: !p[item.key] }))}
                                style={{
                                    width: 44, height: 24, borderRadius: 12, flexShrink: 0,
                                    background: privacy[item.key] ? "linear-gradient(135deg, #291b5f, rgba(108, 99, 255, 0.8))" : COLORS.border,
                                    position: "relative", cursor: "pointer",
                                    transition: "background 0.2s",
                                    boxShadow: privacy[item.key] ? "0 2px 8px rgba(108,99,255,0.35)" : "none",
                                }}>
                                <div style={{
                                    width: 18, height: 18, borderRadius: "50%", background: "white",
                                    position: "absolute", top: 3,
                                    left: privacy[item.key] ? 23 : 3,
                                    transition: "left 0.2s",
                                    boxShadow: "0 1px 4px rgba(0,0,0,0.2)",
                                }} />
                            </div>
                        </div>
                    ))}
                </div>

                {/* ── Logout Button ── */}
                <button
                    onClick={onLogout}
                    style={{
                        width: "100%",
                        marginTop: 20,
                        padding: "14px",
                        borderRadius: 14,
                        border: "1.5px solid #FF6584",
                        background: "white",
                        color: "#FF6584",
                        fontFamily: "'DM Sans', sans-serif",
                        fontWeight: 700,
                        fontSize: 14,
                        cursor: "pointer",
                        boxShadow: "0 4px 12px rgba(255,101,132,0.15)",
                    }}
                >
                    🚪 Logout
                </button>

            </div>
        </div>
    );
}

export default ProfileScreen;
