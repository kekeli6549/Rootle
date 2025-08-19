const fs = require('fs');
const path = require('path');

const filesFilePath = path.join(__dirname, '../data', 'files.json'); // Path to files.json

/**
 * Reads the file metadata from files.json.
 * If the file doesn't exist or is empty/corrupted, it returns an empty array.
 * @returns {Array} An array of file metadata objects.
 */
const readFiles = () => {
    try {
        const filesData = fs.readFileSync(filesFilePath, 'utf8');
        return JSON.parse(filesData);
    } catch (error) {
        if (error.code === 'ENOENT') {
            console.warn('files.json not found, initializing with empty array.');
            return [];
        }
        console.error('Error reading files file:', error);
        return [];
    }
};

/**
 * Writes an array of file metadata objects to files.json.
 * @param {Array} files - The array of file metadata objects to write.
 */
const writeFiles = (files) => {
    try {
        fs.writeFileSync(filesFilePath, JSON.stringify(files, null, 2), 'utf8');
    } catch (error) {
        console.error('Error writing files file:', error);
    }
};

module.exports = {
    readFiles,
    writeFiles
};