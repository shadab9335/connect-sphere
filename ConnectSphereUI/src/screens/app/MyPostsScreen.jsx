// import React, { useState, useEffect, useRef } from "react";
// import IconButton from "@mui/material/IconButton";
// import ArrowBackIcon from "@mui/icons-material/ArrowBack";
// import Avatar from "../../components/Avatar";
// import { COLORS, FEED_TABS } from "../../constants";
// import avatarDinosaur from '../../images/avatarDinosaur.png';
// import ComposeModal from "../../screens/app/ComposeModal";
// import {
//     fetchUserPosts,
//     fetchUserBookmarks,
//     likePost,
//     unlikePost,
//     deletePost,
//     updatePost,
//     createPost,
//     unbookmarkPost,
// } from "../../services/feedService";

// const TAG_COLORS = {
//     Cricket: "#6C63FF", Movies: "#FF6584", Travel: "#43E97B",
//     Running: "#FF6584", Cycling: "#38BDF8", Chess: "#FFB347",
//     Gaming: "#6C63FF", Photography: "#43E97B", Music: "#FF6584",
//     Cooking: "#FFB347", Yoga: "#38BDF8", General: "#8892B0",
// };

// const normalizePost = (p) => ({
//     ...p,
//     user: p.anonymous ? "Anonymous" : p.displayName,
//     avatar: p.anonymous ? "?" : p.avatar,
//     color: p.anonymous ? COLORS.muted : p.avatarColor,
//     time: new Date(p.createdAt).toLocaleString(),
//     likes: p.likeCount,
//     replies: p.replyCount,
//     anon: p.anonymous,
//     image: p.imageDataList?.[0] || null,
//     video: p.videoDataList?.[0] || null,
// });

// export default function MyPostsScreen({ initialPosts, onPostsChanged, onBack, profilePic, mode = "own" }) {
//     const isSavedMode = mode === "saved";
//     const [posts, setPosts] = useState(() => (initialPosts || []).map(normalizePost));
//     const [liked, setLiked] = useState(() => {
//         const m = {};
//         (initialPosts || []).forEach(p => { m[p.id] = p.likedByMe; });
//         return m;
//     });
//     const [bookmarked, setBookmarked] = useState(() => {
//         const m = {};
//         (initialPosts || []).forEach(p => { m[p.id] = p.bookmarkedByMe; });
//         return m;
//     });
//     const [loading, setLoading] = useState(!initialPosts || initialPosts.length === 0);
//     const [error, setError] = useState(null);
//     const [pendingDelete, setPendingDelete] = useState(null);

//     // Edit-modal state. `editingPost` doubles as the "is the modal open?" flag:
//     // null = closed, a post object = open and editing that post.
//     const [editingPost, setEditingPost] = useState(null);
//     const [editText, setEditText] = useState("");
//     const [editTag, setEditTag] = useState("Cricket");
//     const [editSaving, setEditSaving] = useState(false);

//     // Compose (new post) modal state
//     const [showCompose, setShowCompose] = useState(false);
//     const [postText, setPostText] = useState("");
//     const [postTag, setPostTag] = useState("General");
//     const [anon, setAnon] = useState(false);
//     const [postMediaPreviews, setPostMediaPreviews] = useState([]);
//     const [postMediaFiles, setPostMediaFiles] = useState([]);
//     const [composeSliderIdx, setComposeSliderIdx] = useState(0);
//     const [posting, setPosting] = useState(false);
//     const fileInputRef = useRef(null);

//     useEffect(() => {
//         // If parent already passed posts, skip the extra fetch.
//         if (initialPosts && initialPosts.length > 0) return;

//         const user = JSON.parse(localStorage.getItem("user") || "{}");
//         if (!user.id) {
//             setError("No logged-in user");
//             setLoading(false);
//             return;
//         }
//         setLoading(true);
//         const fetcher = isSavedMode ? fetchUserBookmarks : fetchUserPosts;
//         fetcher(user.id)
//             .then(res => {
//                 const raw = res.data.data || [];
//                 const normalized = raw.map(normalizePost);
//                 setPosts(normalized);
//                 const lMap = {}, bMap = {};
//                 normalized.forEach(p => {
//                     lMap[p.id] = p.likedByMe;
//                     bMap[p.id] = p.bookmarkedByMe;
//                 });
//                 setLiked(lMap);
//                 setBookmarked(bMap);
//             })
//             .catch(err => {
//                 console.error(isSavedMode ? "Failed to load saved posts" : "Failed to load my posts", err);
//                 setError(isSavedMode ? "Couldn't load your saved posts" : "Couldn't load your posts");
//             })
//             .finally(() => setLoading(false));
//         // eslint-disable-next-line react-hooks/exhaustive-deps
//     }, []);

//     const handleLike = async (post) => {
//         const isLiked = liked[post.id];
//         setLiked(l => ({ ...l, [post.id]: !isLiked }));
//         setPosts(prev => prev.map(p => p.id === post.id
//             ? { ...p, likes: p.likes + (isLiked ? -1 : 1) }
//             : p));
//         try {
//             if (isLiked) await unlikePost(post.id);
//             else await likePost(post.id);
//         } catch {
//             setLiked(l => ({ ...l, [post.id]: isLiked }));
//             setPosts(prev => prev.map(p => p.id === post.id
//                 ? { ...p, likes: p.likes + (isLiked ? 1 : -1) }
//                 : p));
//         }
//     };


//     // Tap on the trash icon → open the confirm modal, don't delete yet
//     const handleDelete = (post) => setPendingDelete(post);

//     // Unsave (remove from bookmarks) — only used in saved mode.
//     // Optimistic: remove from list immediately so the user sees it disappear,
//     // then call backend. If backend fails, put the post back.
//     const handleUnsave = async (post) => {
//         const previousPosts = posts;
//         const updated = posts.filter(p => p.id !== post.id);
//         setPosts(updated);
//         onPostsChanged?.(updated);
//         try {
//             await unbookmarkPost(post.id);
//         } catch (err) {
//             console.error("Failed to unsave post", err);
//             setPosts(previousPosts);
//             onPostsChanged?.(previousPosts);
//         }
//     };

//     // Tap on the Edit button → open the composer modal pre-filled with this post's values.
//     const openEditModal = (post) => {
//         setEditText(post.content || "");
//         setEditTag(post.tag || "Cricket");
//         setEditingPost(post);
//     };

//     // Close the modal without saving anything.
//     const closeEditModal = () => {
//         setEditingPost(null);
//     };

//     // User clicked "Save Changes" inside the modal → call backend, update local list.
//     const handleSaveEdit = async () => {
//         if (!editingPost) return;
//         const trimmed = editText.trim();
//         // Frontend guard mirrors the backend's @NotBlank / @Size validation —
//         // catching it here means we never make a doomed network round-trip.
//         if (!trimmed || trimmed.length > 1000) return;

//         const id = editingPost.id;
//         const previous = posts;

//         // Optimistic update: change the card immediately so the action feels instant.
//         setPosts(prev => prev.map(p => p.id === id
//             ? { ...p, content: trimmed, tag: editTag }
//             : p));

//         setEditSaving(true);
//         try {
//             const res = await updatePost(id, {
//                 content: trimmed,
//                 tag: editTag,
//                 // Anonymous is frozen in v1 — pass the existing value through unchanged.
//                 anonymous: editingPost.anon,
//             });

//             // Replace our optimistic copy with the server's authoritative version,
//             // so fields the server touches (like updatedAt) are correct in local state.
//             const serverPost = res.data?.data;
//             if (serverPost) {
//                 setPosts(prev => prev.map(p => p.id === id
//                     ? normalizePost(serverPost)
//                     : p));
//             }

//             // Tell the parent so anything derived from the post list stays in sync.
//             onPostsChanged?.(posts.map(p => p.id === id
//                 ? { ...p, content: trimmed, tag: editTag }
//                 : p));

//             setEditingPost(null);
//         } catch (err) {
//             console.error("Failed to update post", err);
//             setPosts(previous);    // roll back the optimistic update
//             alert("Could not save your changes. Please try again.");
//         } finally {
//             setEditSaving(false);
//         }
//     };

//     // User clicked "Delete" inside the modal → actually perform the deletion
//     const confirmDelete = async () => {
//         const post = pendingDelete;
//         if (!post) return;
//         setPendingDelete(null);   // close the modal immediately

//         const previous = posts;
//         const updated = posts.filter(p => p.id !== post.id);
//         setPosts(updated);

//         try {
//             await deletePost(post.id);
//             onPostsChanged?.(updated);
//         } catch (err) {
//             console.error("Failed to delete post", err);
//             setPosts(previous);
//             alert("Could not delete the post. Please try again.");
//         }
//     };

//     const handlePost = async () => {
//         if (!postText.trim() || posting) return;
//         setPosting(true);
//         const formData = new FormData();
//         formData.append('content', postText);
//         formData.append('tag', postTag);
//         formData.append('anonymous', anon);
//         postMediaFiles.forEach(f => {
//             if (f.type.startsWith('image/')) formData.append('images', f);
//             else formData.append('videos', f);
//         });
//         try {
//             await createPost(formData);
//             setPostText(''); setPostMediaPreviews([]); setPostMediaFiles([]);
//             setComposeSliderIdx(0); setPostTag('General'); setAnon(false);
//             setShowCompose(false);
//             // Refresh the posts list
//             const user = JSON.parse(localStorage.getItem("user") || "{}");
//             if (user.id) {
//                 const res = await fetchUserPosts(user.id);
//                 const updated = (res.data.data || []).map(normalizePost);
//                 setPosts(updated);
//                 onPostsChanged?.(updated);
//             }
//         } catch (e) {
//             console.error('Failed to create post', e);
//         } finally {
//             setPosting(false);
//         }
//     };

