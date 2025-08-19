import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const API_URL = 'http://localhost:5000/api';

// NEW: Define your faculty and department data structure (same as FileUpload.jsx)
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

function MyFiles() {
    const [myFiles, setMyFiles] = useState([]);
    const [message, setMessage] = useState('');
    const { token, isAuthenticated, user } = useAuth();
    const navigate = useNavigate();

    // NEW STATE FOR FILTERS
    const [selectedFacultyFilter, setSelectedFacultyFilter] = useState('');
    const [availableDepartmentsFilter, setAvailableDepartmentsFilter] = useState([]);
    const [selectedDepartmentFilter, setSelectedDepartmentFilter] = useState('');

    useEffect(() => {
        const fetchMyFiles = async () => {
            if (!isAuthenticated || !token) {
                setMessage('Please log in to view your files.');
                setMyFiles([]);
                return;
            }
            setMessage('Loading your files...');

            try {
                // NEW: Add query parameters for faculty and department filters
                const params = {};
                if (selectedFacultyFilter) {
                    params.faculty = selectedFacultyFilter;
                }
                if (selectedDepartmentFilter) {
                    params.department = selectedDepartmentFilter;
                }

                const response = await axios.get(`${API_URL}/my-files`, {
                    headers: {
                        'x-auth-token': token
                    },
                    params: params // Send filters as query parameters
                });
                console.log("Data received for My Files:", response.data);
                setMyFiles(response.data);
                setMessage(response.data.length > 0 ? '' : 'You have not uploaded any files yet or no files match your filter.');
            } catch (error) {
                console.error('Error fetching my files:', error.response?.data || error.message);
                setMessage(`Failed to load files: ${error.response?.data?.message || 'Server error'}`);
                setMyFiles([]);
            }
        };

        fetchMyFiles();
    }, [isAuthenticated, token, user, selectedFacultyFilter, selectedDepartmentFilter]); // NEW: Re-fetch when filters change

    const handleDownload = (fileName) => {
        const downloadUrl = `${API_URL}/download/${fileName}`;
        window.open(downloadUrl, '_blank');
    };

    const goToUploadPage = () => {
        navigate('/upload');
    };

    const goBackHome = () => {
        navigate('/');
    };

    // NEW: Handle Faculty filter change
    const handleFacultyFilterChange = (event) => {
        const facultyName = event.target.value;
        setSelectedFacultyFilter(facultyName);
        setSelectedDepartmentFilter(''); // Reset department filter when faculty changes

        const faculty = FACULTY_DEPARTMENT_DATA.find(f => f.name === facultyName);
        if (faculty) {
            setAvailableDepartmentsFilter(faculty.departments);
        } else {
            setAvailableDepartmentsFilter([]);
        }
        setMessage('');
    };

    // NEW: Handle Department filter change
    const handleDepartmentFilterChange = (event) => {
        setSelectedDepartmentFilter(event.target.value);
        setMessage('');
    };

    const handleClearFilters = () => {
        setSelectedFacultyFilter('');
        setAvailableDepartmentsFilter([]);
        setSelectedDepartmentFilter('');
        setMessage('');
    };

    return (
        <div style={styles.container}>
            <h2>My Uploaded Files</h2>

            <div style={styles.navigationButtons}>
                <button onClick={goToUploadPage} style={{ ...styles.navButton, ...styles.uploadButton }}>
                    Upload New File
                </button>
                <button onClick={goBackHome} style={{ ...styles.navButton, ...styles.homeButton }}>
                    Go Back Home
                </button>
            </div>

            {/* NEW: Filter Section */}
            <div style={styles.filterContainer}>
                <div style={styles.formGroup}>
                    <label htmlFor="faculty-filter" style={styles.label}>Filter by Faculty:</label>
                    <select
                        id="faculty-filter"
                        value={selectedFacultyFilter}
                        onChange={handleFacultyFilterChange}
                        style={styles.select}
                    >
                        <option value="">All Faculties</option>
                        {FACULTY_DEPARTMENT_DATA.map((faculty) => (
                            <option key={faculty.name} value={faculty.name}>
                                {faculty.name}
                            </option>
                        ))}
                    </select>
                </div>

                {selectedFacultyFilter && (
                    <div style={styles.formGroup}>
                        <label htmlFor="department-filter" style={styles.label}>Filter by Department:</label>
                        <select
                            id="department-filter"
                            value={selectedDepartmentFilter}
                            onChange={handleDepartmentFilterChange}
                            style={styles.select}
                        >
                            <option value="">All Departments</option>
                            {availableDepartmentsFilter.map((department) => (
                                <option key={department} value={department}>
                                    {department}
                                </option>
                            ))}
                        </select>
                    </div>
                )}
                {(selectedFacultyFilter || selectedDepartmentFilter) && (
                    <button onClick={handleClearFilters} style={styles.clearFilterButton}>Clear Filters</button>
                )}
            </div>


            {message && <p style={message.includes('Loading') ? styles.infoMessage : styles.errorMessage}>{message}</p>}

            {myFiles.length > 0 ? (
                <ul style={styles.fileList}>
                    {myFiles.map((file) => (
                        <li key={file.id} style={styles.fileItem}>
                            <div style={styles.fileInfo}>
                                <span style={styles.fileName}>{file.originalName}</span>
                                <span style={styles.fileMeta}>
                                    (Uploaded by: {file.uploader} on {new Date(file.uploadDate).toLocaleDateString()})
                                </span>
                                {/* NEW: Display Faculty and Department */}
                                {file.faculty && file.department && (
                                    <span style={styles.fileMeta}>
                                        <br />Faculty: {file.faculty}, Dept: {file.department}
                                    </span>
                                )}
                            </div>
                            <button onClick={() => handleDownload(file.savedName)} style={styles.downloadButton}>Download</button>
                        </li>
                    ))}
                </ul>
            ) : (
                !message.includes('Loading') && <p style={styles.noFilesMessage}>No files uploaded by you yet or no files match your filter. Go to <a href="/upload" style={styles.link}>Upload File</a> to add some!</p>
            )}
        </div>
    );
}

