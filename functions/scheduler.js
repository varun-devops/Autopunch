const AutoPunchApp = require('../src/index');

exports.handler = async (event, context) => {
    // This is a Netlify scheduled function
    // Configure it in your Netlify dashboard or use a webhook
    
    context.callbackWaitsForEmptyEventLoop = false;
    
    try {
        console.log('Scheduled function triggered');
        
        const autoPunchApp = new AutoPunchApp();
        await autoPunchApp.initialize();
        
        const result = await autoPunchApp.runAutoPunch();
        
        return {
            statusCode: 200,
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                success: true,
                message: 'Scheduled execution completed',
                result: result,
                timestamp: new Date().toISOString()
            })
        };
        
    } catch (error) {
        console.error('Scheduled function error:', error);
        
        return {
            statusCode: 500,
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                success: false,
                message: 'Scheduled execution failed',
                error: error.message,
                timestamp: new Date().toISOString()
            })
        };
    }
};
