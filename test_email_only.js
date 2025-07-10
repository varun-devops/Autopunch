const EmailService = require('./src/utils/emailService');

async function testEmailOnly() {
    console.log('Testing email functionality...');
    
    const emailService = new EmailService();
    
    try {
        // Test sending a punch report
        console.log('Sending test punch report...');
        const result = await emailService.sendPunchReport(
            '2025-07-10 10:00:00',
            '2025-07-10 18:00:00',
            [
                'Punch In Time: 2025-07-10 10:00:00 - User: varun.singh@telesys.com',
                'Punch Out Time: 2025-07-10 18:00:00 - User: varun.singh@telesys.com'
            ]
        );
        
        console.log('✅ Email sent successfully!');
        console.log('Method used:', result.method);
        console.log('Message ID:', result.messageId);
        
        if (result.previewUrl) {
            console.log('\n📧 Email Preview URL:');
            console.log(result.previewUrl);
            console.log('\nYou can click this URL to see the email that was sent.');
            console.log('This confirms the email functionality is working!');
        }
        
        // Also test error email
        console.log('\nTesting error email...');
        const errorResult = await emailService.sendErrorEmail('Test error message for verification');
        console.log('✅ Error email sent successfully!');
        
        if (errorResult.previewUrl) {
            console.log('Error Email Preview URL:');
            console.log(errorResult.previewUrl);
        }
        
    } catch (error) {
        console.error('❌ Email test failed:', error.message);
    }
}

testEmailOnly();