//     const myUserId = (() => {
//         try { return JSON.parse(localStorage.getItem("user") || "{}").id || ""; }
//         catch { return ""; }
//     })();

//     return (
//         <div style={{
//             flex: 1, display: "flex", flexDirection: "column", overflow: "hidden",
//             background: "linear-gradient(135deg, #FFE0D6, #f3c7da)",
//             borderRadius: "25px 25px 0px 0px",
//         }}>
//             {/* Header bar */}
//             <div style={{
//                 display: "flex", alignItems: "center", gap: 6,
//                 padding: "8px 12px 6px", flexShrink: 0,
//             }}>
//                 <IconButton onClick={onBack} aria-label="back" sx={{ color: COLORS.text }}>
//                     <ArrowBackIcon />
//                 </IconButton>
//                 <div style={{
//                     fontFamily: "'emoji", fontWeight: 800, fontSize: 20,
//                     color: COLORS.text,
//                 }}>
//                     {isSavedMode ? "Saved Posts" : "My Posts"}
//                 </div>
//                 <div style={{
//                     marginLeft: "auto",
//                     fontSize: 12, color: COLORS.muted,
//                     fontFamily: "'DM Sans', sans-serif",
//                 }}>
//                     {isSavedMode
//                         ? `${posts.length} saved`
//                         : `${posts.length} ${posts.length === 1 ? "post" : "posts"}`}
//                 </div>
//             </div>

//             {/* Scrollable list */}
//             <div style={{ flex: 1, overflowY: "auto", padding: "8px 14px 0", scrollbarWidth: "none" }}>

//                 {loading && posts.length === 0 && (
//                     <div style={{ textAlign: "center", padding: "40px 20px" }}>
//                         <div style={{ fontSize: 24, marginBottom: 8 }}>⏳</div>
//                         <div style={{ color: COLORS.muted, fontSize: 13, fontFamily: "'DM Sans', sans-serif" }}>
//                             Loading your posts…
//                         </div>
//                     </div>
//                 )}

//                 {!loading && error && (
//                     <div style={{ textAlign: "center", padding: "40px 20px" }}>
//                         <div style={{ fontSize: 32, marginBottom: 8 }}>⚠️</div>
//                         <div style={{ color: COLORS.muted, fontSize: 13, fontFamily: "'DM Sans', sans-serif" }}>
//                             {error}
//                         </div>
//                     </div>
//                 )}

//                 {!loading && !error && posts.length === 0 && (
//                     <div style={{ textAlign: "center", padding: "40px 20px" }}>
//                         <div style={{ fontSize: 40, marginBottom: 10 }}>{isSavedMode ? "📌" : "📝"}</div>
//                         <div style={{ fontWeight: 700, color: COLORS.text, fontFamily: "'Syne', sans-serif", fontSize: 16, marginBottom: 6 }}>
//                             {isSavedMode ? "No saved posts yet" : "You haven't posted yet"}
//                         </div>
//                         <div style={{ color: COLORS.muted, fontSize: 13, fontFamily: "'DM Sans', sans-serif", marginBottom: 20 }}>
//                             {isSavedMode
//                                 ? "Tap the bookmark icon on any post to save it for later."
//                                 : "Share something with your colleagues!"}
//                         </div>
//                         {!isSavedMode && (
//                             <button
//                                 onClick={() => setShowCompose(true)}
//                                 style={{
//                                     background: "linear-gradient(135deg, rgb(41, 27, 95), rgba(108, 99, 255, 0.85))",
//                                     color: "white", border: "none", borderRadius: 14,
//                                     padding: "12px 28px", fontSize: 14, fontWeight: 700,
//                                     cursor: "pointer", fontFamily: "'DM Sans', sans-serif",
//                                     boxShadow: "0 6px 20px rgba(108,99,255,0.35)",
//                                     display: "inline-flex", alignItems: "center", gap: 8,
//                                 }}
//                             >
//                                 <span style={{ fontSize: 16 }}>✦</span> Add Your First Post
//                             </button>
//                         )}
//                     </div>
//                 )}

//                 {posts.map(post => {
//                     const tColor = TAG_COLORS[post.tag] || COLORS.primary;
//                     const isUpcoming = post.eventStatus === "upcoming";
//                     const isHappened = post.eventStatus === "happened";

//                     return (
//                         <div key={post.id} style={{
//                             backgroundColor: "#f9f7f7", borderRadius: 20, marginBottom: 14, overflow: "hidden",
//                             border: `1.5px solid ${COLORS.border}`,
//                             boxShadow: "0 2px 14px rgba(108,99,255,0.07)",
//                         }}>
//                             {/* Image / video / colored placeholder */}
//                             <div style={{
//                                 position: "relative", width: "100%",
//                                 height: post.video ? "auto" : 180,
//                                 overflow: "hidden",
//                             }}>
//                                 {post.video ? (
//                                     <video src={post.video} controls playsInline
//                                         style={{ width: "100%", maxHeight: 320, objectFit: "cover", display: "block", background: "#000" }} />
//                                 ) : post.image ? (
//                                     <img src={post.image} alt={post.tag}
//                                         style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
//                                 ) : (
//                                     <div style={{ width: "100%", height: "100%", background: tColor }} />
//                                 )}
//                                 {(isUpcoming || isHappened) && (
//                                     <div style={{
//                                         position: "absolute", bottom: 10, right: 10,
//                                         background: isUpcoming ? COLORS.primary : "#1A1A2E",
//                                         color: "white", borderRadius: 10, padding: "5px 10px",
//                                         fontSize: 10, fontWeight: 700, fontFamily: "'DM Sans', sans-serif",
//                                         display: "flex", alignItems: "center", gap: 4,
//                                         boxShadow: "0 2px 8px rgba(0,0,0,0.3)",
//                                     }}>
//                                         {isUpcoming ? "⏰" : "✅"} {isUpcoming ? "UPCOMING" : "HAPPENED"}
//                                     </div>
//                                 )}
//                             </div>

//                             {/* Event meta */}
//                             {(isUpcoming || isHappened) && post.eventDate && (
//                                 <div style={{
//                                     background: isUpcoming ? `${tColor}12` : "#F8F9FA",
//                                     borderBottom: `1px solid ${COLORS.border}`,
//                                     padding: "8px 14px",
//                                     display: "flex", gap: 14, flexWrap: "wrap",
//                                 }}>
//                                     <span style={{ fontSize: 11, color: tColor, fontWeight: 700, fontFamily: "'DM Sans', sans-serif", display: "flex", alignItems: "center", gap: 4 }}>
//                                         📅 {post.eventDate}
//                                     </span>
//                                     {post.eventLocation && (
//                                         <span style={{ fontSize: 11, color: COLORS.muted, fontFamily: "'DM Sans', sans-serif", display: "flex", alignItems: "center", gap: 4 }}>
//                                             📍 {post.eventLocation}
//                                         </span>
//                                     )}
//                                 </div>
//                             )}

//                             {/* Body */}
//                             <div style={{ padding: "12px 14px", backgroundColor: "#f7f0f0" }}>
//                                 <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
//                                     <Avatar
//                                         initials={post.avatar}
//                                         color={post.color}
//                                         size={36}
//                                         image={!post.anon && post.userId === myUserId ? profilePic : null}
//                                     />
//                                     <div style={{ flex: 1 }}>
//                                         <div style={{ fontWeight: 700, fontSize: 13, color: COLORS.text, fontFamily: "'DM Sans', sans-serif", display: "flex", alignItems: "center", gap: 6 }}>
//                                             {post.user}
//                                             {post.anon && (
//                                                 <span style={{
//                                                     fontSize: 10, background: "#F0F4FF", color: COLORS.muted,
//                                                     borderRadius: 6, padding: "2px 6px",
//                                                 }}>Anon</span>
//                                             )}
//                                         </div>
//                                         <div style={{ fontSize: 11, color: COLORS.muted, fontFamily: "'DM Sans', sans-serif" }}>
//                                             {post.time}
//                                         </div>
//                                     </div>
//                                     <span style={{
//                                         fontSize: 10, fontWeight: 700, color: tColor,
//                                         background: `${tColor}15`, borderRadius: 8, padding: "3px 8px",
//                                         fontFamily: "'DM Sans', sans-serif",
//                                     }}>#{post.tag}</span>
//                                 </div>

//                                 <p style={{ margin: "0 0 12px", fontSize: 13, color: COLORS.text, lineHeight: 1.6, fontFamily: "'DM Sans', sans-serif" }}>
//                                     {post.content}
//                                 </p>

//                                 {/* Action bar */}
//                                 <div style={{
//                                     display: "flex", gap: 0, paddingTop: 10,
//                                     borderTop: `1px solid ${COLORS.border}`,
//                                 }}>
//                                     <button onClick={() => handleLike(post)} style={{
//                                         flex: 1, border: "none", background: "none", cursor: "pointer",
//                                         display: "flex", alignItems: "center", justifyContent: "center", gap: 5,
//                                         color: liked[post.id] ? COLORS.secondary : COLORS.muted,
//                                         fontSize: 12, fontFamily: "'DM Sans', sans-serif", fontWeight: 600, padding: "4px 0",
//                                     }}>
//                                         <span style={{ fontSize: 15 }}>{liked[post.id] ? "❤️" : "🤍"}</span>
//                                         {post.likes}
//                                     </button>
//                                     <button style={{
//                                         flex: 1, border: "none", background: "none", cursor: "pointer",
//                                         display: "flex", alignItems: "center", justifyContent: "center", gap: 5,
//                                         color: COLORS.muted, fontSize: 12, fontFamily: "'DM Sans', sans-serif", fontWeight: 600, padding: "4px 0",
//                                     }}>
//                                         <span style={{ fontSize: 15 }}>💬</span>{post.replies}
//                                     </button>
//                                     {!isSavedMode && (
//                                         <>
//                                             <button onClick={() => openEditModal(post)} style={{
//                                                 flex: 1, border: "none", background: "none", cursor: "pointer",
//                                                 display: "flex", alignItems: "center", justifyContent: "center", gap: 5,
//                                                 color: COLORS.primary, fontSize: 12, fontFamily: "'DM Sans', sans-serif", fontWeight: 600, padding: "4px 0",
//                                             }}>
//                                                 <span style={{ fontSize: 15 }}>✏️</span>Edit
//                                             </button>

