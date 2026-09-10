import axios from 'axios';

const API_BASE_URL = "http://localhost:3000/api/auth";

export async function register({ username, email, password }) {
    try {
        const res = await axios.post(`${API_BASE_URL}/register`, {
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
        const res = await axios.post(`${API_BASE_URL}/login`, {
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
        const res = await axios.get(`${API_BASE_URL}/logout`, {
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
        const res = await axios.get(`${API_BASE_URL}/get-me`, {
            withCredentials: true
        });
        return res.data;
    } catch (error) {
        console.error("GetMe Error:", error.response?.data || error.message);
        throw error;
    }
}