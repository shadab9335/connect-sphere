

import React, { useState } from "react";
import Avatar from "../../components/Avatar";
import { COLORS, INTERESTS, MOCK_USERS } from "../../constants";

function Pill({ label, active, color, onClick }) {
    return (
        <button onClick={onClick} style={{
            padding: "6px 14px", borderRadius: 14, border: `1.5px solid ${active ? color : "#E2E8F8"}`,
            //  background: "rgb(249, 224, 224)",
            background: "rgb(247, 240,240 )",

            // color: active ? color : "#8892B0",
            color: "#673ab7",

            fontSize: 12, fontWeight: 700, cursor: "pointer", fontFamily: "'DM Sans', sans-serif",
            whiteSpace: "nowrap",
        }}>{label}</button>
    );
}

function DiscoverScreen({ myInterests, setMyInterests }) {
    const [filter, setFilter] = useState("All");
    // const filters = ["All", ...INTERESTS.slice(0, 5)];
    const filters = ["All", ...INTERESTS.map(item => item.label)];

    // const filtered = filter === "All" ? MOCK_USERS : MOCK_USERS.filter(u => u.interests.includes(filter));
    // Change this line later if filtering stops working with object data

    const filtered = filter === "All"
        ? MOCK_USERS
        : MOCK_USERS.filter(u =>
            u.interests.some(interest => interest.label === filter)
        );
    return (
        <div style={{ flex: 1, overflowY: "auto", padding: "6px 16px 0", scrollbarWidth: 'none' }}>
            <div style={{ fontSize: 22, fontWeight: 800, color: "#f5efb9", marginBottom: 4, fontFamily: "'emoji" }}>Discover Colleagues</div>
            <div style={{ fontSize: 13, color: "#f5efb9", marginBottom: 16, fontFamily: "'DM Sans', sans-serif" }}>Connect by shared interests 🤝</div>

            {/* Search */}
            <div style={{
                background: "#f7f0f0", border: `1.5px solid ${COLORS.border}`, borderRadius: 14,
                display: "flex", alignItems: "center", gap: 10, padding: "10px 14px", marginBottom: 14,

            }}>
                <span style={{ fontSize: 16 }}>🔍</span>
                <input placeholder="Search by name, emp ID, or interest..." style={{
                    border: "none", outline: "none", fontSize: 13, flex: 1,
                    color: "#242939", fontFamily: "'DM Sans', sans-serif", background: "none",
                }} />
            </div>

            {/* Interest filters */}
            <div style={{ display: "flex", gap: 8, overflowX: "auto", paddingBottom: 12, marginBottom: 8, scrollbarWidth: 'none' }}>
                {filters.map(f => <Pill key={f} label={f} active={filter === f} onClick={() => setFilter(f)} color={COLORS.primary} />)}
            </div>

            {/* User Cards */}
            {filtered.map(user => (
                <div key={user.id} style={{
                    background: "#f7f0f0", borderRadius: 18, padding: 16, marginBottom: 12,
                    border: `1.5px solid ${COLORS.border}`,
                    boxShadow: "0 2px 12px rgba(108,99,255,0.05)",

                }}>
                    <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
                        <Avatar initials={user.avatar} color="#6c63ff" size={50} online={user.online} />
                        <div style={{ flex: 1 }}>
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                <div style={{ fontWeight: 800, fontSize: 15, color: "#242939", fontFamily: "'emoji" }}>{user.name}</div>
                                <span style={{ fontSize: 11, color: "#dd5944e0", fontFamily: "'DM Sans', sans-serif" }}>{user.id}</span>
                            </div>
                            <div style={{ fontSize: 12, color: "#242939", marginBottom: 8, fontFamily: "'DM Sans', sans-serif" }}>
                                {user.dept} · {user.location}
                            </div>
                            {/* <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 10 }}>
                                {user.interests.map(i => (
                                    <span key={i} style={{
                                        fontSize: 11, background: "#6c63ff15", color: "#6c63ff",
                                        borderRadius: 8, padding: "3px 8px", fontWeight: 600, fontFamily: "'DM Sans', sans-serif",
                                    }}>{i}</span>
                                ))}
                            </div> */}
                            <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 10 }}>
                                {user.interests.map(i => (
                                    <span key={i.id} style={{
                                        fontSize: 11, background: "#6c63ff15", color: "#6c63ff",
                                        borderRadius: 8, padding: "3px 8px", fontWeight: 600, fontFamily: "'DM Sans', sans-serif",
                                    }}>
                                        {i.label}
                                    </span>
                                ))}
                            </div>
                            <div style={{ display: "flex", gap: 8 }}>
                                <button style={{
                                    flex: 1, background: "linear-gradient(135deg, #291b5f, rgba(108, 99, 255, 0.8))", color: "white", border: "none",
                                    borderRadius: 10, padding: "8px 0", fontSize: 12, fontWeight: 700, cursor: "pointer",
                                    fontFamily: "'DM Sans', sans-serif",
                                }}>Connect</button>
                                <button style={{
                                    flex: 1, background: "#f9e0e0", color: "rgb(80, 73, 189)", border: "2px solid #e9c6c6",
                                    borderRadius: 10, padding: "8px 0", fontSize: 12, fontWeight: 700, cursor: "pointer",
                                    fontFamily: "'DM Sans', sans-serif",
                                }}>Message</button>
                            </div>
                        </div>
                    </div>
                    <div style={{
                        marginTop: 10, paddingTop: 10, borderTop: `1px solid ${COLORS.border}`,
                        fontSize: 11, color: "#0443ff", fontFamily: "'DM Sans', sans-serif",
                    }}>🔗 {user.mutual} mutual interests</div>
                </div>
            ))}
        </div>
    );
}
export default DiscoverScreen;

