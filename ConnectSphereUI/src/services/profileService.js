// import axios from 'axios';
// import config from '../config';

// const BASE = config.USER_API;

// // /auth/profile/me identifies the user via the X-User-Id header (NOT a Bearer token).
// // We pluck the MongoDB ObjectId from the user object saved at login time.
// const userIdHeader = () => {
//     try {
//         const user = JSON.parse(localStorage.getItem('user') || '{}');
//         return { 'X-User-Id': user.id || '' };
//     } catch {
//         return { 'X-User-Id': '' };
//     }
// };

// export const fetchMyProfile = () =>
//     axios.get(`${BASE}/auth/profile/me`, { headers: userIdHeader() });

// // PUT /auth/profile/update — persists all editable fields in ONE request.
// // Backend expects (per ProfileUpdateRequest.java):
// //   { fullName, isAnonymous, department, building, floor, profilePicture, interests }
// export const updateProfile = (payload) => {
//     const url = `${BASE}/auth/profile/update`;
//     console.log("%c[profileService] → PUT " + url, "color: orange; font-weight: bold");
//     console.log("[profileService]   • payload:", payload);

//     return axios.put(url, payload, { headers: userIdHeader() })
//         .then(res => {
//             console.log("%c[profileService] ← Update succeeded", "color: green; font-weight: bold");
//             console.log("[profileService]   • status:", res.status);
//             console.log("[profileService]   • response:", res.data);
//             return res;
//         })
//         .catch(err => {
//             console.error("%c[profileService] ✗ Update FAILED", "color: red; font-weight: bold");
//             console.error("[profileService]   • message:", err.message);
//             console.error("[profileService]   • status :", err.response?.status);
//             console.error("[profileService]   • body   :", err.response?.data);
//             throw err; // re-throw so the screen's catch handler can show error to user
//         });
// };


import axios from 'axios';
import config from '../config';

const BASE = config.USER_API;

// FIXED: Plucks the employeeId (e.g. "E1000") instead of the MongoDB hex id
// because the backend AuthController expects the employeeId string in @RequestHeader("X-User-Id").
const userIdHeader = () => {
    try {
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        return { 'X-User-Id': user.employeeId || '' };
    } catch {
        return { 'X-User-Id': '' };
    }
};

export const fetchMyProfile = () =>
    axios.get(`${BASE}/auth/profile/me`, { headers: userIdHeader() });

// PUT /auth/profile/update — persists all editable fields in ONE request.
// Backend expects (per ProfileUpdateRequest.java):
//   { fullName, isAnonymous, department, building, floor, profilePicture, interests }
export const updateProfile = (payload) => {
    const url = `${BASE}/auth/profile/update`;
    console.log("%c[profileService] → PUT " + url, "color: orange; font-weight: bold");
    console.log("[profileService]   • payload:", payload);

    return axios.put(url, payload, { headers: userIdHeader() })
        .then(res => {
            console.log("%c[profileService] ← Update succeeded", "color: green; font-weight: bold");
            console.log("[profileService]   • status:", res.status);
            console.log("[profileService]   • response:", res.data);
            return res;
        })
        .catch(err => {
            console.error("%c[profileService] ✗ Update FAILED", "color: red; font-weight: bold");
            console.error("[profileService]   • message:", err.message);
            console.error("[profileService]   • status :", err.response?.status);
            console.error("[profileService]   • body   :", err.response?.data);
            throw err; // re-throw so the screen's catch handler can show error to user
        });
};