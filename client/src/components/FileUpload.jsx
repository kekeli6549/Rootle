import React, { useState, useRef } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';

const API_URL = 'http://localhost:5000/api'; // Ensure this matches your backend URL

// Professional 2025 Web Design Color Palette
const COLORS = {
    deepBrown: '#6F4E37',
    deepGreen: '#0A4D4A',
    softWhite: '#F5F5F5',
    softBlack: '#1A1A1A',
};

// Background Image URL
const BACKGROUND_IMAGE_URL = 'https://images.unsplash.com/photo-1541339907198-e08756c2f971?q=80&w=1920&auto=format&fit=crop';

// Define keyframes animations for subtle, modern UI effects
const animations = `
@keyframes fadeIn {
    from { opacity: 0; transform: translateY(10px); }
    to { opacity: 1; transform: translateY(0); }
}
@keyframes pulse {
    0% { transform: scale(1); }
    50% { transform: scale(1.03); }
    100% { transform: scale(1); }
}
@keyframes backgroundZoom {
    from { transform: scale(1); }
    to { transform: scale(1.1); }
}
`;

// NEW: Define your faculty and department data structure
const FACULTY_DEPARTMENT_DATA = [
    {
        name: "Faculty of Engineering",
        departments: ["Civil Engineering", "Electrical Engineering", "Mechanical Engineering", "Computer Engineering"]
    },
    {
        name: "Faculty of Sciences",
        departments: ["Computer Science", "Physics", "Chemistry", "Biology"]
    },
    {
        name: "Faculty of Social Sciences",
        departments: ["Economics", "Political Science", "Sociology", "Psychology"]
    },
    {
        name: "Faculty of Arts",
        departments: ["English Language", "History and International Studies", "Theatre Arts", "Linguistics"]
    }
];

