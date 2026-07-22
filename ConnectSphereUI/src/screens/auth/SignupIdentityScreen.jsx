import React from "react";
import IconButton from "@mui/material/IconButton";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { COLORS } from "../../constants";

export default function SignupIdentityScreen({
    fullName, setFullName,
    empId, setEmpId,
    password, setPassword,
    confirmPassword, setConfirmPassword,
    error,
    isAnonymous, setIsAnonymous,
    onNext, onBack,
}) {
    // ── Live rule checks (kept silent for now — only used to gate the Continue button) ──
    const empIdValid       = /^E\d{4}$/.test(empId);
    const pwHasMinLen      = password.length >= 6;
    const pwStartsCapital  = /^[A-Z]/.test(password);
    const pwHasDigit       = /\d/.test(password);
    const pwHasAt          = /@/.test(password);
    const pwValid          = pwHasMinLen && pwStartsCapital && pwHasDigit && pwHasAt;
    const pwMatch          = password.length > 0 && password === confirmPassword;

    const formValid =
        empIdValid &&
        fullName.trim().length > 0 &&
        pwValid &&
        pwMatch;

    return (
        <div style={{ padding: 28 }}>
            {/* Back button */}
            <IconButton
                onClick={onBack}
                aria-label="back"
                sx={{ marginBottom: 1, marginLeft: -1, color: COLORS.text }}
            >
                <ArrowBackIcon />
            </IconButton>

            {/* Header */}
            <div style={{ fontFamily: "'emoji", fontWeight: 800, fontSize: 26, color: '#eaeff3', marginBottom: 8 }}>
                Create your account
            </div>
            <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 14, color: '#efefef', marginBottom: 28, lineHeight: 1.6 }}>
                Tell us a bit about yourself to get started.
            </div>

            {/* Employee ID */}
            <input
                value={empId}
                onChange={(e) => setEmpId(e.target.value)}
                placeholder="Employee ID (e.g., E1042)"
                style={{
                    width: "100%", boxSizing: "border-box",
                    border:
                        (error === "ID_EMPTY" || error === "ID_FORMAT_INVALID" || (error && error.includes("already exists")))
                            ? "1.5px solid #FF3B30"
                            : `1.5px solid ${COLORS.border}`,
                    borderRadius: 12, padding: "13px 16px", fontSize: 14,
                    fontFamily: "'DM Sans', sans-serif", background: '#fef4ffed', marginBottom: 12,
                }}
            />
            {error && error.includes("already exists") && (
                <div style={{ color: "#FF3B30", fontSize: 12, fontFamily: "'DM Sans', sans-serif", marginBottom: 12, fontWeight: 500 }}>
                    {error}
                </div>
            )}

            {/* Full Name */}
            <input
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Full Name"
                style={{
                    width: "100%", boxSizing: "border-box",
                    border: error === "NAME_EMPTY" ? "1.5px solid #FF3B30" : `1.5px solid ${COLORS.border}`,
                    borderRadius: 12, padding: "13px 16px", fontSize: 14,
                    fontFamily: "'DM Sans', sans-serif",background: '#fef4ffed', marginBottom: 12,
                }}
            />

            {/* Password */}
            <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                style={{
                    width: "100%", boxSizing: "border-box",
                    border:
                        (error === "PASSWORD_EMPTY" || error === "PASSWORD_TOO_SHORT" || error === "PASSWORD_FORMAT_INVALID")
                            ? "1.5px solid #FF3B30"
                            : `1.5px solid ${COLORS.border}`,
                    borderRadius: 12, padding: "13px 16px", fontSize: 14,
                    fontFamily: "'DM Sans', sans-serif",background: '#fef4ffed', marginBottom: 12,
                }}
            />

            {/* Confirm Password */}
            <div style={{ marginBottom: 12 }}>
                <input
                    type="password"
                    placeholder="Confirm Password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    style={{
                        width: "100%", boxSizing: "border-box",
                        border: (error === "PASSWORD_MISMATCH")
                            ? "1.5px solid #FF3B30" : `1.5px solid ${COLORS.border}`,
                        borderRadius: 12, padding: "13px 16px", fontSize: 14,
                        fontFamily: "'DM Sans', sans-serif",background: '#fef4ffed', marginBottom: 0,
                    }}
                />
            </div>

            {/* Anonymous option */}
            <div
                onClick={() => setIsAnonymous(!isAnonymous)}
                style={{
                    display: "flex", justifyContent: "space-between", alignItems: "center",
                    padding: 14, borderRadius: 12, background: "white",
                    border: `1.5px solid ${COLORS.border}`, cursor: "pointer", marginBottom: 28,
                }}
            >
                <div style={{ background: '#fef4ffed' }}>
                    <div style={{ fontWeight: 600, fontSize: 13, fontFamily: "'DM Sans', sans-serif",background: '#fef4ffed' }}>
                        Register as Anonymous
                    </div>
                    <div style={{ fontSize: 11, color: COLORS.muted, fontFamily: "'DM Sans', sans-serif",background: '#fef4ffed' }}>
                        You can choose to appear anonymously in public spaces
                    </div>
                </div>
                <div style={{
                    width: 42, height: 24, borderRadius: 12,
                    background: isAnonymous ? COLORS.primary : COLORS.border,
                    position: "relative",
                }}>
                    <div style={{
                        width: 18, height: 18, borderRadius: "50%", background: "white",
                        position: "absolute", top: 3,
                        left: isAnonymous ? 21 : 3, transition: "left 0.2s",
                    }} />
                </div>
            </div>

            {/* Continue — disabled until every rule passes (no visible hint for now) */}
            <button
                onClick={onNext}
                disabled={!formValid}
                style={{
                    width: "100%",
                    background: formValid ? "linear-gradient(135deg, #c860d9, rgb(124, 85, 193))" : COLORS.border,
                    color: "white",
                    border: "none", borderRadius: 14, padding: 16,
                    fontWeight: 800, fontSize: 15, fontFamily: "'emoji",
                    cursor: formValid ? "pointer" : "not-allowed",
                    opacity: formValid ? 1 : 0.7,
                    transition: "background 0.2s, opacity 0.2s",
                }}
            >
                Continue
            </button>
        </div>
    );
}
