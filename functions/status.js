const fs = require('fs-extra');
const path = require('path');
const moment = require('moment-timezone');

exports.handler = async (event, context) => {
    context.callbackWaitsForEmptyEventLoop = false;
    
    // Allow GET requests
    if (event.httpMethod !== 'GET') {
        return {
            statusCode: 405,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            body: JSON.stringify({
                success: false,
                message: 'Method not allowed. Use GET.'
            })
        };
    }
    
    try {
        const logsDir = path.join(__dirname, '../logs');
        const currentDate = moment().tz('Asia/Kolkata').format('YYYY-MM-DD');
        
        // Get today's reports
        const todayReportFile = path.join(logsDir, `autopunch-report-${currentDate}.json`);
        let todayReports = [];
        
        if (await fs.pathExists(todayReportFile)) {
            todayReports = await fs.readJson(todayReportFile);
            if (!Array.isArray(todayReports)) {
                todayReports = [todayReports];
            }
        }
        
        // Get recent history (last 7 days)
        const recentReports = [];
        for (let i = 0; i < 7; i++) {
            const date = moment().tz('Asia/Kolkata').subtract(i, 'days').format('YYYY-MM-DD');
            const reportFile = path.join(logsDir, `autopunch-report-${date}.json`);
            
            if (await fs.pathExists(reportFile)) {
                try {
                    const dayReports = await fs.readJson(reportFile);
                    const reports = Array.isArray(dayReports) ? dayReports : [dayReports];
                    recentReports.push({
                        date: date,
                        reports: reports,
                        count: reports.length,
                        successCount: reports.filter(r => r.success).length
                    });
                } catch (e) {
                    console.warn(`Error reading report file for ${date}:`, e.message);
                }
            }
        }
        
        // Get main log summary
        const mainLogFile = path.join(logsDir, 'autopunch-history.log');
        let logSummary = 'No log file found';
        
        if (await fs.pathExists(mainLogFile)) {
            const logContent = await fs.readFile(mainLogFile, 'utf8');
            const lines = logContent.trim().split('\n').filter(line => line.trim());
            const recentLines = lines.slice(-10); // Last 10 entries
            logSummary = recentLines.join('\n');
        }
        
        const currentTime = moment().tz('Asia/Kolkata');
        
        return {
            statusCode: 200,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            body: JSON.stringify({
                success: true,
                message: 'Status retrieved successfully',
                data: {
                    currentTime: currentTime.format('YYYY-MM-DD HH:mm:ss'),
                    timezone: 'Asia/Kolkata',
                    todayReports: todayReports,
                    todayCount: todayReports.length,
                    todaySuccessCount: todayReports.filter(r => r.success).length,
                    recentHistory: recentReports,
                    lastLogEntries: logSummary
                },
                timestamp: currentTime.toISOString()
            })
        };
        
    } catch (error) {
        console.error('Status check error:', error);
        
        return {
            statusCode: 500,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            body: JSON.stringify({
                success: false,
                message: 'Status check failed',
                error: error.message,
                timestamp: moment().tz('Asia/Kolkata').toISOString()
            })
        };
    }
};
