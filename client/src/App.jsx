import React from 'react';
// Import components from react-router-dom for routing
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
// Import our custom authentication context and hook
import { AuthProvider, useAuth } from './context/AuthContext';
// Import the authentication components we created earlier
import Login from './components/Login';
import Register from './components/Register';
import FileUpload from './components/FileUpload';
import MyFiles from './components/MyFiles';
import AllFiles from './components/AllFiles';

// Updated background image URL to a university-themed image
const BACKGROUND_IMAGE_URL = 'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&q=80';
// Fallback background in case the main one fails to load

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
const COLORS = {
    deepBrown: '#6F4E37',
    deepGreen: '#0A4D4A',
    softWhite: '#F5F5F5',
    softBlack: '#1A1A1A',
};

// Define a keyframes animation for a subtle fade-in effect
const fadeInAnimation = `
@keyframes fadeIn {
    from {
        opacity: 0;
        transform: translateY(20px);
    }
    to {
        opacity: 1;
        transform: translateY(0);
    }
}
`;

const homeStyles = {
    container: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        fontFamily: 'Inter, sans-serif',
        padding: '20px',
        boxSizing: 'border-box',
        backgroundImage: `url(${BACKGROUND_IMAGE_URL})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        position: 'relative',
        overflow: 'hidden',
    },
    contentBox: {
        // Use the soft white from the new palette with a slight transparency
        backgroundColor: `rgba(${parseInt(COLORS.softWhite.slice(1, 3), 16)}, ${parseInt(COLORS.softWhite.slice(3, 5), 16)}, ${parseInt(COLORS.softWhite.slice(5, 7), 16)}, 0.9)`,
        padding: '40px',
        borderRadius: '20px', // More modern, rounded corners
        // Deeper, more noticeable shadow for a sense of depth
        boxShadow: `0 15px 40px rgba(0,0,0,0.3)`,
        width: '90%',
        maxWidth: '600px',
        textAlign: 'center',
        display: 'flex',
        flexDirection: 'column',
        gap: '20px',
        position: 'relative',
        zIndex: 2,
        // Apply the fade-in animation for a smooth entry
        animation: 'fadeIn 1s ease-in-out',
    },
    heading: {
        // Use the deep green for the main heading to make it stand out
        color: COLORS.deepGreen,
        marginBottom: '10px',
        fontSize: '3em', // Larger, more impactful heading
        fontWeight: 'bold',
        letterSpacing: '-0.5px', // Subtle kerning for a professional look
    },
    tagline: {
        // Use the deep brown for a warm, complementary tagline
        color: COLORS.deepBrown,
        fontSize: '1.4em',
        marginBottom: '20px',
        fontStyle: 'italic',
        opacity: 0.8, // Slightly lower opacity for a subtle effect
    },
    greeting: {
        // Use deep green for the greeting to keep the theme consistent
        fontSize: '1.5em',
        color: COLORS.deepGreen,
        fontWeight: 'bold',
        marginBottom: '10px',
    },
    message: {
        // Use the soft black for the main body text for readability
        fontSize: '1.1em',
        color: COLORS.softBlack,
        marginBottom: '30px',
        lineHeight: '1.6',
    },
    nav: {
        display: 'flex',
        gap: '20px', // Increased gap for better spacing
        flexWrap: 'wrap',
        justifyContent: 'center',
        marginTop: '20px',
    },
    navLink: {
        backgroundColor: COLORS.deepGreen,
        color: COLORS.softWhite,
        padding: '15px 30px',
        borderRadius: '10px',
        textDecoration: 'none',
        fontSize: '1.1em',
        fontWeight: 'bold',
        // Add a smooth transition for all transformations
        transition: 'all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
        boxShadow: `0 4px 12px rgba(0,0,0,0.15)`,
        '&:hover': {
            backgroundColor: COLORS.deepBrown, // Hover state with the deep brown color
            transform: 'translateY(-3px) scale(1.02)', // Lift and slightly enlarge on hover
            boxShadow: `0 8px 20px rgba(0,0,0,0.25)`, // More pronounced shadow on hover
        }
    },
    logoutButton: {
        backgroundColor: COLORS.deepBrown, // Use the deep brown for the logout button
        color: COLORS.softWhite,
        padding: '15px 30px',
        borderRadius: '10px',
        border: 'none',
        cursor: 'pointer',
        fontSize: '1.1em',
        fontWeight: 'bold',
        transition: 'all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
        boxShadow: `0 4px 12px rgba(0,0,0,0.15)`,
        '&:hover': {
            backgroundColor: COLORS.deepGreen, // Switch to green on hover
            transform: 'translateY(-3px) scale(1.02)',
            boxShadow: `0 8px 20px rgba(0,0,0,0.25)`,
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