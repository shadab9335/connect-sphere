import React, { useEffect, useState } from "react";
import Avatar from "../../../../components/Avatar";
import { COLORS } from "../../../../constants";
import { fetchUserProfile } from "../../../../services/chatService";

function GroupMembersModal({ participantIds, createdBy, currentUserId, isOwner, onRemove, onLeave, onClose }) {
    const [members, setMembers] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let cancelled = false;
        (async () => {
            const profiles = await Promise.all(
                (participantIds || []).map(async (id) => {
                    const profile = await fetchUserProfile(id);
                    return { userId: id, ...profile };
                })
            );
            if (!cancelled) setMembers(profiles);
            if (!cancelled) setLoading(false);
        })();
        return () => { cancelled = true; };
    }, [participantIds]);

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
                    Group Members
                </div>

                <div style={{ flex: 1, overflowY: "auto" }}>
                    {loading && <div style={{ fontSize: 12, color: COLORS.muted }}>Loading members…</div>}
                    {/* {members.map(person => (
                        <div key={person.userId} style={{
                            display: "flex", alignItems: "center", gap: 10, padding: "8px 4px",
                        }}>
                            <Avatar
                                initials={(person.avatar || person.displayName || "?").slice(0, 2).toUpperCase()}
                                color={COLORS.primary} size={36} image={person.profilePicture}
                            />
                            <span style={{ fontSize: 13, fontFamily: "'DM Sans', sans-serif", color: COLORS.text }}>
                                {person.displayName || "Unknown user"}
                            </span>
                            {person.userId === createdBy && (
                                <span style={{
                                    marginLeft: "auto", fontSize: 11, fontWeight: 700, color: "#291b5f",
                                    background: "#e0d4fa", borderRadius: 8, padding: "2px 8px",
                                }}>👑 Host</span>
                            )}
                        </div>
                    ))} */}

                    {members.map(person => (
                        <div key={person.userId} style={{
                            display: "flex", alignItems: "center", gap: 10, padding: "8px 4px",
                        }}>
                            <Avatar
                                initials={(person.avatar || person.displayName || "?").slice(0, 2).toUpperCase()}
                                color={COLORS.primary} size={36} image={person.profilePicture} />
                            <span style={{ fontSize: 13, fontFamily: "'DM Sans', sans-serif", color: COLORS.text }}>
                                {person.displayName || "Unknown user"}
                            </span>
                            {person.userId === createdBy && (
                                <span style={{
                                    marginLeft: "auto", fontSize: 11, fontWeight: 700, color: "#291b5f",
                                    background: "#e0d4fa", borderRadius: 8, padding: "2px 8px",
                                }}>Leader</span>
                            )}
                            {!isOwner && person.userId === currentUserId && (
                                <button
                                    onClick={onLeave}
                                    style={{
                                        marginLeft: "auto", border: "none", background: "none",
                                        color: "#B91C1C", fontSize: 11, fontWeight: 700, cursor: "pointer",
                                    }}
                                >Leave</button>
                            )}
                            {isOwner && person.userId !== createdBy && (
                                <button
                                    onClick={() => onRemove(person.userId)}
                                    style={{
                                        marginLeft: "auto", border: "none", background: "none",
                                        color: "#B91C1C", fontSize: 11, fontWeight: 700, cursor: "pointer",
                                    }}
                                >Remove</button>
                            )}
                        </div>
                    ))}
                </div>

                <button onClick={onClose} style={{
                    padding: "10px 0", borderRadius: 10, border: `1.5px solid ${COLORS.border}`,
                    background: "none", fontSize: 13, fontWeight: 700, cursor: "pointer",
                }}>Close</button>
            </div>
        </div>
    );
}

export default GroupMembersModal;