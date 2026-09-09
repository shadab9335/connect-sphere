// import React from "react";
// import { COLORS } from "../../../../constants";

// function MessageInput({ msg, setMsg, sendMessage }) {
//     return (
//         <div style={{
//             padding: "12px 14px",
//             background: "transparent", display: "flex", gap: 10, alignItems: "center",
//         }}>
//             <input
//                 value={msg}
//                 onChange={e => setMsg(e.target.value)}
//                 placeholder="Type a message..."
//                 onKeyDown={e => e.key === "Enter" && sendMessage()}
//                 style={{
//                     flex: 1, border: `1.5px solid ${COLORS.border}`, borderRadius: 14,
//                     padding: "10px 14px", fontSize: 13, outline: "none",
//                     fontFamily: "'DM Sans', sans-serif", color: COLORS.text, background: "white",
//                 }}
//             />
//             <button onClick={sendMessage} style={{
//                 background: "linear-gradient(135deg, rgb(41 27 95), rgba(108, 99, 255, 0.8))",
//                 border: "none", borderRadius: 14,
//                 width: 44, height: 44, color: "white", fontSize: 18, cursor: "pointer",
//                 boxShadow: "0 4px 14px rgba(108,99,255,0.35)",
//                 display: "flex", alignItems: "center", justifyContent: "center",
//             }}>➤</button>
//         </div>
//     );
// }

// export default MessageInput;


// by pritam
import React, { useRef } from "react";
import { COLORS } from "../../../../constants";

function MessageInput({ msg, setMsg, sendMessage, onAttach, uploading, disabled }) {
    const fileInputRef = useRef(null);

    const handleFileChosen = (e) => {
        const file = e.target.files && e.target.files[0];
        e.target.value = ""; // let the same file be picked again later
        if (file && onAttach) onAttach(file);
    };

    return (
        <div style={{
            padding: "12px 14px",
            background: "transparent", display: "flex", gap: 10, alignItems: "center",
            flexShrink: 0,
        }}>
            {/* Photo/video (or file) sharing — see AttachmentService on the
                backend for the accepted types and size limits enforced there;
                this accept list just steers the OS picker toward those. */}
            <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/gif,image/webp,video/mp4,video/quicktime,video/webm"
                style={{ display: "none" }}
                onChange={handleFileChosen}
            />
            <button
                onClick={() => fileInputRef.current?.click()}
                disabled={disabled || uploading}
                title="Share a photo or video"
                style={{
                    border: `1.5px solid ${COLORS.border}`, background: "white", borderRadius: 14,
                    width: 42, height: 42, fontSize: 17,
                    cursor: disabled || uploading ? "not-allowed" : "pointer",
                    opacity: disabled || uploading ? 0.5 : 1,
                    display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
                }}
            >{uploading ? "…" : "📷"}</button>

            <input
                value={msg}
                onChange={e => setMsg(e.target.value)}
                placeholder={disabled ? "Connecting…" : uploading ? "Uploading…" : "Type a message..."}
                disabled={disabled}
                onKeyDown={e => e.key === "Enter" && sendMessage()}
                style={{
                    flex: 1, border: `1.5px solid ${COLORS.border}`, borderRadius: 14,
                    padding: "10px 14px", fontSize: 13, outline: "none",
                    fontFamily: "'DM Sans', sans-serif", color: COLORS.text, background: "white",
                    opacity: disabled ? 0.6 : 1,
                }}
            />
            <button
                onClick={sendMessage}
                disabled={disabled || !msg.trim()}
                style={{
                    background: "linear-gradient(135deg, rgb(41 27 95), rgba(108, 99, 255, 0.8))",
                    border: "none", borderRadius: 14,
                    width: 44, height: 44, color: "white", fontSize: 18,
                    cursor: disabled || !msg.trim() ? "not-allowed" : "pointer",
                    opacity: disabled || !msg.trim() ? 0.5 : 1,
                    boxShadow: "0 4px 14px rgba(108,99,255,0.35)",
                    display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
                }}
            >➤</button>
        </div>
    );
}

export default MessageInput;
