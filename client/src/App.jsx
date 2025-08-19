import React from 'react';
// Import components from react-router-dom for routing
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
// Import our custom authentication context and hook
import { AuthProvider, useAuth } from './context/AuthContext';
// Import the authentication components we created earlier
import Login from './components/Login';
import Register from './components/Register';
import FileUpload from './components/FileUpload'; // Import FileUpload component
import MyFiles from './components/MyFiles';       // Import MyFiles component
import AllFiles from './components/AllFiles';     // Import AllFiles component

// NEW: Placeholder image URL for the background
const BACKGROUND_IMAGE_URL = 'https://placehold.co/1920x1080/ADD8E6/000000?text=Academic+Background'; // Light blue background with text

// --- Component: Home ---
// This component serves as the landing page. Its content changes based on authentication status.
const Home = () => {
    // Access authentication state and functions from our AuthContext
    const { user, isAuthenticated, logout } = useAuth();
    return (
        // Apply background style directly to the container
        <div style={homeStyles.container}>
            {/* NEW: Content box for better visual separation */}
            <div style={homeStyles.contentBox}>
                <h2 style={homeStyles.heading}>Welcome to Rootle🌴 Academic Hub!</h2>
                {/* NEW: Tagline */}
                <p style={homeStyles.tagline}>Your Collaborative Academic Resource Platform</p>

                {/* Conditional rendering: Show different content if user is authenticated or not */}
                {isAuthenticated ? (
                    // Content for logged-in users
                    <>
                        <p style={homeStyles.greeting}>Hello, {user}!</p> {/* Display logged-in username */}
                        <p style={homeStyles.message}>You are logged in. Explore and share academic resources.</p>
                        <nav style={homeStyles.nav}>
                            {/* Navigation links for authenticated users */}
                            <a href="/upload" style={homeStyles.navLink}>Upload File</a>
                            <a href="/my-files" style={homeStyles.navLink}>My Files</a>
                            <a href="/all-files" style={homeStyles.navLink}>All Files</a>
                            <button onClick={logout} style={homeStyles.logoutButton}>Logout</button> {/* Logout button */}
                            {/* REMOVED: <a href="/protected" style={homeStyles.navLink}>Test Protected Route</a> */}
                        </nav>
                    </>
                ) : (
                    // Content for unauthenticated users
                    <>
                        <p style={homeStyles.message}>Please log in or register to access resources.</p>
                        <nav style={homeStyles.nav}>
                            {/* Navigation links for unauthenticated users */}
                            <a href="/login" style={homeStyles.navLink}>Login</a>
                            <a href="/register" style={homeStyles.navLink}>Register</a>
                        </nav>
                    </>
                )}
            </div>
        </div>
    );
};

// --- Component: Protected ---
// A simple component to demonstrate a page that only authenticated users can see.
const Protected = () => {
    const { user } = useAuth(); // Get user info from context
    return (
        <div style={homeStyles.container}> {/* Reusing container style, but content will be simple */}
            <div style={homeStyles.contentBox}> {/* Ensure Protected also uses contentBox for consistent styling */}
                <h2 style={homeStyles.heading}>Protected Content</h2>
                <p style={homeStyles.message}>If you see this, you are authenticated, {user}!</p>
                <a href="/" style={homeStyles.navLink}>Go Home</a> {/* Link back to home */}
            </div>
        </div>
    );
};

// --- Component: ProtectedRoute ---
// This is a special component that acts as a gatekeeper for protected routes.
// It checks if the user is authenticated; if not, it redirects them to the login page.
const ProtectedRoute = ({ children }) => {
    const { isAuthenticated } = useAuth(); // Get authentication status from context
    // If the user is NOT authenticated (isAuthenticated is false), redirect them to /login
    if (!isAuthenticated) {
        return <Navigate to="/login" replace />; // `replace` prevents adding the protected route to browser history
    }
    // If the user IS authenticated, render the children (the actual component for the protected route)
    return children;
};

