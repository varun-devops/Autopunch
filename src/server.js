const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const fs = require('fs-extra');
const path = require('path');
const moment = require('moment-timezone');
const AutoPunchApp = require('./index');
const Logger = require('./utils/logger');

const app = express();
const logger = new Logger();
const autoPunchApp = new AutoPunchApp();

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Routes
app.get('/', (req, res) => {
    const currentTime = moment().tz('Asia/Kolkata');
    res.json({
        message: 'AutoPunch Web Crawler API - Live on Netlify',
        version: '2.0.0',
        status: 'running',
        currentTime: currentTime.format('YYYY-MM-DD HH:mm:ss'),
        timezone: 'Asia/Kolkata (IST)',
        schedules: {
            punchIn: '10:00 AM IST',
            punchOut: '6:00 PM IST'
        },
        timestamp: new Date().toISOString(),
        endpoints: {
            status: '/api/status',
            manualTrigger: '/api/manual-trigger',
            scheduler: '/api/punch-scheduler'
        }
    });
});

app.get('/health', (req, res) => {
    res.json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        uptime: process.uptime()
    });
});

app.post('/run', async (req, res) => {
    try {
        const currentTime = moment().tz('Asia/Kolkata');
        logger.info('Manual execution requested via API at ' + currentTime.format('YYYY-MM-DD HH:mm:ss'));
        
        const result = await autoPunchApp.runAutoPunch();
        result.triggerType = 'api';
        result.triggerTime = currentTime.format('YYYY-MM-DD HH:mm:ss');
        
        res.json({
            success: true,
            message: 'AutoPunch execution completed',
            result: result,
            istTime: currentTime.format('YYYY-MM-DD HH:mm:ss')
        });
    } catch (error) {
        logger.error('Manual execution failed:', error);
        res.status(500).json({
            success: false,
            message: 'AutoPunch execution failed',
            error: error.message,
            istTime: moment().tz('Asia/Kolkata').format('YYYY-MM-DD HH:mm:ss')
        });
    }
});

app.get('/logs', async (req, res) => {
    try {
        const date = req.query.date || moment().tz('Asia/Kolkata').format('YYYY-MM-DD');
        const logsDir = path.join(__dirname, '../logs');
        
        // Get specific date reports
        const reportFile = path.join(logsDir, `autopunch-report-${date}.json`);
        let reports = [];
        
        if (await fs.pathExists(reportFile)) {
            const data = await fs.readJson(reportFile);
            reports = Array.isArray(data) ? data : [data];
        }
        
        // Get main log entries for the date
        const mainLogFile = path.join(logsDir, 'autopunch-history.log');
        let logEntries = [];
        
        if (await fs.pathExists(mainLogFile)) {
            const logContent = await fs.readFile(mainLogFile, 'utf8');
            logEntries = logContent.split('\n')
                .filter(line => line.includes(date))
                .slice(-20); // Last 20 entries for the date
        }
        
        res.json({
            success: true,
            date: date,
            reports: reports,
            reportCount: reports.length,
            successCount: reports.filter(r => r.success).length,
            logEntries: logEntries
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to retrieve logs',
            error: error.message
        });
    }
});

app.get('/schedule', (req, res) => {
    try {
        const currentTime = moment().tz('Asia/Kolkata');
        const nextPunchIn = moment().tz('Asia/Kolkata').hour(10).minute(0).second(0);
        const nextPunchOut = moment().tz('Asia/Kolkata').hour(18).minute(0).second(0);
        
        // If we've passed today's times, move to tomorrow
        if (currentTime.isAfter(nextPunchIn)) {
            nextPunchIn.add(1, 'day');
        }
        if (currentTime.isAfter(nextPunchOut)) {
            nextPunchOut.add(1, 'day');
        }
        
        res.json({
            success: true,
            currentTime: currentTime.format('YYYY-MM-DD HH:mm:ss'),
            timezone: 'Asia/Kolkata',
            schedule: {
                punchIn: '10:00 AM IST Daily',
                punchOut: '6:00 PM IST Daily',
                nextPunchIn: nextPunchIn.format('YYYY-MM-DD HH:mm:ss'),
                nextPunchOut: nextPunchOut.format('YYYY-MM-DD HH:mm:ss')
            },
            note: 'Scheduled via external cron service (cron-job.org) due to Netlify limitations'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to retrieve schedule info',
            error: error.message
        });
    }
});

// Error handling middleware
app.use((error, req, res, next) => {
    logger.error('API Error:', error);
    res.status(500).json({
        success: false,
        message: 'Internal Server Error',
        error: error.message
    });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: 'Endpoint not found'
    });
});

// Start server
const PORT = process.env.PORT || 3000;

async function startServer() {
    try {
        // Don't initialize AutoPunch app for serverless deployment
        // It will be initialized when needed
        
        // Start Express server
        app.listen(PORT, () => {
            logger.info(`AutoPunch API server running on port ${PORT}`);
            logger.info(`Health check: http://localhost:${PORT}/health`);
            logger.info(`Manual run: POST http://localhost:${PORT}/run`);
            logger.info(`View logs: GET http://localhost:${PORT}/logs`);
        });
    } catch (error) {
        logger.error('Failed to start server:', error);
        process.exit(1);
    }
}

// Handle graceful shutdown
process.on('SIGINT', () => {
    logger.info('Received SIGINT. Shutting down gracefully...');
    process.exit(0);
});

process.on('SIGTERM', () => {
    logger.info('Received SIGTERM. Shutting down gracefully...');
    process.exit(0);
});

if (require.main === module) {
    startServer();
}

module.exports = app;
