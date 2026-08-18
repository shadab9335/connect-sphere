import React from "react";
import IconButton from "@mui/material/IconButton";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { COLORS } from "../../constants";

const inputStyle = (hasError) => ({
    width: "100%",
    boxSizing: "border-box",
    border: hasError ? "1.5px solid #FF3B30" : "1.5px solid #d8d0f0",
    borderRadius: 12,
    padding: "13px 16px",
    fontSize: 14,
    fontFamily: "'DM Sans', sans-serif",
    background: "rgba(255,255,255,0.92)",
    marginBottom: 4,
    outline: "none",
    color: "#1A1A2E",
    transition: "border 0.2s",
});

const hintRow = (passed, text) => (
    <div style={{
        display: "flex", alignItems: "center", gap: 6,
        fontSize: 12, fontFamily: "'DM Sans', sans-serif",
        color: passed ? "#4ade80" : "#ff6b6b",
        marginBottom: 3,
        fontWeight: 500,
    }}>
        <span style={{ fontSize: 13 }}>{passed ? "✓" : "✗"}</span>
        {text}
    </div>
);

const alertBox = (text) => (
    <div style={{
        display: "flex", alignItems: "center", gap: 10,
        background: "rgba(255, 59, 48, 0.15)",
        border: "1.5px solid rgba(255, 59, 48, 0.5)",
        borderRadius: 12, padding: "12px 14px", marginBottom: 10,
    }}>
        <div style={{ color: "#ff6b6b", fontSize: 13, fontWeight: 400, fontFamily: "'DM Sans', sans-serif", lineHeight: 1.4 }}>
            {text}
        </div>
    </div>
);

