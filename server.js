const fs = require('fs');
const path = require('path');
const express = require('express');
const cors = require('cors'); // Required for frontend to talk to backend
const bcrypt = require('bcryptjs'); // For password hashing
const jwt = require('jsonwebtoken'); // For JSON Web Tokens
const { readUsers, writeUsers } = require('./utils/userUtils'); // Import utility functions
const auth = require('./middleware/auth'); // Import our authentication middleware
const multer = require('multer'); // For handling file uploads
const { readFiles, writeFiles } = require('./utils/fileUtils'); // Import file utility functions


const app = express();
// Use environment variable for port in production, default to 5000 for development
const PORT = process.env.PORT || 5000;

// IMPORTANT: Keep this secret key consistent with middleware/auth.js.
// In a real application, use an environment variable for security.
const JWT_SECRET = process.env.JWT_SECRET || 'If hate is real, then the pain you feel is justified. As emotions assures your humanity.'; // Must match in auth.js!

// Configure Multer for file storage
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        // cb is the callback function (error, destination)
        cb(null, 'uploads/'); // Files will be saved in the 'uploads/' directory
    },
    filename: (req, file, cb) => {
        // cb is the callback function (error, filename)
        // Create a unique filename to prevent overwrites, e.g., timestamp + original name
        cb(null, Date.now() + '-' + file.originalname);
    }
});

// You can add a file filter if you only want specific file types (e.g., PDFs, DOCX)
const fileFilter = (req, file, cb) => {
    // Example: Only allow PDF, Word documents, and common image formats
    if (file.mimetype === 'application/pdf' ||
        file.mimetype === 'application/msword' || // .doc
        file.mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' || // .docx
        file.mimetype.startsWith('image/')
    ) {
        cb(null, true); // Accept the file
    } else {
        cb(new Error('Invalid file type. Only PDF, Word documents, and images are allowed.'), false); // Reject the file
    }
};

// Initialize Multer upload middleware
const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: { fileSize: 1024 * 1024 * 20 } // Limit file size to 20MB (optional, adjust as needed)
});

// --- Middleware Setup ---
app.use(express.json()); // Allows Express to parse JSON bodies from incoming requests
app.use(cors()); // Enables Cross-Origin Resource Sharing for all routes - essential for frontend communication

// --- Public Routes (Authentication) ---

// @route   POST /api/register
// @desc    Register a new user
// @access  Public
app.post('/api/register', async (req, res) => {
    const { username, password } = req.body;

    // Basic validation
    if (!username || !password) {
        return res.status(400).json({ message: 'Username and password are required' });
    }

    const users = readUsers(); // Get current users from file
    if (users.find(u => u.username === username)) {
        return res.status(409).json({ message: 'Username already exists' }); // 409 Conflict
    }

    try {
        // Hash password before saving
        const salt = await bcrypt.genSalt(10); // Generate a salt (random string)
        const hashedPassword = await bcrypt.hash(password, salt); // Hash password with the salt

        const newUser = { username, password: hashedPassword };
        users.push(newUser); // Add new user to array
        writeUsers(users); // Save updated array back to file

        res.status(201).json({ message: 'User registered successfully' }); // 201 Created
    } catch (error) {
        console.error('Registration error:', error.message);
        res.status(500).json({ message: 'Server error during registration' }); // 500 Internal Server Error
    }
});

// @route   POST /api/login
// @desc    Authenticate user & get token
// @access  Public
app.post('/api/login', async (req, res) => {
    const { username, password } = req.body;

    // Basic validation
    if (!username || !password) {
        return res.status(400).json({ message: 'Username and password are required' });
    }

    const users = readUsers();
    const user = users.find(u => u.username === username);

    if (!user) {
        return res.status(400).json({ message: 'Invalid credentials' }); // User not found
    }

    try {
        // Compare provided password with stored hashed password
        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid credentials' }); // Password mismatch
        }

        // Generate JWT payload (what data to store in the token)
        const payload = {
            username: user.username // Store username in token for easy access
        };

        // Sign the token
        jwt.sign(
            payload,
            JWT_SECRET,
            { expiresIn: '1h' }, // Token expires in 1 hour
            (err, token) => {
                if (err) throw err;
                res.status(200).json({ message: 'Logged in successfully', token });
            }
        );
    } catch (error) {
        console.error('Login error:', error.message);
        res.status(500).json({ message: 'Server error during login' });
    }
});


