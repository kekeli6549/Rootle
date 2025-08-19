const fs = require('fs'); // Node.js built-in File System module
const path = require('path'); // Node.js built-in Path module

// Construct the full path to your users.json file
// __dirname is a Node.js global variable that provides the absolute path of the directory
// where the currently executing script (userUtils.js) resides.
const usersFilePath = path.join(__dirname, '../data', 'users.json');

/**
 * Reads the users data from users.json.
 * If the file doesn't exist or is empty/corrupted, it returns an empty array.
 * @returns {Array} An array of user objects.
 */
const readUsers = () => {
    try {
        // Read file content as a string
        const usersData = fs.readFileSync(usersFilePath, 'utf8');
        // Parse the JSON string into a JavaScript array
        return JSON.parse(usersData);
    } catch (error) {
        // If the file doesn't exist, it's not an error for us; just return an empty array
        if (error.code === 'ENOENT') { // ENOENT stands for "Error NO ENtry" - file/directory does not exist
            console.warn('users.json not found, initializing with empty array.');
            return [];
        }
        // Log other errors to the console for debugging
        console.error('Error reading users file:', error);
        return []; // Return empty array on other errors like malformed JSON
    }
};

/**
 * Writes an array of user objects to users.json.
 * @param {Array} users - The array of user objects to write.
 */
const writeUsers = (users) => {
    try {
        // Convert the JavaScript array to a formatted JSON string (2 spaces for indentation)
        fs.writeFileSync(usersFilePath, JSON.stringify(users, null, 2), 'utf8');
    } catch (error) {
        console.error('Error writing users file:', error);
    }
};

// Export these functions so they can be used in other files (like server.js)
module.exports = {
    readUsers,
    writeUsers
};