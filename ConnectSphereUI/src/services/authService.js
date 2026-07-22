// All backend calls used during sign-in / sign-up.

import axios from 'axios';
import config from '../config';

const BASE = `${config.USER_API}/auth`;

// POST /auth/login  →  { success, data: { token, user } }
export const login = (employeeId, password) =>
    axios.post(`${BASE}/login`, { employeeId, password });

// POST /auth/register  →  { success, data: { token, user } }
export const register = (payload) =>
    axios.post(`${BASE}/register`, payload);

// GET /auth/interests  →  { success, data: [ { id, label, emoji, description } ] }
export const fetchInterests = () =>
    axios.get(`${BASE}/interests`);

// ─── Cascading Dropdown API calls ────────────────────────────────────────────
// Each call depends on the selection made in the previous step.

/**
 * Step 1 — Fetch all department names.
 * GET /auth/cascade/departments
 * Response: { success, data: { departments: ["Application Development", ...] } }
 */
export const fetchDepartments = () =>
    axios.get(`${BASE}/cascade/departments`);

/**
 * Step 2 — Fetch locations for the selected department.
 * GET /auth/cascade/locations?department=Application+Development
 * Response: { success, data: { department: "...", locations: ["Bangalore", ...] } }
 */
export const fetchLocations = (department) =>
    axios.get(`${BASE}/cascade/locations`, { params: { department } });

/**
 * Step 3 — Fetch buildings for the selected department + location.
 * GET /auth/cascade/buildings?department=...&location=Bangalore
 * Response: { success, data: { ..., buildings: ["G1", "G2"] } }
 */
export const fetchBuildings = (department, location) =>
    axios.get(`${BASE}/cascade/buildings`, { params: { department, location } });

/**
 * Step 4 — Fetch floors for the selected department + location + building.
 * GET /auth/cascade/floors?department=...&location=...&building=G1
 * Response: { success, data: { ..., floors: ["Floor 1", "Floor 2", ...] } }
 */
export const fetchFloors = (department, location, building) =>
    axios.get(`${BASE}/cascade/floors`, { params: { department, location, building } });
