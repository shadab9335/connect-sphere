
import React, { useState } from "react";
import { COLORS } from "../../constants";
import LoginGif from '../../images/fist-bump.gif';
import { login } from "../../services/authService";

export default function WelcomeAuthScreen({ onNext, onLogin, error }) {
    const [employeeId, setEmployeeId] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [localError, setLocalError] = useState("");

    // The error shown to the user is either:
    //   • a local validation error (format check, empty fields), OR
    //   • a server-driven error passed in via props (invalid credentials)
    const displayedError = localError || error;

    const handleLogin = async () => {
        setLocalError("");
        if (!employeeId || !password) { setLocalError("EMPTY_FIELDS"); return; }
        if (!/^E\d{4}$/.test(employeeId)) { setLocalError("ID_INVALID_FORMAT"); return; }

        setLoading(true);
        try {
            const response = await login(employeeId, password);
            localStorage.setItem("userContext", JSON.stringify(response.data));
            onLogin(response.data);
        } catch (err) {
            const msg = err?.response?.data?.message || "";
            if (msg === "WRONG_PASSWORD") setLocalError("WRONG_PASSWORD");
            else if (msg === "WRONG_ID") setLocalError("WRONG_ID");
            else setLocalError("WRONG_ID");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ padding: 28, display: "flex", flexDirection: "column", height: "100%", boxSizing: "border-box" }}>
            {/* Title */}
            <div
                style={{
                    // fontFamily: "'Syne', sans-serif",
                    fontFamily: "'emoji",
                    fontWeight: 800,
                    fontSize: 26,
                    // color: COLORS.text,
                    color: '#eaeff3',
                    marginBottom: 8,
                }}
            >
                Welcome to ConnectSphere
            </div>

            <div
                style={{
                    fontFamily: "'DM Sans', sans-serif",
                    fontSize: 14,
                    // color: COLORS.muted,
                    color: '#efefef',
                    marginBottom: 28,
                }}
            >
                Sign in to continue or create a new account
            </div>

            {/* Inline error messages */}
            {displayedError && (
                <div style={{
                    display: "flex", alignItems: "center", gap: 10,
                    background: "rgba(255, 59, 48, 0.15)",
                    border: "1.5px solid rgba(255, 59, 48, 0.5)",
                    borderRadius: 12,
                    padding: "12px 14px",
                    marginBottom: 16,
                }}>
                    <div style={{
                        color: "#ff6b6b",
                        fontSize: 13,
                        fontWeight: 400,
                        fontFamily: "'DM Sans', sans-serif",
                        lineHeight: 1.4,
                    }}>
                        {displayedError === "WRONG_ID" && "Employee ID not found. Please check and try again."}
                        {displayedError === "WRONG_PASSWORD" && "Wrong password. Please try again."}
                        {displayedError === "INVALID_CREDENTIALS" && "Invalid employee ID or password."}
                        {displayedError === "ID_INVALID_FORMAT" && "ID must start with 'E' followed by 4 digits (e.g., E1042)"}
                        {displayedError === "EMPTY_FIELDS" && "Please enter both employee ID and password"}
                    </div>
                </div>
            )}

            {/* Employee ID */}
            <input
                value={employeeId}
                onChange={(e) => setEmployeeId(e.target.value)}
                placeholder="Employee ID (e.g., E1042)"
                autoComplete="off"
                style={{
                    width: "100%",
                    boxSizing: "border-box",
                    border: (displayedError === "EMPTY_FIELDS" && !employeeId) || displayedError === "ID_INVALID_FORMAT" || displayedError === "INVALID_CREDENTIALS"
                        ? "1.5px solid #FF3B30"
                        : `1.5px solid ${COLORS.border}`,

                    borderRadius: 12,
                    padding: "13px 16px",
                    fontSize: 14,
                    fontFamily: "'DM Sans', sans-serif",
                    backgroundColor: '#fef4ffed',
                    marginBottom: 16,
                }}
            />

            {/* Password */}
            <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"

                style={{
                    width: "100%",
                    boxSizing: "border-box",
                    border: (displayedError === "EMPTY_FIELDS" && !password) || displayedError === "INVALID_CREDENTIALS"
                        ? "1.5px solid #FF3B30"
                        : `1.5px solid ${COLORS.border}`,

                    borderRadius: 12,
                    padding: "13px 16px",
                    fontSize: 14,
                    fontFamily: "'DM Sans', sans-serif",
                    marginBottom: 20,
                    backgroundColor: '#fef4ffed'
                }}
            />

            {/* Login Button */}
            <button
                onClick={handleLogin} // 3. Link to the handler
                disabled={loading}
                style={{
                    width: "100%",
                    // background: loading ? COLORS.border : COLORS.primary,
                    background: 'linear-gradient(135deg, #c860d9, rgb(124 85 193))',
                    color: "white",
                    border: "none",
                    borderRadius: 14,
                    padding: 16,
                    fontWeight: 800,
                    fontSize: 15,
                    fontFamily: "'emoji",
                    marginBottom: 12,
                    cursor: loading ? "not-allowed" : "pointer"
                }}
            >
                {loading ? "Authenticating..." : "Login"}
            </button>
            {/* Spacer pushes signup link to bottom */}
            <div style={{ flex: 1 }} />

            {/* Signup Link */}
            <button
                onClick={onNext}
                style={{
                    width: "100%",
                    background: "transparent",
                    color: "rgb(5, 1, 147)",
                    border: "none",
                    borderRadius: 14,
                    padding: 12,
                    fontWeight: 600,
                    fontSize: 14,
                    fontFamily: "'DM Sans', sans-serif",
                    cursor: "pointer",
                    marginBottom: 8,
                }}
            >
                New user? Sign up
            </button>
        </div>
    );
}