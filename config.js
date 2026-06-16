const fs = require('fs');
const path = require('path');

// config.env file එක තියෙනවනම් load වෙනවා
const envPath = path.resolve(__dirname, 'config.env');
if (fs.existsSync(envPath)) {
    require('dotenv').config({ path: envPath });
}

function convertToBool(text, fault = 'true') {
    return String(text).toLowerCase() === String(fault).toLowerCase();
}

module.exports = {
    // Pairing Code - session ID නැතුව link වෙන්න
    SESSION_ID: process.env.SESSION_ID || "", // හිස් තියපන්
    USE_PAIRING_CODE: true,
    
    // Bot Settings
    AUTO_READ_STATUS: convertToBool(process.env.AUTO_READ_STATUS, "true"),
    ANTI_DELETE: convertToBool(process.env.ANTI_DELETE, "true"),
    MODE: process.env.MODE || "public", // public, private, groups, inbox
    ALWAYS_OFFLINE: convertToBool(process.env.ALWAYS_OFFLINE, "false"),
    LANG: process.env.LANG || "SI",
    
    // අනිත් basic settings
    PREFIX: process.env.PREFIX || ".",
    OWNER_NUMBER: process.env.OWNER_NUMBER || "",
    BOT_NAME: process.env.BOT_NAME || "thuhi-OFC",
    PORT: process.env.PORT || 5000
};