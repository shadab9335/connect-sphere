import React, { useState, useEffect } from "react";
import IconButton from "@mui/material/IconButton";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { COLORS, INTERESTS } from "../../constants";
import { fetchInterests, register } from "../../services/authService";

function InterestTile({ interest, active, onClick }) {
    return (
        <div
            onClick={onClick}
            style={{
                background: "white",
                borderRadius: 14,
                padding: 10,
                cursor: "pointer",
                border: active ? `2px solid ${COLORS.primary}` : `1.5px solid ${COLORS.border}`,
                boxShadow: active ? `0 6px 16px ${COLORS.primary}22` : "0 3px 10px rgba(0,0,0,0.05)",
                transition: "border 0.2s ease, box-shadow 0.2s ease",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                textAlign: "center",
                gap: 6,
            }}
        >
            <div style={{ fontSize: 24 }}>{interest.emoji}</div>
            <div style={{ fontWeight: 700, fontSize: 13, fontFamily: "'DM Sans', sans-serif", color: COLORS.text }}>
                {interest.label}
            </div>
            <div style={{ fontSize: 11, color: COLORS.muted, fontFamily: "'DM Sans', sans-serif", lineHeight: 1.3 }}>
                {interest.description}
            </div>
        </div>
    );
}

export default function SignupInterestsScreen({ interests, setInterests, onSubmit, identityData, onBack }) {
    const [loading, setLoading] = useState(false);
    const [regSuccess, setRegSuccess] = useState(false);
    const [localError, setLocalError] = useState("");
    const [availableInterests, setAvailableInterests] = useState([]);

    useEffect(() => {
        fetchInterests()
            .then(res => {
                const list = res.data?.data || [];
                setAvailableInterests(list.length ? list : INTERESTS);
            })
            .catch(err => {
                console.error("Failed to fetch interests from backend", err);
                setAvailableInterests(INTERESTS);
            });
    }, []);

    const handleRegister = async () => {
        setLocalError("");
        if (interests.length === 0) { setLocalError("Select at least one interest"); return; }
        setLoading(true);
        const payload = {
            employeeId: identityData.empId,
            password: identityData.password,
            fullName: identityData.fullName,
            isAnonymous: identityData.isAnonymous,
            department: identityData.department,
            location: identityData.location,
            building: identityData.building,
            floor: identityData.floor,
            interests: interests.map(i => i.label),
        };
        console.log("Sending payload:", JSON.stringify(payload));
        try {
            const response = await register(payload);
            if (response.data.success) {
                setRegSuccess(true);
                setTimeout(() => onSubmit(response.data), 1500);
            }
        } catch (error) {
            const errorMsg = error.response?.data?.message || "Registration failed. Try again.";
            setLocalError(errorMsg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ height: "100%", overflowY: "auto", padding: 28 }}>
            <IconButton onClick={onBack} aria-label="back" sx={{ marginBottom: 1, marginLeft: -1, color: COLORS.text }}>
                <ArrowBackIcon />
            </IconButton>

            <div style={{ fontFamily: "'emoji", fontWeight: 800, fontSize: 26, color: '#eaeff3', marginBottom: 6 }}>
                Start Connecting
            </div>
            <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 14, color: '#efefef', marginBottom: 20, lineHeight: 1.6 }}>
                Choose communities you'd like to be part of.
                <br />
                You can change this anytime later.
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 12, marginBottom: 28 }}>
                {availableInterests.map(interest => {
                    const active = interests.some(item => item.id === interest.id);
                    return (
                        <InterestTile
                            key={interest.id}
                            interest={interest}
                            active={active}
                            onClick={() =>
                                setInterests(prev =>
                                    active ? prev.filter(item => item.id !== interest.id) : [...prev, interest]
                                )
                            }
                        />
                    );
                })}
            </div>

            {localError && (
                <div style={{ color: "#FF3B30", fontSize: 12, textAlign: "center", marginBottom: 16, fontWeight: 600, fontFamily: "'DM Sans', sans-serif",background: '#fef4ffed' }}>
                    {typeof localError === "string" ? localError : "An error occurred"}
                </div>
            )}

            <button
                onClick={handleRegister}
                disabled={loading}
                style={{
                    width: "100%",
                    background: loading ? COLORS.border : "linear-gradient(135deg, #c860d9, rgb(124, 85, 193))",
                    color: "white", border: "none", borderRadius: 14, padding: 16,
                    fontWeight: 800, fontSize: 15, cursor: loading ? "not-allowed" : "pointer",
                    fontFamily: "'Syne', sans-serif",
                    boxShadow: loading ? "none" : `0 8px 24px ${COLORS.primary}44`,
                }}
            >
                {loading ? "Creating Account..." : regSuccess ? "Success! ✓" : "Start Connecting"}
            </button>
        </div>
    );
}
