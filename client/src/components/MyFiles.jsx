import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';

const API_URL = 'http://localhost:5000/api';

// The shared color palette from the Login and Register components
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
    from { opacity: 0; transform: translateY(20px); }
    to { opacity: 1; transform: translateY(0); }
}
@keyframes slideIn {
    from { opacity: 0; transform: translateY(10px); }
    to { opacity: 1; transform: translateY(0); }
}
.animated-element {
    animation: fadeIn 0.9s ease-out;
}
`;

// Styles object for the new design
const styles = {
    // 1. Overall Container
    container: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        minHeight: '100vh',
        fontFamily: 'Poppins, Arial, sans-serif',
        backgroundImage: `url('https://images.unsplash.com/photo-1595180630737-18451b66f103')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed',
        backgroundColor: COLORS.background,
        backgroundBlendMode: 'multiply',
        padding: '30px',
        boxSizing: 'border-box',
    },
    // 2. Main Content Card
    contentCard: {
        backgroundColor: COLORS.cardBackground,
        padding: '40px',
        borderRadius: '20px',
        boxShadow: '0 15px 40px rgba(0,0,0,0.25)',
        width: '100%',
        maxWidth: '900px',
        display: 'flex',
        flexDirection: 'column',
        gap: '20px',
        animation: 'fadeIn 0.9s ease-out',
    },
    // 3. Title
    title: {
        fontSize: '2.8em',
        fontWeight: 800,
        color: COLORS.textPrimary,
        textAlign: 'center',
        marginBottom: '10px',
        letterSpacing: '-1px',
    },
    // 4. Navigation & Filter Section
    topSection: {
        display: 'flex',
        flexDirection: 'column',
        gap: '20px',
        paddingBottom: '20px',
        borderBottom: `1px solid ${COLORS.border}`,
        marginBottom: '20px',
    },
    navButtons: {
        display: 'flex',
        gap: '15px',
        justifyContent: 'center',
        flexWrap: 'wrap',
    },
    filterContainer: {
        display: 'flex',
        flexDirection: 'column',
        gap: '15px',
    },
    formGroup: {
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
        position: 'relative', // Added for custom dropdown
    },
    label: {
        fontSize: '1em',
        fontWeight: 600,
        color: COLORS.textPrimary,
    },
    select: {
        padding: '12px',
        border: `2px solid ${COLORS.border}`,
        borderRadius: '10px',
        fontSize: '1em',
        color: COLORS.textPrimary,
        backgroundColor: 'white',
        cursor: 'pointer',
        transition: 'all 0.3s ease',
        '&:focus': {
            outline: 'none',
            borderColor: COLORS.primary,
            boxShadow: `0 0 0 3px rgba(77, 140, 97, 0.2)`,
        },
    },
    clearButton: {
        padding: '10px 20px',
        backgroundColor: COLORS.error,
        color: 'white',
        border: 'none',
        borderRadius: '10px',
        cursor: 'pointer',
        fontWeight: 'bold',
        transition: 'background-color 0.3s ease',
    },
    // 5. Buttons
    button: {
        padding: '15px 30px',
        backgroundColor: COLORS.primary,
        color: COLORS.cardBackground,
        border: 'none',
        borderRadius: '10px',
        fontSize: '1em',
        fontWeight: 'bold',
        cursor: 'pointer',
        transition: 'all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
        boxShadow: `0 4px 15px rgba(77, 140, 97, 0.2)`,
        '&:hover': {
            backgroundColor: COLORS.primaryHover,
            transform: 'translateY(-2px)',
            boxShadow: `0 6px 20px rgba(77, 140, 97, 0.3)`,
        },
    },
    // 6. File Cards/Grid
    fileGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
        gap: '20px',
        listStyle: 'none',
        padding: 0,
        margin: 0,
    },
    fileCard: {
        backgroundColor: 'rgba(255, 255, 255, 0.8)',
        backdropFilter: 'blur(5px)',
        padding: '20px',
        borderRadius: '15px',
        boxShadow: '0 8px 20px rgba(0,0,0,0.1)',
        display: 'flex',
        flexDirection: 'column',
        gap: '10px',
        transition: 'all 0.3s ease',
        '&:hover': {
            transform: 'translateY(-5px)',
            boxShadow: `0 12px 30px rgba(77, 140, 97, 0.25)`,
        },
    },
    fileInfo: {
        flexGrow: 1,
    },
    fileName: {
        fontSize: '1.2em',
        fontWeight: 'bold',
        color: COLORS.textPrimary,
        wordBreak: 'break-word',
    },
    fileMeta: {
        fontSize: '0.9em',
        color: COLORS.textSecondary,
        marginTop: '5px',
    },
    downloadButton: {
        alignSelf: 'flex-start',
        padding: '10px 25px',
        backgroundColor: COLORS.primary,
        color: 'white',
        border: 'none',
        borderRadius: '8px',
        cursor: 'pointer',
        fontWeight: 'bold',
        transition: 'all 0.3s ease',
        '&:hover': {
            backgroundColor: COLORS.primaryHover,
            transform: 'scale(1.02)',
        },
    },
    // 7. Messages
    infoMessage: {
        color: COLORS.textSecondary,
        fontWeight: 'bold',
        textAlign: 'center',
        padding: '15px',
        backgroundColor: 'rgba(227, 227, 222, 0.5)',
        borderRadius: '10px',
    },
    errorMessage: {
        color: COLORS.error,
        fontWeight: 'bold',
        textAlign: 'center',
        padding: '15px',
        backgroundColor: 'rgba(178, 34, 34, 0.1)',
        borderRadius: '10px',
        border: `1px solid ${COLORS.error}`,
    },
    noFilesMessage: {
        marginTop: '20px',
        color: COLORS.textSecondary,
        fontSize: '1.1em',
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
    },
    // Custom Dropdown Styles
    customDropdownContainer: {
        position: 'relative',
        width: '100%',
    },
    dropdownButton: {
        width: '100%',
        padding: '12px',
        border: `2px solid ${COLORS.border}`,
        borderRadius: '10px',
        backgroundColor: 'white',
        cursor: 'pointer',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        fontSize: '1em',
        color: COLORS.textPrimary,
        fontWeight: 500,
        transition: 'all 0.3s ease',
        boxShadow: '0 2px 5px rgba(0,0,0,0.05)',
        '&:hover': {
            borderColor: COLORS.primary,
        },
    },
    dropdownArrow: {
        transition: 'transform 0.3s ease',
        transform: 'rotate(0deg)',
    },
    dropdownArrowActive: {
        transform: 'rotate(180deg)',
    },
    dropdownMenu: {
        position: 'absolute',
        top: '100%',
        left: 0,
        right: 0,
        marginTop: '8px',
        backgroundColor: 'white',
        border: `2px solid ${COLORS.border}`,
        borderRadius: '10px',
        boxShadow: '0 8px 15px rgba(0,0,0,0.1)',
        zIndex: 10,
        maxHeight: '200px',
        overflowY: 'auto',
        listStyle: 'none',
        padding: 0,
        margin: 0,
        animation: 'slideIn 0.3s ease-out',
    },
    dropdownItem: {
        padding: '12px 20px',
        cursor: 'pointer',
        color: COLORS.textPrimary,
        transition: 'background-color 0.2s ease',
        '&:hover': {
            backgroundColor: '#f5f5f0',
        },
    },
    dropdownItemActive: {
        backgroundColor: COLORS.primary,
        color: 'white',
        fontWeight: 'bold',
    },
};

