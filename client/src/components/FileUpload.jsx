import React, { useState, useRef } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const API_URL = 'http://localhost:5000/api'; // Ensure this matches your backend URL

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
    const [uploadStatus, setUploadStatus] = useState(null); // 'success', 'error', null
    const { token } = useAuth();
    const navigate = useNavigate();
    const fileInputRef = useRef(null);

    // NEW STATE VARIABLES for Faculty and Department
    const [selectedFaculty, setSelectedFaculty] = useState(''); // Stores the currently selected faculty name
    const [availableDepartments, setAvailableDepartments] = useState([]); // Stores departments for the selected faculty
    const [selectedDepartment, setSelectedDepartment] = useState(''); // Stores the currently selected department name


    const handleFileChange = (event) => {
        setSelectedFile(event.target.files[0]); // Get the first selected file
        setMessage(''); // Clear message on new file selection
        setUploadStatus(null); // Reset status
    };

    // NEW: Handle Faculty selection change
    const handleFacultyChange = (event) => {
        const facultyName = event.target.value;
        setSelectedFaculty(facultyName); // Update selected faculty state
        setSelectedDepartment(''); // Reset department when faculty changes

        // Find the selected faculty's departments
        const faculty = FACULTY_DEPARTMENT_DATA.find(f => f.name === facultyName);
        if (faculty) {
            setAvailableDepartments(faculty.departments); // Update available departments
        } else {
            setAvailableDepartments([]); // No departments if no faculty selected or found
        }
        setMessage(''); // Clear messages
        setUploadStatus(null); // Reset status
    };

    // NEW: Handle Department selection change
    const handleDepartmentChange = (event) => {
        setSelectedDepartment(event.target.value); // Update selected department state
        setMessage(''); // Clear messages
        setUploadStatus(null); // Reset status
    };

    const handleSubmit = async (event) => {
        event.preventDefault(); // Prevent default form submission
        setMessage('Uploading...');
        setUploadStatus(null); // Reset status at the start of new upload

        if (!selectedFile) {
            setMessage('Please select a file first.');
            setUploadStatus('error');
            return;
        }
        // NEW VALIDATION: Ensure Faculty and Department are selected
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
        // NEW: Append selected faculty and department to formData
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
            setSelectedFile(null); // Clear the state
            setSelectedFaculty(''); // NEW: Clear faculty dropdown
            setAvailableDepartments([]); // NEW: Clear departments
            setSelectedDepartment(''); // NEW: Clear department dropdown
            if (fileInputRef.current) { // Clear the file input field visually
                fileInputRef.current.value = '';
            }
        } catch (error) {
            console.error('File upload error:', error.response?.data || error.message);
            setMessage(`Upload failed: ${error.response?.data?.message || 'Server error'}`);
            setUploadStatus('error');
        }
    };

    // Function for retry button
    const handleRetry = () => {
        setSelectedFile(null); // Clear any previously selected file from state
        setMessage(''); // Clear error message
        setUploadStatus(null); // Reset status
        setSelectedFaculty(''); // NEW: Clear faculty dropdown
        setAvailableDepartments([]); // NEW: Clear departments
        setSelectedDepartment(''); // NEW: Clear department dropdown
        if (fileInputRef.current) { // Clear the file input field visually
            fileInputRef.current.value = '';
        }
    };

    // Function for go back button
    const handleGoBack = () => {
        navigate('/'); // Navigates to the home page
    };

    return (
        <div style={styles.container}>
            <div style={styles.header}>
                <button onClick={handleGoBack} style={styles.goBackButton}>
                    Back To Home
                </button>
                <h2>Upload Academic Resource</h2>
            </div>
            <form onSubmit={handleSubmit} style={styles.form}>
                {/* NEW: Faculty Dropdown */}
                <div style={styles.formGroup}>
                    <label htmlFor="faculty-select" style={styles.label}>Faculty:</label>
                    <select
                        id="faculty-select"
                        value={selectedFaculty}
                        onChange={handleFacultyChange}
                        required
                        style={styles.select} // Apply new style
                    >
                        <option value="">Select Faculty</option>
                        {FACULTY_DEPARTMENT_DATA.map((faculty) => (
                            <option key={faculty.name} value={faculty.name}>
                                {faculty.name}
                            </option>
                        ))}
                    </select>
                </div>

                {/* NEW: Department Dropdown (conditionally rendered) */}
                {selectedFaculty && ( // Only show if a faculty is selected
                    <div style={styles.formGroup}>
                        <label htmlFor="department-select" style={styles.label}>Department:</label>
                        <select
                            id="department-select"
                            value={selectedDepartment}
                            onChange={handleDepartmentChange}
                            required
                            style={styles.select} // Apply new style
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
                    <input
                        type="file"
                        id="file-input"
                        onChange={handleFileChange}
                        required
                        style={styles.fileInput}
                        ref={fileInputRef}
                    />
                </div>
                <button type="submit" style={styles.button} disabled={!selectedFile || !selectedFaculty || !selectedDepartment || uploadStatus === 'uploading'}>
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
        backgroundColor: '#f9f9f9',
        padding: '20px',
        boxSizing: 'border-box',
    },
    header: {
        width: '100%',
        maxWidth: '500px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '20px',
        position: 'relative',
    },
    goBackButton: {
        padding: '8px 15px',
        backgroundColor: '#6c757d',
        color: 'white',
        border: 'none',
        borderRadius: '5px',
        cursor: 'pointer',
        fontSize: '0.9em',
        transition: 'background-color 0.3s ease',
        position: 'absolute',
        left: '0',
        top: '50%',
        transform: 'translateY(-50%)',
    },
    goBackButtonHover: {
        backgroundColor: '#5a6268',
    },
    form: {
        backgroundColor: '#fff',
        padding: '30px',
        borderRadius: '8px',
        boxShadow: '0 4px 15px rgba(0,0,0,0.1)',
        width: '100%',
        maxWidth: '500px',
        display: 'flex',
        flexDirection: 'column',
        gap: '20px',
    },
    formGroup: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-start',
    },
    label: {
        marginBottom: '8px',
        fontWeight: 'bold',
        color: '#333',
        fontSize: '1.1em',
    },
    fileInput: {
        padding: '10px',
        border: '1px solid #ddd',
        borderRadius: '5px',
        width: '100%',
        boxSizing: 'border-box',
    },
    // NEW: Style for select dropdowns
    select: {
        padding: '10px',
        border: '1px solid #ddd',
        borderRadius: '4px',
        fontSize: '1em',
        width: '100%',
        boxSizing: 'border-box',
        backgroundColor: '#fff',
        cursor: 'pointer',
    },
    button: {
        padding: '12px 25px',
        backgroundColor: '#28a745',
        color: 'white',
        border: 'none',
        borderRadius: '6px',
        fontSize: '1.2em',
        cursor: 'pointer',
        transition: 'background-color 0.3s ease, transform 0.1s ease',
    },
    buttonHover: {
        backgroundColor: '#218838',
        transform: 'translateY(-1px)',
    },
    buttonDisabled: {
        backgroundColor: '#cccccc',
        cursor: 'not-allowed',
    },
    successMessage: {
        color: '#28a745',
        fontWeight: 'bold',
        marginTop: '20px',
        fontSize: '1.1em',
        backgroundColor: '#d4edda',
        padding: '10px',
        borderRadius: '5px',
        width: '100%',
        maxWidth: '500px',
        textAlign: 'center',
        border: '1px solid #c3e6cb',
    },
    errorMessage: {
        color: '#dc3545',
        fontWeight: 'bold',
        marginTop: '20px',
        fontSize: '1.1em',
        backgroundColor: '#f8d7da',
        padding: '10px',
        borderRadius: '5px',
        width: '100%',
        maxWidth: '500px',
        textAlign: 'center',
        border: '1px solid #f5c6cb',
    },
    infoMessage: {
        color: '#007bff',
        fontWeight: 'bold',
        marginTop: '20px',
        fontSize: '1.1em',
        backgroundColor: '#cfe2ff',
        padding: '10px',
        borderRadius: '5px',
        width: '100%',
        maxWidth: '500px',
        textAlign: 'center',
        border: '1px solid #b9d7fd',
    },
    infoTextBottom: {
        marginTop: '15px',
        color: '#666',
        fontSize: '0.9em',
    },
    buttonContainer: {
        display: 'flex',
        gap: '15px',
        marginTop: '20px',
        justifyContent: 'center',
        flexWrap: 'wrap',
    },
    actionButton: {
        padding: '10px 20px',
        borderRadius: '5px',
        border: 'none',
        cursor: 'pointer',
        fontSize: '1em',
        transition: 'background-color 0.3s ease',
        color: 'white',
    },
    viewUploadsButton: {
        backgroundColor: '#007bff',
    },
    retryButton: {
        backgroundColor: '#ffc107',
        color: '#333',
    }
};

export default FileUpload;