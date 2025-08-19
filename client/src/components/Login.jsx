import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// A structured deep brown and green color palette, now more synergistic
const COLORS = {
    background: '#756D5C',      // A deep, desaturated green-brown for the image overlay
    cardBackground: '#FDFDF9',  // A creamy off-white for the card
    textPrimary: '#3A322C',     // A very dark, rich brown
    textSecondary: '#6B6056',   // A lighter, muted brown
    border: '#A3998F',          // An earthy brown for borders
    primary: '#4D8C61',         // A slightly more muted, elegant green
    primaryHover: '#3D724D',    // A darker green for hover
    error: '#B22222',           // A deep red for error messages
    success: '#4D8C61',         // Same as primary for success messages
};

// CSS for subtle animations
const animations = `
@keyframes fadeIn {
    from { opacity: 0; transform: translateY(10px); }
    to { opacity: 1; transform: translateY(0); }
}
@keyframes glow {
    0% { box-shadow: 0 0 0 0 rgba(77, 140, 97, 0.4); }
    100% { box-shadow: 0 0 0 10px rgba(77, 140, 97, 0); }
}
`;

// The refined and complete styles object with the new palette and background image
const styles = {
    // 1. Overall Container: The main wrapper for the form with a background image.
    container: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        fontFamily: 'Poppins, Arial, sans-serif',
        // New Unsplash image URL that fits the earthy theme
        backgroundImage: `url('https://images.unsplash.com/photo-1595180630737-18451b66f103')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed',
        backgroundColor: COLORS.background, // Used as a color overlay
        backgroundBlendMode: 'multiply', // Blends the image with the background color
        padding: '30px',
        animation: 'fadeIn 0.8s ease-out',
        transition: 'background-color 0.5s ease',
    },
    
    // 2. Form Card: A card-like container for the form
    formCard: {
        backgroundColor: COLORS.cardBackground,
        padding: '40px',
        borderRadius: '15px',
        boxShadow: '0 8px 30px rgba(0,0,0,0.15)', // Slightly darker shadow
        width: '100%',
        maxWidth: '450px',
        display: 'flex',
        flexDirection: 'column',
        gap: '20px',
        animation: 'fadeIn 0.7s ease-out',
        backgroundBlendMode: 'screen', // Blends the form card slightly with the background
    },

    // 3. Form Title
    title: {
        fontSize: '2.4em',
        fontWeight: 700,
        color: COLORS.textPrimary,
        textAlign: 'center',
        marginBottom: '10px',
    },

    // 4. Input Groups
    formGroup: {
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
    },

    // 5. Labels
    label: {
        fontSize: '1em',
        fontWeight: 600,
        color: COLORS.textPrimary,
    },

    // 6. Inputs & Selects
    input: {
        padding: '14px',
        border: `1px solid ${COLORS.border}`,
        borderRadius: '10px',
        fontSize: '1em',
        color: COLORS.textPrimary,
        backgroundColor: 'rgba(255, 255, 255, 0.7)', // Slightly transparent to let background show
        transition: 'all 0.3s ease',
        '::placeholder': {
            color: COLORS.textSecondary,
        },
        '&:focus': {
            outline: 'none',
            borderColor: COLORS.primary,
            boxShadow: `0 0 0 3px rgba(77, 140, 97, 0.2)`,
        },
    },

    // 7. Primary Button
    button: {
        padding: '16px',
        backgroundColor: COLORS.primary,
        color: COLORS.cardBackground,
        border: 'none',
        borderRadius: '10px',
        fontSize: '1.2em',
        fontWeight: 'bold',
        cursor: 'pointer',
        transition: 'all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
        boxShadow: '0 4px 15px rgba(77, 140, 97, 0.2)',
        '&:hover': {
            backgroundColor: COLORS.primaryHover,
            transform: 'translateY(-2px)',
            boxShadow: '0 6px 20px rgba(77, 140, 97, 0.3)',
        },
        '&:disabled': {
            backgroundColor: COLORS.border,
            cursor: 'not-allowed',
            transform: 'none',
            boxShadow: 'none',
            opacity: 0.7,
        }
    },

    // 8. Messages
    successMessage: {
        color: COLORS.success,
        fontWeight: 'bold',
        marginTop: '15px',
        textAlign: 'center',
        backgroundColor: 'rgba(77, 140, 97, 0.1)',
        padding: '12px',
        borderRadius: '10px',
        border: `1px solid ${COLORS.success}`,
        animation: 'fadeIn 0.5s ease-out',
    },
    errorMessage: {
        color: COLORS.error,
        fontWeight: 'bold',
        marginTop: '15px',
        textAlign: 'center',
        backgroundColor: 'rgba(178, 34, 34, 0.1)',
        padding: '12px',
        borderRadius: '10px',
        border: `1px solid ${COLORS.error}`,
        animation: 'fadeIn 0.5s ease-out',
    },

    // 9. Links
    linkText: {
        marginTop: '20px',
        fontSize: '0.9em',
        color: COLORS.textSecondary,
        textAlign: 'center',
    },
    link: {
        color: COLORS.primary,
        textDecoration: 'none',
        fontWeight: 'bold',
        transition: 'text-decoration 0.2s ease-in-out',
        '&:hover': {
            textDecoration: 'underline',
        }
    }
};

function Login() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [message, setMessage] = useState('');
    const [messageType, setMessageType] = useState('');
    const { login, isAuthenticated } = useAuth();
    const navigate = useNavigate();

    // Check auth status on component load
    useEffect(() => {
        if (isAuthenticated) {
            navigate('/');
        }
    }, [isAuthenticated, navigate]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage('');
        setMessageType('');

        const result = await login(username, password);

        if (result.success) {
            setMessage(result.message || 'Logged in successfully!');
            setMessageType('success');
            setUsername('');
            setPassword('');
            // Navigation handled by useEffect
        } else {
            setMessage(result.message);
            setMessageType('error');
        }
    };

    return (
        <div style={styles.container}>
            {/* Inject animations into the DOM */}
            <style>{animations}</style>

            <div style={styles.formCard}>
                <h2 style={styles.title}>Welcome Back</h2>
                
                <form onSubmit={handleSubmit} style={{ display: 'contents' }}>
                    <div style={styles.formGroup}>
                        <label htmlFor="username" style={styles.label}>Username</label>
                        <input
                            type="text"
                            id="username"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            required
                            style={styles.input}
                            placeholder="Enter your username"
                        />
                    </div>
                    
                    <div style={styles.formGroup}>
                        <label htmlFor="password" style={styles.label}>Password</label>
                        <input
                            type="password"
                            id="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            style={styles.input}
                            placeholder="Enter your password"
                        />
                    </div>
                    
                    <button type="submit" style={styles.button}>
                        Login
                    </button>
                </form>
                
                {message && (
                    <p style={messageType === 'success' ? styles.successMessage : styles.errorMessage}>
                        {message}
                    </p>
                )}

                <p style={styles.linkText}>
                    Don't have an account?{' '}
                    <Link to="/register" style={styles.link}>
                        Register here
                    </Link>
                </p>
            </div>
        </div>
    );
}

export default Login;
