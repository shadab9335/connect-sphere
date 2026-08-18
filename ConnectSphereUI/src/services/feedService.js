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

// // Fetch comments for a post
// export const getReplies = async (postId) => {
//   const response = await api.get(`/api/feed/posts/${postId}/replies`);
//   return response.data;
// };

// // Add a comment to a post
// export const addReply = async (postId, content, isAnonymous = false) => {
//   const response = await api.post(`/api/feed/posts/${postId}/replies`, {
//     content,
//     anonymous: isAnonymous
//   });
//   return response.data;
// };

// // Delete a comment
// export const deleteReply = async (replyId) => {
//   await api.delete(`/api/feed/replies/${replyId}`);
// };

export const getReplies = async (postId) => {
  const response = await axios.get(
    `${FEED_BASE}/posts/${postId}/replies`,
    { headers: authHeader() }
  );
  return response.data;
};

export const addReply = async (postId, content, isAnonymous = false) => {
  const response = await axios.post(
    `${FEED_BASE}/posts/${postId}/replies`,
    {
      content,
      anonymous: isAnonymous
    },
    { headers: authHeader() }
  );
  return response.data;
};

export const deleteReply = async (replyId) => {
  await axios.delete(
    `${FEED_BASE}/replies/${replyId}`,
    { headers: authHeader() }
  );
};