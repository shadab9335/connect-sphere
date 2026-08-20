// import React, { useState, useEffect } from "react";
// import Avatar from "../../components/Avatar";
// import { COLORS } from "../../constants";
// import { getReplies, addReply } from "../../services/feedService";

// export default function CommentModal({ isOpen, onClose, postId, currentProfilePic, onCommentAdded }) {
//     const [replies, setReplies] = useState([]);
//     const [commentText, setCommentText] = useState("");
//     const [isAnon, setIsAnon] = useState(false);
//     const [loading, setLoading] = useState(false);
//     const [submitting, setSubmitting] = useState(false);

//     useEffect(() => {
//         if (isOpen && postId) {
//             loadComments();
//         }
//     }, [isOpen, postId]);

//     const loadComments = async () => {
//         try {
//             setLoading(true);
//             const res = await getReplies(postId);
            
//             let commentsArray = [];
//             if (Array.isArray(res)) {
//                 commentsArray = res;
//             } else if (Array.isArray(res?.data)) {
//                 commentsArray = res.data;
//             } else if (Array.isArray(res?.data?.data)) {
//                 commentsArray = res.data.data;
//             } else if (Array.isArray(res?.data?.content)) {
//                 commentsArray = res.data.content;
//             }

//             setReplies(commentsArray);
//         } catch (err) {
//             console.error("Failed to load comments", err);
//             setReplies([]);
//         } finally {
//             setLoading(false);
//         }
//     };

//     const handleSendComment = async () => {
//         if (!commentText.trim()) return;
//         try {
//             setSubmitting(true);
//             await addReply(postId, commentText, isAnon);
//             setCommentText("");
//             setIsAnon(false);
//             loadComments();
//             if (onCommentAdded) onCommentAdded();
//         } catch (err) {
//             console.error("Failed to add comment", err);
//         } finally {
//             setSubmitting(false);
//         }
//     };

//     if (!isOpen) return null;

//     return (
//         /* 🛠️ FIX: Use absolute positioning matching ComposeModal */
//         <div style={{
//             position: "absolute", 
//             top: 0, 
//             left: 0, 
//             right: 0, 
//             bottom: 0, 
//             background: "rgba(26,26,46,0.55)",
//             zIndex: 250, 
//             display: "flex", 
//             alignItems: "flex-end",
//             borderRadius: "inherit" // Ensures corners don't bleed past phone borders
//         }} onClick={onClose}>
            
//             <div onClick={e => e.stopPropagation()} style={{
//                 background: "rgba(254, 244, 255, 0.98)", 
//                 borderRadius: "24px 24px 0 0",
//                 padding: "16px 20px 24px", 
//                 width: "100%", 
//                 maxHeight: "80%", 
//                 display: "flex",
//                 flexDirection: "column", 
//                 boxSizing: "border-box",
//                 boxShadow: "0 -4px 20px rgba(0,0,0,0.15)"
//             }}>
//                 {/* Drag Handle */}
//                 <div style={{ width: 36, height: 4, borderRadius: 2, background: COLORS.border || "#DDD", margin: "0 auto 12px" }} />

//                 {/* Header */}
//                 <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
//                     <div style={{ fontSize: 16, fontWeight: 800, fontFamily: "'DM Sans', sans-serif", color: COLORS.text }}>Comments</div>
//                     <button onClick={onClose} style={{ background: "none", border: "none", fontSize: 18, cursor: "pointer", color: COLORS.muted }}>✕</button>
//                 </div>

//                 {/* Comments List */}
//                 <div style={{ flex: 1, overflowY: "auto", marginBottom: 12, paddingRight: 4, scrollbarWidth: "none" }}>
//                     {loading ? (
//                         <div style={{ textAlign: "center", padding: "20px", color: COLORS.muted, fontSize: 13 }}>Loading comments...</div>
//                     ) : replies.length === 0 ? (
//                         <div style={{ textAlign: "center", padding: "30px 20px", color: COLORS.muted, fontSize: 13 }}>
//                             No comments yet. Be the first to share your thoughts!
//                         </div>
//                     ) : (
//                         replies.map(r => (
//                             <div key={r.id} style={{ display: "flex", gap: 10, marginBottom: 12, alignItems: "flex-start" }}>
//                                 <Avatar 
//                                     initials={r.anonymous ? "?" : r.avatar} 
//                                     color={r.anonymous ? "#8892B0" : r.avatarColor} 
//                                     size={32}
//                                     image={r.anonymous ? null : r.profilePicture}
//                                 />
//                                 <div style={{
//                                     background: "#FFFFFF", borderRadius: 12, padding: "10px 12px", flex: 1,
//                                     boxShadow: "0 1px 4px rgba(0,0,0,0.05)", border: `1px solid ${COLORS.border || "#EAEAEA"}`
//                                 }}>
//                                     <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 2 }}>
//                                         <span style={{ fontWeight: 700, fontSize: 12, color: COLORS.text, fontFamily: "'DM Sans', sans-serif" }}>
//                                             {r.displayName}
//                                         </span>
//                                         <span style={{ fontSize: 10, color: COLORS.muted }}>
//                                             {r.createdAt ? new Date(r.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
//                                         </span>
//                                     </div>
//                                     <div style={{ fontSize: 13, color: COLORS.text, fontFamily: "'DM Sans', sans-serif", lineHeight: 1.4 }}>
//                                         {r.content}
//                                     </div>
//                                 </div>
//                             </div>
//                         ))
//                     )}
//                 </div>

