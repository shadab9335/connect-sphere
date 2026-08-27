// updated by pritam
import React, { useEffect, useState } from "react";
import Avatar from "../../components/Avatar";
import { COLORS, INTERESTS } from "../../constants";
import { fetchAllUsers } from "../../services/profileService.js";
import {
    connectUser,
    disconnectUser,
    getConnectionsForUser,
} from "../../services/connectionService.js";
function Pill({ label, active, color, onClick }) {
    return (
        <button
            onClick={onClick}
            style={{
                padding: "6px 14px",
                borderRadius: 14,
                border: `1.5px solid ${active ? color : "#E2E8F8"}`,
                background: "rgb(247, 240,240 )",
                color: "#673ab7",
                fontSize: 12,
                fontWeight: 700,
                cursor: "pointer",
                fontFamily: "'DM Sans', sans-serif",
                whiteSpace: "nowrap",
            }}
        >
            {label}
        </button>
    );
}
function DiscoverScreen({ myInterests, setMyInterests }) {
    const [filter, setFilter] = useState("All");
    const [connectedUserIds, setConnectedUserIds] = useState(new Set());
    const [connectionLoading, setConnectionLoading] = useState(false);
    const [users, setUsers] = useState([]);
    const currentUser = JSON.parse(localStorage.getItem("user") || "{}");


    useEffect(() => {
        const loadConnections = async () => {
            try {
                if (!currentUser?.id) {
                    return;
                }
                const response = await getConnectionsForUser(currentUser.id);
                const connectedUsers = response?.data?.data?.connectedUsers || [];
                setConnectedUserIds(new Set(connectedUsers.map((user) => user.userId)));
            } catch (error) {
                console.error("Failed to load connections", error);
            }
        };
        loadConnections();
        // Load users from the backend or mock data
        fetchAllUsers()
            .then((response) => {
                const fetchedUsers = response?.data?.data || [];
                setUsers(fetchedUsers.filter((user) => user.id !== currentUser.id));
            })
            .catch((error) => {
                console.error("Failed to load users", error);
            });
    }, [currentUser.id]);
    const handleConnect = async (recipientUserId) => {
        try {
            setConnectionLoading(true);
            await connectUser(currentUser.id, recipientUserId);
            setConnectedUserIds((prev) => new Set([...prev, recipientUserId]));
        } catch (error) {
            console.error("Connection failed", error);
        } finally {
            setConnectionLoading(false);
        }
    };
    const handleDisconnect = async (recipientUserId) => {
        try {
            setConnectionLoading(true);
            await disconnectUser(currentUser.id, recipientUserId);
            setConnectedUserIds((prev) => {
                const updated = new Set(prev);
                updated.delete(recipientUserId);
                return updated;
            });
        } catch (error) {
            console.error("Disconnection failed", error);
        } finally {
            setConnectionLoading(false);
        }
    };
    const safeMyInterests = Array.isArray(myInterests) ? myInterests : [];
    const myInterestSet = new Set(safeMyInterests);
    const allLabels = INTERESTS.map((item) => item.label);
    const myLabels = safeMyInterests.filter((name) => allLabels.includes(name));
    const otherLabels = allLabels.filter((label) => !myInterestSet.has(label));
    const filters = ["All", ...myLabels, ...otherLabels];
    // const filtered =
    //     filter === "All"
    //         ? MOCK_USERS
    //         : MOCK_USERS.filter(user =>
    //               user.interests.some(
    //                   interest =>
    //                       interest.label === filter
    //               )
    //           );


    // const filtered =
    //     filter === "All"
    //         ? users
    //         : users.filter((user) =>
    //             user.interests?.some((interest) => interest.label === filter),
    //         );

    const filtered =
        filter === "All"
            ? users
            : users.filter((user) =>
                user.interests?.some((interest) =>
                    interest.interestName === filter
                )
            );

    return (
        <div
            style={{
                flex: 1,
                overflowY: "auto",
                padding: "6px 16px 0",
                scrollbarWidth: "none",
            }}
        >
            <div
                style={{
                    fontSize: 22,
                    fontWeight: 800,
                    color: "#f5efb9",
                    marginBottom: 4,
                    fontFamily: "'emoji",
                }}
            >
                Discover Colleagues
            </div>
            <div
                style={{
                    fontSize: 13,
                    color: "#f5efb9",
                    marginBottom: 16,
                    fontFamily: "'DM Sans', sans-serif",
                }}
            >
                Connect by shared interests 🤝
            </div>
            {/* Search */}
            <div
                style={{
                    background: "#f7f0f0",
                    border: `1.5px solid ${COLORS.border}`,
                    borderRadius: 14,
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    padding: "10px 14px",
                    marginBottom: 14,
                }}
            >
                <span style={{ fontSize: 16 }}>🔍</span>
                <input
                    placeholder="Search by name, emp ID, or interest..."
                    style={{
                        border: "none",
                        outline: "none",
                        fontSize: 13,
                        flex: 1,
                        color: "#242939",
                        fontFamily: "'DM Sans', sans-serif",
                        background: "none",
                    }}
                />
            </div>
            {/* Interest filters */}
            <div
                style={{
                    display: "flex",
                    gap: 8,
                    overflowX: "auto",
                    paddingBottom: 12,
                    marginBottom: 8,
                    scrollbarWidth: "none",
                }}
            >
                {filters.map((f) => (
                    <Pill
                        key={f}
                        label={f}
                        active={filter === f}
                        onClick={() => setFilter(f)}
                        color={COLORS.primary}
                    />
                ))}
            </div>
            {/* User Cards */}
            {filtered.map((user) => (
                <div
                    key={user.id} //
                    style={{
                        background: "#f7f0f0",
                        borderRadius: 18,
                        padding: 16,
                        marginBottom: 12,
                        border: `1.5px solid ${COLORS.border}`,
                        boxShadow: "0 2px 12px rgba(108,99,255,0.05)",
                    }}
                >
                    {/* avatar and user info */}




                    <div
                        style={{
                            display: "flex",
                            gap: 10,
                            alignItems: "flex-start",
                        }}
                    >
                        <div
                            style={{
                                width: 50,
                                height: 50,
                                flexShrink: 0,
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                            }}
                        >
                            {user.profilePicture ? (
                                <img
                                    src={user.profilePicture}
                                    alt={user.fullName}
                                    style={{
                                        width: "100%",
                                        height: "100%",
                                        borderRadius: "50%",
                                        objectFit: "cover",
                                        border: "2px solid #6c63ff",
                                        display: "block",
                                    }}
                                />
                            ) : (
                                <Avatar
                                    initials={user.avatar}
                                    color={user.avatarColor || "#6c63ff"}
                                    size={50}
                                    online={user.online}
                                />
                            )}
                        </div>
                        <div
                            style={{
                                flex: 1,
                                paddingTop: 4,
                            }}
                        >
                            {/* <div
                        style={{
                            display: "flex",
                            gap: 12,
                            alignItems: "flex-start",
                        }}
                    >
                        <Avatar
                            initials={user.avatar}
                            color="#6c63ff"
                            size={50}
                            online={user.online}
                        />
                        <div
                            style={{
                                flex: 1,
                            }}
                        > */}




                            <div
                                style={{
                                    display: "flex",
                                    justifyContent: "space-between",
                                    alignItems: "center",
                                    width: "100%",
                                }}
                            >
                                <div
                                    style={{
                                        fontWeight: 800,
                                        fontSize: 15,
                                        color: "#242939",
                                        fontFamily: "'emoji",
                                    }}
                                >
                                    {user.fullName}
                                </div>
                                <span
                                    style={{
                                        fontSize: 11,
                                        color: "#dd5944e0",
                                        fontFamily: "'DM Sans', sans-serif",
                                    }}
                                >
                                    {user.employeeId}
                                </span>
                            </div>
                            <div
                                style={{
                                    fontSize: 12,
                                    color: "#242939",
                                    marginBottom: 8,
                                    fontFamily: "'DM Sans', sans-serif",
                                }}
                            >
                                {user.department}
                                {" · "}
                                {user.location}
                            </div>
                            <div
                                style={{
                                    display: "flex",
                                    flexWrap: "wrap",
                                    gap: 6,
                                    marginBottom: 10,
                                }}
                            >
                                {(user.interests || []).map((interest) => (
                                    <span
                                        key={interest.id}
                                        style={{
                                            fontSize: 11,
                                            background: "#6c63ff15",
                                            color: "#6c63ff",
                                            borderRadius: 8,
                                            padding: "3px 8px",
                                            fontWeight: 600,
                                            fontFamily: "'DM Sans', sans-serif",
                                        }}
                                    >
                                        {interest.interestName}
                                    </span>
                                ))}
                            </div>
                            <div
                                style={{
                                    display: "flex",
                                    gap: 8,
                                }}
                            >
                                <button
                                    onClick={() => {
                                        if (connectedUserIds.has(user.id)) {
                                            handleDisconnect(user.id);
                                        } else {
                                            handleConnect(user.id);
                                        }
                                    }}
                                    disabled={connectionLoading}
                                    style={{
                                        flex: 1,
                                        background: connectedUserIds.has(user.id)
                                            // ? "#dc3545"
                                            ? "#ef4444ff"
                                            : "linear-gradient(135deg, #291b5f, rgba(108, 99, 255, 0.8))",
                                        color: "white",
                                        border: "none",
                                        borderRadius: 10,
                                        padding: "8px 0",
                                        fontSize: 12,
                                        fontWeight: 700,
                                        cursor: connectionLoading ? "not-allowed" : "pointer",
                                        opacity: connectionLoading ? 0.7 : 1,
                                        fontFamily: "'DM Sans', sans-serif",
                                    }}
                                >
                                    {connectionLoading
                                        ? "Loading..."
                                        : connectedUserIds.has(user.id)
                                            ? "Disconnect"
                                            : "Connect"}
                                </button>
                                <button
                                    style={{
                                        flex: 1,
                                        background: "#f9e0e0",
                                        color: "rgb(80, 73, 189)",
                                        border: "2px solid #e9c6c6",
                                        borderRadius: 10,
                                        padding: "8px 0",
                                        fontSize: 12,
                                        fontWeight: 700,
                                        cursor: "pointer",
                                        fontFamily: "'DM Sans', sans-serif",
                                    }}
                                >
                                    Message
                                </button>
                            </div>
                        </div>
                    </div>
                    <div
                        style={{
                            marginTop: 10,
                            paddingTop: 10,
                            borderTop: `1px solid ${COLORS.border}`,
                            fontSize: 11,
                            color: "#0443ff",
                            fontFamily: "'DM Sans', sans-serif",
                        }}
                    >
                        🔗 {user.mutual} mutual interests
                    </div>
                </div>
            ))}
        </div>
    );
}
export default DiscoverScreen;

