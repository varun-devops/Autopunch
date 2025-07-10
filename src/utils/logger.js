const fs = require('fs-extra');
const path = require('path');
const moment = require('moment');

class Logger {
    constructor() {
        this.logDir = path.join(__dirname, '../../logs');
        this.logFile = path.join(this.logDir, 'autopunch.log');
        this.maxLogSize = 10 * 1024 * 1024; // 10MB
        this.maxLogFiles = 5;
        
        // Ensure log directory exists
        this.ensureLogDir();
    }

    async ensureLogDir() {
        try {
            await fs.ensureDir(this.logDir);
        } catch (error) {
            console.error('Failed to create log directory:', error);
        }
    }

    formatMessage(level, message, data = null) {
        const timestamp = moment().format('YYYY-MM-DD HH:mm:ss');
        let formattedMessage = `[${timestamp}] [${level.toUpperCase()}] ${message}`;
        
        if (data) {
            formattedMessage += ` | Data: ${JSON.stringify(data, null, 2)}`;
        }
        
        return formattedMessage;
    }

    async writeToFile(message) {
        try {
            // Check if log rotation is needed
            await this.rotateLogIfNeeded();
            
            // Append to log file
            await fs.appendFile(this.logFile, message + '\n');
        } catch (error) {
            console.error('Failed to write to log file:', error);
        }
    }

    async rotateLogIfNeeded() {
        try {
            const stats = await fs.stat(this.logFile);
            
            if (stats.size > this.maxLogSize) {
                // Rotate logs
                for (let i = this.maxLogFiles - 1; i >= 1; i--) {
                    const oldFile = `${this.logFile}.${i}`;
                    const newFile = `${this.logFile}.${i + 1}`;
                    
                    if (await fs.pathExists(oldFile)) {
                        if (i === this.maxLogFiles - 1) {
                            // Delete the oldest log file
                            await fs.remove(oldFile);
                        } else {
                            // Rename the log file
                            await fs.move(oldFile, newFile);
                        }
                    }
                }
                
                // Move current log to .1
                await fs.move(this.logFile, `${this.logFile}.1`);
            }
        } catch (error) {
            // If rotation fails, just continue - we don't want to stop logging
            console.error('Log rotation failed:', error);
        }
    }

    log(level, message, data = null) {
        const formattedMessage = this.formatMessage(level, message, data);
        
        // Console output with colors
        this.consoleLog(level, formattedMessage);
        
        // File output
        this.writeToFile(formattedMessage);
    }

    consoleLog(level, message) {
        const colors = {
            info: '\x1b[36m',    // Cyan
            warn: '\x1b[33m',    // Yellow
            error: '\x1b[31m',   // Red
            debug: '\x1b[35m',   // Magenta
            success: '\x1b[32m'  // Green
        };
        
        const resetColor = '\x1b[0m';
        const color = colors[level] || colors.info;
        
        console.log(`${color}${message}${resetColor}`);
    }

    info(message, data = null) {
        this.log('info', message, data);
    }

    warn(message, data = null) {
        this.log('warn', message, data);
    }

    error(message, data = null) {
        this.log('error', message, data);
    }

    debug(message, data = null) {
        this.log('debug', message, data);
    }

    success(message, data = null) {
        this.log('success', message, data);
    }

    // Method to get recent logs
    async getRecentLogs(lines = 100) {
        try {
            const logContent = await fs.readFile(this.logFile, 'utf8');
            const logLines = logContent.split('\n');
            return logLines.slice(-lines).join('\n');
        } catch (error) {
            return `Error reading logs: ${error.message}`;
        }
    }

    // Method to clear logs
    async clearLogs() {
        try {
            await fs.remove(this.logFile);
            this.info('Logs cleared successfully');
        } catch (error) {
            this.error('Failed to clear logs:', error);
        }
    }
}

module.exports = Logger;
