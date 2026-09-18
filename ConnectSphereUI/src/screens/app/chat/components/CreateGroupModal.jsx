import React, { useEffect, useState } from "react";
import Avatar from "../../../../components/Avatar";
import { COLORS } from "../../../../constants";
import { searchPeople } from "../../../../services/chatService";

function CreateGroupModal({ onClose, onCreate }) {
    const [name, setName] = useState("");
    const [connections, setConnections] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selected, setSelected] = useState(new Set());
    const [error, setError] = useState("");
    const [creating, setCreating] = useState(false);

    useEffect(() => {
        let cancelled = false;
        (async () => {
            try {
                const res = await searchPeople(""); // blank query = full connections list
                if (!cancelled) setConnections(res?.data || []);
            } catch (err) {
                console.error("Failed to load connections", err);
                if (!cancelled) setError("Couldn't load your connections.");
            } finally {
                if (!cancelled) setLoading(false);
            }
        })();
        return () => { cancelled = true; };
    }, []);
    console.log(connections);
    
    const toggle = (userId) => {
        setSelected(prev => {
            const next = new Set(prev);
            next.has(userId) ? next.delete(userId) : next.add(userId);
            return next;
        });
    };

    const handleCreate = async () => {
        if (!name.trim()) { setError("Give the group a name."); return; }
        if (selected.size < 2) { setError("Pick at least 2 members besides yourself."); return; }
        setCreating(true);
        setError("");
        try {
            await onCreate(name.trim(), Array.from(selected));
        } catch (err) {
            console.error("Group creation failed", err);
            const serverMessage = typeof err?.response?.data === "string" ? err.response.data : null;
            setError(serverMessage || "Couldn't create the group.");
        } finally {
            setCreating(false);
        }
    };

    return (
        <div style={{
            position: "absolute", inset: 0, background: "rgba(0,0,0,0.5)",
            display: "flex", alignItems: "center", justifyContent: "center", zIndex: 50,
        }}>
            <div style={{
                background: "#f7f0f0", borderRadius: 20, padding: 20, width: "90%", maxWidth: 380,
                maxHeight: "80vh", display: "flex", flexDirection: "column", gap: 12,
            }}>
                <div style={{ fontWeight: 800, fontSize: 16, fontFamily: "'emoji", color: COLORS.text }}>
                    New Group
                </div>

                <input
                    value={name}
                    onChange={e => setName(e.target.value)}
                    placeholder="Group name"
                    maxLength={40}
                    style={{
                        border: `1.5px solid ${COLORS.border}`, borderRadius: 12, padding: "10px 14px",
                        fontSize: 13, outline: "none", fontFamily: "'DM Sans', sans-serif",
                    }}
                />

                <div style={{ fontSize: 11, fontWeight: 700, color: "#8892B0", letterSpacing: 1 }}>
                    ADD MEMBERS ({selected.size} selected — need at least 2)
                </div>

                <div style={{ flex: 1, overflowY: "auto", minHeight: 120 }}>
                    {loading && <div style={{ fontSize: 12, color: COLORS.muted }}>Loading connections…</div>}
                    {!loading && connections.length === 0 && (
                        <div style={{ fontSize: 12, color: COLORS.muted }}>
                            You need at least 2 connections to start a group.
                        </div>
                    )}
                    {connections.map(person => (
                        <div
                            key={person.userId}
                            onClick={() => toggle(person.userId)}
                            style={{
                                display: "flex", alignItems: "center", gap: 10, padding: "8px 6px",
                                cursor: "pointer", borderRadius: 10,
                                background: selected.has(person.userId) ? "#e0d4fa" : "transparent",
                            }}
                        >
                            <Avatar
                                initials={(person.avatar || person.displayName || "?").slice(0, 2).toUpperCase()}
                                color={COLORS.primary} size={36} image={person.profilePicture}
                            />
                            <span style={{ fontSize: 13, fontFamily: "'DM Sans', sans-serif", color: COLORS.text }}>
                                {person.displayName}
                            </span>
                            {selected.has(person.userId) && <span style={{ marginLeft: "auto" }}>✓</span>}
                        </div>
                    ))}
                </div>

                {error && <div style={{ fontSize: 12, color: "#B91C1C" }}>{error}</div>}

                <div style={{ display: "flex", gap: 8 }}>
                    <button onClick={onClose} style={{
                        flex: 1, padding: "10px 0", borderRadius: 10, border: `1.5px solid ${COLORS.border}`,
                        background: "none", fontSize: 13, fontWeight: 700, cursor: "pointer",
                    }}>Cancel</button>
                    <button onClick={handleCreate} disabled={creating} style={{
                        flex: 1, padding: "10px 0", borderRadius: 10, border: "none",
                        background: "linear-gradient(135deg, #291b5f, rgba(108, 99, 255, 0.8))",
                        color: "white", fontSize: 13, fontWeight: 700, cursor: "pointer",
                        opacity: creating ? 0.6 : 1,
                    }}>{creating ? "Creating…" : "Create"}</button>
                </div>
            </div>
        </div>
    );
}

export default CreateGroupModal;