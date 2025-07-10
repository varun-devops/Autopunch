const AutoPunchApp = require('../src/index');
const moment = require('moment-timezone');

exports.handler = async (event, context) => {
    // This function will be triggered by Netlify scheduled functions
    // or external cron services like cron-job.org for 10am and 6pm IST
    
    context.callbackWaitsForEmptyEventLoop = false;
    
    try {
        const currentTime = moment().tz('Asia/Kolkata');
        const hour = currentTime.hour();
        
        console.log(`Scheduled function triggered at ${currentTime.format('YYYY-MM-DD HH:mm:ss')} IST`);
        
        // Determine if this is punch-in (10am) or punch-out (6pm)
        let punchType = 'unknown';
        if (hour >= 9 && hour <= 11) {
            punchType = 'punch-in';
        } else if (hour >= 17 && hour <= 19) {
            punchType = 'punch-out';
        }
        
        console.log(`Executing ${punchType} at ${currentTime.format('HH:mm:ss')} IST`);
        
        const autoPunchApp = new AutoPunchApp();
        const result = await autoPunchApp.runAutoPunch();
        
        // Add punch type info to result
        result.punchType = punchType;
        result.scheduleTime = currentTime.format('YYYY-MM-DD HH:mm:ss');
        
        return {
            statusCode: 200,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            body: JSON.stringify({
                success: true,
                message: `Scheduled ${punchType} execution completed`,
                result: result,
                timestamp: currentTime.toISOString(),
                istTime: currentTime.format('YYYY-MM-DD HH:mm:ss')
            })
        };
        
    } catch (error) {
        console.error('Scheduled function error:', error);
        
        return {
            statusCode: 500,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            body: JSON.stringify({
                success: false,
                message: 'Scheduled execution failed',
                error: error.message,
                timestamp: moment().tz('Asia/Kolkata').toISOString(),
                istTime: moment().tz('Asia/Kolkata').format('YYYY-MM-DD HH:mm:ss')
            })
        };
    }
};
