const EmailService = require('./src/utils/emailService');

async function testEmailService() {
    console.log('Testing Email Service...');
    
    const emailService = new EmailService();
    
    try {
        const result = await emailService.sendPunchReport(
            '2025-07-10 10:00:00',
            '2025-07-10 18:00:00',
            [
                'Punch In Time: 2025-07-10 10:00:00 - User: varun.singh@telesys.com',
                'Punch Out Time: 2025-07-10 18:00:00 - User: varun.singh@telesys.com'
            ]
        );
        
        console.log('✅ Email test successful!');
        console.log('Result:', result);
        
        if (result.previewUrl) {
            console.log('\n📧 Email Preview URL:', result.previewUrl);
            console.log('You can view the email at this URL to confirm it was sent correctly.');
        }
        
    } catch (error) {
        console.error('❌ Email test failed:', error.message);
    }
}

testEmailService();
