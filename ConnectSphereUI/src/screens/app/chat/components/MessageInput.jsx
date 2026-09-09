import React from "react";
import { COLORS } from "../../../../constants";

function MessageInput({ msg, setMsg, sendMessage }) {
    return (
        <div style={{
            padding: "12px 14px",
            background: "transparent", display: "flex", gap: 10, alignItems: "center",
        }}>
            <input
                value={msg}
                onChange={e => setMsg(e.target.value)}
                placeholder="Type a message..."
                onKeyDown={e => e.key === "Enter" && sendMessage()}
                style={{
                    flex: 1, border: `1.5px solid ${COLORS.border}`, borderRadius: 14,
                    padding: "10px 14px", fontSize: 13, outline: "none",
                    fontFamily: "'DM Sans', sans-serif", color: COLORS.text, background: "white",
                }}
            />
            <button onClick={sendMessage} style={{
                background: "linear-gradient(135deg, rgb(41 27 95), rgba(108, 99, 255, 0.8))",
                border: "none", borderRadius: 14,
                width: 44, height: 44, color: "white", fontSize: 18, cursor: "pointer",
                boxShadow: "0 4px 14px rgba(108,99,255,0.35)",
                display: "flex", alignItems: "center", justifyContent: "center",
            }}>➤</button>
        </div>
    );
}

export default MessageInput;
