// Picklist lookups for signup / profile-edit dropdowns.
// Each function hits a GET endpoint on the UserAndInterest service and
// returns a list of { id, name, active } records. These used to be
// hardcoded arrays in constants.js — moved to the backend so adding a new
// department / building / floor only requires a DB insert.

import axios from 'axios';
import config from '../config';

const BASE = `${config.USER_API}/api`;

// GET /api/departments → { success, data: [{ id, name, active }] }
export const fetchDepartments = () => {
    const url = `${BASE}/departments`;
    console.log("%c[lookupService] → GET " + url, "color: orange; font-weight: bold");
    return axios.get(url)
        .then(res => {
            console.log("[lookupService] ← departments count:", res.data?.data?.length);
            return res;
        })
        .catch(err => {
            console.error("[lookupService] ✗ departments fetch failed:", err.message);
            throw err;
        });
};

// GET /api/buildings → { success, data: [{ id, name, active }] }
export const fetchBuildings = () => {
    const url = `${BASE}/buildings`;
    console.log("%c[lookupService] → GET " + url, "color: orange; font-weight: bold");
    return axios.get(url)
        .then(res => {
            console.log("[lookupService] ← buildings count:", res.data?.data?.length);
            return res;
        })
        .catch(err => {
            console.error("[lookupService] ✗ buildings fetch failed:", err.message);
            throw err;
        });
};

// GET /api/floors → { success, data: [{ id, name, active }] }
export const fetchFloors = () => {
    const url = `${BASE}/floors`;
    console.log("%c[lookupService] → GET " + url, "color: orange; font-weight: bold");
    return axios.get(url)
        .then(res => {
            console.log("[lookupService] ← floors count:", res.data?.data?.length);
            return res;
        })
        .catch(err => {
            console.error("[lookupService] ✗ floors fetch failed:", err.message);
            throw err;
        });
};