//                 {/* Input Container */}
//                 <div style={{ borderTop: `1px solid ${COLORS.border || "#EAEAEA"}`, paddingTop: 12 }}>
//                     <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 8 }}>
//                         <input 
//                             type="text" 
//                             placeholder="Write a comment..." 
//                             value={commentText} 
//                             onChange={e => setCommentText(e.target.value)}
//                             onKeyDown={e => { if (e.key === 'Enter') handleSendComment(); }}
//                             style={{
//                                 flex: 1, border: `1.5px solid ${COLORS.border || "#DDD"}`, borderRadius: 20,
//                                 padding: "10px 14px", fontSize: 13, outline: "none", fontFamily: "'DM Sans', sans-serif"
//                             }}
//                         />
//                         <button 
//                             onClick={handleSendComment}
//                             disabled={submitting || !commentText.trim()}
//                             style={{
//                                 background: (submitting || !commentText.trim()) ? (COLORS.border || "#DDD") : "linear-gradient(135deg, rgb(41, 27, 95), rgba(108, 99, 255, 0.8))",
//                                 color: "white", border: "none", borderRadius: 20, padding: "10px 18px",
//                                 fontWeight: 700, fontSize: 12, cursor: (submitting || !commentText.trim()) ? "not-allowed" : "pointer"
//                             }}
//                         >
//                             {submitting ? "..." : "Send"}
//                         </button>
//                     </div>

//                     {/* Anonymous Toggle */}
//                     <div style={{ display: "flex", alignItems: "center", gap: 6, cursor: "pointer" }} onClick={() => setIsAnon(!isAnon)}>
//                         <div style={{ width: 28, height: 16, borderRadius: 8, background: isAnon ? (COLORS.primary || "#6C63FF") : (COLORS.border || "#CCC"), position: "relative" }}>
//                             <div style={{ width: 12, height: 12, borderRadius: "50%", background: "white", position: "absolute", top: 2, left: isAnon ? 14 : 2, transition: "left 0.2s" }} />
//                         </div>
//                         <span style={{ fontSize: 11, color: COLORS.muted || "#666", fontFamily: "'DM Sans', sans-serif" }}>Comment anonymously</span>
//                     </div>
//                 </div>
//             </div>
//         </div>
//     );
// }

import React, { useState, useEffect } from "react";
import Avatar from "../../components/Avatar";
import { COLORS } from "../../constants";
import { getReplies, addReply } from "../../services/feedService";

