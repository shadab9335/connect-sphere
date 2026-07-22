import React, { useState, useEffect } from "react";
import IconButton from "@mui/material/IconButton";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { COLORS } from "../../constants";
import {
    fetchDepartments,
    fetchLocations,
    fetchBuildings,
    fetchFloors,
} from "../../services/authService";

// ─── Fallback data (used if the API is unreachable) ──────────────────────────
// These mirrors the seeded data so the form remains functional offline.
const FALLBACK_DEPARTMENTS = [
    "Application Development",
    "Cloud & Infrastructure Engineering",
    "Data Engineering & Analytics",
    "Quality Engineering & Testing",
    "DevOps & Site Reliability",
];

// ─── Styles ──────────────────────────────────────────────────────────────────

const CHEVRON_SVG =
    "url(\"data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' width='14' height='14' viewBox='0 0 24 24' fill='none' stroke='%238892B0' stroke-width='2.5' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'/%3e%3c/svg%3e\")";

const baseSelectStyle = {
    width: "100%",
    boxSizing: "border-box",
    borderRadius: 12,
    padding: "13px 40px 13px 16px",
    fontSize: 14,
    fontFamily: "'DM Sans', sans-serif",
    marginBottom: 12,
    appearance: "none",
    WebkitAppearance: "none",
    MozAppearance: "none",
    backgroundImage: CHEVRON_SVG,
    backgroundRepeat: "no-repeat",
    backgroundPosition: "right 14px center",
    color: COLORS.text,
    cursor: "pointer",
    outline: "none",
    transition: "border-color 0.2s, opacity 0.2s",
};

const selectStyle = (hasError, disabled) => ({
    ...baseSelectStyle,
    backgroundColor: disabled ? "#F4F5F7" : "white",
    border: hasError ? "1.5px solid #FF3B30" : `1.5px solid ${COLORS.border}`,
    cursor: disabled ? "not-allowed" : "pointer",
    opacity: disabled ? 0.6 : 1,
});

const errorMsg = (text) => (
    <div
        style={{
            color: "#FF3B30",
            fontSize: 12,
            fontFamily: "'DM Sans', sans-serif",
            marginTop: -8,
            marginBottom: 12,
            fontWeight: 500,
        }}
    >
        {text}
    </div>
);

// ─── Component ───────────────────────────────────────────────────────────────

/**
 * REFACTORED: 4-step cascading dropdown flow.
 *
 * Props (all lifted to App.js):
 *   department / setDepartment
 *   location   / setLocation   ← NEW
 *   building   / setBuilding
 *   floor      / setFloor
 *   error
 *   onNext / onBack
 */