// Custom Dropdown Component
function CustomDropdown({ options, value, onChange, placeholder }) {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);

    // Close the dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [dropdownRef]);

    const handleItemClick = (optionValue) => {
        onChange({ target: { value: optionValue } });
        setIsOpen(false);
    };

    const selectedOption = options.find(opt => opt.value === value) || { label: placeholder, value: '' };

    return (
        <div style={styles.customDropdownContainer} ref={dropdownRef}>
            <button
                style={styles.dropdownButton}
                onClick={() => setIsOpen(!isOpen)}
                type="button"
            >
                {selectedOption.label}
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="20"
                    height="20"
                    fill="currentColor"
                    viewBox="0 0 256 256"
                    style={{ ...styles.dropdownArrow, ...(isOpen && styles.dropdownArrowActive) }}
                >
                    <path d="M205.66,155.19,136,85.53a12,12,0,0,0-17,0L50.34,155.19a12,12,0,0,0,8.5,20.51H197.16a12,12,0,0,0,8.5-20.51Z"></path>
                </svg>
            </button>
            {isOpen && (
                <ul style={styles.dropdownMenu}>
                    <li
                        style={{ ...styles.dropdownItem, ...(value === '' && styles.dropdownItemActive) }}
                        onClick={() => handleItemClick('')}
                    >
                        {placeholder}
                    </li>
                    {options.map((option) => (
                        <li
                            key={option.value}
                            style={{ ...styles.dropdownItem, ...(value === option.value && styles.dropdownItemActive) }}
                            onClick={() => handleItemClick(option.value)}
                        >
                            {option.label}
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}

// Data structure for filters (same as FileUpload.jsx)
const FACULTY_DEPARTMENT_DATA = [
    { name: "Faculty of Engineering", departments: ["Civil Engineering", "Electrical Engineering", "Mechanical Engineering", "Computer Engineering"] },
    { name: "Faculty of Sciences", departments: ["Computer Science", "Physics", "Chemistry", "Biology"] },
    { name: "Faculty of Social Sciences", departments: ["Economics", "Political Science", "Sociology", "Psychology"] },
    { name: "Faculty of Arts", departments: ["English Language", "History and International Studies", "Theatre Arts", "Linguistics"] }
];

function MyFiles() {
    const [myFiles, setMyFiles] = useState([]);
    const [message, setMessage] = useState('');
    const { token, isAuthenticated, user } = useAuth();
    const navigate = useNavigate();
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
                const params = {};
                if (selectedFacultyFilter) {
                    params.faculty = selectedFacultyFilter;
                }
                if (selectedDepartmentFilter) {
                    params.department = selectedDepartmentFilter;
                }

                const response = await axios.get(`${API_URL}/my-files`, {
                    headers: { 'x-auth-token': token },
                    params: params
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
    }, [isAuthenticated, token, user, selectedFacultyFilter, selectedDepartmentFilter]);

    const handleDownload = (fileName) => {
        const downloadUrl = `${API_URL}/download/${fileName}`;
        window.open(downloadUrl, '_blank');
    };

    const handleFacultyFilterChange = (event) => {
        const facultyName = event.target.value;
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

    const facultyOptions = FACULTY_DEPARTMENT_DATA.map(f => ({
        label: f.name,
        value: f.name
    }));

    const departmentOptions = availableDepartmentsFilter.map(d => ({
        label: d,
        value: d
    }));

    return (
        <div style={styles.container}>
            <style>{animations}</style>
            
            <div style={styles.contentCard} className="animated-element">
                <h2 style={styles.title}>My Uploaded Files</h2>

                <div style={styles.topSection}>
                    <div style={styles.navButtons}>
                        <Link to="/upload" style={styles.button}>Upload New File</Link>
                        <Link to="/" style={{ ...styles.button, backgroundColor: COLORS.textSecondary }}>Go Back Home</Link>
                    </div>

                    <div style={styles.filterContainer}>
                        {/* Custom Dropdown for Faculty Filter */}
                        <div style={styles.formGroup}>
                            <label htmlFor="faculty-filter" style={styles.label}>Filter by Faculty:</label>
                            <CustomDropdown
                                options={facultyOptions}
                                value={selectedFacultyFilter}
                                onChange={handleFacultyFilterChange}
                                placeholder="All Faculties"
                            />
                        </div>

                        {selectedFacultyFilter && (
                            <div style={styles.formGroup}>
                                <label htmlFor="department-filter" style={styles.label}>Filter by Department:</label>
                                {/* Custom Dropdown for Department Filter */}
                                <CustomDropdown
                                    options={departmentOptions}
                                    value={selectedDepartmentFilter}
                                    onChange={handleDepartmentFilterChange}
                                    placeholder="All Departments"
                                />
                            </div>
                        )}
                        {(selectedFacultyFilter || selectedDepartmentFilter) && (
                            <button onClick={handleClearFilters} style={styles.clearButton}>Clear Filters</button>
                        )}
                    </div>
                </div>

                {message && (
                    <p style={message.includes('Loading') ? styles.infoMessage : styles.errorMessage}>{message}</p>
                )}

                {myFiles.length > 0 ? (
                    <ul style={styles.fileGrid}>
                        {myFiles.map((file) => (
                            <li key={file.id} style={styles.fileCard}>
                                <div style={styles.fileInfo}>
                                    <div style={styles.fileName}>{file.originalName}</div>
                                    <div style={styles.fileMeta}>
                                        <p>Uploaded: {new Date(file.uploadDate).toLocaleDateString()}</p>
                                        <p>By: {file.uploader}</p>
                                    </div>
                                    {file.faculty && file.department && (
                                        <div style={styles.fileMeta}>
                                            <p>Faculty: {file.faculty}</p>
                                            <p>Department: {file.department}</p>
                                        </div>
                                    )}
                                </div>
                                <button onClick={() => handleDownload(file.savedName)} style={styles.downloadButton}>
                                    Download
                                </button>
                            </li>
                        ))}
                    </ul>
                ) : (
                    !message.includes('Loading') && <p style={styles.noFilesMessage}>No files uploaded by you yet or no files match your filter. Go to <Link to="/upload" style={styles.link}>Upload File</Link> to add some!</p>
                )}
            </div>
        </div>
    );
}

export default MyFiles;
