import React, { useState, useRef, useEffect } from "react";
import Avatar from "../../components/Avatar";
import { COLORS } from "../../constants";
import {
    fetchFeed, createPost, likePost, unlikePost, bookmarkPost, unbookmarkPost
} from "../../services/feedService";
import avatarDinosaur from '../../images/avatarDinosaur.png';
import heartFilled from '../../images/heart_color_filled.png';
import heartOutline from '../../images/heart_black_outlined.png';
import CommentIcon from '../../images/comment_icon.png';
import ShareIcon from '../../images/share_icon.png';
import SaveIcone from '../../images/save_icon.png';
import SaveIconOutline from '../../images/save_icon_outline.png';
import Checked from '../../images/checked.png';
import Upcoming from '../../images/upcoming.png';
import ComposeModal from "../../screens/app/ComposeModal";
import CommentModal from "./CommentModal";
import { fetchMyJoinedEvents, acknowledgeEventUpdate, acknowledgeEventCancellation } from "../../services/eventsService";
import dayjs from 'dayjs';

// ─── Emoji for every possible interest tag ────────────────────────────────────
// Add a new entry here if you add a new interest to the DB.
const EMOJI_MAP = {
    "All":         "✨",
    "Cricket":     "🏏",
    "Movies":      "🎬",
    "Travel":      "✈️",
    "Cycling":     "🚴",
    "Running":     "🏃",
    "Chess":       "♟️",
    "Gaming":      "🎮",
    "Photography": "📸",
    "Music":       "🎵",
    "Cooking":     "🍳",
    "Yoga":        "🧘",
    "Badminton":   "🏸",
    "General":     "💬",
};


const storedUser = JSON.parse(localStorage.getItem("user"));

// Every interest that can ever be a tab — keep in sync with your interests collection.
const ALL_INTERESTS = [
    "Cricket", "Movies", "Travel", "Cycling", "Running",
    "Chess", "Gaming", "Photography", "Music", "Cooking", "Yoga", "Badminton"
];

const TAG_COLOR = "rgb(173 14 130)";

// ─── Build personalised tabs from the myInterests PROP (passed from App.js) ───
// App.js sets myInterests = data.data.user.interests immediately on login,
// so this prop is always correct and requires no localStorage read.
// Order: All → user's interests (prop order) → remaining interests
const buildFeedTabs = (userInterests) => {
    const safeInterests = Array.isArray(userInterests) ? userInterests : [];
    const userSet = new Set(safeInterests);

    const myTabs = safeInterests.map(name => ({
        id: name,
        emoji: EMOJI_MAP[name] || "🏷️",
    }));

    const otherTabs = ALL_INTERESTS
        .filter(name => !userSet.has(name))
        .map(name => ({ id: name, emoji: EMOJI_MAP[name] || "🏷️" }));

    return [{ id: "All", emoji: "✨" }, ...myTabs, ...otherTabs];
};

const getCurrentUserId = () => {
    try {
        const u = JSON.parse(localStorage.getItem("user") || "{}");
        return u.id || "";
    } catch { return ""; }
};

const normalizePost = (p) => ({
    ...p,
    user: p.anonymous ? "Anonymous" : p.displayName,
    avatar: p.anonymous ? "?" : p.avatar,
    color: p.anonymous ? COLORS.muted : p.avatarColor,
    profilePicture: p.anonymous ? null : p.profilePicture,
    time: new Date(p.createdAt).toLocaleString(),
    likes: p.likeCount,
    replies: p.replyCount,
    anon: p.anonymous,
    mediaList: [
        ...(p.imageDataList || []).map(src => ({ type: "image", src })),
        ...(p.videoDataList || []).map(src => ({ type: "video", src })),
    ],
});

function MediaSlider({ mediaList }) {
    const [idx, setIdx] = useState(0);
    if (!mediaList || mediaList.length === 0) return null;
    const item = mediaList[idx];
    return (
        <div style={{ position: "relative", width: "100%" }}>
            {item.type === "video" ? (
                <video src={item.src} controls playsInline
                    style={{ width: "100%", maxHeight: 320, objectFit: "cover", display: "block", background: "#000" }} />
            ) : (
                <img src={item.src} alt="media"
                    style={{ width: "100%", height: 220, objectFit: "cover", display: "block" }} />
            )}
            {mediaList.length > 1 && (
                <>
                    {idx > 0 && (
                        <button onClick={() => setIdx(i => i - 1)} style={{
                            position: "absolute", left: 8, top: "50%", transform: "translateY(-50%)",
                            background: "rgba(0,0,0,0.45)", border: "none", borderRadius: "50%",
                            width: 28, height: 28, color: "white", fontSize: 14, cursor: "pointer",
                            display: "flex", alignItems: "center", justifyContent: "center",
                        }}>&#8249;</button>
                    )}
                    {idx < mediaList.length - 1 && (
                        <button onClick={() => setIdx(i => i + 1)} style={{
                            position: "absolute", right: 8, top: "50%", transform: "translateY(-50%)",
                            background: "rgba(0,0,0,0.45)", border: "none", borderRadius: "50%",
                            width: 28, height: 28, color: "white", fontSize: 14, cursor: "pointer",
                            display: "flex", alignItems: "center", justifyContent: "center",
                        }}>&#8250;</button>
                    )}
                    <div style={{ position: "absolute", bottom: 8, left: "50%", transform: "translateX(-50%)", display: "flex", gap: 5 }}>
                        {mediaList.map((_, i) => (
                            <div key={i} onClick={() => setIdx(i)} style={{
                                width: i === idx ? 16 : 6, height: 6, borderRadius: 3, cursor: "pointer",
                                background: i === idx ? "white" : "rgba(255,255,255,0.5)",
                                transition: "all 0.2s",
                            }} />
                        ))}
                    </div>
                    <div style={{
                        position: "absolute", top: 8, right: 10,
                        background: "rgba(0,0,0,0.45)", borderRadius: 10,
                        padding: "2px 8px", color: "white", fontSize: 10, fontWeight: 700,
                    }}>{idx + 1}/{mediaList.length}</div>
                </>
            )}
        </div>
    );
}

