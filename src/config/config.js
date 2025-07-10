const dotenv = require('dotenv');
const path = require('path');

// Load environment variables from .env file
dotenv.config();

const config = {
    // Website Configuration
    website: {
        targetUrl: process.env.TARGET_URL || 'https://example.com/login',
        selectors: {
            username: process.env.USERNAME_SELECTOR || '#username',
            password: process.env.PASSWORD_SELECTOR || '#password',
            loginButton: process.env.LOGIN_BUTTON_SELECTOR || '#login-button',
            punchButton: process.env.PUNCH_BUTTON_SELECTOR || '#punch-button'
        }
    },

    // Authentication
    auth: {
        username: process.env.LOGIN_USERNAME || '',
        password: process.env.LOGIN_PASSWORD || ''
    },

    // Browser Configuration
    browser: {
        headless: process.env.BROWSER_HEADLESS === 'true',
        timeout: parseInt(process.env.BROWSER_TIMEOUT) || 30000,
        userAgent: process.env.BROWSER_USER_AGENT || 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
    },

    // Scheduling
    scheduler: {
        cronSchedule: process.env.CRON_SCHEDULE || '0 10 * * *', // 10 AM daily
        timezone: process.env.TIMEZONE || 'UTC'
    },

    // PDF Configuration
    pdf: {
        outputDir: process.env.PDF_OUTPUT_DIR || path.join(__dirname, '../../reports'),
        filenamePrefix: process.env.PDF_FILENAME_PREFIX || 'autopunch-report'
    },

    // Logging
    logging: {
        level: process.env.LOG_LEVEL || 'info',
        maxFileSize: parseInt(process.env.MAX_LOG_FILE_SIZE) || 10485760, // 10MB
        maxFiles: parseInt(process.env.MAX_LOG_FILES) || 5
    },

    // Netlify Configuration
    netlify: {
        siteId: process.env.NETLIFY_SITE_ID || '',
        authToken: process.env.NETLIFY_AUTH_TOKEN || ''
    },

    // Application Configuration
    app: {
        port: parseInt(process.env.PORT) || 3000,
        nodeEnv: process.env.NODE_ENV || 'development'
    },

    // Retry Configuration
    retry: {
        maxAttempts: parseInt(process.env.MAX_RETRY_ATTEMPTS) || 3,
        delayMs: parseInt(process.env.RETRY_DELAY_MS) || 5000
    }
};

// Validation function
function validateConfig() {
    const requiredFields = [
        'website.targetUrl',
        'auth.username',
        'auth.password',
        'website.selectors.username',
        'website.selectors.password',
        'website.selectors.loginButton',
        'website.selectors.punchButton'
    ];

    const missingFields = [];

    requiredFields.forEach(field => {
        const value = getNestedValue(config, field);
        if (!value) {
            missingFields.push(field);
        }
    });

    if (missingFields.length > 0) {
        throw new Error(`Missing required configuration fields: ${missingFields.join(', ')}`);
    }
}

function getNestedValue(obj, path) {
    return path.split('.').reduce((current, key) => current && current[key], obj);
}

// Export configuration
module.exports = {
    ...config,
    validateConfig
};
