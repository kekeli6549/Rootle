import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const API_URL = 'http://localhost:5000/api';

// NOTE: To use the 'Poppins' font, you should include this link in your index.html's <head> section:
// <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;600;700&display=swap" rel="stylesheet">

// The new, earthy color palette
const COLORS = {
    background: '#ffa989ff', // Peach for soft contrast
    primary: '#D96D46',     // Terracotta/Burnt Orange for actions
    secondary: '#EFEAD5',   // Light Tan for cards and dropdowns
    text: '#4A3C32',        // Deep Brown for primary text
    muted: '#7D6E66',       // Muted Taupe for secondary text
    border: '#D6C4B5',      // Light Brown for borders
    error: '#C0392B',       // Muted Red for errors
    success: '#587E58',     // Olive Green for success
};

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

// Custom Dropdown Component
const CustomDropdown = ({ label, options, value, onChange }) => {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleOutsideClick = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleOutsideClick);
        return () => {
            document.removeEventListener('mousedown', handleOutsideClick);
        };
    }, []);

    return (
        <div style={dropdownStyles.container} ref={dropdownRef}>
            <div style={dropdownStyles.label}>{label}</div>
            <div
                style={dropdownStyles.header}
                onClick={() => setIsOpen(!isOpen)}
            >
                <span style={dropdownStyles.selectedValue}>{value || `Select ${label}`}</span>
                <span style={dropdownStyles.arrow}>{isOpen ? '▲' : '▼'}</span>
            </div>
            {isOpen && (
                <div style={dropdownStyles.list}>
                    {options.map((option) => (
                        <div
                            key={option}
                            style={dropdownStyles.item}
                            onClick={() => {
                                onChange(option);
                                setIsOpen(false);
                            }}
                        >
                            {option}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

// Styles for the Custom Dropdown
const dropdownStyles = {
    container: {
        position: 'relative',
        width: '100%',
        fontFamily: 'Poppins, sans-serif',
        marginBottom: '10px',
    },
    label: {
        fontSize: '0.9em',
        color: COLORS.text,
        marginBottom: '5px',
        fontWeight: '600',
    },
    header: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '12px 15px',
        backgroundColor: COLORS.secondary,
        borderRadius: '8px',
        cursor: 'pointer',
        border: `1px solid ${COLORS.border}`,
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
        transition: 'all 0.2s ease',
    },
    selectedValue: {
        color: COLORS.text,
        fontWeight: '400',
    },
    arrow: {
        color: COLORS.muted,
        fontSize: '0.8em',
    },
    list: {
        position: 'absolute',
        top: 'calc(100% + 5px)',
        left: 0,
        right: 0,
        backgroundColor: COLORS.secondary,
        border: `1px solid ${COLORS.border}`,
        borderRadius: '8px',
        boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
        zIndex: 100,
        maxHeight: '200px',
        overflowY: 'auto',
    },
    item: {
        padding: '12px 15px',
        cursor: 'pointer',
        color: COLORS.text,
        transition: 'background-color 0.1s ease',
    },
    itemHover: {
        backgroundColor: COLORS.border,
    }
};

function AllFiles() {
    const [allFiles, setAllFiles] = useState([]);
    const [message, setMessage] = useState('');
    const { token, isAuthenticated } = useAuth();
    const navigate = useNavigate();

    const [selectedFacultyFilter, setSelectedFacultyFilter] = useState('');
    const [availableDepartmentsFilter, setAvailableDepartmentsFilter] = useState([]);
    const [selectedDepartmentFilter, setSelectedDepartmentFilter] = useState('');

    useEffect(() => {
        const fetchAllFiles = async () => {
            if (!isAuthenticated || !token) {
                setMessage('Please log in to view all files.');
                setAllFiles([]);
                return;
            }
            setMessage('Loading all files...');

            try {
                const params = {};
                if (selectedFacultyFilter) {
                    params.faculty = selectedFacultyFilter;
                }
                if (selectedDepartmentFilter) {
                    params.department = selectedDepartmentFilter;
                }

                const response = await axios.get(`${API_URL}/all-files`, {
                    headers: { 'x-auth-token': token },
                    params: params
                });
                console.log("Data received for All Files:", response.data);
                setAllFiles(response.data);
                setMessage(response.data.length > 0 ? '' : 'No files have been uploaded to the platform yet or no files match your filter.');
            } catch (error) {
                console.error('Error fetching all files:', error.response?.data || error.message);
                setMessage(`Failed to load files: ${error.response?.data?.message || 'Server error'}`);
                setAllFiles([]);
            }
        };

        fetchAllFiles();
    }, [isAuthenticated, token, selectedFacultyFilter, selectedDepartmentFilter]);

    const handleDownload = (fileName) => {
        const downloadUrl = `${API_URL}/download/${fileName}`;
        window.open(downloadUrl, '_blank');
    };

    const goBackHome = () => {
        navigate('/');
    };

    const handleFacultyFilterChange = (facultyName) => {
        setSelectedFacultyFilter(facultyName);
        setSelectedDepartmentFilter('');

        const faculty = FACULTY_DEPARTMENT_DATA.find(f => f.name === facultyName);
        if (faculty) {
            setAvailableDepartmentsFilter(faculty.departments);
        } else {
            setAvailableDepartmentsFilter([]);
        }
        setMessage('');
    };

    const handleDepartmentFilterChange = (departmentName) => {
        setSelectedDepartmentFilter(departmentName);
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
            <div style={styles.header}>
                <h1 style={styles.title}>All Available Files</h1>
                <button onClick={goBackHome} style={styles.homeButton}>
                    Go Back Home
                </button>
            </div>

            <div style={styles.content}>
                {/* Filters Section */}
                <div style={styles.filterSection}>
                    <h3 style={styles.filterTitle}>Filter Files</h3>
                    <CustomDropdown
                        label="Faculty"
                        options={['All Faculties', ...FACULTY_DEPARTMENT_DATA.map(f => f.name)]}
                        value={selectedFacultyFilter || 'All Faculties'}
                        onChange={(value) => handleFacultyFilterChange(value === 'All Faculties' ? '' : value)}
                    />
                    {selectedFacultyFilter && (
                        <CustomDropdown
                            label="Department"
                            options={['All Departments', ...availableDepartmentsFilter]}
                            value={selectedDepartmentFilter || 'All Departments'}
                            onChange={(value) => handleDepartmentFilterChange(value === 'All Departments' ? '' : value)}
                        />
                    )}
                    {(selectedFacultyFilter || selectedDepartmentFilter) && (
                        <button onClick={handleClearFilters} style={styles.clearFilterButton}>Clear Filters</button>
                    )}
                </div>

                {/* File List Section */}
                <div style={styles.fileSection}>
                    {message && (
                        <p style={message.includes('Loading') ? styles.infoMessage : styles.errorMessage}>
                            {message}
                        </p>
                    )}

                    {!message && allFiles.length > 0 ? (
                        <div style={styles.fileGrid}>
                            {allFiles.map((file) => (
                                <div key={file.id} style={styles.fileCard}>
                                    <div style={styles.cardHeader}>
                                        <h4 style={styles.cardTitle}>{file.originalName}</h4>
                                    </div>
                                    <div style={styles.cardBody}>
                                        <p style={styles.fileMeta}>
                                            <span style={styles.label}>Uploader:</span> {file.uploader}
                                        </p>
                                        <p style={styles.fileMeta}>
                                            <span style={styles.label}>Date:</span> {new Date(file.uploadDate).toLocaleDateString()}
                                        </p>
                                        {file.faculty && (
                                            <p style={styles.fileMeta}>
                                                <span style={styles.label}>Faculty:</span> {file.faculty}
                                            </p>
                                        )}
                                        {file.department && (
                                            <p style={styles.fileMeta}>
                                                <span style={styles.label}>Department:</span> {file.department}
                                            </p>
                                        )}
                                    </div>
                                    <div style={styles.cardFooter}>
                                        <button onClick={() => handleDownload(file.savedName)} style={styles.downloadButton}>
                                            Download File
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        !message.includes('Loading') && <p style={styles.noFilesMessage}>No files available or no files match your filter criteria.</p>
                    )}
                </div>
            </div>
        </div>
    );
}

const styles = {
    container: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        minHeight: '100vh',
        backgroundColor: COLORS.background,
        fontFamily: 'Poppins, sans-serif',
        padding: '20px',
    },
    header: {
        width: '100%',
        maxWidth: '1200px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '30px',
    },
    title: {
        fontSize: '2.5em',
        fontWeight: '700',
        color: COLORS.text,
        margin: 0,
    },
    homeButton: {
        padding: '12px 25px',
        borderRadius: '50px',
        border: 'none',
        backgroundColor: COLORS.primary,
        color: '#fff',
        fontSize: '1em',
        fontWeight: '600',
        cursor: 'pointer',
        boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
        transition: 'transform 0.2s ease',
    },
    content: {
        display: 'flex',
        flexDirection: 'column',
        gap: '30px',
        width: '100%',
        maxWidth: '1200px',
    },
    filterSection: {
        backgroundColor: COLORS.secondary,
        padding: '25px',
        borderRadius: '12px',
        boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
    },
    filterTitle: {
        fontSize: '1.5em',
        fontWeight: '600',
        color: COLORS.text,
        marginBottom: '15px',
    },
    clearFilterButton: {
        marginTop: '15px',
        padding: '10px 20px',
        borderRadius: '8px',
        border: 'none',
        backgroundColor: COLORS.error,
        color: '#fff',
        fontSize: '0.9em',
        fontWeight: '600',
        cursor: 'pointer',
        transition: 'transform 0.2s ease',
    },
    fileSection: {
        width: '100%',
    },
    fileGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
        gap: '25px',
    },
    fileCard: {
        backgroundColor: '#fff',
        borderRadius: '12px',
        padding: '20px',
        boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        transition: 'transform 0.2s ease, box-shadow 0.2s ease',
    },
    cardHeader: {
        borderBottom: `1px solid ${COLORS.border}`,
        paddingBottom: '15px',
        marginBottom: '15px',
    },
    cardTitle: {
        fontSize: '1.2em',
        fontWeight: '700',
        color: COLORS.text,
        margin: 0,
        wordBreak: 'break-word',
    },
    cardBody: {
        marginBottom: '15px',
    },
    fileMeta: {
        fontSize: '0.9em',
        color: COLORS.muted,
        margin: '5px 0',
    },
    label: {
        fontWeight: '600',
        color: COLORS.text,
    },
    cardFooter: {
        marginTop: 'auto',
    },
    downloadButton: {
        width: '100%',
        padding: '12px',
        borderRadius: '8px',
        border: 'none',
        backgroundColor: COLORS.primary,
        color: '#fff',
        fontSize: '1em',
        fontWeight: '600',
        cursor: 'pointer',
        transition: 'background-color 0.2s ease',
    },
    infoMessage: {
        color: COLORS.primary,
        fontWeight: '600',
        textAlign: 'center',
        margin: '20px 0',
    },
    errorMessage: {
        color: COLORS.error,
        fontWeight: '600',
        textAlign: 'center',
        margin: '20px 0',
    },
    noFilesMessage: {
        color: COLORS.muted,
        fontSize: '1.2em',
        textAlign: 'center',
        margin: '50px 0',
    },
};

export default AllFiles;