//                                             <button onClick={() => handleDelete(post)} style={{
//                                                 flex: 1, border: "none", background: "none", cursor: "pointer",
//                                                 display: "flex", alignItems: "center", justifyContent: "center", gap: 5,
//                                                 color: "#E74C3C",
//                                                 fontSize: 12, fontFamily: "'DM Sans', sans-serif", fontWeight: 600, padding: "4px 0",
//                                             }}>
//                                                 <span style={{ fontSize: 15 }}>🗑️</span>Delete
//                                             </button>
//                                         </>
//                                     )}

//                                     {isSavedMode && (
//                                         <button onClick={() => handleUnsave(post)} style={{
//                                             flex: 1, border: "none", background: "none", cursor: "pointer",
//                                             display: "flex", alignItems: "center", justifyContent: "center", gap: 5,
//                                             color: COLORS.primary,
//                                             fontSize: 12, fontFamily: "'DM Sans', sans-serif", fontWeight: 600, padding: "4px 0",
//                                         }}>
//                                             <span style={{ fontSize: 15 }}>🔖</span>Unsave
//                                         </button>
//                                     )}

//                                 </div>
//                             </div>
//                         </div>
//                     );
//                 })}
//                 <div style={{ height: 16 }} />
//             </div>

//             {/* Delete confirmation modal */}
//             {pendingDelete && (
//                 <div
//                     onClick={() => setPendingDelete(null)}
//                     style={{
//                         position: "absolute", inset: 0,
//                         background: "rgba(0,0,0,0.45)",
//                         display: "flex", alignItems: "center", justifyContent: "center",
//                         zIndex: 100, padding: 24,
//                     }}
//                 >
//                     <div
//                         onClick={(e) => e.stopPropagation()}
//                         style={{
//                             background: "#fff",
//                             borderRadius: 20,
//                             padding: "22px 22px 16px",
//                             width: "100%",
//                             maxWidth: 320,
//                             boxShadow: "0 10px 40px rgba(0,0,0,0.25)",
//                             fontFamily: "'DM Sans', sans-serif",
//                         }}
//                     >
//                         <div style={{
//                             fontFamily: "'Syne', sans-serif",
//                             fontWeight: 800,
//                             fontSize: 18,
//                             color: COLORS.text,
//                             marginBottom: 8,
//                         }}>
//                             Delete this post?
//                         </div>
//                         <div style={{
//                             fontSize: 13,
//                             color: COLORS.muted,
//                             lineHeight: 1.5,
//                             marginBottom: 20,
//                         }}>
//                             This can't be undone. The post and all its likes and replies will be removed.
//                         </div>
//                         <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
//                             <button
//                                 onClick={() => setPendingDelete(null)}
//                                 style={{
//                                     border: `1.5px solid ${COLORS.border}`,
//                                     background: "transparent",
//                                     color: COLORS.text,
//                                     borderRadius: 12,
//                                     padding: "8px 16px",
//                                     fontSize: 13,
//                                     fontWeight: 700,
//                                     fontFamily: "'DM Sans', sans-serif",
//                                     cursor: "pointer",
//                                 }}
//                             >
//                                 Cancel
//                             </button>
//                             <button
//                                 onClick={confirmDelete}
//                                 style={{
//                                     border: "none",
//                                     background: "#E74C3C",
//                                     color: "#fff",
//                                     borderRadius: 12,
//                                     padding: "8px 18px",
//                                     fontSize: 13,
//                                     fontWeight: 700,
//                                     fontFamily: "'DM Sans', sans-serif",
//                                     cursor: "pointer",
//                                     boxShadow: "0 4px 12px rgba(231,76,60,0.35)",
//                                 }}
//                             >
//                                 Delete
//                             </button>
//                         </div>
//                     </div>
//                 </div>
//             )}

//             {/* Edit-post modal — composer-style overlay, same visual feel as the new-post modal on FeedScreen */}
//             {editingPost && (
//                 <div
//                     onClick={editSaving ? undefined : closeEditModal}
//                     style={{
//                         position: "absolute", inset: 0,
//                         background: "rgba(0,0,0,0.45)",
//                         display: "flex", alignItems: "flex-end", justifyContent: "center",
//                         zIndex: 100,
//                     }}
//                 >
//                     <div
//                         onClick={(e) => e.stopPropagation()}
//                         style={{
//                             background: "#fff",
//                             borderRadius: "24px 24px 0 0",
//                             padding: "16px 18px 18px",
//                             width: "100%",
//                             maxHeight: "92%",
//                             overflowY: "auto",
//                             boxShadow: "0 -10px 40px rgba(0,0,0,0.25)",
//                             fontFamily: "'DM Sans', sans-serif",
//                             scrollbarWidth: "none",
//                         }}
//                     >
//                         {/* Header row: Cancel — Title — Save */}
//                         <div style={{
//                             display: "flex", alignItems: "center", marginBottom: 12,
//                         }}>
//                             <button
//                                 onClick={closeEditModal}
//                                 disabled={editSaving}
//                                 style={{
//                                     border: "none", background: "none",
//                                     fontSize: 13, fontWeight: 700,
//                                     color: COLORS.muted,
//                                     fontFamily: "'DM Sans', sans-serif",
//                                     cursor: editSaving ? "default" : "pointer",
//                                     padding: "4px 6px",
//                                 }}
//                             >
//                                 Cancel
//                             </button>
//                             <div style={{
//                                 flex: 1, textAlign: "center",
//                                 fontFamily: "'Syne', sans-serif",
//                                 fontWeight: 800, fontSize: 17,
//                                 color: COLORS.text,
//                             }}>
//                                 Edit Post
//                             </div>
//                             <button
//                                 onClick={handleSaveEdit}
//                                 disabled={
//                                     editSaving ||
//                                     !editText.trim() ||
//                                     editText.length > 1000
//                                 }
//                                 style={{
//                                     border: "none",
//                                     background: (editSaving || !editText.trim() || editText.length > 1000)
//                                         ? "#CBD5E1"
//                                         : COLORS.primary,
//                                     color: "#fff",
//                                     borderRadius: 12,
//                                     padding: "8px 14px",
//                                     fontSize: 12,
//                                     fontWeight: 700,
//                                     fontFamily: "'DM Sans', sans-serif",
//                                     cursor: (editSaving || !editText.trim() || editText.length > 1000)
//                                         ? "not-allowed"
//                                         : "pointer",
//                                 }}
//                             >
//                                 {editSaving ? "Saving…" : "Save"}
//                             </button>
//                         </div>

//                         {/* Existing media — shown read-only (v1 doesn't allow media edits) */}
//                         {(editingPost.image || editingPost.video) && (
//                             <div style={{
//                                 width: "100%",
//                                 borderRadius: 14,
//                                 overflow: "hidden",
//                                 marginBottom: 12,
//                                 maxHeight: 200,
//                                 background: "#000",
//                             }}>
//                                 {editingPost.video ? (
//                                     <video
//                                         src={editingPost.video}
//                                         controls
//                                         playsInline
//                                         style={{
//                                             width: "100%", maxHeight: 200,
//                                             objectFit: "cover", display: "block",
//                                         }}
//                                     />
//                                 ) : (
//                                     <img
//                                         src={editingPost.image}
//                                         alt={editingPost.tag}
//                                         style={{
//                                             width: "100%", maxHeight: 200,
//                                             objectFit: "cover", display: "block",
//                                         }}
//                                     />
//                                 )}
//                             </div>
//                         )}

//                         {/* Textarea */}
//                         <textarea
//                             value={editText}
//                             onChange={(e) => setEditText(e.target.value)}
//                             placeholder="What's on your mind?"
//                             disabled={editSaving}
//                             style={{
//                                 width: "100%",
//                                 minHeight: 120,
//                                 resize: "none",
//                                 border: `1.5px solid ${COLORS.border}`,
//                                 borderRadius: 14,
//                                 padding: "12px 14px",
//                                 fontSize: 14,
//                                 fontFamily: "'DM Sans', sans-serif",
//                                 color: COLORS.text,
//                                 outline: "none",
//                                 boxSizing: "border-box",
//                                 background: "#FAFAFC",
//                             }}
//                         />

//                         {/* Character counter — gray normally, orange near limit, red over limit */}
//                         <div style={{
//                             textAlign: "right",
//                             fontSize: 11,
//                             fontWeight: 600,
//                             color: editText.length > 1000
//                                 ? "#E74C3C"
//                                 : editText.length > 900
//                                     ? "#F59E0B"
//                                     : COLORS.muted,
//                             fontFamily: "'DM Sans', sans-serif",
//                             marginTop: 6,
//                             marginBottom: 14,
//                         }}>
//                             {editText.length}/1000
//                         </div>

