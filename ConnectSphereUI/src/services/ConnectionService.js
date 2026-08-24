import axios from "axios";
import config from "../config";
const BASE = `${config.USER_API}/api/connections`;
/**
 * Connect two users
 *
 * POST /api/connections/{requesterUserId}/{recipientUserId}
 */
export const connectUser = async (
    requesterUserId,
    recipientUserId
) => {
    return axios.post(
        `${BASE}/${requesterUserId}/${recipientUserId}`
    );
};
/**
 * Disconnect two users
 *
 * DELETE /api/connections/{firstUserId}/{secondUserId}
 */
export const disconnectUser = async (
    firstUserId,
    secondUserId
) => {
    return axios.delete(
        `${BASE}/${firstUserId}/${secondUserId}`
    );
};
/**
 * Get all connections for a user
 *
 * GET /api/connections/{userId}
 */
export const getConnectionsForUser = async (
    userId
) => {
    return axios.get(
        `${BASE}/${userId}`
    );
};
/**
 * Get connection count for a user
 *
 * GET /api/connections/{userId}/count
 */
export const getConnectionCount = async (
    userId
) => {
    return axios.get(
        `${BASE}/${userId}/count`
    );
};