export default function CommentModal({ isOpen, onClose, postId, currentProfilePic, onCommentAdded }) {
    const [replies, setReplies] = useState([]);
    const [commentText, setCommentText] = useState("");
    const [isAnon, setIsAnon] = useState(false);
    const [loading, setLoading] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        if (isOpen && postId) {
            loadComments();
        }
    }, [isOpen, postId]);

    const loadComments = async () => {
        try {
            setLoading(true);
            const res = await getReplies(postId);
            
            let commentsArray = [];
            if (Array.isArray(res)) {
                commentsArray = res;
            } else if (Array.isArray(res?.data)) {
                commentsArray = res.data;
            } else if (Array.isArray(res?.data?.data)) {
                commentsArray = res.data.data;
            } else if (Array.isArray(res?.data?.content)) {
                commentsArray = res.data.content;
            }

            setReplies(commentsArray);
        } catch (err) {
            console.error("Failed to load comments", err);
            setReplies([]);
        } finally {
            setLoading(false);
        }
    };

    const handleSendComment = async () => {
        if (!commentText.trim()) return;
        try {
            setSubmitting(true);
            await addReply(postId, commentText, isAnon);
            setCommentText("");
            setIsAnon(false);
            loadComments();
            if (onCommentAdded) onCommentAdded();
        } catch (err) {
            console.error("Failed to add comment", err);
        } finally {
            setSubmitting(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div style={{
            position: "absolute", 
            top: 0, 
            left: 0, 
            right: 0, 
            bottom: 0, 
            background: "rgba(26,26,46,0.55)",
            zIndex: 250, 
            display: "flex", 
            alignItems: "flex-end",
            borderRadius: "inherit"
        }} onClick={onClose}>
            
            <div onClick={e => e.stopPropagation()} style={{
                background: "rgba(254, 244, 255, 0.98)", 
                borderRadius: "24px 24px 0 0",
                padding: "16px 20px 24px", 
                width: "100%", 
                maxHeight: "80%", 
                display: "flex",
                flexDirection: "column", 
                boxSizing: "border-box",
                boxShadow: "0 -4px 20px rgba(0,0,0,0.15)"
            }}>
                {/* Drag Handle */}
                <div style={{ width: 36, height: 4, borderRadius: 2, background: COLORS.border || "#DDD", margin: "0 auto 12px" }} />

                {/* Header */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                    <div style={{ fontSize: 16, fontWeight: 800, fontFamily: "'DM Sans', sans-serif", color: COLORS.text }}>Comments</div>
                    <button onClick={onClose} style={{ background: "none", border: "none", fontSize: 18, cursor: "pointer", color: COLORS.muted }}>✕</button>
                </div>

                {/* Comments List */}
                <div style={{ flex: 1, overflowY: "auto", marginBottom: 12, paddingRight: 4, scrollbarWidth: "none" }}>
                    {loading ? (
                        <div style={{ textAlign: "center", padding: "20px", color: COLORS.muted, fontSize: 13 }}>Loading comments...</div>
                    ) : replies.length === 0 ? (
                        <div style={{ textAlign: "center", padding: "30px 20px", color: COLORS.muted, fontSize: 13 }}>
                            No comments yet. Be the first to share your thoughts!
                        </div>
                    ) : (
                        replies.map(r => {
                            // Validate profilePicture is a real Base64 image or HTTP URL
                            const rawPic = r.profilePicture;
                            const isRealUrl = rawPic && typeof rawPic === "string" && (
                                rawPic.startsWith("data:image") || 
                                rawPic.startsWith("http") || 
                                rawPic.includes("/")
                            );

                            // Only set picUrl if it's not anonymous and is a valid image string
                            const picUrl = !r.anonymous && isRealUrl ? rawPic : null;

                            return (
                                <div key={r.id || r._id} style={{ display: "flex", gap: 10, marginBottom: 12, alignItems: "flex-start" }}>
                                    <Avatar 
                                        initials={r.anonymous ? "?" : (r.avatar || (r.displayName ? r.displayName.split(" ").map(n => n[0]).join("") : "U"))} 
                                        color={r.anonymous ? "#8892B0" : (r.avatarColor || "#FF6584")} 
                                        size={32}
                                        image={picUrl}
                                        src={picUrl}
                                    />
                                    <div style={{
                                        background: "#FFFFFF", borderRadius: 12, padding: "10px 12px", flex: 1,
                                        boxShadow: "0 1px 4px rgba(0,0,0,0.05)", border: `1px solid ${COLORS.border || "#EAEAEA"}`
                                    }}>
                                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 2 }}>
                                            <span style={{ fontWeight: 700, fontSize: 12, color: COLORS.text, fontFamily: "'DM Sans', sans-serif" }}>
                                                {r.anonymous ? "Anonymous" : r.displayName}
                                            </span>
                                            <span style={{ fontSize: 10, color: COLORS.muted }}>
                                                {r.createdAt ? new Date(r.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                                            </span>
                                        </div>
                                        <div style={{ fontSize: 13, color: COLORS.text, fontFamily: "'DM Sans', sans-serif", lineHeight: 1.4 }}>
                                            {r.content}
                                        </div>
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>

                {/* Input Container */}
                <div style={{ borderTop: `1px solid ${COLORS.border || "#EAEAEA"}`, paddingTop: 12 }}>
                    <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 8 }}>
                        <input 
                            type="text" 
                            placeholder="Write a comment..." 
                            value={commentText} 
                            onChange={e => setCommentText(e.target.value)}
                            onKeyDown={e => { if (e.key === 'Enter') handleSendComment(); }}
                            style={{
                                flex: 1, border: `1.5px solid ${COLORS.border || "#DDD"}`, borderRadius: 20,
                                padding: "10px 14px", fontSize: 13, outline: "none", fontFamily: "'DM Sans', sans-serif"
                            }}
                        />
                        <button 
                            onClick={handleSendComment}
                            disabled={submitting || !commentText.trim()}
                            style={{
                                background: (submitting || !commentText.trim()) ? (COLORS.border || "#DDD") : "linear-gradient(135deg, rgb(41, 27, 95), rgba(108, 99, 255, 0.8))",
                                color: "white", border: "none", borderRadius: 20, padding: "10px 18px",
                                fontWeight: 700, fontSize: 12, cursor: (submitting || !commentText.trim()) ? "not-allowed" : "pointer"
                            }}
                        >
                            {submitting ? "..." : "Send"}
                        </button>
                    </div>

                    {/* Anonymous Toggle */}
                    <div style={{ display: "flex", alignItems: "center", gap: 6, cursor: "pointer" }} onClick={() => setIsAnon(!isAnon)}>
                        <div style={{ width: 28, height: 16, borderRadius: 8, background: isAnon ? (COLORS.primary || "#6C63FF") : (COLORS.border || "#CCC"), position: "relative" }}>
                            <div style={{ width: 12, height: 12, borderRadius: "50%", background: "white", position: "absolute", top: 2, left: isAnon ? 14 : 2, transition: "left 0.2s" }} />
                        </div>
                        <span style={{ fontSize: 11, color: COLORS.muted || "#666", fontFamily: "'DM Sans', sans-serif" }}>Comment anonymously</span>
                    </div>
                </div>
            </div>
        </div>
    );
}