const AutoPunchApp = require('../src/index');
const moment = require('moment-timezone');

exports.handler = async (event, context) => {
    context.callbackWaitsForEmptyEventLoop = false;
    
    // Only allow POST requests
    if (event.httpMethod !== 'POST') {
        return {
            statusCode: 405,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            body: JSON.stringify({
                success: false,
                message: 'Method not allowed. Use POST.'
            })
        };
    }
    
    try {
        const currentTime = moment().tz('Asia/Kolkata');
        console.log(`Manual trigger executed at ${currentTime.format('YYYY-MM-DD HH:mm:ss')} IST`);
        
        // Parse request body for manual punch type
        let requestBody = {};
        try {
            requestBody = JSON.parse(event.body || '{}');
        } catch (e) {
            // Use default if parsing fails
        }
        
        const punchType = requestBody.type || 'manual';
        
        console.log(`Executing manual ${punchType} trigger`);
        
        const autoPunchApp = new AutoPunchApp();
        const result = await autoPunchApp.runAutoPunch();
        
        // Add trigger info to result
        result.punchType = punchType;
        result.triggerTime = currentTime.format('YYYY-MM-DD HH:mm:ss');
        result.triggerType = 'manual';
        
        return {
            statusCode: 200,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Headers': 'Content-Type',
                'Access-Control-Allow-Methods': 'POST, OPTIONS'
            },
            body: JSON.stringify({
                success: true,
                message: `Manual ${punchType} execution completed`,
                result: result,
                timestamp: currentTime.toISOString(),
                istTime: currentTime.format('YYYY-MM-DD HH:mm:ss')
            })
        };
        
    } catch (error) {
        console.error('Manual trigger error:', error);
        
        return {
            statusCode: 500,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            body: JSON.stringify({
                success: false,
                message: 'Manual execution failed',
                error: error.message,
                timestamp: moment().tz('Asia/Kolkata').toISOString(),
                istTime: moment().tz('Asia/Kolkata').format('YYYY-MM-DD HH:mm:ss')
            })
        };
    }
};
