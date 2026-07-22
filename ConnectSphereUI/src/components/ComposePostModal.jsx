import React, { useState, useRef } from "react";
import Avatar from "./Avatar";
import { COLORS } from "../constants";
import { createPost } from "../services/feedService";
import avatarDinosaur from '../images/avatarDinosaur.png';

const TAG_COLOR = "rgb(173 14 130)";

/**
 * Reusable compose modal.
 *
 * Props:
 *   feedTabs        — array of { id, emoji } (all tabs except "All")
 *   profilePic      — current user's profile picture (for avatar)
 *   onPostCreated   — callback(newPost) fired after a successful POST
 *   onClose         — callback fired when user dismisses the modal
 */
export default function ComposePostModal({ feedTabs, profilePic, onPostCreated, onClose }) {
    const [postText, setPostText]                   = useState("");
    const [anon, setAnon]                           = useState(false);
    const [postTag, setPostTag]                     = useState("General");
    const [postMediaPreviews, setPostMediaPreviews] = useState([]);
    const [postMediaFiles, setPostMediaFiles]       = useState([]);
    const [sliderIdx, setSliderIdx]                 = useState(0);
    const [submitting, setSubmitting]               = useState(false);
    const fileInputRef = useRef(null);

    // The tags shown in the compose modal are all interests except "All".
    const tagOptions = (feedTabs || []).filter(t => t.id !== "All");

    const handlePost = async () => {
        if (!postText.trim() || submitting) return;
        setSubmitting(true);
        const formData = new FormData();
        formData.append("content", postText);
        formData.append("tag",     postTag);
        formData.append("anonymous", anon);
        postMediaFiles.forEach(f => {
            if (f.type.startsWith("image/")) formData.append("images", f);
            else formData.append("videos", f);
        });
        try {
            const res = await createPost(formData);
            onPostCreated?.(res.data?.data);
            onClose?.();
        } catch (e) {
            console.error("Failed to create post", e);
            alert("Could not create post. Please try again.");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div
            style={{
                position: "absolute", inset: 0,
                background: "rgba(26,26,46,0.55)", zIndex: 200,
                display: "flex", alignItems: "flex-end",
            }}
            onClick={submitting ? undefined : onClose}
        >
            <div
                onClick={e => e.stopPropagation()}
                style={{
                    background: "white", borderRadius: "24px 24px 0 0",
                    padding: "20px 20px 30px", width: "100%", boxSizing: "border-box",
                }}
            >
                {/* Drag handle */}
                <div style={{ width: 36, height: 4, borderRadius: 2, background: COLORS.border, margin: "0 auto 16px" }} />

                {/* Header row */}
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
                    <div style={{ fontSize: 16, fontWeight: 800, fontFamily: "'DM Sans', sans-serif", color: COLORS.text }}>
                        New Post
                    </div>
                    <input
                        ref={fileInputRef} type="file" accept="image/*,video/*" multiple
                        style={{ display: "none" }}
                        onChange={e => {
                            const files = Array.from(e.target.files);
                            const previews = files.map(f => ({
                                type: f.type.startsWith("video/") ? "video" : "image",
                                src: URL.createObjectURL(f),
                            }));
                            setPostMediaFiles(prev => [...prev, ...files]);
                            setPostMediaPreviews(prev => [...prev, ...previews]);
                            setSliderIdx(0);
                            e.target.value = "";
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
                        <span style={{ fontSize: 11 }}>
                            {postMediaPreviews.length > 0 ? `${postMediaPreviews.length} added ✓` : "Photo/Video"}
                        </span>
                    </button>
                </div>

                {/* Media preview slider */}
                {postMediaPreviews.length > 0 && (
                    <div style={{ position: "relative", marginBottom: 12, borderRadius: 12, overflow: "hidden" }}>
                        {postMediaPreviews[sliderIdx].type === "video"
                            ? <video src={postMediaPreviews[sliderIdx].src} controls playsInline style={{ width: "100%", maxHeight: 180, background: "#000", display: "block" }} />
                            : <img src={postMediaPreviews[sliderIdx].src} alt="preview" style={{ width: "100%", height: 140, objectFit: "cover", display: "block" }} />
                        }
                        <button
                            onClick={() => {
                                const np = postMediaPreviews.filter((_, i) => i !== sliderIdx);
                                const nf = postMediaFiles.filter((_, i) => i !== sliderIdx);
                                setPostMediaPreviews(np);
                                setPostMediaFiles(nf);
                                setSliderIdx(Math.min(sliderIdx, np.length - 1));
                            }}
                            style={{
                                position: "absolute", top: 6, right: 6,
                                background: "rgba(0,0,0,0.55)", border: "none", borderRadius: "50%",
                                width: 24, height: 24, cursor: "pointer", color: "white", fontSize: 12,
                                display: "flex", alignItems: "center", justifyContent: "center",
                            }}
                        >✕</button>
                        {postMediaPreviews.length > 1 && (
                            <>
                                {sliderIdx > 0 && (
                                    <button onClick={() => setSliderIdx(i => i - 1)} style={{ position: "absolute", left: 6, top: "50%", transform: "translateY(-50%)", background: "rgba(0,0,0,0.45)", border: "none", borderRadius: "50%", width: 26, height: 26, color: "white", fontSize: 14, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>&#8249;</button>
                                )}
                                {sliderIdx < postMediaPreviews.length - 1 && (
                                    <button onClick={() => setSliderIdx(i => i + 1)} style={{ position: "absolute", right: 32, top: "50%", transform: "translateY(-50%)", background: "rgba(0,0,0,0.45)", border: "none", borderRadius: "50%", width: 26, height: 26, color: "white", fontSize: 14, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>&#8250;</button>
                                )}
                                <div style={{ position: "absolute", bottom: 6, left: "50%", transform: "translateX(-50%)", display: "flex", gap: 4 }}>
                                    {postMediaPreviews.map((_, i) => (
                                        <div key={i} onClick={() => setSliderIdx(i)} style={{ width: i === sliderIdx ? 14 : 5, height: 5, borderRadius: 3, background: i === sliderIdx ? "white" : "rgba(255,255,255,0.5)", cursor: "pointer", transition: "all 0.2s" }} />
                                    ))}
                                </div>
                                <div style={{ position: "absolute", top: 6, left: 8, background: "rgba(0,0,0,0.45)", borderRadius: 8, padding: "1px 7px", color: "white", fontSize: 10, fontWeight: 700 }}>
                                    {sliderIdx + 1}/{postMediaPreviews.length}
                                </div>
                            </>
                        )}
                    </div>
                )}

                {/* Text area */}
                <div style={{ display: "flex", gap: 10, marginBottom: 12, alignItems: "flex-start" }}>
                    <Avatar alt="VK" color={"#a7aebf"} online backgroundColor="white" image={avatarDinosaur} />
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

                {/* Tag chips */}
                <div style={{ display: "flex", gap: 8, overflowX: "auto", paddingBottom: 8, marginBottom: 12, scrollbarWidth: "none" }}>
                    {tagOptions.map(t => {
                        const isSelected = postTag === t.id;
                        return (
                            <span
                                key={t.id}
                                onClick={() => setPostTag(t.id)}
                                style={{
                                    padding: "5px 12px", borderRadius: 20,
                                    background: isSelected ? TAG_COLOR : `${TAG_COLOR}18`,
                                    color: isSelected ? "white" : TAG_COLOR,
                                    fontSize: 11, fontWeight: 700, cursor: "pointer",
                                    fontFamily: "'DM Sans', sans-serif",
                                    border: `1.5px solid ${isSelected ? TAG_COLOR : "transparent"}`,
                                    transition: "all 0.15s", whiteSpace: "nowrap", flexShrink: 0,
                                }}
                            >
                                #{t.id}
                            </span>
                        );
                    })}
                </div>

                {/* Anonymous toggle + Submit */}
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer" }} onClick={() => setAnon(!anon)}>
                        <div style={{ width: 36, height: 20, borderRadius: 10, background: anon ? COLORS.primary : COLORS.border, position: "relative", transition: "background 0.2s" }}>
                            <div style={{ width: 16, height: 16, borderRadius: "50%", background: "white", position: "absolute", top: 2, left: anon ? 18 : 2, transition: "left 0.2s", boxShadow: "0 1px 4px rgba(0,0,0,0.2)" }} />
                        </div>
                        <span style={{ fontSize: 12, color: COLORS.muted, fontFamily: "'DM Sans', sans-serif" }}>Post anonymously</span>
                    </div>
                    <button
                        onClick={handlePost}
                        disabled={!postText.trim() || submitting}
                        style={{
                            background: (!postText.trim() || submitting) ? COLORS.border : COLORS.primary,
                            color: "white", border: "none", borderRadius: 12,
                            padding: "10px 22px", fontWeight: 700, fontSize: 13,
                            cursor: (!postText.trim() || submitting) ? "not-allowed" : "pointer",
                            fontFamily: "'DM Sans', sans-serif",
                            boxShadow: (!postText.trim() || submitting) ? "none" : `0 4px 14px ${COLORS.primary}44`,
                        }}
                    >
                        {submitting ? "Posting..." : "Share ✦"}
                    </button>
                </div>
            </div>
        </div>
    );
}