function FeedScreen({ myInterests, profilePic }) {

    // Build tabs directly from the myInterests prop.
    // App.js sets myInterests = user.interests immediately on login and passes
    // it here as a prop — so it is always the correct, up-to-date value.
    // We also watch myInterests so tabs update if the user changes interests.
    const [feedTabs, setFeedTabs] = useState(() => buildFeedTabs(myInterests));

    useEffect(() => {
        setFeedTabs(buildFeedTabs(myInterests));
    }, [myInterests]); // re-runs whenever myInterests changes (e.g. after profile update)

    const [liked, setLiked] = useState({});
    const [bookmarked, setBookmarked] = useState({});
    const [showCompose, setShowCompose] = useState(false);
    const [anon, setAnon] = useState(false);
    const [postText, setPostText] = useState("");
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(false);
    const [nextCursor, setNextCursor] = useState(null);
    const [activeTab, setActiveTab] = useState("All");
    const [validationError, setValidationError] = useState("");
    const [postMediaPreviews, setPostMediaPreviews] = useState([]);
    const [postMediaFiles, setPostMediaFiles] = useState([]);
    const [postTag, setPostTag] = useState("");
    const fileInputRef = useRef(null);
    const [composeSliderIdx, setComposeSliderIdx] = useState(0);
    const tabsRef = useRef(null);
    const [pendingNotification, setPendingNotification] = useState(null);
    const [notificationType, setNotificationType] = useState(null);
    const [activeCommentPostId, setActiveCommentPostId] = useState(null);
    const [isCommentModalOpen, setIsCommentModalOpen] = useState(false);

    const loadFeed = async (tag, before) => {
        setLoading(true);
        try {
            const res = await fetchFeed(tag, before);
            if (res.data && res.data.data) {
                const { posts: raw, nextCursor: cursor } = res.data.data;
                const normalized = raw.map(normalizePost);
                const likedMap = {};
                const bookmarkedMap = {};
                normalized.forEach(p => {
                    likedMap[p.id] = p.likedByMe;
                    bookmarkedMap[p.id] = p.bookmarkedByMe;
                });
                if (before) {
                    setPosts(prev => [...prev, ...normalized]);
                    setLiked(l => ({ ...l, ...likedMap }));
                    setBookmarked(b => ({ ...b, ...bookmarkedMap }));
                } else {
                    setPosts(normalized);
                    setLiked(likedMap);
                    setBookmarked(bookmarkedMap);
                }
                setNextCursor(cursor);
            } else {
                alert("Failed to load data");
            }
        } catch (e) {
            console.error("Failed to load feed", e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadFeed(activeTab, null);
    }, [activeTab]);

    const handlePost = async () => {
        if (!postTag || postTag.trim() === "") {
            setValidationError("Please select a tag/topic before sharing your post!");
            return;
        }
        if (!postText || postText.trim() === "") {
            setValidationError("Please enter some content before sharing your post!");
            return;
        }
        setValidationError("");
        const formData = new FormData();
        formData.append("content", postText);
        formData.append("tag", postTag);
        formData.append("anonymous", anon);
        postMediaFiles.forEach(f => {
            if (f.type.startsWith("image/")) formData.append("images", f);
            else formData.append("videos", f);
        });
        try {
            await createPost(formData);
            setPostText(""); setPostMediaPreviews([]); setPostMediaFiles([]);
            setComposeSliderIdx(0); setPostTag(""); setShowCompose(false); setValidationError("");
            loadFeed(activeTab, null);
        } catch (e) {
            console.error("Failed to create post", e);
            setValidationError("Failed to share post. Please try again.");
        }
    };

    // useEffect(() => {
    //     let isMounted = true;

    //     // Fetch joined events upon user login landing context
    //     fetchMyJoinedEvents()
    //         .then((res) => {
    //             if (!isMounted) return;
                
    //             // Locate the first event containing an unacknowledged update indicator flag
    //             const updatedEvent = res?.data?.find(ev => ev.needsNotification === true);
                
    //             if (updatedEvent) {
    //                 setPendingNotification(updatedEvent);
    //             }
    //         })
    //         .catch((err) => console.error("Failed to query update notices:", err));

    //     return () => { isMounted = false; };
    // }, []);

    // const handleDismissNotification = async () => {
    //     if (!pendingNotification) return;
    //     try {
    //         // Inform the database tracking array to clear notification state for this user ID
    //         await acknowledgeEventUpdate(pendingNotification.id);
    //         setPendingNotification(null);
    //     } catch (err) {
    //         console.error("Failed to acknowledge schedule notice:", err);
    //         setPendingNotification(null); // Dismiss modal anyway to avoid blocking user loop
    //     }
    // };

//     useEffect(() => {
//     let isMounted = true;

//     fetchMyJoinedEvents()
//         .then((res) => {
//             if (!isMounted) return;
            
//             // 1. Check first for cancellations as they take absolute priority
//             const canceledEvent = res?.data?.find(ev => ev.needsCancellationNotification === true);
//             if (canceledEvent) {
//                 setPendingNotification(canceledEvent);
//                 setNotificationType("cancellation");
//                 return; // Stop checking further if a cancellation is found
//             }

//             // 2. Fallback to standard date/time adjustments
//             const updatedEvent = res?.data?.find(ev => ev.needsNotification === true);
//             if (updatedEvent) {
//                 setPendingNotification(updatedEvent);
//                 setNotificationType("update");
//             }
//         })
//         .catch((err) => console.error("Error verifying event updates:", err));

//     return () => { isMounted = false; };
// }, []);

// const handleDismissNotification = async () => {
//     if (!pendingNotification) return;
//     try {
//         // Dynamically call the correct endpoint depending on the type of notification
//         if (notificationType === "cancellation") {
//             await acknowledgeEventCancellation(pendingNotification.id);
//         } else {
//             await acknowledgeEventUpdate(pendingNotification.id);
//         }
        
//         // Reset both states to dismiss the popup cleanly
//         setPendingNotification(null);
//         setNotificationType(null);
//     } catch (err) {
//         console.error("Failed to clear notification target:", err);
//         setPendingNotification(null);
//         setNotificationType(null);
//     }
// };


// // ── Notification Center States ───────────────────────────────────────────
// const [notifications, setNotifications] = useState([]); // List of events with unread alerts
// const [showNotifDrawer, setShowNotifDrawer] = useState(false);

// const loadNotifications = () => {
//     fetchMyJoinedEvents()
//         .then((res) => {
//             const list = res?.data || [];
//             // Filter events that need EITHER cancellation OR schedule update notification
//             const unreadNotifs = list.filter(
//                 ev => ev.needsCancellationNotification || ev.needsNotification
//             );
//             setNotifications(unreadNotifs);
//         })
//         .catch((err) => console.error("Error loading notifications:", err));
// };

// useEffect(() => {
//     loadNotifications();
// }, []);

// Dismiss a single notification item
// const handleDismissSingle = async (ev) => {
//     try {
//         if (ev.needsCancellationNotification) {
//             await acknowledgeEventCancellation(ev.id);
//         } else {
//             await acknowledgeEventUpdate(ev.id);
//         }
//         // Refresh local notification list
//         setNotifications(prev => prev.filter(item => item.id !== ev.id));
//     } catch (err) {
//         console.error("Failed to dismiss notification:", err);
//     }
// };

// // Clear all notifications
// const handleClearAllNotifs = async () => {
//     try {
//         await acknowledgeAllEventNotices(notifications);
//         setNotifications([]);
//         setShowNotifDrawer(false);
//     } catch (err) {
//         console.error("Failed to clear all notifications:", err);
//     }
// };

    const handleLike = async (post) => {
        const isLiked = liked[post.id];
        setLiked(l => ({ ...l, [post.id]: !isLiked }));
        setPosts(prev => prev.map(p => p.id === post.id ? { ...p, likes: p.likes + (isLiked ? -1 : 1) } : p));
        try {
            if (isLiked) await unlikePost(post.id); else await likePost(post.id);
        } catch {
            setLiked(l => ({ ...l, [post.id]: isLiked }));
            setPosts(prev => prev.map(p => p.id === post.id ? { ...p, likes: p.likes + (isLiked ? 1 : -1) } : p));
        }
    };

    const handleBookmark = async (post) => {
        const isBookmarked = bookmarked[post.id];
        setBookmarked(b => ({ ...b, [post.id]: !isBookmarked }));
        try {
            if (isBookmarked) await unbookmarkPost(post.id); else await bookmarkPost(post.id);
        } catch { setBookmarked(b => ({ ...b, [post.id]: isBookmarked })); }
    };

    

    const filtered = activeTab === "All" ? posts : posts.filter(p => p.tag === activeTab);
    const myUserId = getCurrentUserId();

    return (
        <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden", position: "relative", background: "linear-gradient(135deg, #FFE0D6, #f3c7da)", borderRadius: "10px 10px 0px 0px", borderTop: "3px solid #f3f3f3d1" }}>

            <div style={{ background: "linear-gradient(135deg, #FFE0D6, #f3c7da)", flexShrink: 0 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px", paddingTop: "3px" }} />

                {/* ── Tab Bar ── */}
                <div ref={tabsRef} style={{
                    display: "flex", overflowX: "auto", paddingBottom: 10, paddingLeft: 5,
                    scrollbarWidth: "none", msOverflowStyle: "none", borderBottom: "1px solid #ffffff73",
                }}>
                    {feedTabs.map(t => {
                        const isActive = activeTab === t.id;
                        return (
                            <button key={t.id} onClick={() => setActiveTab(t.id)} style={{
                                padding: "10px 14px", border: "none",
                                borderRadius: isActive ? 40 : 0,
                                background: isActive ? "#cb257242" : "none",
                                cursor: "pointer", whiteSpace: "nowrap",
                                display: "flex", alignItems: "center", gap: 5,
                                transition: "all 0.18s", marginBottom: -2, flexShrink: 0,
                            }}>
                                <span style={{ fontSize: 14 }}>{t.emoji}</span>
                                <span style={{
                                    fontSize: 12, fontWeight: isActive ? 800 : 600,
                                    color: isActive ? "#0d4507" : "#972a3e",
                                    fontFamily: "'DM Sans', sans-serif", transition: "color 0.18s",
                                }}>{t.id}</span>
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* ── Scrollable Feed ── */}
            <div style={{ flex: 1, overflowY: "auto", padding: "12px 14px 0", scrollbarWidth: "none" }}>

                {/* Compose bar */}
                <div onClick={() => setShowCompose(true)} style={{
                    background: "rgb(247, 240, 240)", borderRadius: 16, padding: "11px 14px",
                    display: "flex", alignItems: "center", gap: 10,
                    border: "1px solid rgb(255 191 191)", marginBottom: 14, cursor: "pointer",
                    boxShadow: "0 2px 10px rgba(108,99,255,0.06)",
                }}>
                    <Avatar alt="VK" color={"#a7aebf"} online backgroundColor="white" image={profilePic || avatarDinosaur} />
                    <span style={{ color: "#6677ab", fontSize: 13, fontFamily: "'DM Sans', sans-serif", flex: 1 }}>Share something with colleagues...</span>
                    <div style={{
                        background: "linear-gradient(135deg, rgb(41, 27, 95), rgba(108, 99, 255, 0.8))",
                        borderRadius: 10, padding: "6px 11px", color: "white",
                        fontSize: 11, fontWeight: 700, fontFamily: "'DM Sans', sans-serif",
                    }}>Post</div>
                </div>

                {/* Loading */}
                {loading && posts.length === 0 && (
                    <div style={{ textAlign: "center", padding: "40px 20px" }}>
                        <div style={{ fontSize: 24, marginBottom: 8 }}>⏳</div>
                        <div style={{ color: COLORS.muted, fontSize: 13, fontFamily: "'DM Sans', sans-serif" }}>Loading posts...</div>
                    </div>
                )}

                {/* Empty */}
                {!loading && filtered.length === 0 && (
                    <div style={{ textAlign: "center", padding: "40px 20px" }}>
                        <div style={{ fontSize: 40, marginBottom: 10 }}>🔍</div>
                        <div style={{ fontWeight: 700, color: COLORS.text, fontFamily: "'Syne', sans-serif", fontSize: 16, marginBottom: 6 }}>No posts yet</div>
                        <div style={{ color: COLORS.muted, fontSize: 13, fontFamily: "'DM Sans', sans-serif" }}>Be the first to post about {activeTab}!</div>
                    </div>
                )}

                {/* Post cards */}
                {filtered.map(post => {
                    const isUpcoming = post.eventStatus === "upcoming";
                    const isHappened = post.eventStatus === "happened";
                    return (
                        <div key={post.id} style={{
                            backgroundColor: "#f9f7f7", borderRadius: 20, marginBottom: 14,
                            overflow: "hidden", boxShadow: "#4516295c 0px 2px 10px",
                        }}>
                            <div style={{ position: "relative" }}>
                                <MediaSlider mediaList={post.mediaList} />
                                {post.mediaList?.length === 0 && <div style={{ width: "100%", height: 180 }} />}
                                {(isUpcoming || isHappened) && (
                                    <div style={{
                                        position: "absolute", bottom: 10, right: 10,
                                        background: isUpcoming ? "rgb(35 153 33)" : "#a51f8e",
                                        color: "white", borderRadius: 10, padding: "5px 10px",
                                        fontSize: 10, fontWeight: 700, fontFamily: "'DM Sans', sans-serif",
                                        display: "flex", alignItems: "center", gap: 4,
                                        boxShadow: "0 2px 8px rgba(0,0,0,0.3)",
                                    }}>
                                        <img src={isUpcoming ? Upcoming : Checked} alt="" style={{ width: 14, height: 14 }} />
                                        {isUpcoming ? "UPCOMING" : "HAPPENED"}
                                    </div>
                                )}
                            </div>

                            {(isUpcoming || isHappened) && post.eventDate && (
                                <div style={{
                                    background: isUpcoming ? `${TAG_COLOR}12` : "#F8F9FA",
                                    borderBottom: `1px solid ${COLORS.border}`,
                                    padding: "8px 14px", display: "flex", gap: 14, flexWrap: "wrap",
                                }}>
                                    <span style={{ fontSize: 11, color: TAG_COLOR, fontWeight: 700, fontFamily: "'DM Sans', sans-serif", display: "flex", alignItems: "center", gap: 4 }}>
                                        📅 {post.eventDate}
                                    </span>
                                    {post.eventLocation && (
                                        <span style={{ fontSize: 11, color: COLORS.muted, fontFamily: "'DM Sans', sans-serif", display: "flex", alignItems: "center", gap: 4 }}>
                                            📍 {post.eventLocation}
                                        </span>
                                    )}
                                </div>
                            )}

                            <div style={{ padding: "12px 14px", backgroundColor: "#f7f0f0" }}>
                                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
                                    <Avatar initials={post.avatar} color={post.color} size={36}
                                        // image={!post.anon && post.userId === myUserId ? profilePic : null} 
                                        image={ post.anon ? null : (post.userId === myUserId ? profilePic : post.profilePicture)  }/>
                                    <div style={{ flex: 1 }}>
                                        <div style={{ fontWeight: 700, fontSize: 13, color: COLORS.text, fontFamily: "'DM Sans', sans-serif", display: "flex", alignItems: "center", gap: 6 }}>
                                            {post.user}
                                            {post.anon && <span style={{ fontSize: 10, background: "#F0F4FF", color: COLORS.muted, borderRadius: 6, padding: "2px 6px" }}>Anon</span>}
                                        </div>
                                        <div style={{ fontSize: 11, color: COLORS.muted, fontFamily: "'DM Sans', sans-serif" }}>{post.time}</div>
                                    </div>
                                    <span style={{ fontSize: 10, fontWeight: 700, color: TAG_COLOR, background: `${TAG_COLOR}15`, borderRadius: 8, padding: "3px 8px", fontFamily: "'DM Sans', sans-serif" }}>
                                        #{post.tag}
                                    </span>
                                </div>

                                <p style={{ margin: "0 0 12px", fontSize: 13, color: COLORS.text, lineHeight: 1.6, fontFamily: "'DM Sans', sans-serif" }}>
                                    {post.content}
                                </p>

                                {isUpcoming && (
                                    <button style={{
                                        width: "100%", background: "linear-gradient(135deg, rgb(41 27 95), rgba(108,99,255,0.8))",
                                        color: "white", border: "none", borderRadius: 12, padding: "9px 0",
                                        fontWeight: 700, fontSize: 12, cursor: "pointer", marginBottom: 10,
                                    }}>🙋 I'm Interested — Join Event</button>
                                )}
                                {isHappened && (
                                    <button style={{
                                        width: "100%", background: "#F8F9FA", color: COLORS.text,
                                        border: `1.5px solid ${COLORS.border}`, borderRadius: 12, padding: "9px 0",
                                        fontWeight: 700, fontSize: 12, cursor: "pointer", marginBottom: 10,
                                    }}>📸 View Full Recap →</button>
                                )}

                                <div style={{ display: "flex", paddingTop: 10, borderTop: `1px solid ${COLORS.border}` }}>
                                    <button onClick={() => handleLike(post)} style={{
                                        flex: 1, border: "none", background: "none", cursor: "pointer",
                                        display: "flex", alignItems: "center", justifyContent: "center", gap: 5,
                                        color: liked[post.id] ? COLORS.secondary : COLORS.muted,
                                        fontSize: 12, fontFamily: "'DM Sans', sans-serif", fontWeight: 600, padding: "4px 0",
                                    }}>
                                        <img src={liked[post.id] ? heartFilled : heartOutline} alt="like" style={{
                                            width: 16, height: 16, transition: "transform 0.25s ease",
                                            transform: liked[post.id] ? "scale(1.3)" : "scale(1)",
                                            filter: liked[post.id] ? "drop-shadow(0 0 3px rgba(255,91,119,0.35))" : "none",
                                        }} />
                                        {post.likes}
                                    </button>
                                    {/* Functional Comment Button */}
                                    <button onClick={() => {
                                        setActiveCommentPostId(post.id);
                                        setIsCommentModalOpen(true);
                                    }} style={{
                                        flex: 1, border: "none", background: "none", cursor: "pointer",
                                        display: "flex", alignItems: "center", justifyContent: "center", gap: 5,
                                        color: COLORS.muted, fontSize: 12, fontFamily: "'DM Sans', sans-serif", fontWeight: 600, padding: "4px 0",
                                    }}>
                                        <img src={CommentIcon} alt="comment" style={{ width: 16, height: 16 }} />
                                        {post.replies}
                                    </button>
                                    <button style={{
                                        flex: 1, border: "none", background: "none", cursor: "pointer",
                                        display: "flex", alignItems: "center", justifyContent: "center", gap: 5,
                                        color: COLORS.muted, fontSize: 12, fontFamily: "'DM Sans', sans-serif", fontWeight: 600, padding: "4px 0",
                                    }}>
                                        <img src={ShareIcon} alt="share" style={{ width: 16, height: 16 }} />
                                        Share
                                    </button>
                                    <button onClick={() => handleBookmark(post)} style={{
                                        flex: 1, border: "none", background: "none", cursor: "pointer",
                                        display: "flex", alignItems: "center", justifyContent: "center", gap: 5,
                                        color: bookmarked[post.id] ? TAG_COLOR : COLORS.muted,
                                        fontSize: 12, fontFamily: "'DM Sans', sans-serif", fontWeight: 600, padding: "4px 0",
                                    }}>
                                        <img src={bookmarked[post.id] ? SaveIcone : SaveIconOutline} alt="Save" style={{ width: 16, height: 16 }} />
                                        Save
                                    </button>
                                </div>
                            </div>
                        </div>
                    );
                })}
                <div style={{ height: 16 }} />
            </div>


            {/* ── Compose Modal ── */}
{/* {showCompose && (
    <div style={{
        position: "absolute", inset: 0, background: "rgba(26,26,46,0.55)",
        zIndex: 200, display: "flex", alignItems: "flex-end",
    }} onClick={() => setShowCompose(false)}>
        <div onClick={e => e.stopPropagation()} style={{
            background: "rgba(254, 244, 255, 0.93)", borderRadius: "24px 24px 0 0",
            padding: "20px 20px 30px", width: "100%", boxSizing: "border-box",
        }}>
            <div style={{ width: 36, height: 4, borderRadius: 2, background: COLORS.border, margin: "0 auto 16px" }} />

            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
                <div style={{ fontSize: 16, fontWeight: 800, fontFamily: "'DM Sans', sans-serif", color: COLORS.text }}>New Post</div>
                <input ref={fileInputRef} type="file" accept="image/*,video/*" multiple style={{ display: "none" }}
                    onChange={e => {
                        const files = Array.from(e.target.files);
                        const previews = files.map(f => ({ type: f.type.startsWith("video/") ? "video" : "image", src: URL.createObjectURL(f) }));
                        setPostMediaFiles(prev => [...prev, ...files]);
                        setPostMediaPreviews(prev => [...prev, ...previews]);
                        setComposeSliderIdx(0); e.target.value = "";
                    }} />
                <button onClick={() => fileInputRef.current.click()} style={{
                    background: postMediaPreviews.length > 0 ? `${COLORS.primary}15` : "#F4F4F8",
                    border: `1.5px solid ${postMediaPreviews.length > 0 ? COLORS.primary : COLORS.border}`,
                    borderRadius: 20, padding: "6px 14px", cursor: "pointer",
                    fontSize: 13, fontWeight: 600,
                    color: postMediaPreviews.length > 0 ? COLORS.primary : COLORS.muted,
                    fontFamily: "'DM Sans', sans-serif",
                    display: "flex", alignItems: "center", gap: 6,
                }}>
                    <span style={{ fontSize: 16 }}>📷</span>
                    <span style={{ fontSize: 11 }}>{postMediaPreviews.length > 0 ? `${postMediaPreviews.length} Added/Add more +` : "Photo/Video"}</span>
                </button>
            </div>

            {postMediaPreviews.length > 0 && (
                <div style={{ position: "relative", marginBottom: 12, borderRadius: 12, overflow: "hidden" }}>
                    {postMediaPreviews[composeSliderIdx].type === "video"
                        ? <video src={postMediaPreviews[composeSliderIdx].src} controls playsInline style={{ width: "100%", maxHeight: 180, background: "#000", display: "block" }} />
                        : <img src={postMediaPreviews[composeSliderIdx].src} alt="preview" style={{ width: "100%", height: 140, objectFit: "cover", display: "block" }} />
                    }
                    <button onClick={() => {
                        const np = postMediaPreviews.filter((_, i) => i !== composeSliderIdx);
                        const nf = postMediaFiles.filter((_, i) => i !== composeSliderIdx);
                        setPostMediaPreviews(np); setPostMediaFiles(nf);
                        setComposeSliderIdx(Math.min(composeSliderIdx, np.length - 1));
                    }} style={{
                        position: "absolute", top: 6, right: 6, background: "rgba(0,0,0,0.55)",
                        border: "none", borderRadius: "50%", width: 24, height: 24,
                        cursor: "pointer", color: "white", fontSize: 12,
                        display: "flex", alignItems: "center", justifyContent: "center",
                    }}>✕</button>
                    {postMediaPreviews.length > 1 && (
                        <>
                            {composeSliderIdx > 0 && (
                                <button onClick={() => setComposeSliderIdx(i => i - 1)} style={{
                                    position: "absolute", left: 6, top: "50%", transform: "translateY(-50%)",
                                    background: "rgba(0,0,0,0.45)", border: "none", borderRadius: "50%",
                                    width: 26, height: 26, color: "white", fontSize: 14, cursor: "pointer",
                                    display: "flex", alignItems: "center", justifyContent: "center",
                                }}>&#8249;</button>
                            )}
                            {composeSliderIdx < postMediaPreviews.length - 1 && (
                                <button onClick={() => setComposeSliderIdx(i => i + 1)} style={{
                                    position: "absolute", right: 32, top: "50%", transform: "translateY(-50%)",
                                    background: "rgba(0,0,0,0.45)", border: "none", borderRadius: "50%",
                                    width: 26, height: 26, color: "white", fontSize: 14, cursor: "pointer",
                                    display: "flex", alignItems: "center", justifyContent: "center",
                                }}>&#8250;</button>
                            )}
                            <div style={{ position: "absolute", bottom: 6, left: "50%", transform: "translateX(-50%)", display: "flex", gap: 4 }}>
                                {postMediaPreviews.map((_, i) => (
                                    <div key={i} onClick={() => setComposeSliderIdx(i)} style={{
                                        width: i === composeSliderIdx ? 14 : 5, height: 5, borderRadius: 3,
                                        background: i === composeSliderIdx ? "white" : "rgba(255,255,255,0.5)",
                                        cursor: "pointer", transition: "all 0.2s",
                                    }} />
                                ))}
                            </div>
                            <div style={{
                                position: "absolute", top: 6, left: 8, background: "rgba(0,0,0,0.45)",
                                borderRadius: 8, padding: "1px 7px", color: "white", fontSize: 10, fontWeight: 700,
                            }}>{composeSliderIdx + 1}/{postMediaPreviews.length}</div>
                        </>
                    )}
                </div>
            )}

            <div style={{ display: "flex", gap: 10, marginBottom: 12, alignItems: "flex-start" }}>
                <Avatar alt="VK" color={"#a7aebf"} online backgroundColor="white" image={profilePic || avatarDinosaur} />
                <textarea value={postText} onChange={e => setPostText(e.target.value)}
                    placeholder="What's on your mind? Plan a game, share an interest..."
                    style={{
                        flex: 1, border: `1.5px solid ${COLORS.border}`, borderRadius: 12,
                        padding: 12, fontSize: 13, fontFamily: "'DM Sans', sans-serif",
                        resize: "none", minHeight: 80, color: COLORS.text, outline: "none",
                    }} />
            </div>

            {/* Inline Mobile Validation Error Banner */}
{/* {validationError && (
    <div style={{
        background: "#FFE5E5",
        color: "#D32F2F",
        padding: "10px 14px",
        borderRadius: "12px",
        marginBottom: "12px",
        fontSize: "12px",
        fontFamily: "'DM Sans', sans-serif",
        fontWeight: 600,
        display: "flex",
        alignItems: "center",
        gap: 6,
        animation: "fadeIn 0.2s ease"
    }}>
        ⚠ {validationError}
    </div>
)}

            {/* Tag picker Carousel — Preserving Single-Select with high contrast theme text */}
            {/* <div style={{ display: "flex", gap: 8, overflowX: "auto", paddingBottom: 8, marginBottom: 12, scrollbarWidth: "none" }}>
                {feedTabs.slice(1).map(t => {
                    const isSelected = postTag === t.id;
                    return (
                        <span 
                            key={t.id} 
                            onClick={() => {
                                setPostTag(prevTag => prevTag === t.id ? "" : t.id);
                            }} 
                            style={{
                                padding: "6px 14px", 
                                borderRadius: 20,
                                background: isSelected ? TAG_COLOR : "rgba(244, 244, 248, 0.8)",
                                color: isSelected ? "white" : TAG_COLOR,
                                fontSize: 11, 
                                fontWeight: 700, 
                                cursor: "pointer",
                                fontFamily: "'DM Sans', sans-serif",
                                border: `1.5px solid ${TAG_COLOR}`,
                                transition: "all 0.15s ease", 
                                whiteSpace: "nowrap", 
                                flexShrink: 0,
                            }}
                        >
                            #{t.id}
                        </span>
                    );
                })}
            </div>

            {/* Bottom Action Row with original native variables */}
            {/* <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer" }}
                    onClick={() => setAnon(!anon)}>
                    <div style={{ width: 36, height: 20, borderRadius: 10, background: anon ? COLORS.primary : COLORS.border, position: "relative", transition: "background 0.2s" }}>
                        <div style={{ width: 16, height: 16, borderRadius: "50%", background: "white", position: "absolute", top: 2, left: anon ? 18 : 2, transition: "left 0.2s", boxShadow: "0 1px 4px rgba(0,0,0,0.2)" }} />
                    </div>
                    <span style={{ fontSize: 12, color: COLORS.muted, fontFamily: "'DM Sans', sans-serif" }}>Post anonymously</span>
                </div>
                <button onClick={handlePost} style={{
                    background: "linear-gradient(135deg, rgb(41, 27, 95), rgba(108, 99, 255, 0.8))", color: "white", border: "none", borderRadius: 12,
                    padding: "10px 22px", fontWeight: 700, fontSize: 13, cursor: "pointer",
                    fontFamily: "'DM Sans', sans-serif", boxShadow: `0 4px 14px ${COLORS.primary}44`,
                }}>Share ✦</button>
            </div>
        </div>
    </div>
)} */}
       {/* New shared component layout element replacement */}
            <ComposeModal
                isOpen={showCompose}
                onClose={() => setShowCompose(false)}
                onPostSuccess={() => loadFeed(activeTab, null)}
                profilePic={profilePic}
                feedTabs={feedTabs}
                TAG_COLOR={TAG_COLOR}
            />

           {/* Put this near ComposeModal at the bottom of FeedScreen.jsx */}
<CommentModal
    isOpen={isCommentModalOpen}
    onClose={() => {
        setIsCommentModalOpen(false);
        setActiveCommentPostId(null);
    }}
    postId={activeCommentPostId}
    currentProfilePic={profilePic}
    onCommentAdded={() => {
        // Optimistically increment comment count on the active post
        setPosts(prevPosts =>
            prevPosts.map(p =>
                p.id === activeCommentPostId
                    ? { ...p, replies: (p.replies || 0) + 1 }
                    : p
            )
        );
    }}
/>

            {/* ── Dynamic Schedule Change Notification Overlay Popup Appended Here ──
            {pendingNotification && (
                <div style={{
                    position: "absolute", inset: 0, background: "rgba(26, 26, 46, 0.6)",
                    display: "flex", alignItems: "center", justifyContent: "center", zIndex: 9999,
                }}>
                    <div style={{
                        background: '#fffaff', borderRadius: 24, padding: "30px 24px 24px",
                        width: 300, boxShadow: "0 12px 36px rgba(0,0,0,0.25)", textAlign: "center",
                        margin: "0 20px", border: "2px solid #FF6584",
                        animation: "fadeIn 0.25s ease-out"
                    }}>
                        <div style={{ fontSize: 42, marginBottom: 12 }}>📅</div>
                        <div style={{ fontWeight: 800, fontSize: 18, marginBottom: 10, fontFamily: "'DM Sans', sans-serif", color: "#1b1d23" }}>
                            Schedule Updated!
                        </div>
                        <div style={{ fontSize: 13, color: "#4A5568", marginBottom: 26, fontFamily: "'DM Sans', sans-serif", lineHeight: 1.6 }}>
                            The host has updated the event timing parameters for <strong style={{ color: "#6C63FF" }}>{pendingNotification.title}</strong>.
                            <br />
                            <span style={{ fontSize: 11, display: "block", marginTop: 8, color: "#718096", background: "#EDF2F7", padding: "6px 10px", borderRadius: 8, fontWeight: "bold" }}>
                                New Schedule: {pendingNotification.date} at {pendingNotification.time ? dayjs(`2026-01-01T${pendingNotification.time}`).format('hh:mm A') : ''}
                            </span>
                        </div>
                        <button 
                            onClick={handleDismissNotification} 
                            style={{
                                width: "100%", padding: "12px 0", borderRadius: 12, border: "none",
                                background: "linear-gradient(135deg, rgb(191, 82, 127), rgb(28, 17, 193))", 
                                color: "white", fontWeight: 700, fontSize: 13, cursor: "pointer", 
                                fontFamily: "'DM Sans', sans-serif", boxShadow: "0 4px 12px rgba(28, 17, 193, 0.3)"
                            }}
                        >
                            Got it, Thanks!
                        </button>
                    </div>
                </div>
            )} */}

            {/* {pendingNotification && (
    <div style={{
        position: "absolute", inset: 0, background: "rgba(26, 26, 46, 0.6)",
        display: "flex", alignItems: "center", justifyContent: "center", zIndex: 9999,
    }}>
        <div style={{
            background: '#fffaff', borderRadius: 24, padding: "30px 24px 24px",
            width: 300, boxShadow: "0 12px 36px rgba(0,0,0,0.25)", textAlign: "center",
            margin: "0 20px", 
            border: notificationType === "cancellation" ? "2px solid #EF4444" : "2px solid #FF6584",
            animation: "fadeIn 0.25s ease-out"
        }}>
            <div style={{ fontSize: 42, marginBottom: 12 }}>
                {notificationType === "cancellation" ? "🚨" : "📅"}
            </div>
            <div style={{ 
                fontWeight: 800, fontSize: 18, marginBottom: 10, 
                fontFamily: "'DM Sans', sans-serif", 
                color: notificationType === "cancellation" ? "#EF4444" : "#1b1d23" 
            }}>
                {notificationType === "cancellation" ? "Event Canceled!" : "Schedule Updated!"}
            </div>
            <div style={{ fontSize: 13, color: "#4A5568", marginBottom: 26, fontFamily: "'DM Sans', sans-serif", lineHeight: 1.6 }}>
                {notificationType === "cancellation" ? (
                    <>
                        The host has canceled the upcoming event: <strong style={{ color: "#EF4444" }}>{pendingNotification.title}</strong>. This event has been removed from the schedule.
                    </>
                ) : (
                    <>
                        The host has updated the event timing parameters for <strong style={{ color: "#6C63FF" }}>{pendingNotification.title}</strong>.
                        <br />
                        <span style={{ fontSize: 11, display: "block", marginTop: 8, color: "#718096", background: "#EDF2F7", padding: "6px 10px", borderRadius: 8, fontWeight: "bold" }}>
                            New Schedule: {pendingNotification.date} at {pendingNotification.time ? dayjs(`2026-01-01T${pendingNotification.time}`).format('hh:mm A') : ''}
                        </span>
                    </>
                )}
            </div>
            <button 
                onClick={handleDismissNotification} 
                style={{
                    width: "100%", padding: "12px 0", borderRadius: 12, border: "none",
                    background: notificationType === "cancellation" ? "#EF4444" : "linear-gradient(135deg, rgb(191, 82, 127), rgb(28, 17, 193))", 
                    color: "white", fontWeight: 700, fontSize: 13, cursor: "pointer", 
                    fontFamily: "'DM Sans', sans-serif", 
                    boxShadow: notificationType === "cancellation" ? "0 4px 12px rgba(239, 68, 68, 0.3)" : "0 4px 12px rgba(28, 17, 193, 0.3)"
                }}
            >
                Got it, Thanks!
            </button>
        </div>
    </div>
)} */}
        </div>
    );
}

export default FeedScreen;