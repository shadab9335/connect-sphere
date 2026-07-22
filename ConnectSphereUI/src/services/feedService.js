import axios from 'axios';
import config from '../config';

const FEED_BASE = `${config.FEED_API}/api/feed`;
const USER_BASE = `${config.USER_API}`;
const authHeader = () => ({ Authorization: `Bearer ${localStorage.getItem('token')}` });

// ─────────────────────────────────────────────────────────────────────────────
// TABS
// GET /auth/interests  (UserAndInterest service — port 8081)
// This endpoint already exists and is proven to work (used in SignupInterestsScreen).
// Returns: { success, data: [ { id, label, emoji, description }, ... ] }
// The FeedScreen sorts the result using user.interests from localStorage.
// ─────────────────────────────────────────────────────────────────────────────
export const fetchAllInterests = () =>
    axios.get(`${USER_BASE}/auth/interests`);

// ─────────────────────────────────────────────────────────────────────────────
// FEED
// ─────────────────────────────────────────────────────────────────────────────
export const fetchFeed = (tag, before = null, size = 20) => {
    const params = { size };
    if (tag && tag !== 'All') params.tag = tag;
    if (before) params.before = before;
    return axios.get(`${FEED_BASE}/posts/timeline`, { headers: authHeader(), params });
};

export const createPost = (formData) =>
    axios.post(`${FEED_BASE}/posts`, formData, { headers: authHeader() });

export const likePost = (id) =>
    axios.post(`${FEED_BASE}/posts/${id}/like`, {}, { headers: authHeader() });

export const unlikePost = (id) =>
    axios.delete(`${FEED_BASE}/posts/${id}/like`, { headers: authHeader() });

export const bookmarkPost = (id) =>
    axios.post(`${FEED_BASE}/posts/${id}/bookmark`, {}, { headers: authHeader() });

export const unbookmarkPost = (id) =>
    axios.delete(`${FEED_BASE}/posts/${id}/bookmark`, { headers: authHeader() });

export const fetchUserPosts = (userId) =>
    axios.get(`${FEED_BASE}/user/${userId}/posts`, { headers: authHeader() });
export const fetchUserBookmarks = (userId) =>
    axios.get(`${FEED_BASE}/user/${userId}/bookmarks`, { headers: authHeader() });

export const deletePost = (id) =>
    axios.delete(`${FEED_BASE}/posts/${id}`, { headers: authHeader() });

export const updatePost = (id, payload) =>
    axios.put(`${FEED_BASE}/posts/${id}`, payload, { headers: authHeader() });