// Basic inline styles (replace with your template's CSS)
const styles = {
    container: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        minHeight: '80vh',
        fontFamily: 'Arial, sans-serif',
        backgroundColor: '#f9f9f9',
        padding: '20px',
        boxSizing: 'border-box',
    },
    navigationButtons: {
        display: 'flex',
        gap: '15px',
        marginBottom: '20px',
        flexWrap: 'wrap',
        justifyContent: 'center',
        width: '100%',
        maxWidth: '600px',
    },
    navButton: {
        padding: '10px 20px',
        borderRadius: '5px',
        border: 'none',
        cursor: 'pointer',
        fontSize: '1em',
        transition: 'background-color 0.3s ease',
        color: 'white',
    },
    uploadButton: {
        backgroundColor: '#28a745',
    },
    homeButton: {
        backgroundColor: '#007bff',
    },
    // NEW: Styles for filter section
    filterContainer: {
        backgroundColor: '#e6e6e6',
        padding: '20px',
        borderRadius: '8px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
        width: '100%',
        maxWidth: '600px',
        marginBottom: '20px',
        display: 'flex',
        flexDirection: 'column',
        gap: '15px',
        alignItems: 'center',
    },
    select: { // Reused from FileUpload.jsx, ensure it's here
        padding: '10px',
        border: '1px solid #ddd',
        borderRadius: '4px',
        fontSize: '1em',
        width: '100%',
        boxSizing: 'border-box',
        backgroundColor: '#fff',
        cursor: 'pointer',
    },
    formGroup: { // Reused from FileUpload.jsx
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-start',
        width: '100%', // Ensure it takes full width within filter container
    },
    label: { // Reused from FileUpload.jsx
        marginBottom: '8px',
        fontWeight: 'bold',
        color: '#333',
        fontSize: '1em',
    },
    clearFilterButton: {
        padding: '8px 15px',
        backgroundColor: '#dc3545', // Red for clear
        color: 'white',
        border: 'none',
        borderRadius: '5px',
        cursor: 'pointer',
        fontSize: '0.9em',
        transition: 'background-color 0.3s ease',
        marginTop: '10px',
    },
    fileList: {
        listStyle: 'none',
        padding: 0,
        width: '100%',
        maxWidth: '600px',
        backgroundColor: '#fff',
        borderRadius: '8px',
        boxShadow: '0 2px 10px rgba(0,0,0,0.08)',
    },
    fileItem: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '15px 20px',
        borderBottom: '1px solid #eee',
        gap: '10px',
        flexWrap: 'wrap',
    },
    fileInfo: { // NEW: Container for file name and meta
        display: 'flex',
        flexDirection: 'column',
        flexGrow: 1,
        wordBreak: 'break-word',
    },
    fileName: {
        fontWeight: 'bold',
        color: '#333',
    },
    fileMeta: {
        fontSize: '0.85em',
        color: '#777',
        marginTop: '5px', // Spacing for new lines
    },
    downloadButton: {
        backgroundColor: '#007bff',
        color: 'white',
        padding: '8px 15px',
        borderRadius: '5px',
        border: 'none',
        cursor: 'pointer',
        fontSize: '0.9em',
        transition: 'background-color 0.3s ease',
        marginLeft: '15px',
        whiteSpace: 'nowrap',
    },
    downloadButtonHover: {
        backgroundColor: '#0056b3',
    },
    infoMessage: {
        color: '#007bff',
        fontWeight: 'bold',
        marginTop: '20px',
    },
    errorMessage: {
        color: '#dc3545',
        fontWeight: 'bold',
        marginTop: '20px',
    },
    noFilesMessage: {
        marginTop: '20px',
        color: '#555',
        fontSize: '1.1em',
        textAlign: 'center',
    },
    link: {
        color: '#007bff',
        textDecoration: 'none',
        fontWeight: 'bold',
    }
};

export default MyFiles;