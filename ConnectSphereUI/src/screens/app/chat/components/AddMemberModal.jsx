import React, { useEffect, useState } from "react";
import Avatar from "../../../../components/Avatar";
import { COLORS } from "../../../../constants";
import { searchPeople } from "../../../../services/chatService";

function AddMemberModal({ existingParticipantIds, onClose, onAdd }) {
    const [connections, setConnections] = useState([]);
    const [loading, setLoading] = useState(true);
    const [adding, setAdding] = useState(null);
    const [error, setError] = useState("");

    useEffect(() => {
        let cancelled = false;
        (async () => {
            try {
                const res = await searchPeople("");
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

    const candidates = connections.filter(p => !(existingParticipantIds || []).includes(p.userId));

    const handleAdd = async (userId) => {
        setAdding(userId);
        setError("");
        try {
            await onAdd(userId);
        } catch (err) {
            const serverMessage = typeof err?.response?.data === "string" ? err.response.data : null;
            setError(serverMessage || "Couldn't add that member.");
        } finally {
            setAdding(null);
        }
    };

    return (
        <div style={{
            position: "absolute", inset: 0, background: "rgba(0,0,0,0.5)",
            display: "flex", alignItems: "center", justifyContent: "center", zIndex: 50,
        }}>
            <div style={{
                background: "#f7f0f0", borderRadius: 20, padding: 20, width: "85%", maxWidth: 340,
                maxHeight: "70vh", display: "flex", flexDirection: "column", gap: 10,
            }}>
                <div style={{ fontWeight: 800, fontSize: 16, fontFamily: "'emoji", color: COLORS.text }}>
                    Add Member
                </div>

                <div style={{ flex: 1, overflowY: "auto" }}>
                    {loading && <div style={{ fontSize: 12, color: COLORS.muted }}>Loading connections…</div>}
                    {!loading && candidates.length === 0 && (
                        <div style={{ fontSize: 12, color: COLORS.muted }}>
                            Everyone you're connected to is already in this group.
                        </div>
                    )}
                    {candidates.map(person => (
                        <div key={person.userId} onClick={() => handleAdd(person.userId)} style={{
                            display: "flex", alignItems: "center", gap: 10, padding: "8px 6px",
                            cursor: "pointer", borderRadius: 10, opacity: adding === person.userId ? 0.5 : 1,
                        }}>
                            <Avatar
                                initials={(person.avatar || person.displayName || "?").slice(0, 2).toUpperCase()}
                                color={COLORS.primary} size={36} image={person.profilePicture}
                            />
                            <span style={{ fontSize: 13, fontFamily: "'DM Sans', sans-serif", color: COLORS.text }}>
                                {person.displayName}
                            </span>
                        </div>
                    ))}
                </div>

                {error && <div style={{ fontSize: 12, color: "#B91C1C" }}>{error}</div>}

                <button onClick={onClose} style={{
                    padding: "10px 0", borderRadius: 10, border: `1.5px solid ${COLORS.border}`,
                    background: "none", fontSize: 13, fontWeight: 700, cursor: "pointer",
                }}>Close</button>
            </div>
        </div>
    );
}

export default AddMemberModal;