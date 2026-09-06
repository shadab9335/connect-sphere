// import React from "react";
// import Avatar from "../../../../components/Avatar";

// function ChatHeader({ chat, setActive }) {
//     return (
//         <div style={{
//             background: "linear-gradient(135deg, rgb(41 27 95), rgba(108, 99, 255, 0.8))",
//             padding: "14px 16px",
//             display: "flex", alignItems: "center", gap: 12,
//             boxShadow: "0 2px 14px rgba(108,99,255,0.18)",
//         }}>
//             <button onClick={() => setActive(null)} style={{
//                 border: "none", background: "rgba(255,255,255,0.2)", borderRadius: 10,
//                 width: 34, height: 34, fontSize: 16, cursor: "pointer", color: "white",
//                 display: "flex", alignItems: "center", justifyContent: "center",
//             }}>←</button>
//             <Avatar initials={chat.avatar} color={chat.color} size={38} online={!chat.group} />
//             <div style={{ flex: 1 }}>
//                 <div style={{ fontWeight: 800, fontSize: 15, fontFamily: "'emoji", color: "white" }}>{chat.name}</div>
//                 <div style={{ fontSize: 11, color: "rgba(255,255,255,0.75)", fontFamily: "'DM Sans', sans-serif", display: "flex", alignItems: "center", gap: 4 }}>
//                     <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#43E97B", display: "inline-block" }} />
//                     Online
//                 </div>
//             </div>
//             <button style={{
//                 border: "none", background: "rgba(255,255,255,0.15)", borderRadius: 10,
//                 width: 34, height: 34, fontSize: 18, cursor: "pointer", color: "white",
//             }}>⋯</button>
//         </div>
//     );
// }

// export default ChatHeader;


// by pritam
import React from "react";
import Avatar from "../../../../components/Avatar";

function ChatHeader({ chat, onBack, connected }) {
    return (
        <div style={{
            background: "linear-gradient(135deg, rgb(41 27 95), rgba(108, 99, 255, 0.8))",
            padding: "14px 16px",
            display: "flex", alignItems: "center", gap: 12,
            boxShadow: "0 2px 14px rgba(108,99,255,0.18)",
            flexShrink: 0,
        }}>
            <button onClick={onBack} style={{
                border: "none", background: "rgba(255,255,255,0.2)", borderRadius: 10,
                width: 34, height: 34, fontSize: 16, cursor: "pointer", color: "white",
                display: "flex", alignItems: "center", justifyContent: "center",
            }}>←</button>
            <Avatar initials={chat.avatar} color={chat.color} size={38} image={chat.image} online={!chat.group} />
            <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{
                    fontWeight: 800, fontSize: 15, fontFamily: "'emoji", color: "white",
                    overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                }}>{chat.name}</div>
                {/* Live socket state, not presence — we don't track who's online yet. */}
                <div style={{ fontSize: 11, color: "rgba(255,255,255,0.75)", fontFamily: "'DM Sans', sans-serif", display: "flex", alignItems: "center", gap: 4 }}>
                    <span style={{
                        width: 6, height: 6, borderRadius: "50%",
                        background: connected ? "#43E97B" : "#FFB347", display: "inline-block",
                    }} />
                    {connected ? "Connected" : "Connecting…"}
                </div>
            </div>
            <button style={{
                border: "none", background: "rgba(255,255,255,0.15)", borderRadius: 10,
                width: 34, height: 34, fontSize: 18, cursor: "pointer", color: "white",
            }}>⋯</button>
        </div>
    );
}

export default ChatHeader;

