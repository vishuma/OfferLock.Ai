import axios from 'axios';
import API_BASE_URL from '../../../config/api.config.js';

const AUTH_API_URL = `${API_BASE_URL}/api/auth`;

export async function register({ username, email, password }) {
    try {
        const res = await axios.post(`${AUTH_API_URL}/register`, {
            username,
            email,
            password
        }, {
            withCredentials: true
        });
        return res.data;
    } catch (error) {
        console.error("Register Error:", error.response?.data || error.message);
        throw error;
    }
}

export async function login({ email, password }) {
    try {
        const res = await axios.post(`${AUTH_API_URL}/login`, {
            email,
            password
        }, {
            withCredentials: true
        });
        return res.data;
    } catch (error) {
        console.error("Login Error:", error.response?.data || error.message);
        throw error;
    }
}

export async function logout() {
    try {
        // Changed to GET to match router.get("/logout", ...)
        const res = await axios.get(`${AUTH_API_URL}/logout`, {
            withCredentials: true
        });
        return res.data;
    } catch (error) {
        console.error("Logout Error:", error.response?.data || error.message);
        throw error;
    }
}

export async function getMe() {
    try {
        // Changed to GET to match router.get("/get-me", ...)
        const res = await axios.get(`${AUTH_API_URL}/get-me`, {
            withCredentials: true
        });
        return res.data;
    } catch (error) {
        console.error("GetMe Error:", error.response?.data || error.message);
        throw error;
    }
}