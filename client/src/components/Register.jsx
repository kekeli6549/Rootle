import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';

// The shared color palette from the Login component
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

// CSS for subtle animations and background effects
const animations = `
@keyframes fadeIn {
    from { opacity: 0; transform: translateY(20px); }
    to { opacity: 1; transform: translateY(0); }
}
@keyframes slideInFromLeft {
    from { opacity: 0; transform: translateX(-100px); }
    to { opacity: 1; transform: translateX(0); }
}
.animated-element {
    animation: fadeIn 0.8s ease-out;
}
`;

// The styles object for the new, modern design
const styles = {
    // 1. Overall Container
    container: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        fontFamily: 'Poppins, Arial, sans-serif',
        // New, more visually dynamic Unsplash image URL
        backgroundImage: `url('https://images.unsplash.com/photo-1542157790-281a8b9e6931?q=80&w=2574&auto=format&fit=crop')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed',
        backgroundColor: COLORS.background,
        backgroundBlendMode: 'multiply',
        padding: '30px',
        transition: 'background-color 0.5s ease',
    },
    
    // 2. Form Card
    formCard: {
        backgroundColor: COLORS.cardBackground,
        padding: '50px',
        borderRadius: '20px',
        boxShadow: '0 15px 40px rgba(0,0,0,0.25)',
        width: '100%',
        maxWidth: '480px',
        display: 'flex',
        flexDirection: 'column',
        gap: '25px',
        animation: 'fadeIn 0.9s ease-out',
        background: `linear-gradient(145deg, ${COLORS.cardBackground}, rgba(253, 253, 249, 0.9))`,
    },

    // 3. Form Title
    title: {
        fontSize: '2.8em',
        fontWeight: 800,
        color: COLORS.textPrimary,
        textAlign: 'center',
        marginBottom: '10px',
        letterSpacing: '-1px',
    },

    // 4. Input Groups
    formGroup: {
        display: 'flex',
        flexDirection: 'column',
    },

    // 5. Labels
    label: {
        fontSize: '1em',
        fontWeight: 600,
        color: COLORS.textSecondary,
        marginBottom: '8px',
    },

    // 6. Inputs
    input: {
        padding: '16px',
        border: `2px solid ${COLORS.border}`,
        borderRadius: '12px',
        fontSize: '1em',
        color: COLORS.textPrimary,
        backgroundColor: 'rgba(255, 255, 255, 0.7)',
        transition: 'all 0.3s ease',
        '::placeholder': {
            color: COLORS.textSecondary,
            opacity: 0.8,
        },
        '&:focus': {
            outline: 'none',
            borderColor: COLORS.primary,
            boxShadow: `0 0 0 4px rgba(77, 140, 97, 0.3)`,
        },
    },

    // 7. Primary Button
    button: {
        padding: '18px',
        backgroundColor: COLORS.primary,
        color: COLORS.cardBackground,
        border: 'none',
        borderRadius: '12px',
        fontSize: '1.2em',
        fontWeight: 'bold',
        cursor: 'pointer',
        transition: 'all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
        boxShadow: `0 6px 20px rgba(77, 140, 97, 0.4)`,
        '&:hover': {
            backgroundColor: COLORS.primaryHover,
            transform: 'translateY(-3px)',
            boxShadow: `0 8px 25px rgba(77, 140, 97, 0.5)`,
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
        marginTop: '20px',
        textAlign: 'center',
        backgroundColor: 'rgba(77, 140, 97, 0.15)',
        padding: '15px',
        borderRadius: '12px',
        border: `1px solid ${COLORS.success}`,
        animation: 'fadeIn 0.5s ease-out',
    },
    errorMessage: {
        color: COLORS.error,
        fontWeight: 'bold',
        marginTop: '20px',
        textAlign: 'center',
        backgroundColor: 'rgba(178, 34, 34, 0.15)',
        padding: '15px',
        borderRadius: '12px',
        border: `1px solid ${COLORS.error}`,
        animation: 'fadeIn 0.5s ease-out',
    },

    // 9. Links
    linkText: {
        marginTop: '25px',
        fontSize: '1em',
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

function Register() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [message, setMessage] = useState('');
    const [messageType, setMessageType] = useState('');
    const { register, isAuthenticated } = useAuth();
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

        const result = await register(username, password);

        if (result.success) {
            setMessage(result.message);
            setMessageType('success');
            setUsername('');
            setPassword('');
            setTimeout(() => navigate('/login'), 1500);
        } else {
            setMessage(result.message);
            setMessageType('error');
        }
    };

    return (
        <div style={styles.container}>
            {/* Inject animations into the DOM */}
            <style>{animations}</style>

            <div style={styles.formCard} className="animated-element">
                <h2 style={styles.title}>Create Your Account</h2>
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
                            placeholder="Choose a username"
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
                            placeholder="Create a password"
                        />
                    </div>
                    <button type="submit" style={styles.button}>Register</button>
                </form>
                {message && (
                    <p style={messageType === 'success' ? styles.successMessage : styles.errorMessage}>
                        {message}
                    </p>
                )}
                <p style={styles.linkText}>
                    Already have an account?{' '}
                    <Link to="/login" style={styles.link}>
                        Login here
                    </Link>
                </p>
            </div>
        </div>
    );
}

export default Register;
