import React, { useState, useRef } from "react";
import Avatar from "./../../components/Avatar";
import { COLORS } from "../../constants";
import { createPost } from "../../services/feedService";
import avatarDinosaur from '../../images/avatarDinosaur.png';

export default function ComposeModal({ isOpen, onClose, onPostSuccess, profilePic, feedTabs, TAG_COLOR }) {
    // ─── Localized States for the Post Form ───────────────────────────────
    const [postText, setPostText] = useState("");
    const [postTag, setPostTag] = useState("");
    const [anon, setAnon] = useState(false);
    const [postMediaPreviews, setPostMediaPreviews] = useState([]);
    const [postMediaFiles, setPostMediaFiles] = useState([]);
    const [composeSliderIdx, setComposeSliderIdx] = useState(0);
    const [validationError, setValidationError] = useState("");
    const [posting, setPosting] = useState(false);
    const fileInputRef = useRef(null);

    // Guard: Don't render anything if the modal shouldn't be open
    if (!isOpen) return null;

    // ─── Submit Action Logic handler ──────────────────────────────────────
    const handlePost = async () => {
        if (!postTag || postTag.trim() === "") {
            setValidationError("Please select a tag/topic before sharing your post!");
            return;
        }
        if (!postText || postText.trim() === "") {
            setValidationError("Please enter some content before sharing your post!");
            return;
        }
        
        // Validation check for mandatory photo/video upload
        if (!postMediaFiles || postMediaFiles.length === 0) {
            setValidationError("Please attach at least one photo or video before sharing your post!");
            return;
        }

        setValidationError("");
        setPosting(true);

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
            // Reset local component variables on success
            setPostText(""); 
            setPostMediaPreviews([]); 
            setPostMediaFiles([]);
            setComposeSliderIdx(0); 
            setPostTag(""); 
            setAnon(false);
            setValidationError("");
            
            if (onPostSuccess) onPostSuccess(); // Trigger parent database reload/refresh
            onClose(); // Shut the layout frame view
        } catch (e) {
            console.error("Failed to create post", e);
            setValidationError("Failed to share post. Please try again.");
        } finally {
            setPosting(false);
        }
    };

    return (
        <div style={{
            position: "absolute", inset: 0, background: "rgba(26,26,46,0.55)",
            zIndex: 200, display: "flex", alignItems: "flex-end",
        }} onClick={() => { if (!posting) onClose(); }}>
            
            <div onClick={e => e.stopPropagation()} style={{
                background: "rgba(254, 244, 255, 0.93)", borderRadius: "24px 24px 0 0",
                padding: "20px 20px 30px", width: "100%", boxSizing: "border-box",
            }}>
                {/* Drag Indicator handle */}
                <div style={{ width: 36, height: 4, borderRadius: 2, background: COLORS.border, margin: "0 auto 16px" }} />

                {/* Header view area */}
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
                    <div style={{ fontSize: 16, fontWeight: 800, fontFamily: "'DM Sans', sans-serif", color: COLORS.text }}>New Post</div>
                    
                    <input ref={fileInputRef} type="file" accept="image/*,video/*" multiple style={{ display: "none" }}
                        onChange={e => {
                            const files = Array.from(e.target.files);
                            const previews = files.map(f => ({ type: f.type.startsWith("video/") ? "video" : "image", src: URL.createObjectURL(f) }));
                            setPostMediaFiles(prev => [...prev, ...files]);
                            setPostMediaPreviews(prev => [...prev, ...previews]);
                            setComposeSliderIdx(0); e.target.value = "";
                        }} 
                    />
                    
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

                {/* Media preview panel carousel viewport layout */}
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

                {/* Text Content Input layout panel */}
                <div style={{ display: "flex", gap: 10, marginBottom: 12, alignItems: "flex-start" }}>
                    <Avatar alt="VK" color={"#a7aebf"} online backgroundColor="white" image={profilePic || avatarDinosaur} />
                    <textarea value={postText} onChange={e => setPostText(e.target.value)}
                        placeholder="What's on your mind? Plan a game, share an interest..."
                        disabled={posting}
                        style={{
                            flex: 1, border: `1.5px solid ${COLORS.border}`, borderRadius: 12,
                            padding: 12, fontSize: 13, fontFamily: "'DM Sans', sans-serif",
                            resize: "none", minHeight: 80, color: COLORS.text, outline: "none",
                        }} 
                    />
                </div>

                {/* Form Logic Validation Error Container */}
                {validationError && (
                    <div style={{
                        background: "#FFE5E5", color: "#D32F2F", padding: "10px 14px", borderRadius: "12px",
                        marginBottom: "12px", fontSize: "12px", fontFamily: "'DM Sans', sans-serif",
                        fontWeight: 600, display: "flex", alignItems: "center", gap: 6
                    }}>
                        ⚠ {validationError}
                    </div>
                )}

                {/* Tag Selection Row Options */}
                <div style={{ display: "flex", gap: 8, overflowX: "auto", paddingBottom: 8, marginBottom: 12, scrollbarWidth: "none" }}>
                    {feedTabs.slice(1).map(t => {
                        const isSelected = postTag === t.id;
                        return (
                            <span key={t.id} onClick={() => { if (!posting) setPostTag(prev => prev === t.id ? "" : t.id); }} 
                                style={{
                                    padding: "6px 14px", borderRadius: 20,
                                    background: isSelected ? TAG_COLOR : "rgba(244, 244, 248, 0.8)",
                                    color: isSelected ? "white" : TAG_COLOR,
                                    fontSize: 11, fontWeight: 700, cursor: posting ? "not-allowed" : "pointer",
                                    fontFamily: "'DM Sans', sans-serif", border: `1.5px solid ${TAG_COLOR}`,
                                    transition: "all 0.15s ease", whiteSpace: "nowrap", flexShrink: 0,
                                }}
                            >
                                #{t.id}
                            </span>
                        );
                    })}
                </div>

                {/* Bottom Toggle Control Panel Bar actions */}
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, cursor: posting ? "not-allowed" : "pointer" }}
                        onClick={() => { if (!posting) setAnon(!anon); }}>
                        <div style={{ width: 36, height: 20, borderRadius: 10, background: anon ? COLORS.primary : COLORS.border, position: "relative", transition: "background 0.2s" }}>
                            <div style={{ width: 16, height: 16, borderRadius: "50%", background: "white", position: "absolute", top: 2, left: anon ? 18 : 2, transition: "left 0.2s", boxShadow: "0 1px 4px rgba(0,0,0,0.2)" }} />
                        </div>
                        <span style={{ fontSize: 12, color: COLORS.muted, fontFamily: "'DM Sans', sans-serif" }}>Post anonymously</span>
                    </div>
                    
                     <button onClick={handlePost} disabled={posting} style={{
                        background: posting ? COLORS.border : "linear-gradient(135deg, rgb(41, 27, 95), rgba(108, 99, 255, 0.8))", 
                        color: posting ? COLORS.muted : "white", 
                        border: "none", borderRadius: 12, padding: "10px 22px", 
                        fontWeight: 700, fontSize: 13, cursor: posting ? "not-allowed" : "pointer",
                        fontFamily: "'DM Sans', sans-serif", 
                        boxShadow: posting ? "none" : `0 4px 14px ${COLORS.primary}44`,
                    }}>
                        {posting ? "Posting…" : "Share ✦"}
                    </button>
                </div>
            </div>
        </div>
    );
}