//                         {/* Tag chips */}
//                         <div style={{
//                             fontSize: 12, fontWeight: 700,
//                             color: COLORS.muted,
//                             marginBottom: 8,
//                             fontFamily: "'DM Sans', sans-serif",
//                         }}>
//                             TAG
//                         </div>
//                         <div style={{
//                             display: "flex", flexWrap: "wrap", gap: 8,
//                             marginBottom: 4,
//                         }}>
//                             {FEED_TABS
//                                 .filter(t => t.id !== "All")
//                                 .map(t => {
//                                     const selected = editTag === t.id;
//                                     const tColor = TAG_COLORS[t.id] || COLORS.primary;
//                                     return (
//                                         <button
//                                             key={t.id}
//                                             onClick={() => setEditTag(t.id)}
//                                             disabled={editSaving}
//                                             style={{
//                                                 border: selected
//                                                     ? `1.5px solid ${tColor}`
//                                                     : `1.5px solid ${COLORS.border}`,
//                                                 background: selected ? `${tColor}18` : "#fff",
//                                                 color: selected ? tColor : COLORS.text,
//                                                 borderRadius: 999,
//                                                 padding: "6px 12px",
//                                                 fontSize: 12,
//                                                 fontWeight: 700,
//                                                 fontFamily: "'DM Sans', sans-serif",
//                                                 cursor: editSaving ? "default" : "pointer",
//                                             }}
//                                         >
//                                             #{t.id}
//                                         </button>
//                                     );
//                                 })}
//                         </div>
//                     </div>
//                 </div>
//             )}
//             {/* Compose (new post) modal — identical to FeedScreen's compose modal */}
//             {/* {showCompose && (
//                 <div
//                     style={{
//                         position: "absolute", inset: 0,
//                         background: "rgba(26,26,46,0.55)", zIndex: 200,
//                         display: "flex", alignItems: "flex-end",
//                     }}
//                     onClick={() => { if (!posting) setShowCompose(false); }}
//                 >
//                     <div
//                         onClick={e => e.stopPropagation()}
//                         style={{
//                             background: "white", borderRadius: "24px 24px 0 0",
//                             padding: "20px 20px 30px", width: "100%", boxSizing: "border-box",
//                         }}
//                     >
//                         <div style={{ width: 36, height: 4, borderRadius: 2, background: COLORS.border, margin: "0 auto 16px" }} />
//                         <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
//                             <div style={{ fontSize: 16, fontWeight: 800, fontFamily: "'DM Sans', sans-serif", color: COLORS.text }}>New Post</div>
//                             <input
//                                 ref={fileInputRef}
//                                 type="file"
//                                 accept="image/*,video/*"
//                                 multiple
//                                 style={{ display: "none" }}
//                                 onChange={e => {
//                                     const files = Array.from(e.target.files);
//                                     const previews = files.map(f => ({ type: f.type.startsWith('video/') ? 'video' : 'image', src: URL.createObjectURL(f) }));
//                                     setPostMediaFiles(prev => [...prev, ...files]);
//                                     setPostMediaPreviews(prev => [...prev, ...previews]);
//                                     setComposeSliderIdx(0);
//                                     e.target.value = '';
//                                 }}
//                             />
//                             <button
//                                 onClick={() => fileInputRef.current.click()}
//                                 style={{
//                                     background: postMediaPreviews.length > 0 ? `${COLORS.primary}15` : "#F4F4F8",
//                                     border: `1.5px solid ${postMediaPreviews.length > 0 ? COLORS.primary : COLORS.border}`,
//                                     borderRadius: 20, padding: "6px 14px", cursor: "pointer",
//                                     fontSize: 13, fontWeight: 600,
//                                     color: postMediaPreviews.length > 0 ? COLORS.primary : COLORS.muted,
//                                     fontFamily: "'DM Sans', sans-serif",
//                                     display: "flex", alignItems: "center", gap: 6,
//                                 }}
//                             >
//                                 <span style={{ fontSize: 16 }}>📷</span>
//                                 <span style={{ fontSize: 11 }}>{postMediaPreviews.length > 0 ? `${postMediaPreviews.length} added ✓` : "Photo/Video"}</span>
//                             </button>
//                         </div>

//                         {postMediaPreviews.length > 0 && (
//                             <div style={{ position: "relative", marginBottom: 12, borderRadius: 12, overflow: "hidden" }}>
//                                 {postMediaPreviews[composeSliderIdx].type === "video" ? (
//                                     <video src={postMediaPreviews[composeSliderIdx].src} controls playsInline
//                                         style={{ width: "100%", maxHeight: 180, background: "#000", display: "block" }} />
//                                 ) : (
//                                     <img src={postMediaPreviews[composeSliderIdx].src} alt="preview"
//                                         style={{ width: "100%", height: 140, objectFit: "cover", display: "block" }} />
//                                 )}
//                                 <button
//                                     onClick={() => {
//                                         const newPreviews = postMediaPreviews.filter((_, i) => i !== composeSliderIdx);
//                                         const newFiles = postMediaFiles.filter((_, i) => i !== composeSliderIdx);
//                                         setPostMediaPreviews(newPreviews);
//                                         setPostMediaFiles(newFiles);
//                                         setComposeSliderIdx(Math.min(composeSliderIdx, newPreviews.length - 1));
//                                     }}
//                                     style={{
//                                         position: "absolute", top: 6, right: 6,
//                                         background: "rgba(0,0,0,0.55)", border: "none", borderRadius: "50%",
//                                         width: 24, height: 24, cursor: "pointer", color: "white", fontSize: 12,
//                                         display: "flex", alignItems: "center", justifyContent: "center",
//                                     }}>&#x2715;</button>
//                                 {postMediaPreviews.length > 1 && (
//                                     <>
//                                         {composeSliderIdx > 0 && (
//                                             <button onClick={() => setComposeSliderIdx(i => i - 1)} style={{
//                                                 position: "absolute", left: 6, top: "50%", transform: "translateY(-50%)",
//                                                 background: "rgba(0,0,0,0.45)", border: "none", borderRadius: "50%",
//                                                 width: 26, height: 26, color: "white", fontSize: 14, cursor: "pointer",
//                                                 display: "flex", alignItems: "center", justifyContent: "center",
//                                             }}>&#8249;</button>
//                                         )}
//                                         {composeSliderIdx < postMediaPreviews.length - 1 && (
//                                             <button onClick={() => setComposeSliderIdx(i => i + 1)} style={{
//                                                 position: "absolute", right: 32, top: "50%", transform: "translateY(-50%)",
//                                                 background: "rgba(0,0,0,0.45)", border: "none", borderRadius: "50%",
//                                                 width: 26, height: 26, color: "white", fontSize: 14, cursor: "pointer",
//                                                 display: "flex", alignItems: "center", justifyContent: "center",
//                                             }}>&#8250;</button>
//                                         )}
//                                         <div style={{ position: "absolute", bottom: 6, left: "50%", transform: "translateX(-50%)", display: "flex", gap: 4 }}>
//                                             {postMediaPreviews.map((_, i) => (
//                                                 <div key={i} onClick={() => setComposeSliderIdx(i)} style={{
//                                                     width: i === composeSliderIdx ? 14 : 5, height: 5, borderRadius: 3,
//                                                     background: i === composeSliderIdx ? "white" : "rgba(255,255,255,0.5)",
//                                                     cursor: "pointer", transition: "all 0.2s",
//                                                 }} />
//                                             ))}
//                                         </div>
//                                     </>
//                                 )}
//                             </div> */}
//                         {/* )} */}

//                         {/* <div style={{ display: "flex", gap: 10, marginBottom: 12, alignItems: "flex-start" }}>
//                             <Avatar alt='VK' color={'#a7aebf'} online backgroundColor='white' image={avatarDinosaur} />
//                             <textarea
//                                 value={postText}
//                                 onChange={e => setPostText(e.target.value)}
//                                 placeholder="What's on your mind? Plan a game, share an interest..."
//                                 style={{
//                                     flex: 1, border: `1.5px solid ${COLORS.border}`, borderRadius: 12,
//                                     padding: 12, fontSize: 13, fontFamily: "'DM Sans', sans-serif",
//                                     resize: "none", minHeight: 80, color: COLORS.text, outline: "none",
//                                 }}
//                             />
//                         </div>

//                         <div style={{ display: "flex", gap: 8, overflowX: "auto", paddingBottom: 8, marginBottom: 12, scrollbarWidth: "none" }}>
//                             {FEED_TABS.slice(1).map(t => {
//                                 const isSelected = postTag === t.id;
//                                 const tColor = TAG_COLORS[t.id] || COLORS.primary;
//                                 return (
//                                     <span key={t.id} onClick={() => setPostTag(t.id)} style={{
//                                         padding: "5px 12px", borderRadius: 20,
//                                         background: isSelected ? tColor : `${tColor}18`,
//                                         color: isSelected ? "white" : tColor,
//                                         fontSize: 11, fontWeight: 700, cursor: "pointer",
//                                         fontFamily: "'DM Sans', sans-serif",
//                                         border: `1.5px solid ${isSelected ? tColor : "transparent"}`,
//                                         whiteSpace: "nowrap", flexShrink: 0,
//                                     }}>#{t.id}</span>
//                                 );
//                             })}
//                         </div>

//                         <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
//                             <div style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer" }} onClick={() => setAnon(!anon)}>
//                                 <div style={{
//                                     width: 36, height: 20, borderRadius: 10,
//                                     background: anon ? COLORS.primary : COLORS.border,
//                                     position: "relative", transition: "background 0.2s",
//                                 }}>
//                                     <div style={{
//                                         width: 16, height: 16, borderRadius: "50%", background: "white",
//                                         position: "absolute", top: 2, left: anon ? 18 : 2, transition: "left 0.2s",
//                                         boxShadow: "0 1px 4px rgba(0,0,0,0.2)",
//                                     }} />
//                                 </div>
//                                 <span style={{ fontSize: 12, color: COLORS.muted, fontFamily: "'DM Sans', sans-serif" }}>Post anonymously</span>
//                             </div>
//                             <button
//                                 onClick={handlePost}
//                                 disabled={!postText.trim() || posting}
//                                 style={{
//                                     background: (!postText.trim() || posting) ? COLORS.border : COLORS.primary,
//                                     color: (!postText.trim() || posting) ? COLORS.muted : "white",
//                                     border: "none", borderRadius: 12, padding: "10px 22px",
//                                     fontWeight: 700, fontSize: 13, cursor: (!postText.trim() || posting) ? "not-allowed" : "pointer",
//                                     fontFamily: "'DM Sans', sans-serif",
//                                     boxShadow: (!postText.trim() || posting) ? "none" : `0 4px 14px ${COLORS.primary}44`,
//                                 }}
//                             >
//                                 {posting ? "Posting…" : "Share ❆"}
//                             </button>
//                         </div>
//                     </div>
//                 </div> */}
//             {/* )} */}

