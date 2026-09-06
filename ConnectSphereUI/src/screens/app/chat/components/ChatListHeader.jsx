// import React from "react";
// import Avatar from "../../../../components/Avatar";
// import { COLORS } from "../../../../constants";

// const BG = "transparent";
// const CARD_BG = "#f7f0f0";

// function ChatListHeader({ profilePic }) {
//     return (
//         <div style={{ background: BG, flexShrink: 0 }}>
//             <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "3px 16px 10px" }}>
//                 <div>
//                     <div style={{ fontSize: 25, fontWeight: 800, color: "white", fontFamily: "'emoji" }}>Messages 💬</div>
//                 </div>
//                 <Avatar initials="VK" color="#f7f0f0" backgroundColor="#f7f0f0" size={42} online dotColor="#1e8a4a" image={profilePic} />
//             </div>

//             {/* Search */}
//             <div style={{
//                 background: CARD_BG, border: `1.5px solid ${COLORS.border}`, borderRadius: 14,
//                 display: "flex", alignItems: "center", gap: 10,
//                 padding: "10px 14px", margin: "0 16px 14px",
//                 boxShadow: "0 2px 10px rgba(108,99,255,0.06)",
//             }}>
//                 <span style={{ fontSize: 14 }}>🔍</span>
//                 <input placeholder="Search messages..." style={{
//                     border: "none", outline: "none", fontSize: 13, flex: 1,
//                     fontFamily: "'DM Sans', sans-serif", color: COLORS.text, background: "none",
//                 }} />
//             </div>

//             <div style={{ fontSize: 12, fontWeight: 700, color: "#e8e0f0", letterSpacing: 1, fontFamily: "'DM Sans', sans-serif", padding: "0 16px 8px" }}>
//                 RECENT
//             </div>
//         </div>
//     );
// }

// export default ChatListHeader;


// by pritam
import React from "react";
import Avatar from "../../../../components/Avatar";
import { COLORS } from "../../../../constants";
import { initialsOf } from "../chatUtils";

const BG = "transparent";
const CARD_BG = "#f7f0f0";

function ChatListHeader({ profilePic, search, setSearch }) {
    // Was hardcoded "VK" — read the signed-in user instead.
    const myInitials = (() => {
        try {
            const user = JSON.parse(localStorage.getItem("user") || "{}");
            return initialsOf(user.fullName);
        } catch {
            return "?";
        }
    })();

    return (
        <div style={{ background: BG, flexShrink: 0 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "3px 16px 10px" }}>
                <div>
                    <div style={{ fontSize: 25, fontWeight: 800, color: "white", fontFamily: "'emoji" }}>Messages 💬</div>
                </div>
                <Avatar initials={myInitials} color="#f7f0f0" background="#f7f0f0" size={42} online dotColor="#1e8a4a" image={profilePic} />
            </div>

            {/* Search — filters the list in ChatScreen */}
            <div style={{
                background: CARD_BG, border: `1.5px solid ${COLORS.border}`, borderRadius: 14,
                display: "flex", alignItems: "center", gap: 10,
                padding: "10px 14px", margin: "0 16px 14px",
                boxShadow: "0 2px 10px rgba(108,99,255,0.06)",
            }}>
                <span style={{ fontSize: 14 }}>🔍</span>
                <input
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    placeholder="Search messages..."
                    style={{
                        border: "none", outline: "none", fontSize: 13, flex: 1,
                        fontFamily: "'DM Sans', sans-serif", color: COLORS.text, background: "none",
                    }}
                />
            </div>

            <div style={{ fontSize: 12, fontWeight: 700, color: "#e8e0f0", letterSpacing: 1, fontFamily: "'DM Sans', sans-serif", padding: "0 16px 8px" }}>
                RECENT
            </div>
        </div>
    );
}

export default ChatListHeader;