export default function SignupIdentityScreen({
    fullName, setFullName,
    empId, setEmpId,
    password, setPassword,
    confirmPassword, setConfirmPassword,
    error,
    isAnonymous, setIsAnonymous,
    onNext, onBack,
}) {
    const empIdValid = /^E\d{4}$/.test(empId);

    const pwMinLen      = password.length >= 6;
    const pwHasUpper    = /[A-Z]/.test(password);
    const pwHasDigit    = /\d/.test(password);
    const pwHasSpecial  = /[^A-Za-z0-9]/.test(password);
    const pwValid       = pwMinLen && pwHasUpper && pwHasDigit && pwHasSpecial;
    const pwMatch       = password.length > 0 && password === confirmPassword;

    const showEmpIdHint     = empId.length > 0 && !empIdValid;
    const showPwHints       = password.length > 0 && !pwValid;
    const showPwMatchHint   = confirmPassword.length > 0 && !pwMatch;

    const formValid =
        empIdValid &&
        fullName.trim().length > 0 &&
        pwValid &&
        pwMatch;

    return (
        <div style={{ padding: 28 }}>
            {/* Back */}
            <IconButton
                onClick={onBack}
                aria-label="back"
                sx={{
                    marginBottom: 1,
                    marginLeft: -1,
                    color: "#ffffff",
                    background: "rgba(255,255,255,0.15)",
                    borderRadius: "50%",
                    padding: "8px",
                    "&:hover": { background: "rgba(255,255,255,0.25)" },
                }}
            >
                <ArrowBackIcon />
            </IconButton>

            {/* Header */}
            <div style={{ fontWeight: 800, fontSize: 26, color: "#eaeff3", marginBottom: 6, fontFamily: "'DM Sans', sans-serif" }}>
                Create your account
            </div>
            <div style={{ fontSize: 14, color: "#c9c9d4", marginBottom: 24, lineHeight: 1.6, fontFamily: "'DM Sans', sans-serif" }}>
                Tell us a bit about yourself to get started.
            </div>

            {/* Employee ID */}
            <input
                value={empId}
                onChange={(e) => setEmpId(e.target.value)}
                placeholder="Employee ID (e.g., E1042)"
                style={inputStyle(
                    showEmpIdHint ||
                    error === "ID_EMPTY" ||
                    error === "ID_FORMAT_INVALID" ||
                    (error && error.includes("already exists"))
                )}
            />
            {showEmpIdHint && alertBox("Format must be E followed by 4 digits (e.g. E1042)")}
            {error && error.includes("already exists") && alertBox(error)}
            {!showEmpIdHint && !error?.includes("already exists") && <div style={{ marginBottom: 10 }} />}

            {/* Full Name */}
            <input
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Full Name"
                style={inputStyle(error === "NAME_EMPTY")}
            />
            <div style={{ marginBottom: 10 }} />

            {/* Password */}
            <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                style={inputStyle(
                    error === "PASSWORD_EMPTY" ||
                    error === "PASSWORD_TOO_SHORT" ||
                    error === "PASSWORD_FORMAT_INVALID" ||
                    (password.length > 0 && !pwValid)
                )}
            />

            {/* Live password hints */}
            {showPwHints && (
                <div style={{
                    background: "rgba(255, 59, 48, 0.1)",
                    border: "1.5px solid rgba(255, 59, 48, 0.4)",
                    borderRadius: 12,
                    padding: "12px 14px",
                    marginBottom: 10,
                    marginTop: 4,
                }}>
                    <div style={{ fontSize: 11, color: "#ff9a9a", fontFamily: "'DM Sans', sans-serif", marginBottom: 6, fontWeight: 700, letterSpacing: 0.5 }}>
                        PASSWORD REQUIREMENTS
                    </div>
                    {hintRow(pwMinLen,     "At least 6 characters")}
                    {hintRow(pwHasUpper,   "At least 1 uppercase letter")}
                    {hintRow(pwHasDigit,   "At least 1 digit")}
                    {hintRow(pwHasSpecial, "At least 1 special character (e.g. @, #, !)")}
                </div>
            )}
            {!showPwHints && <div style={{ marginBottom: 10 }} />}

            {/* Confirm Password */}
            <input
                type="password"
                placeholder="Confirm Password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                style={inputStyle(
                    error === "PASSWORD_MISMATCH" ||
                    showPwMatchHint
                )}
            />
            {showPwMatchHint && alertBox("Passwords do not match")}
            {!showPwMatchHint && <div style={{ marginBottom: 10 }} />}

            {/* Anonymous toggle */}
            <div
                onClick={() => setIsAnonymous(!isAnonymous)}
                style={{
                    display: "flex", justifyContent: "space-between", alignItems: "center",
                    padding: 14, borderRadius: 12,
                    background: "#ffffff",
                    border: `1.5px solid ${isAnonymous ? COLORS.primary : "#d8d0f0"}`,
                    cursor: "pointer", marginBottom: 24,
                    transition: "border 0.2s",
                }}
            >
                <div>
                    <div style={{ fontWeight: 600, fontSize: 13, fontFamily: "'DM Sans', sans-serif", color: "#1A1A2E" }}>
                        Register as Anonymous
                    </div>
                    <div style={{ fontSize: 11, color: "#666", fontFamily: "'DM Sans', sans-serif", marginTop: 2 }}>
                        Appear anonymously in public spaces
                    </div>
                </div>
                <div style={{
                    width: 42, height: 24, borderRadius: 12,
                    background: isAnonymous ? COLORS.primary : "#c9c0e8",
                    position: "relative", transition: "background 0.2s", flexShrink: 0,
                }}>
                    <div style={{
                        width: 18, height: 18, borderRadius: "50%", background: "white",
                        position: "absolute", top: 3,
                        left: isAnonymous ? 21 : 3, transition: "left 0.2s",
                        boxShadow: "0 1px 4px rgba(0,0,0,0.2)",
                    }} />
                </div>
            </div>

            {/* Continue button */}
            <button
                onClick={onNext}
                disabled={!formValid}
                style={{
                    width: "100%",
                    background: formValid
                        ? "linear-gradient(135deg, #c860d9, rgb(124, 85, 193))"
                        : "rgba(255,255,255,0.3)",
                    color: formValid ? "white" : "rgba(255,255,255,0.6)",
                    border: "none", borderRadius: 14, padding: 16,
                    fontWeight: 800, fontSize: 15, fontFamily: "'DM Sans', sans-serif",
                    cursor: formValid ? "pointer" : "not-allowed",
                    transition: "background 0.2s, color 0.2s",
                    letterSpacing: 0.3,
                }}
            >
                Continue →
            </button>
        </div>
    );
}