// @route   POST /api/upload
// @desc    Upload a new academic resource
// @access  Private (requires authentication)
// `upload.single('file')` means it expects a single file under the field name 'file'
app.post('/api/upload', auth, upload.single('file'), async (req, res) => {
    // Multer handles the file, but other form fields come in req.body
    const { faculty, department } = req.body; // Destructure faculty and department from req.body

    if (!req.file) {
        return res.status(400).json({ message: 'No file selected or invalid file type.' });
    }
    // VALIDATION: Ensure faculty and department are present
    if (!faculty || !department) {
        return res.status(400).json({ message: 'Faculty and Department are required for upload.' });
    }


    try {
        const files = readFiles(); // Get current file metadata
        const newFile = {
            id: Date.now().toString(), // Simple unique ID
            originalName: req.file.originalname,
            savedName: req.file.filename, // The unique name Multer saved it as
            uploader: req.user, // Username from JWT (attached by auth middleware)
            uploadDate: new Date().toISOString(),
            mimetype: req.file.mimetype,
            size: req.file.size,
            faculty: faculty,     // Add faculty to metadata
            department: department // Add department to metadata
        };

        files.push(newFile); // Add new file metadata
        writeFiles(files); // Save updated metadata to file

        res.status(201).json({
            message: 'File uploaded successfully! Rootle is growing.',
            file: {
                id: newFile.id,
                originalName: newFile.originalName,
                uploader: newFile.uploader,
                uploadDate: newFile.uploadDate,
                faculty: newFile.faculty,     // Include in response
                department: newFile.department // Include in response
            }
        });
    } catch (error) {
        console.error('File upload error:', error);
        if (error.message === 'Invalid file type. Only PDF, Word documents, and images are allowed.') {
            return res.status(400).json({ message: error.message });
        }
        res.status(500).json({ message: 'Server error during file upload.' });
    }
});

// @route   GET /api/my-files
// @desc    Get files uploaded by the authenticated user, with optional filters
// @access  Private (requires authentication)
app.get('/api/my-files', auth, (req, res) => {
    try {
        const { faculty, department } = req.query; // Get filters from query parameters
        let files = readFiles(); // Read all file metadata

        // Filter by uploader (always for my-files)
        let userFiles = files.filter(file => file.uploader === req.user);

        // Apply additional filters if provided
        if (faculty) {
            userFiles = userFiles.filter(file => file.faculty === faculty);
        }
        if (department) {
            userFiles = userFiles.filter(file => file.department === department);
        }

        res.status(200).json(userFiles);
    } catch (error) {
        console.error('Error fetching my files:', error);
        res.status(500).json({ message: 'Server error while fetching user files.' });
    }
});

// @route   GET /api/all-files
// @desc    Get all uploaded files, with optional filters
// @access  Private (requires authentication)
app.get('/api/all-files', auth, (req, res) => {
    try {
        const { faculty, department } = req.query; // Get filters from query parameters
        let files = readFiles(); // Read all file metadata

        // Apply filters if provided
        if (faculty) {
            files = files.filter(file => file.faculty === faculty);
        }
        if (department) {
            files = files.filter(file => file.department === department);
        }

        res.status(200).json(files);
    } catch (error) {
        console.error('Error fetching all files:', error);
        res.status(500).json({ message: 'Server error while fetching all files.' });
    }
});

// @route   GET /api/download/:filename
// @desc    Download a specific file
// @access  Public (for simplicity, but consider protecting in real apps)
// NOTE: For this MVP, we are making the download route public for simplicity.
// In a production app, you might want to protect this route and verify
// user permissions to download specific files.
app.get('/api/download/:filename', (req, res) => {
    const fileName = req.params.filename; // Get filename from URL parameter
    const filePath = path.join(__dirname, 'uploads', fileName); // Construct full path to file


    console.log(`Attempting to download: ${fileName}`); // NEW LOG
    console.log(`Full path being checked: ${filePath}`); // NEW LOG

    // Check if the file exists
    if (fs.existsSync(filePath)) { // Ensure fs module is imported
        // Send the file for download
        // res.download() automatically sets the Content-Disposition header for download
        res.download(filePath, (err) => {
            if (err) {
                // Handle error, e.g., file not found on server or network error
                console.error('Error downloading file:', err);
                if (err.code === 'ENOENT') {
                    return res.status(404).json({ message: 'File not found.' });
                }
                res.status(500).json({ message: 'Could not download the file.' });
            }
        });
    } else {
        console.error(`File not found at path: ${filePath}`); // Added for better debugging
        res.status(404).json({ message: 'File not found.' });
    }
});

// --- Protected Routes (require JWT authentication) ---

// @route   GET /api/protected
// @desc    A sample protected route to test authentication
// @access  Private
app.get('/api/protected', auth, (req, res) => {
    // If 'auth' middleware passes, req.user will contain the username from the token
    res.json({ message: `Welcome, ${req.user}! You successfully accessed a protected route.` });
});


// --- Basic Health Check / Root Route ---
app.get('/', (req, res) => {
    res.send('Rootle grown and bearing fruits.! "Backend can take API requests."');
});


// --- Start the Server ---
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log('Use http://localhost:5000/api/register for registration.');
    console.log('Use http://localhost:5000/api/login for login.');
    console.log('Use http://localhost:5000/api/protected for testing JWT.');
});