export default function SignupWorkLocationScreen({
    department, setDepartment,
    location,   setLocation,
    building,   setBuilding,
    floor,      setFloor,
    error,
    onNext, onBack,
}) {
    // ── Option lists ─────────────────────────────────────────────────────────
    const [departments, setDepartments] = useState(FALLBACK_DEPARTMENTS);
    const [locations,   setLocations]   = useState([]);
    const [buildings,   setBuildings]   = useState([]);
    const [floors,      setFloors]      = useState([]);

    // ── Loading state per dropdown ────────────────────────────────────────────
    // `initialLoading` covers the first fetch (departments) shown as a full spinner.
    // Per-dropdown loaders are shown inside the <select> as a "Loading…" option.
    const [initialLoading, setInitialLoading] = useState(true);
    const [loadingLocations, setLoadingLocations] = useState(false);
    const [loadingBuildings, setLoadingBuildings] = useState(false);
    const [loadingFloors,    setLoadingFloors]    = useState(false);

    // ── Step 1: load departments once on mount ────────────────────────────────
    useEffect(() => {
        fetchDepartments()
            .then((res) => {
                const depts = res.data?.data?.departments;
                if (depts?.length) setDepartments(depts);
            })
            .catch((err) =>
                console.warn("[CascadeDropdown] Could not load departments, using fallback.", err)
            )
            .finally(() => setInitialLoading(false));
    }, []);

    // ── Step 2: fetch locations when department changes ───────────────────────
    useEffect(() => {
        if (!department) {
            setLocations([]);
            setLocation("");
            setBuildings([]);
            setBuilding("");
            setFloors([]);
            setFloor("");
            return;
        }
        setLoadingLocations(true);
        // Clear downstream selections immediately
        setLocation("");
        setBuildings([]);
        setBuilding("");
        setFloors([]);
        setFloor("");

        fetchLocations(department)
            .then((res) => {
                const locs = res.data?.data?.locations;
                if (locs?.length) setLocations(locs);
                else setLocations([]);
            })
            .catch((err) =>
                console.warn("[CascadeDropdown] Could not load locations.", err)
            )
            .finally(() => setLoadingLocations(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [department]);

    // ── Step 3: fetch buildings when location changes ─────────────────────────
    useEffect(() => {
        if (!department || !location) {
            setBuildings([]);
            setBuilding("");
            setFloors([]);
            setFloor("");
            return;
        }
        setLoadingBuildings(true);
        setBuilding("");
        setFloors([]);
        setFloor("");

        fetchBuildings(department, location)
            .then((res) => {
                const bldgs = res.data?.data?.buildings;
                if (bldgs?.length) setBuildings(bldgs);
                else setBuildings([]);
            })
            .catch((err) =>
                console.warn("[CascadeDropdown] Could not load buildings.", err)
            )
            .finally(() => setLoadingBuildings(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [location]);

    // ── Step 4: fetch floors when building changes ────────────────────────────
    useEffect(() => {
        if (!department || !location || !building) {
            setFloors([]);
            setFloor("");
            return;
        }
        setLoadingFloors(true);
        setFloor("");

        fetchFloors(department, location, building)
            .then((res) => {
                const flrs = res.data?.data?.floors;
                if (flrs?.length) setFloors(flrs);
                else setFloors([]);
            })
            .catch((err) =>
                console.warn("[CascadeDropdown] Could not load floors.", err)
            )
            .finally(() => setLoadingFloors(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [building]);

    // ── Render ────────────────────────────────────────────────────────────────
    return (
        <div style={{ padding: 28 }}>
            <IconButton
                onClick={onBack}
                aria-label="back"
                sx={{ marginBottom: 1, marginLeft: -1, color: COLORS.text }}
            >
                <ArrowBackIcon />
            </IconButton>

            <div
                style={{
                    fontFamily: "'emoji",
                    fontWeight: 800,
                    fontSize: 26,
                    color: '#eaeff3',
                    marginBottom: 8,
                }}
            >
                Where do you work?
            </div>
            <div
                style={{
                    fontFamily: "'DM Sans', sans-serif",
                    fontSize: 14,
                    color: '#efefef',
                    marginBottom: 28,
                    lineHeight: 1.6,
                }}
            >
                Help colleagues find you on the right floor and team.
            </div>

            {initialLoading ? (
                <div
                    style={{
                        textAlign: "center",
                        padding: "20px 0",
                        backgroundColor: '#fef4ffed',
                        fontSize: 13,
                        fontFamily: "'DM Sans', sans-serif",
                    }}
                >
                    Loading options…
                </div>
            ) : (
                <>
                    {/* ── Step 1: Department ── */}
                    <select
                        value={department}
                        onChange={(e) => setDepartment(e.target.value)}
                        style={selectStyle(error === "DEPT_EMPTY", false)}
                    >
                        <option value="" disabled>Department</option>
                        {departments.map((d) => (
                            <option key={d} value={d}>{d}</option>
                        ))}
                    </select>
                    {error === "DEPT_EMPTY" && errorMsg("Please select your department")}

                    {/* ── Step 2: Location (NEW) ── */}
                    <select
                        value={location}
                        onChange={(e) => setLocation(e.target.value)}
                        disabled={!department || loadingLocations}
                        style={selectStyle(error === "LOCATION_EMPTY", !department || loadingLocations)}
                    >
                        {loadingLocations ? (
                            <option value="">Loading locations…</option>
                        ) : (
                            <>
                                <option value="" disabled>
                                    {!department ? "Select department first" : "Location"}
                                </option>
                                {locations.map((l) => (
                                    <option key={l} value={l}>{l}</option>
                                ))}
                            </>
                        )}
                    </select>
                    {error === "LOCATION_EMPTY" && errorMsg("Please select your location")}

                    {/* ── Step 3: Building ── */}
                    <select
                        value={building}
                        onChange={(e) => setBuilding(e.target.value)}
                        disabled={!location || loadingBuildings}
                        style={selectStyle(error === "BUILDING_EMPTY", !location || loadingBuildings)}
                    >
                        {loadingBuildings ? (
                            <option value="">Loading buildings…</option>
                        ) : (
                            <>
                                <option value="" disabled>
                                    {!location ? "Select location first" : "Building"}
                                </option>
                                {buildings.map((b) => (
                                    <option key={b} value={b}>{b}</option>
                                ))}
                            </>
                        )}
                    </select>
                    {error === "BUILDING_EMPTY" && errorMsg("Please select your building")}

                    {/* ── Step 4: Floor ── */}
                    <select
                        value={floor}
                        onChange={(e) => setFloor(e.target.value)}
                        disabled={!building || loadingFloors}
                        style={selectStyle(error === "FLOOR_EMPTY", !building || loadingFloors)}
                    >
                        {loadingFloors ? (
                            <option value="">Loading floors…</option>
                        ) : (
                            <>
                                <option value="" disabled>
                                    {!building ? "Select building first" : "Floor"}
                                </option>
                                {floors.map((f) => (
                                    <option key={f} value={f}>{f}</option>
                                ))}
                            </>
                        )}
                    </select>
                    {error === "FLOOR_EMPTY" && errorMsg("Please select your floor")}
                </>
            )}

            <button
                onClick={onNext}
                disabled={initialLoading}
                style={{
                    width: "100%",
                    background: initialLoading ? COLORS.border : "linear-gradient(135deg, #c860d9, rgb(124, 85, 193))",
                    color: "white",
                    border: "none",
                    borderRadius: 14,
                    padding: 16,
                    fontWeight: 800,
                    fontSize: 15,
                    fontFamily: "'emoji",
                    cursor: initialLoading ? "not-allowed" : "pointer",
                    marginTop: 8,
                }}
            >
                Continue
            </button>
        </div>
    );
}