//             {/* Place this component right above the final closing screen container div */}
//             <ComposeModal
//                 isOpen={showCompose}
//                 onClose={() => setShowCompose(false)}
//                 profilePic={profilePic}
//                 feedTabs={FEED_TABS} // Uses the props & constants built into this screen
//                 TAG_COLOR="rgb(173 14 130)"  // Fallback styling indicator theme color
//                 onPostSuccess={async () => {
//                     // Automatically re-fetch user posts to clear out the empty state page!
//                     const user = JSON.parse(localStorage.getItem("user") || "{}");
//                     if (user.id) {
//                         setLoading(true);
//                         try {
//                             const res = await fetchUserPosts(user.id);
//                             const updated = (res.data.data || []).map(normalizePost);
//                             setPosts(updated);
//                             onPostsChanged?.(updated);
//                         } catch (err) {
//                             console.error("Failed to auto-refresh user posts:", err);
//                         } finally {
//                             setLoading(false);
//                         }
//                     }
//                 }}
//             />
//         </div>
//     );
// }




// update by pritam
import React, { useState, useEffect, useRef } from "react";
import IconButton from "@mui/material/IconButton";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import Avatar from "../../components/Avatar";
import { COLORS, FEED_TABS } from "../../constants";
import avatarDinosaur from '../../images/avatarDinosaur.png';
import ComposeModal from "../../screens/app/ComposeModal";
import {
    fetchUserPosts,
    fetchUserBookmarks,
    likePost,
    unlikePost,
    deletePost,
    updatePost,
    createPost,
    unbookmarkPost,
} from "../../services/feedService";

const TAG_COLORS = {
    Cricket: "#6C63FF", Movies: "#FF6584", Travel: "#43E97B",
    Running: "#FF6584", Cycling: "#38BDF8", Chess: "#FFB347",
    Gaming: "#6C63FF", Photography: "#43E97B", Music: "#FF6584",
    Cooking: "#FFB347", Yoga: "#38BDF8", General: "#8892B0",
};

const normalizePost = (p) => ({
    ...p,
    user: p.anonymous ? "Anonymous" : p.displayName,
    avatar: p.anonymous ? "?" : p.avatar,
    color: p.anonymous ? COLORS.muted : p.avatarColor,
    time: new Date(p.createdAt).toLocaleString(),
    likes: p.likeCount,
    replies: p.replyCount,
    anon: p.anonymous,
    image: p.imageDataList?.[0] || null,
    video: p.videoDataList?.[0] || null,
});

