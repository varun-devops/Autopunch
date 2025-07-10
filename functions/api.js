const serverless = require('serverless-http');
const app = require('../src/server');

const handler = serverless(app);

module.exports.handler = async (event, context) => {
    // Set timeout for serverless function
    context.callbackWaitsForEmptyEventLoop = false;
    
    try {
        const result = await handler(event, context);
        return result;
    } catch (error) {
        console.error('Serverless function error:', error);
        return {
            statusCode: 500,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Headers': 'Content-Type',
                'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS'
            },
            body: JSON.stringify({
                success: false,
                message: 'Internal Server Error',
                error: error.message
            })
        };
    }
};