// --- Updated Inline Styles for Home/Protected ---
const homeStyles = {
    container: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh', // Take full viewport height
        fontFamily: 'Inter, sans-serif', // Use Inter font
        padding: '20px',
        boxSizing: 'border-box',
        // NEW: Background image and overlay
        backgroundImage: `url(${BACKGROUND_IMAGE_URL})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        position: 'relative', // Needed for overlay
        overflow: 'hidden', // Hide overflow if image is too large
    },
    contentBox: { // NEW: A box to hold content, making it readable over background
        backgroundColor: 'rgba(255, 255, 255, 0.9)', // Semi-transparent white background
        padding: '40px',
        borderRadius: '15px', // Rounded corners
        boxShadow: '0 10px 30px rgba(0,0,0,0.2)', // Soft shadow
        width: '90%',
        maxWidth: '600px',
        textAlign: 'center',
        display: 'flex',
        flexDirection: 'column',
        gap: '20px', // Space between elements
        position: 'relative', // Ensure content is above overlay
        zIndex: 2, // Ensure it's above the pseudo-element overlay
    },
    heading: {
        color: '#2c3e50', // Darker heading color
        marginBottom: '10px',
        fontSize: '2.5em', // Larger heading
        fontWeight: 'bold',
    },
    tagline: { // NEW: Style for tagline
        color: '#34495e',
        fontSize: '1.2em',
        marginBottom: '20px',
        fontStyle: 'italic',
    },
    greeting: {
        fontSize: '1.3em',
        color: '#2980b9', // Blue for greeting
        fontWeight: 'bold',
        marginBottom: '10px',
    },
    message: {
        fontSize: '1.1em',
        color: '#555',
        marginBottom: '30px',
        lineHeight: '1.6',
    },
    nav: {
        display: 'flex',
        gap: '15px',
        flexWrap: 'wrap',
        justifyContent: 'center',
        marginTop: '20px',
    },
    navLink: {
        backgroundColor: '#3498db', // Brighter blue
        color: 'white',
        padding: '12px 25px',
        borderRadius: '8px', // More rounded
        textDecoration: 'none',
        fontSize: '1.1em',
        fontWeight: 'bold',
        transition: 'background-color 0.3s ease, transform 0.2s ease',
        boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
        // Note: Inline styles don't directly support hover states,
        // but these represent the desired hover effect if using CSS modules or styled-components.
        // For pure inline, this is illustrative.
        '&:hover': {
            backgroundColor: '#2980b9',
            transform: 'translateY(-2px)',
        }
    },
    logoutButton: {
        backgroundColor: '#e74c3c', // Red for logout
        color: 'white',
        padding: '12px 25px',
        borderRadius: '8px',
        border: 'none',
        cursor: 'pointer',
        fontSize: '1.1em',
        fontWeight: 'bold',
        transition: 'background-color 0.3s ease, transform 0.2s ease',
        boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
        // Note: Inline styles don't directly support hover states,
        // but these represent the desired hover effect if using CSS modules or styled-components.
        // For pure inline, this is illustrative.
        '&:hover': {
            backgroundColor: '#c0392b',
            transform: 'translateY(-2px)',
        }
    },
};


// --- Main App Component ---
// This is the root component where our routing logic is defined.
function App() {
    return (
        // 1. BrowserRouter (as Router): Wraps your entire application, enabling client-side routing.
        // It uses the HTML5 history API to keep your UI in sync with the URL.
        <Router>
            {/* 2. AuthProvider: Wraps all components that need access to authentication state.
                Any component inside AuthProvider can use the `useAuth()` hook to get token, user, login, logout, etc. */}
            <AuthProvider>
                {/* 3. Routes: A container for all your individual Route components.
                    It renders only the first <Route> that matches the current URL. */}
                <Routes>
                    {/* 4. Route for Login Page */}
                    {/* path="/login": The URL path to match. */}
                    {/* element={<Login />}: The React component to render when the path matches. */}
                    <Route path="/login" element={<Login />} />

                    {/* 5. Route for Register Page */}
                    <Route path="/register" element={<Register />} />

                    {/* 6. Route for Home Page */}
                    {/* path="/": The root URL of your application. */}
                    <Route path="/" element={<Home />} />

                    {/* Protected Routes (Require Authentication) */}
                    {/* Corrected: Only one instance of /protected route */}
                    <Route
                        path="/protected"
                        element={
                            <ProtectedRoute>
                                <Protected />
                            </ProtectedRoute>
                        }
                    />
                    {/* Protected Route for File Upload */}
                    <Route
                        path="/upload"
                        element={
                            <ProtectedRoute>
                                <FileUpload />
                            </ProtectedRoute>
                        }
                    />
                    {/* Protected Route for My Files */}
                    <Route
                        path="/my-files"
                        element={
                            <ProtectedRoute>
                                <MyFiles />
                            </ProtectedRoute>
                        }
                    />
                    {/* Protected Route for All Files */}
                    <Route
                        path="/all-files"
                        element={
                            <ProtectedRoute>
                                <AllFiles />
                            </ProtectedRoute>
                        }
                    />

                    {/* Optional: Catch-all route for 404 (Not Found) pages. */}
                    {/* The '*' path means "match any path that hasn't been matched by previous routes". */}
                    <Route path="*" element={<h2>404 Not Found</h2>} />
                </Routes>
            </AuthProvider>
        </Router>
    );
}

export default App; // Export the App component to be rendered by index.js