export default function MyPostsScreen({ initialPosts, onPostsChanged, onBack, profilePic, mode = "own", savedCount = 0, onViewSaved }) {
    const isSavedMode = mode === "saved";
    const [posts, setPosts] = useState(() => (initialPosts || []).map(normalizePost));
    const [liked, setLiked] = useState(() => {
        const m = {};
        (initialPosts || []).forEach(p => { m[p.id] = p.likedByMe; });
        return m;
    });
    const [bookmarked, setBookmarked] = useState(() => {
        const m = {};
        (initialPosts || []).forEach(p => { m[p.id] = p.bookmarkedByMe; });
        return m;
    });
    const [loading, setLoading] = useState(!initialPosts || initialPosts.length === 0);
    const [error, setError] = useState(null);
    const [pendingDelete, setPendingDelete] = useState(null);

    // Edit-modal state. `editingPost` doubles as the "is the modal open?" flag:
    // null = closed, a post object = open and editing that post.
    const [editingPost, setEditingPost] = useState(null);
    const [editText, setEditText] = useState("");
    const [editTag, setEditTag] = useState("Cricket");
    const [editSaving, setEditSaving] = useState(false);

    // Compose (new post) modal state
    const [showCompose, setShowCompose] = useState(false);
    const [postText, setPostText] = useState("");
    const [postTag, setPostTag] = useState("General");
    const [anon, setAnon] = useState(false);
    const [postMediaPreviews, setPostMediaPreviews] = useState([]);
    const [postMediaFiles, setPostMediaFiles] = useState([]);
    const [composeSliderIdx, setComposeSliderIdx] = useState(0);
    const [posting, setPosting] = useState(false);
    const fileInputRef = useRef(null);

    useEffect(() => {
        // Own-mode posts are kept in sync via onPostsChanged (create/edit/delete all
        // call it), so it's safe to skip an extra fetch if the parent already has data.
        // Saved mode, however, can go stale: a post might get bookmarked elsewhere
        // (e.g. the main Feed) after ProfileScreen's one-time fetch ran, so we always
        // refetch fresh from the backend whenever this screen is entered in saved mode.
        if (!isSavedMode && initialPosts && initialPosts.length > 0) return;

        const user = JSON.parse(localStorage.getItem("user") || "{}");
        if (!user.id) {
            setError("No logged-in user");
            setLoading(false);
            return;
        }
        setLoading(true);
        const fetcher = isSavedMode ? fetchUserBookmarks : fetchUserPosts;
        fetcher(user.id)
            .then(res => {
                const raw = res.data.data || [];
                const normalized = raw.map(normalizePost);
                setPosts(normalized);
                const lMap = {}, bMap = {};
                normalized.forEach(p => {
                    lMap[p.id] = p.likedByMe;
                    bMap[p.id] = p.bookmarkedByMe;
                });
                setLiked(lMap);
                setBookmarked(bMap);
            })
            .catch(err => {
                console.error(isSavedMode ? "Failed to load saved posts" : "Failed to load my posts", err);
                setError(isSavedMode ? "Couldn't load your saved posts" : "Couldn't load your posts");
            })
            .finally(() => setLoading(false));
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handleLike = async (post) => {
        const isLiked = liked[post.id];
        setLiked(l => ({ ...l, [post.id]: !isLiked }));
        setPosts(prev => prev.map(p => p.id === post.id
            ? { ...p, likes: p.likes + (isLiked ? -1 : 1) }
            : p));
        try {
            if (isLiked) await unlikePost(post.id);
            else await likePost(post.id);
        } catch {
            setLiked(l => ({ ...l, [post.id]: isLiked }));
            setPosts(prev => prev.map(p => p.id === post.id
                ? { ...p, likes: p.likes + (isLiked ? 1 : -1) }
                : p));
        }
    };


    // Tap on the trash icon → open the confirm modal, don't delete yet
    const handleDelete = (post) => setPendingDelete(post);

    // Unsave (remove from bookmarks) — only used in saved mode.
    // Optimistic: remove from list immediately so the user sees it disappear,
    // then call backend. If backend fails, put the post back.
    const handleUnsave = async (post) => {
        const previousPosts = posts;
        const updated = posts.filter(p => p.id !== post.id);
        setPosts(updated);
        onPostsChanged?.(updated);
        try {
            await unbookmarkPost(post.id);
        } catch (err) {
            console.error("Failed to unsave post", err);
            setPosts(previousPosts);
            onPostsChanged?.(previousPosts);
        }
    };

    // Tap on the Edit button → open the composer modal pre-filled with this post's values.
    const openEditModal = (post) => {
        setEditText(post.content || "");
        setEditTag(post.tag || "Cricket");
        setEditingPost(post);
    };

    // Close the modal without saving anything.
    const closeEditModal = () => {
        setEditingPost(null);
    };

    // User clicked "Save Changes" inside the modal → call backend, update local list.
    const handleSaveEdit = async () => {
        if (!editingPost) return;
        const trimmed = editText.trim();
        // Frontend guard mirrors the backend's @NotBlank / @Size validation —
        // catching it here means we never make a doomed network round-trip.
        if (!trimmed || trimmed.length > 1000) return;

        const id = editingPost.id;
        const previous = posts;

        // Optimistic update: change the card immediately so the action feels instant.
        setPosts(prev => prev.map(p => p.id === id
            ? { ...p, content: trimmed, tag: editTag }
            : p));

        setEditSaving(true);
        try {
            const res = await updatePost(id, {
                content: trimmed,
                tag: editTag,
                // Anonymous is frozen in v1 — pass the existing value through unchanged.
                anonymous: editingPost.anon,
            });

            // Replace our optimistic copy with the server's authoritative version,
            // so fields the server touches (like updatedAt) are correct in local state.
            const serverPost = res.data?.data;
            if (serverPost) {
                setPosts(prev => prev.map(p => p.id === id
                    ? normalizePost(serverPost)
                    : p));
            }

            // Tell the parent so anything derived from the post list stays in sync.
            onPostsChanged?.(posts.map(p => p.id === id
                ? { ...p, content: trimmed, tag: editTag }
                : p));

            setEditingPost(null);
        } catch (err) {
            console.error("Failed to update post", err);
            setPosts(previous);    // roll back the optimistic update
            alert("Could not save your changes. Please try again.");
        } finally {
            setEditSaving(false);
        }
    };

    // User clicked "Delete" inside the modal → actually perform the deletion
    const confirmDelete = async () => {
        const post = pendingDelete;
        if (!post) return;
        setPendingDelete(null);   // close the modal immediately

        const previous = posts;
        const updated = posts.filter(p => p.id !== post.id);
        setPosts(updated);

        try {
            await deletePost(post.id);
            onPostsChanged?.(updated);
        } catch (err) {
            console.error("Failed to delete post", err);
            setPosts(previous);
            alert("Could not delete the post. Please try again.");
        }
    };

    const handlePost = async () => {
        if (!postText.trim() || posting) return;
        setPosting(true);
        const formData = new FormData();
        formData.append('content', postText);
        formData.append('tag', postTag);
        formData.append('anonymous', anon);
        postMediaFiles.forEach(f => {
            if (f.type.startsWith('image/')) formData.append('images', f);
            else formData.append('videos', f);
        });
        try {
            await createPost(formData);
            setPostText(''); setPostMediaPreviews([]); setPostMediaFiles([]);
            setComposeSliderIdx(0); setPostTag('General'); setAnon(false);
            setShowCompose(false);
            // Refresh the posts list
            const user = JSON.parse(localStorage.getItem("user") || "{}");
            if (user.id) {
                const res = await fetchUserPosts(user.id);
                const updated = (res.data.data || []).map(normalizePost);
                setPosts(updated);
                onPostsChanged?.(updated);
            }
        } catch (e) {
            console.error('Failed to create post', e);
        } finally {
            setPosting(false);
        }
    };

    const myUserId = (() => {
        try { return JSON.parse(localStorage.getItem("user") || "{}").id || ""; }
        catch { return ""; }
    })();

    return (
        <div style={{
            flex: 1, display: "flex", flexDirection: "column", overflow: "hidden",
            background: "linear-gradient(135deg, #FFE0D6, #f3c7da)",
            borderRadius: "25px 25px 0px 0px",
        }}>
            {/* Header bar */}
            <div style={{
                display: "flex", alignItems: "center", gap: 6,
                padding: "8px 12px 6px", flexShrink: 0,
            }}>
                <IconButton onClick={onBack} aria-label="back" sx={{ color: COLORS.text }}>
                    <ArrowBackIcon />
                </IconButton>
                <div style={{
                    fontFamily: "'emoji", fontWeight: 800, fontSize: 20,
                    color: COLORS.text,
                }}>
                    {isSavedMode ? "Saved Posts" : "My Posts"}
                </div>
                <div style={{
                    marginLeft: "auto",
                    fontSize: 12, color: COLORS.muted,
                    fontFamily: "'DM Sans', sans-serif",
                }}>
                    {isSavedMode
                        ? `${posts.length} saved`
                        : `${posts.length} ${posts.length === 1 ? "post" : "posts"}`}
                </div>
            </div>

            {/* "Saved Posts" link — moved here from the profile stats row. Own-mode only. */}
            {!isSavedMode && onViewSaved && (
                <div style={{ padding: "0 14px 10px", flexShrink: 0 }}>
                    <button
                        onClick={onViewSaved}
                        style={{
                            display: "flex", alignItems: "center", gap: 8,
                            width: "100%", textAlign: "left",
                            background: "#f9f0f0", border: `1.5px solid ${COLORS.border}`,
                            borderRadius: 14, padding: "10px 14px",
                            cursor: "pointer", fontFamily: "'DM Sans', sans-serif",
                        }}
                    >
                        <span style={{ fontSize: 16 }}>🔖</span>
                        <span style={{ flex: 1, fontSize: 13, fontWeight: 700, color: COLORS.text }}>
                            Saved Posts
                        </span>
                        <span style={{ fontSize: 12, color: COLORS.muted, fontWeight: 600 }}>
                            {savedCount} ›
                        </span>
                    </button>
                </div>
            )}

            {/* Scrollable list */}
            <div style={{ flex: 1, overflowY: "auto", padding: "8px 14px 0", scrollbarWidth: "none" }}>

                {loading && posts.length === 0 && (
                    <div style={{ textAlign: "center", padding: "40px 20px" }}>
                        <div style={{ fontSize: 24, marginBottom: 8 }}>⏳</div>
                        <div style={{ color: COLORS.muted, fontSize: 13, fontFamily: "'DM Sans', sans-serif" }}>
                            Loading your posts…
                        </div>
                    </div>
                )}

                {!loading && error && (
                    <div style={{ textAlign: "center", padding: "40px 20px" }}>
                        <div style={{ fontSize: 32, marginBottom: 8 }}>⚠️</div>
                        <div style={{ color: COLORS.muted, fontSize: 13, fontFamily: "'DM Sans', sans-serif" }}>
                            {error}
                        </div>
                    </div>
                )}

                {!loading && !error && posts.length === 0 && (
                    <div style={{ textAlign: "center", padding: "40px 20px" }}>
                        <div style={{ fontSize: 40, marginBottom: 10 }}>{isSavedMode ? "📌" : "📝"}</div>
                        <div style={{ fontWeight: 700, color: COLORS.text, fontFamily: "'Syne', sans-serif", fontSize: 16, marginBottom: 6 }}>
                            {isSavedMode ? "No saved posts yet" : "You haven't posted yet"}
                        </div>
                        <div style={{ color: COLORS.muted, fontSize: 13, fontFamily: "'DM Sans', sans-serif", marginBottom: 20 }}>
                            {isSavedMode
                                ? "Tap the bookmark icon on any post to save it for later."
                                : "Share something with your colleagues!"}
                        </div>
                        {!isSavedMode && (
                            <button
                                onClick={() => setShowCompose(true)}
                                style={{
                                    background: "linear-gradient(135deg, rgb(41, 27, 95), rgba(108, 99, 255, 0.85))",
                                    color: "white", border: "none", borderRadius: 14,
                                    padding: "12px 28px", fontSize: 14, fontWeight: 700,
                                    cursor: "pointer", fontFamily: "'DM Sans', sans-serif",
                                    boxShadow: "0 6px 20px rgba(108,99,255,0.35)",
                                    display: "inline-flex", alignItems: "center", gap: 8,
                                }}
                            >
                                <span style={{ fontSize: 16 }}>✦</span> Add Your First Post
                            </button>
                        )}
                    </div>
                )}

                {posts.map(post => {
                    const tColor = TAG_COLORS[post.tag] || COLORS.primary;
                    const isUpcoming = post.eventStatus === "upcoming";
                    const isHappened = post.eventStatus === "happened";

                    return (
                        <div key={post.id} style={{
                            backgroundColor: "#f9f7f7", borderRadius: 20, marginBottom: 14, overflow: "hidden",
                            border: `1.5px solid ${COLORS.border}`,
                            boxShadow: "0 2px 14px rgba(108,99,255,0.07)",
                        }}>
                            {/* Image / video / colored placeholder */}
                            <div style={{
                                position: "relative", width: "100%",
                                height: post.video ? "auto" : 180,
                                overflow: "hidden",
                            }}>
                                {post.video ? (
                                    <video src={post.video} controls playsInline
                                        style={{ width: "100%", maxHeight: 320, objectFit: "cover", display: "block", background: "#000" }} />
                                ) : post.image ? (
                                    <img src={post.image} alt={post.tag}
                                        style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
                                ) : (
                                    <div style={{ width: "100%", height: "100%", background: tColor }} />
                                )}
                                {(isUpcoming || isHappened) && (
                                    <div style={{
                                        position: "absolute", bottom: 10, right: 10,
                                        background: isUpcoming ? COLORS.primary : "#1A1A2E",
                                        color: "white", borderRadius: 10, padding: "5px 10px",
                                        fontSize: 10, fontWeight: 700, fontFamily: "'DM Sans', sans-serif",
                                        display: "flex", alignItems: "center", gap: 4,
                                        boxShadow: "0 2px 8px rgba(0,0,0,0.3)",
                                    }}>
                                        {isUpcoming ? "⏰" : "✅"} {isUpcoming ? "UPCOMING" : "HAPPENED"}
                                    </div>
                                )}
                            </div>

                            {/* Event meta */}
                            {(isUpcoming || isHappened) && post.eventDate && (
                                <div style={{
                                    background: isUpcoming ? `${tColor}12` : "#F8F9FA",
                                    borderBottom: `1px solid ${COLORS.border}`,
                                    padding: "8px 14px",
                                    display: "flex", gap: 14, flexWrap: "wrap",
                                }}>
                                    <span style={{ fontSize: 11, color: tColor, fontWeight: 700, fontFamily: "'DM Sans', sans-serif", display: "flex", alignItems: "center", gap: 4 }}>
                                        📅 {post.eventDate}
                                    </span>
                                    {post.eventLocation && (
                                        <span style={{ fontSize: 11, color: COLORS.muted, fontFamily: "'DM Sans', sans-serif", display: "flex", alignItems: "center", gap: 4 }}>
                                            📍 {post.eventLocation}
                                        </span>
                                    )}
                                </div>
                            )}

                            {/* Body */}
                            <div style={{ padding: "12px 14px", backgroundColor: "#f7f0f0" }}>
                                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
                                    <Avatar
                                        initials={post.avatar}
                                        color={post.color}
                                        size={36}
                                        image={!post.anon && post.userId === myUserId ? profilePic : null}
                                    />
                                    <div style={{ flex: 1 }}>
                                        <div style={{ fontWeight: 700, fontSize: 13, color: COLORS.text, fontFamily: "'DM Sans', sans-serif", display: "flex", alignItems: "center", gap: 6 }}>
                                            {post.user}
                                            {post.anon && (
                                                <span style={{
                                                    fontSize: 10, background: "#F0F4FF", color: COLORS.muted,
                                                    borderRadius: 6, padding: "2px 6px",
                                                }}>Anon</span>
                                            )}
                                        </div>
                                        <div style={{ fontSize: 11, color: COLORS.muted, fontFamily: "'DM Sans', sans-serif" }}>
                                            {post.time}
                                        </div>
                                    </div>
                                    <span style={{
                                        fontSize: 10, fontWeight: 700, color: tColor,
                                        background: `${tColor}15`, borderRadius: 8, padding: "3px 8px",
                                        fontFamily: "'DM Sans', sans-serif",
                                    }}>#{post.tag}</span>
                                </div>

                                <p style={{ margin: "0 0 12px", fontSize: 13, color: COLORS.text, lineHeight: 1.6, fontFamily: "'DM Sans', sans-serif" }}>
                                    {post.content}
                                </p>

                                {/* Action bar */}
                                <div style={{
                                    display: "flex", gap: 0, paddingTop: 10,
                                    borderTop: `1px solid ${COLORS.border}`,
                                }}>
                                    <button onClick={() => handleLike(post)} style={{
                                        flex: 1, border: "none", background: "none", cursor: "pointer",
                                        display: "flex", alignItems: "center", justifyContent: "center", gap: 5,
                                        color: liked[post.id] ? COLORS.secondary : COLORS.muted,
                                        fontSize: 12, fontFamily: "'DM Sans', sans-serif", fontWeight: 600, padding: "4px 0",
                                    }}>
                                        <span style={{ fontSize: 15 }}>{liked[post.id] ? "❤️" : "🤍"}</span>
                                        {post.likes}
                                    </button>
                                    <button style={{
                                        flex: 1, border: "none", background: "none", cursor: "pointer",
                                        display: "flex", alignItems: "center", justifyContent: "center", gap: 5,
                                        color: COLORS.muted, fontSize: 12, fontFamily: "'DM Sans', sans-serif", fontWeight: 600, padding: "4px 0",
                                    }}>
                                        <span style={{ fontSize: 15 }}>💬</span>{post.replies}
                                    </button>
                                    {!isSavedMode && (
                                        <>
                                            <button onClick={() => openEditModal(post)} style={{
                                                flex: 1, border: "none", background: "none", cursor: "pointer",
                                                display: "flex", alignItems: "center", justifyContent: "center", gap: 5,
                                                color: COLORS.primary, fontSize: 12, fontFamily: "'DM Sans', sans-serif", fontWeight: 600, padding: "4px 0",
                                            }}>
                                                <span style={{ fontSize: 15 }}>✏️</span>Edit
                                            </button>

                                            <button onClick={() => handleDelete(post)} style={{
                                                flex: 1, border: "none", background: "none", cursor: "pointer",
                                                display: "flex", alignItems: "center", justifyContent: "center", gap: 5,
                                                color: "#E74C3C",
                                                fontSize: 12, fontFamily: "'DM Sans', sans-serif", fontWeight: 600, padding: "4px 0",
                                            }}>
                                                <span style={{ fontSize: 15 }}>🗑️</span>Delete
                                            </button>
                                        </>
                                    )}

                                    {isSavedMode && (
                                        <button onClick={() => handleUnsave(post)} style={{
                                            flex: 1, border: "none", background: "none", cursor: "pointer",
                                            display: "flex", alignItems: "center", justifyContent: "center", gap: 5,
                                            color: COLORS.primary,
                                            fontSize: 12, fontFamily: "'DM Sans', sans-serif", fontWeight: 600, padding: "4px 0",
                                        }}>
                                            <span style={{ fontSize: 15 }}>🔖</span>Unsave
                                        </button>
                                    )}

                                </div>
                            </div>
                        </div>
                    );
                })}
                <div style={{ height: 16 }} />
            </div>

            {/* Delete confirmation modal */}
            {pendingDelete && (
                <div
                    onClick={() => setPendingDelete(null)}
                    style={{
                        position: "absolute", inset: 0,
                        background: "rgba(0,0,0,0.45)",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        zIndex: 100, padding: 24,
                    }}
                >
                    <div
                        onClick={(e) => e.stopPropagation()}
                        style={{
                            background: "#fff",
                            borderRadius: 20,
                            padding: "22px 22px 16px",
                            width: "100%",
                            maxWidth: 320,
                            boxShadow: "0 10px 40px rgba(0,0,0,0.25)",
                            fontFamily: "'DM Sans', sans-serif",
                        }}
                    >
                        <div style={{
                            fontFamily: "'Syne', sans-serif",
                            fontWeight: 800,
                            fontSize: 18,
                            color: COLORS.text,
                            marginBottom: 8,
                        }}>
                            Delete this post?
                        </div>
                        <div style={{
                            fontSize: 13,
                            color: COLORS.muted,
                            lineHeight: 1.5,
                            marginBottom: 20,
                        }}>
                            This can't be undone. The post and all its likes and replies will be removed.
                        </div>
                        <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
                            <button
                                onClick={() => setPendingDelete(null)}
                                style={{
                                    border: `1.5px solid ${COLORS.border}`,
                                    background: "transparent",
                                    color: COLORS.text,
                                    borderRadius: 12,
                                    padding: "8px 16px",
                                    fontSize: 13,
                                    fontWeight: 700,
                                    fontFamily: "'DM Sans', sans-serif",
                                    cursor: "pointer",
                                }}
                            >
                                Cancel
                            </button>
                            <button
                                onClick={confirmDelete}
                                style={{
                                    border: "none",
                                    background: "#E74C3C",
                                    color: "#fff",
                                    borderRadius: 12,
                                    padding: "8px 18px",
                                    fontSize: 13,
                                    fontWeight: 700,
                                    fontFamily: "'DM Sans', sans-serif",
                                    cursor: "pointer",
                                    boxShadow: "0 4px 12px rgba(231,76,60,0.35)",
                                }}
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Edit-post modal — composer-style overlay, same visual feel as the new-post modal on FeedScreen */}
            {editingPost && (
                <div
                    onClick={editSaving ? undefined : closeEditModal}
                    style={{
                        position: "absolute", inset: 0,
                        background: "rgba(0,0,0,0.45)",
                        display: "flex", alignItems: "flex-end", justifyContent: "center",
                        zIndex: 100,
                    }}
                >
                    <div
                        onClick={(e) => e.stopPropagation()}
                        style={{
                            background: "#fff",
                            borderRadius: "24px 24px 0 0",
                            padding: "16px 18px 18px",
                            width: "100%",
                            maxHeight: "92%",
                            overflowY: "auto",
                            boxShadow: "0 -10px 40px rgba(0,0,0,0.25)",
                            fontFamily: "'DM Sans', sans-serif",
                            scrollbarWidth: "none",
                        }}
                    >
                        {/* Header row: Cancel — Title — Save */}
                        <div style={{
                            display: "flex", alignItems: "center", marginBottom: 12,
                        }}>
                            <button
                                onClick={closeEditModal}
                                disabled={editSaving}
                                style={{
                                    border: "none", background: "none",
                                    fontSize: 13, fontWeight: 700,
                                    color: COLORS.muted,
                                    fontFamily: "'DM Sans', sans-serif",
                                    cursor: editSaving ? "default" : "pointer",
                                    padding: "4px 6px",
                                }}
                            >
                                Cancel
                            </button>
                            <div style={{
                                flex: 1, textAlign: "center",
                                fontFamily: "'Syne', sans-serif",
                                fontWeight: 800, fontSize: 17,
                                color: COLORS.text,
                            }}>
                                Edit Post
                            </div>
                            <button
                                onClick={handleSaveEdit}
                                disabled={
                                    editSaving ||
                                    !editText.trim() ||
                                    editText.length > 1000
                                }
                                style={{
                                    border: "none",
                                    background: (editSaving || !editText.trim() || editText.length > 1000)
                                        ? "#CBD5E1"
                                        : COLORS.primary,
                                    color: "#fff",
                                    borderRadius: 12,
                                    padding: "8px 14px",
                                    fontSize: 12,
                                    fontWeight: 700,
                                    fontFamily: "'DM Sans', sans-serif",
                                    cursor: (editSaving || !editText.trim() || editText.length > 1000)
                                        ? "not-allowed"
                                        : "pointer",
                                }}
                            >
                                {editSaving ? "Saving…" : "Save"}
                            </button>
                        </div>

                        {/* Existing media — shown read-only (v1 doesn't allow media edits) */}
                        {(editingPost.image || editingPost.video) && (
                            <div style={{
                                width: "100%",
                                borderRadius: 14,
                                overflow: "hidden",
                                marginBottom: 12,
                                maxHeight: 200,
                                background: "#000",
                            }}>
                                {editingPost.video ? (
                                    <video
                                        src={editingPost.video}
                                        controls
                                        playsInline
                                        style={{
                                            width: "100%", maxHeight: 200,
                                            objectFit: "cover", display: "block",
                                        }}
                                    />
                                ) : (
                                    <img
                                        src={editingPost.image}
                                        alt={editingPost.tag}
                                        style={{
                                            width: "100%", maxHeight: 200,
                                            objectFit: "cover", display: "block",
                                        }}
                                    />
                                )}
                            </div>
                        )}

                        {/* Textarea */}
                        <textarea
                            value={editText}
                            onChange={(e) => setEditText(e.target.value)}
                            placeholder="What's on your mind?"
                            disabled={editSaving}
                            style={{
                                width: "100%",
                                minHeight: 120,
                                resize: "none",
                                border: `1.5px solid ${COLORS.border}`,
                                borderRadius: 14,
                                padding: "12px 14px",
                                fontSize: 14,
                                fontFamily: "'DM Sans', sans-serif",
                                color: COLORS.text,
                                outline: "none",
                                boxSizing: "border-box",
                                background: "#FAFAFC",
                            }}
                        />

                        {/* Character counter — gray normally, orange near limit, red over limit */}
                        <div style={{
                            textAlign: "right",
                            fontSize: 11,
                            fontWeight: 600,
                            color: editText.length > 1000
                                ? "#E74C3C"
                                : editText.length > 900
                                    ? "#F59E0B"
                                    : COLORS.muted,
                            fontFamily: "'DM Sans', sans-serif",
                            marginTop: 6,
                            marginBottom: 14,
                        }}>
                            {editText.length}/1000
                        </div>

                        {/* Tag chips */}
                        <div style={{
                            fontSize: 12, fontWeight: 700,
                            color: COLORS.muted,
                            marginBottom: 8,
                            fontFamily: "'DM Sans', sans-serif",
                        }}>
                            TAG
                        </div>
                        <div style={{
                            display: "flex", flexWrap: "wrap", gap: 8,
                            marginBottom: 4,
                        }}>
                            {FEED_TABS
                                .filter(t => t.id !== "All")
                                .map(t => {
                                    const selected = editTag === t.id;
                                    const tColor = TAG_COLORS[t.id] || COLORS.primary;
                                    return (
                                        <button
                                            key={t.id}
                                            onClick={() => setEditTag(t.id)}
                                            disabled={editSaving}
                                            style={{
                                                border: selected
                                                    ? `1.5px solid ${tColor}`
                                                    : `1.5px solid ${COLORS.border}`,
                                                background: selected ? `${tColor}18` : "#fff",
                                                color: selected ? tColor : COLORS.text,
                                                borderRadius: 999,
                                                padding: "6px 12px",
                                                fontSize: 12,
                                                fontWeight: 700,
                                                fontFamily: "'DM Sans', sans-serif",
                                                cursor: editSaving ? "default" : "pointer",
                                            }}
                                        >
                                            #{t.id}
                                        </button>
                                    );
                                })}
                        </div>
                    </div>
                </div>
            )}
            {/* Compose (new post) modal — identical to FeedScreen's compose modal */}
            {/* {showCompose && (
                <div
                    style={{
                        position: "absolute", inset: 0,
                        background: "rgba(26,26,46,0.55)", zIndex: 200,
                        display: "flex", alignItems: "flex-end",
                    }}
                    onClick={() => { if (!posting) setShowCompose(false); }}
                >
                    <div
                        onClick={e => e.stopPropagation()}
                        style={{
                            background: "white", borderRadius: "24px 24px 0 0",
                            padding: "20px 20px 30px", width: "100%", boxSizing: "border-box",
                        }}
                    >
                        <div style={{ width: 36, height: 4, borderRadius: 2, background: COLORS.border, margin: "0 auto 16px" }} />
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
                            <div style={{ fontSize: 16, fontWeight: 800, fontFamily: "'DM Sans', sans-serif", color: COLORS.text }}>New Post</div>
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept="image/*,video/*"
                                multiple
                                style={{ display: "none" }}
                                onChange={e => {
                                    const files = Array.from(e.target.files);
                                    const previews = files.map(f => ({ type: f.type.startsWith('video/') ? 'video' : 'image', src: URL.createObjectURL(f) }));
                                    setPostMediaFiles(prev => [...prev, ...files]);
                                    setPostMediaPreviews(prev => [...prev, ...previews]);
                                    setComposeSliderIdx(0);
                                    e.target.value = '';
                                }}
                            />
                            <button
                                onClick={() => fileInputRef.current.click()}
                                style={{
                                    background: postMediaPreviews.length > 0 ? `${COLORS.primary}15` : "#F4F4F8",
                                    border: `1.5px solid ${postMediaPreviews.length > 0 ? COLORS.primary : COLORS.border}`,
                                    borderRadius: 20, padding: "6px 14px", cursor: "pointer",
                                    fontSize: 13, fontWeight: 600,
                                    color: postMediaPreviews.length > 0 ? COLORS.primary : COLORS.muted,
                                    fontFamily: "'DM Sans', sans-serif",
                                    display: "flex", alignItems: "center", gap: 6,
                                }}
                            >
                                <span style={{ fontSize: 16 }}>📷</span>
                                <span style={{ fontSize: 11 }}>{postMediaPreviews.length > 0 ? `${postMediaPreviews.length} added ✓` : "Photo/Video"}</span>
                            </button>
                        </div>

                        {postMediaPreviews.length > 0 && (
                            <div style={{ position: "relative", marginBottom: 12, borderRadius: 12, overflow: "hidden" }}>
                                {postMediaPreviews[composeSliderIdx].type === "video" ? (
                                    <video src={postMediaPreviews[composeSliderIdx].src} controls playsInline
                                        style={{ width: "100%", maxHeight: 180, background: "#000", display: "block" }} />
                                ) : (
                                    <img src={postMediaPreviews[composeSliderIdx].src} alt="preview"
                                        style={{ width: "100%", height: 140, objectFit: "cover", display: "block" }} />
                                )}
                                <button
                                    onClick={() => {
                                        const newPreviews = postMediaPreviews.filter((_, i) => i !== composeSliderIdx);
                                        const newFiles = postMediaFiles.filter((_, i) => i !== composeSliderIdx);
                                        setPostMediaPreviews(newPreviews);
                                        setPostMediaFiles(newFiles);
                                        setComposeSliderIdx(Math.min(composeSliderIdx, newPreviews.length - 1));
                                    }}
                                    style={{
                                        position: "absolute", top: 6, right: 6,
                                        background: "rgba(0,0,0,0.55)", border: "none", borderRadius: "50%",
                                        width: 24, height: 24, cursor: "pointer", color: "white", fontSize: 12,
                                        display: "flex", alignItems: "center", justifyContent: "center",
                                    }}>&#x2715;</button>
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
                                    </>
                                )}
                            </div> */}
                        {/* )} */}

                        {/* <div style={{ display: "flex", gap: 10, marginBottom: 12, alignItems: "flex-start" }}>
                            <Avatar alt='VK' color={'#a7aebf'} online backgroundColor='white' image={avatarDinosaur} />
                            <textarea
                                value={postText}
                                onChange={e => setPostText(e.target.value)}
                                placeholder="What's on your mind? Plan a game, share an interest..."
                                style={{
                                    flex: 1, border: `1.5px solid ${COLORS.border}`, borderRadius: 12,
                                    padding: 12, fontSize: 13, fontFamily: "'DM Sans', sans-serif",
                                    resize: "none", minHeight: 80, color: COLORS.text, outline: "none",
                                }}
                            />
                        </div>

                        <div style={{ display: "flex", gap: 8, overflowX: "auto", paddingBottom: 8, marginBottom: 12, scrollbarWidth: "none" }}>
                            {FEED_TABS.slice(1).map(t => {
                                const isSelected = postTag === t.id;
                                const tColor = TAG_COLORS[t.id] || COLORS.primary;
                                return (
                                    <span key={t.id} onClick={() => setPostTag(t.id)} style={{
                                        padding: "5px 12px", borderRadius: 20,
                                        background: isSelected ? tColor : `${tColor}18`,
                                        color: isSelected ? "white" : tColor,
                                        fontSize: 11, fontWeight: 700, cursor: "pointer",
                                        fontFamily: "'DM Sans', sans-serif",
                                        border: `1.5px solid ${isSelected ? tColor : "transparent"}`,
                                        whiteSpace: "nowrap", flexShrink: 0,
                                    }}>#{t.id}</span>
                                );
                            })}
                        </div>

                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer" }} onClick={() => setAnon(!anon)}>
                                <div style={{
                                    width: 36, height: 20, borderRadius: 10,
                                    background: anon ? COLORS.primary : COLORS.border,
                                    position: "relative", transition: "background 0.2s",
                                }}>
                                    <div style={{
                                        width: 16, height: 16, borderRadius: "50%", background: "white",
                                        position: "absolute", top: 2, left: anon ? 18 : 2, transition: "left 0.2s",
                                        boxShadow: "0 1px 4px rgba(0,0,0,0.2)",
                                    }} />
                                </div>
                                <span style={{ fontSize: 12, color: COLORS.muted, fontFamily: "'DM Sans', sans-serif" }}>Post anonymously</span>
                            </div>
                            <button
                                onClick={handlePost}
                                disabled={!postText.trim() || posting}
                                style={{
                                    background: (!postText.trim() || posting) ? COLORS.border : COLORS.primary,
                                    color: (!postText.trim() || posting) ? COLORS.muted : "white",
                                    border: "none", borderRadius: 12, padding: "10px 22px",
                                    fontWeight: 700, fontSize: 13, cursor: (!postText.trim() || posting) ? "not-allowed" : "pointer",
                                    fontFamily: "'DM Sans', sans-serif",
                                    boxShadow: (!postText.trim() || posting) ? "none" : `0 4px 14px ${COLORS.primary}44`,
                                }}
                            >
                                {posting ? "Posting…" : "Share ❆"}
                            </button>
                        </div>
                    </div>
                </div> */}
            {/* )} */}

            {/* Place this component right above the final closing screen container div */}
            <ComposeModal
                isOpen={showCompose}
                onClose={() => setShowCompose(false)}
                profilePic={profilePic}
                feedTabs={FEED_TABS} // Uses the props & constants built into this screen
                TAG_COLOR="rgb(173 14 130)"  // Fallback styling indicator theme color
                onPostSuccess={async () => {
                    // Automatically re-fetch user posts to clear out the empty state page!
                    const user = JSON.parse(localStorage.getItem("user") || "{}");
                    if (user.id) {
                        setLoading(true);
                        try {
                            const res = await fetchUserPosts(user.id);
                            const updated = (res.data.data || []).map(normalizePost);
                            setPosts(updated);
                            onPostsChanged?.(updated);
                        } catch (err) {
                            console.error("Failed to auto-refresh user posts:", err);
                        } finally {
                            setLoading(false);
                        }
                    }
                }}
            />
        </div>
    );
}