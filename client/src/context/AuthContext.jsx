import React, { createContext, useState, useEffect, useContext } from 'react';
import axios from 'axios';

// Create the AuthContext
const AuthContext = createContext(null);

// Define your backend API base URL
const API_URL = 'http://localhost:5000/api'; // Make sure this matches your backend server's address

// AuthProvider component that will wrap your entire application or parts of it
export const AuthProvider = ({ children }) => {
    // State to store the user's token and username
    const [token, setToken] = useState(localStorage.getItem('token'));
    const [user, setUser] = useState(null); // Will store the username from the token

    // Effect to set up Axios defaults and parse user from token on load
    useEffect(() => {
        if (token) {
            axios.defaults.headers.common['x-auth-token'] = token;
            // In a real app, you'd decode the token on the client or make an API call to verify it.
            // For simplicity, we'll just assume the token is valid and extract the username (if needed)
            // You might need a helper function to decode JWT if you want user info on frontend without another API call.
            // For now, we'll rely on the backend to verify the token for protected routes.
            // A simple way to get username from token on frontend for display (not for security):
            try {
                const base64Url = token.split('.')[1];
                const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
                const decodedPayload = JSON.parse(window.atob(base64));
                setUser(decodedPayload.username);
            } catch (error) {
                console.error("Failed to decode token:", error);
                logout(); // If token is malformed, log out
            }

        } else {
            delete axios.defaults.headers.common['x-auth-token'];
            setUser(null);
        }
    }, [token]); // Re-run this effect if token changes

    // Login function
    const login = async (username, password) => {
        try {
            const res = await axios.post(`${API_URL}/login`, { username, password });
            setToken(res.data.token);
            localStorage.setItem('token', res.data.token);
            setUser(username); // Set user immediately on successful login
            return { success: true };
        } catch (err) {
            console.error('Login error:', err.response?.data || err.message);
            return { success: false, message: err.response?.data?.message || 'Login failed' };
        }
    };

    // Register function
    const register = async (username, password) => {
        try {
            const res = await axios.post(`${API_URL}/register`, { username, password });
            return { success: true, message: res.data.message };
        } catch (err) {
            console.error('Register error:', err.response?.data || err.message);
            return { success: false, message: err.response?.data?.message || 'Registration failed' };
        }
    };

    // Logout function
    const logout = () => {
        setToken(null);
        localStorage.removeItem('token');
        delete axios.defaults.headers.common['x-auth-token']; // Remove header for future requests
        setUser(null);
    };

    // Value provided by the context to its consumers
    const authContextValue = {
        token,
        user, // The logged-in user's username
        isAuthenticated: !!token, // True if token exists
        login,
        register,
        logout,
    };

    return (
        <AuthContext.Provider value={authContextValue}>
            {children}
        </AuthContext.Provider>
    );
};

// Custom hook to use the AuthContext easily
export const useAuth = () => {
    return useContext(AuthContext);
};