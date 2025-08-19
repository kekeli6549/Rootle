import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext'; // Import our auth context
import { useNavigate } from 'react-router-dom'; // For navigation after login

function Login() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [message, setMessage] = useState('');
    const { login, isAuthenticated } = useAuth(); // Get login function and auth status
    const navigate = useNavigate();

    // If already authenticated, redirect to home/dashboard
    if (isAuthenticated) {
        navigate('/');
    }

    const handleSubmit = async (e) => {
        e.preventDefault(); // Prevent default form submission
        setMessage(''); // Clear previous messages

        const result = await login(username, password); // Call the login function from context

        if (result.success) {
            setMessage(result.message || 'Logged in successfully!');
            setUsername(''); // Clear form fields
            setPassword('');
            navigate('/'); // Redirect to the home page or dashboard
        } else {
            setMessage(result.message);
        }
    };

    return (
        <div style={styles.container}>
            <h2>Login</h2>
            <form onSubmit={handleSubmit} style={styles.form}>
                <div style={styles.formGroup}>
                    <label htmlFor="username" style={styles.label}>Username:</label>
                    <input
                        type="text"
                        id="username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        required
                        style={styles.input}
                    />
                </div>
                <div style={styles.formGroup}>
                    <label htmlFor="password" style={styles.label}>Password:</label>
                    <input
                        type="password"
                        id="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        style={styles.input}
                    />
                </div>
                <button type="submit" style={styles.button}>Login</button>
            </form>
            {message && <p style={message.includes('success') ? styles.successMessage : styles.errorMessage}>{message}</p>}
            <p style={styles.linkText}>Don't have an account? <a href="/register" style={styles.link}>Register here</a></p>
        </div>
    );
}

// Basic inline styles (replace with your template's CSS)
const styles = {
    container: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '80vh',
        fontFamily: 'Arial, sans-serif',
        backgroundColor: '#f4f4f4',
        padding: '20px',
    },
    form: {
        backgroundColor: '#fff',
        padding: '30px',
        borderRadius: '8px',
        boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
        width: '100%',
        maxWidth: '400px',
        display: 'flex',
        flexDirection: 'column',
        gap: '15px',
    },
    formGroup: {
        display: 'flex',
        flexDirection: 'column',
    },
    label: {
        marginBottom: '5px',
        fontWeight: 'bold',
        color: '#333',
    },
    input: {
        padding: '10px',
        border: '1px solid #ddd',
        borderRadius: '4px',
        fontSize: '1em',
    },
    button: {
        padding: '12px 20px',
        backgroundColor: '#28a745', // Green for login
        color: 'white',
        border: 'none',
        borderRadius: '5px',
        fontSize: '1.1em',
        cursor: 'pointer',
        transition: 'background-color 0.3s ease',
    },
    buttonHover: {
        backgroundColor: '#218838',
    },
    successMessage: {
        color: 'green',
        fontWeight: 'bold',
        marginTop: '15px',
    },
    errorMessage: {
        color: 'red',
        fontWeight: 'bold',
        marginTop: '15px',
    },
    linkText: {
        marginTop: '20px',
        fontSize: '0.9em',
        color: '#555',
    },
    link: {
        color: '#007bff',
        textDecoration: 'none',
        fontWeight: 'bold',
    }
};

export default Login;