function FileUpload() {
    const [selectedFile, setSelectedFile] = useState(null);
    const [message, setMessage] = useState('');
    const [uploadStatus, setUploadStatus] = useState(null); // 'success', 'error', 'uploading', null
    const { token } = useAuth();
    const navigate = useNavigate();
    const fileInputRef = useRef(null);

    // NEW STATE VARIABLES for Faculty and Department
    const [selectedFaculty, setSelectedFaculty] = useState('');
    const [availableDepartments, setAvailableDepartments] = useState([]);
    const [selectedDepartment, setSelectedDepartment] = useState('');

    const handleFileChange = (event) => {
        setSelectedFile(event.target.files[0]);
        setMessage('');
        setUploadStatus(null);
    };

    const handleFacultyChange = (event) => {
        const facultyName = event.target.value;
        setSelectedFaculty(facultyName);
        setSelectedDepartment('');
        const faculty = FACULTY_DEPARTMENT_DATA.find(f => f.name === facultyName);
        if (faculty) {
            setAvailableDepartments(faculty.departments);
        } else {
            setAvailableDepartments([]);
        }
        setMessage('');
        setUploadStatus(null);
    };

    const handleDepartmentChange = (event) => {
        setSelectedDepartment(event.target.value);
        setMessage('');
        setUploadStatus(null);
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        setMessage('Uploading...');
        setUploadStatus('uploading');

        if (!selectedFile) {
            setMessage('Please select a file first.');
            setUploadStatus('error');
            return;
        }
        if (!selectedFaculty) {
            setMessage('Please select a Faculty.');
            setUploadStatus('error');
            return;
        }
        if (!selectedDepartment) {
            setMessage('Please select a Department.');
            setUploadStatus('error');
            return;
        }

        const formData = new FormData();
        formData.append('file', selectedFile);
        formData.append('faculty', selectedFaculty);
        formData.append('department', selectedDepartment);

        try {
            const response = await axios.post(`${API_URL}/upload`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    'x-auth-token': token
                },
                onUploadProgress: (progressEvent) => {
                    const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                    setMessage(`Uploading: ${percentCompleted}%`);
                }
            });

            setMessage(`Success: ${response.data.message} File: ${response.data.file.originalName}`);
            setUploadStatus('success');
            setSelectedFile(null);
            setSelectedFaculty('');
            setAvailableDepartments([]);
            setSelectedDepartment('');
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
        } catch (error) {
            console.error('File upload error:', error.response?.data || error.message);
            setMessage(`Upload failed: ${error.response?.data?.message || 'Server error'}`);
            setUploadStatus('error');
        }
    };

    const handleRetry = () => {
        setSelectedFile(null);
        setMessage('');
        setUploadStatus(null);
        setSelectedFaculty('');
        setAvailableDepartments([]);
        setSelectedDepartment('');
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const handleGoBack = () => {
        navigate('/');
    };

    return (
        <div style={styles.container}>
            <div style={styles.overlay}></div>
            <div style={styles.contentWrapper}>
                <div style={styles.backButtonContainer}>
                    <button onClick={handleGoBack} style={styles.backButton}>
                        Back to Home
                    </button>
                </div>
                <div style={styles.uploadContainer}>
                    <h2 style={styles.title}>Upload Academic Resource</h2>
                    <form onSubmit={handleSubmit} style={styles.form}>
                        {/* Faculty Dropdown */}
                        <div style={styles.formGroup}>
                            <label htmlFor="faculty-select" style={styles.label}>Faculty:</label>
                            <select
                                id="faculty-select"
                                value={selectedFaculty}
                                onChange={handleFacultyChange}
                                required
                                style={styles.select}
                            >
                                <option value="">Select Faculty</option>
                                {FACULTY_DEPARTMENT_DATA.map((faculty) => (
                                    <option key={faculty.name} value={faculty.name}>
                                        {faculty.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Department Dropdown (conditionally rendered) */}
                        {selectedFaculty && (
                            <div style={styles.formGroup}>
                                <label htmlFor="department-select" style={styles.label}>Department:</label>
                                <select
                                    id="department-select"
                                    value={selectedDepartment}
                                    onChange={handleDepartmentChange}
                                    required
                                    style={styles.select}
                                >
                                    <option value="">Select Department</option>
                                    {availableDepartments.map((department) => (
                                        <option key={department} value={department}>
                                            {department}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        )}

                        <div style={styles.formGroup}>
                            <label htmlFor="file-input" style={styles.label}>Select File:</label>
                            <div style={styles.fileInputWrapper}>
                                <input
                                    type="file"
                                    id="file-input"
                                    onChange={handleFileChange}
                                    ref={fileInputRef}
                                    style={styles.hiddenFileInput}
                                />
                                <span style={styles.fileName}>{selectedFile ? selectedFile.name : 'Choose a file...'}</span>
                                <button
                                    type="button"
                                    onClick={() => fileInputRef.current.click()}
                                    style={styles.chooseFileButton}
                                >
                                    Browse
                                </button>
                            </div>
                        </div>

                        <button
                            type="submit"
                            style={styles.uploadButton}
                            disabled={!selectedFile || !selectedFaculty || !selectedDepartment || uploadStatus === 'uploading'}
                        >
                            {uploadStatus === 'uploading' ? 'Uploading...' : 'Upload File'}
                        </button>
                    </form>

                    {/* Conditional rendering of messages */}
                    {message && (
                        <p style={
                            uploadStatus === 'success' ? styles.successMessage :
                            uploadStatus === 'error' ? styles.errorMessage :
                            styles.infoMessage
                        }>
                            {message}
                        </p>
                    )}

                    {/* Conditional buttons based on upload status */}
                    <div style={styles.buttonContainer}>
                        {uploadStatus === 'success' && (
                            <button
                                onClick={() => navigate('/my-files')}
                                style={{ ...styles.actionButton, ...styles.viewUploadsButton }}
                            >
                                See Your Uploads
                            </button>
                        )}

                        {uploadStatus === 'error' && (
                            <button
                                onClick={handleRetry}
                                style={{ ...styles.actionButton, ...styles.retryButton }}
                            >
                                Retry Upload
                            </button>
                        )}
                    </div>

                    <p style={styles.infoTextBottom}>Allowed formats: PDF, Word documents (.doc, .docx), Images. Max 10MB.</p>
                </div>
            </div>
        </div>
    );
}

const styles = {
    // Main container with animated background
    container: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        fontFamily: 'Inter, sans-serif',
        backgroundColor: COLORS.softWhite,
        backgroundImage: `url(${BACKGROUND_IMAGE_URL})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        position: 'relative',
        overflow: 'hidden',
        animation: 'backgroundZoom 60s ease-in-out infinite alternate',
    },
    overlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        zIndex: 1,
    },
    contentWrapper: {
        width: '100%',
        maxWidth: '700px',
        padding: '20px',
        boxSizing: 'border-box',
        zIndex: 2,
    },
    backButtonContainer: {
        width: '100%',
        display: 'flex',
        justifyContent: 'flex-start',
        marginBottom: '30px',
    },
    backButton: {
        padding: '12px 25px',
        backgroundColor: COLORS.deepBrown,
        color: COLORS.softWhite,
        border: 'none',
        borderRadius: '10px',
        cursor: 'pointer',
        fontSize: '1em',
        fontWeight: 'bold',
        textDecoration: 'none',
        transition: 'all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
        boxShadow: `0 4px 8px rgba(0,0,0,0.15)`,
        '&:hover': {
            backgroundColor: COLORS.deepGreen,
            transform: 'translateY(-2px) scale(1.02)',
            boxShadow: `0 6px 12px rgba(0,0,0,0.25)`,
        },
    },
    uploadContainer: {
        backgroundColor: `rgba(${parseInt(COLORS.softWhite.slice(1, 3), 16)}, ${parseInt(COLORS.softWhite.slice(3, 5), 16)}, ${parseInt(COLORS.softWhite.slice(5, 7), 16)}, 0.95)`,
        backdropFilter: 'blur(10px)',
        padding: '40px',
        borderRadius: '20px',
        boxShadow: `0 10px 30px rgba(0,0,0,0.2)`,
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        gap: '30px',
        animation: 'fadeIn 0.7s ease-out',
    },
    title: {
        color: COLORS.deepGreen,
        fontSize: '2.5em',
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: '20px',
    },
    form: {
        display: 'flex',
        flexDirection: 'column',
        gap: '25px',
    },
    formGroup: {
        display: 'flex',
        flexDirection: 'column',
    },
    label: {
        color: COLORS.deepBrown,
        fontWeight: 'bold',
        marginBottom: '10px',
        fontSize: '1.1em',
    },
    select: {
        padding: '15px',
        border: `2px solid #ddd`,
        borderRadius: '10px',
        fontSize: '1em',
        color: COLORS.softBlack,
        backgroundColor: '#f8f8f8',
        cursor: 'pointer',
        transition: 'all 0.3s ease',
        '&:focus': {
            borderColor: COLORS.deepGreen,
            outline: 'none',
            boxShadow: `0 0 0 4px rgba(${parseInt(COLORS.deepGreen.slice(1, 3), 16)}, ${parseInt(COLORS.deepGreen.slice(3, 5), 16)}, ${parseInt(COLORS.deepGreen.slice(5, 7), 16)}, 0.1)`,
        },
    },
    fileInputWrapper: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '10px',
        border: `2px solid #ddd`,
        borderRadius: '10px',
        backgroundColor: '#f8f8f8',
        transition: 'all 0.3s ease',
        '&:hover': {
            borderColor: COLORS.deepGreen,
        },
    },
    hiddenFileInput: {
        display: 'none',
    },
    fileName: {
        flex: 1,
        color: COLORS.softBlack,
        fontSize: '1em',
        padding: '0 10px',
        overflow: 'hidden',
        whiteSpace: 'nowrap',
        textOverflow: 'ellipsis',
    },
    chooseFileButton: {
        padding: '8px 15px',
        backgroundColor: COLORS.deepBrown,
        color: COLORS.softWhite,
        border: 'none',
        borderRadius: '8px',
        cursor: 'pointer',
        fontSize: '0.9em',
        fontWeight: 'bold',
        transition: 'background-color 0.3s ease, transform 0.2s ease',
        '&:hover': {
            backgroundColor: COLORS.deepGreen,
            transform: 'scale(1.05)',
        },
    },
    uploadButton: {
        padding: '15px 30px',
        backgroundColor: COLORS.deepGreen,
        color: COLORS.softWhite,
        border: 'none',
        borderRadius: '10px',
        fontSize: '1.2em',
        fontWeight: 'bold',
        cursor: 'pointer',
        transition: 'all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
        boxShadow: `0 4px 10px rgba(0,0,0,0.15)`,
        '&:hover': {
            backgroundColor: COLORS.deepBrown,
            transform: 'translateY(-2px) scale(1.01)',
            boxShadow: `0 6px 15px rgba(0,0,0,0.25)`,
        },
        '&:disabled': {
            backgroundColor: '#A0A0A0',
            cursor: 'not-allowed',
            boxShadow: 'none',
            transform: 'none',
            opacity: 0.6,
        },
    },
    successMessage: {
        color: COLORS.deepGreen,
        fontWeight: 'bold',
        marginTop: '20px',
        fontSize: '1.1em',
        backgroundColor: '#e6f4e6',
        padding: '15px',
        borderRadius: '10px',
        width: '100%',
        textAlign: 'center',
        border: `1px solid ${COLORS.deepGreen}`,
        animation: 'fadeIn 0.5s ease-out, pulse 2s infinite',
    },
    errorMessage: {
        color: COLORS.deepBrown,
        fontWeight: 'bold',
        marginTop: '20px',
        fontSize: '1.1em',
        backgroundColor: '#fbe9e7',
        padding: '15px',
        borderRadius: '10px',
        width: '100%',
        textAlign: 'center',
        border: `1px solid ${COLORS.deepBrown}`,
        animation: 'fadeIn 0.5s ease-out',
    },
    infoMessage: {
        color: COLORS.softBlack,
        fontWeight: 'bold',
        marginTop: '20px',
        fontSize: '1.1em',
        backgroundColor: '#f0f0f0',
        padding: '15px',
        borderRadius: '10px',
        width: '100%',
        textAlign: 'center',
        border: `1px solid ${COLORS.softBlack}`,
        animation: 'fadeIn 0.5s ease-out',
    },
    infoTextBottom: {
        marginTop: '20px',
        color: COLORS.softBlack,
        fontSize: '0.9em',
        textAlign: 'center',
        opacity: 0.7,
    },
    buttonContainer: {
        display: 'flex',
        gap: '20px',
        marginTop: '20px',
        justifyContent: 'center',
        flexWrap: 'wrap',
    },
    actionButton: {
        padding: '15px 25px',
        borderRadius: '10px',
        border: 'none',
        cursor: 'pointer',
        fontSize: '1em',
        fontWeight: 'bold',
        transition: 'all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
        boxShadow: `0 4px 10px rgba(0,0,0,0.15)`,
        '&:hover': {
            transform: 'translateY(-2px) scale(1.01)',
            boxShadow: `0 6px 15px rgba(0,0,0,0.25)`,
        },
    },
    viewUploadsButton: {
        backgroundColor: COLORS.deepGreen,
        color: COLORS.softWhite,
        '&:hover': {
            backgroundColor: COLORS.deepBrown,
        },
    },
    retryButton: {
        backgroundColor: COLORS.deepBrown,
        color: COLORS.softWhite,
        '&:hover': {
            backgroundColor: COLORS.deepGreen,
        },
    }
};

export default FileUpload;