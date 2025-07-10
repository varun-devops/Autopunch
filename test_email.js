const nodemailer = require('nodemailer');
const moment = require('moment-timezone');

async function sendTestEmail() {
    try {
        console.log('Creating test email account...');
        
        // Create a test account using Ethereal Email (for testing)
        const testAccount = await nodemailer.createTestAccount();
        
        console.log('Test account created:', testAccount.user);
        
        // Create transporter with test account
        const transporter = nodemailer.createTransporter({
            host: 'smtp.ethereal.email',
            port: 587,
            secure: false,
            auth: {
                user: testAccount.user,
                pass: testAccount.pass
            }
        });
        
        const emailContent = `
Daily Punch Report - ${moment().tz('Asia/Kolkata').format('YYYY-MM-DD')}

Employee: varun.singh@telesys.com
Punch In Time: 2025-07-10 22:08:38 IST
Punch Out Time: 2025-07-10 22:09:10 IST
Total Working Hours: 0 hours 32 minutes

Punch Log:
Punch In Time: 2025-07-10 22:08:38 - User: varun.singh@telesys.com
Punch Out Time: 2025-07-10 22:09:10 - User: varun.singh@telesys.com

This report was generated automatically by AutoPunch System.
        `;
        
        // Send email
        const info = await transporter.sendMail({
            from: testAccount.user,
            to: 'varunparihar994@gmail.com',
            subject: `Daily Punch Report - ${moment().tz('Asia/Kolkata').format('YYYY-MM-DD')}`,
            text: emailContent
        });
        
        console.log('✓ Test email sent successfully!');
        console.log('Message ID:', info.messageId);
        console.log('Preview URL:', nodemailer.getTestMessageUrl(info));
        
        return {
            success: true,
            messageId: info.messageId,
            previewUrl: nodemailer.getTestMessageUrl(info)
        };
        
    } catch (error) {
        console.error('❌ Failed to send test email:', error);
        return {
            success: false,
            error: error.message
        };
    }
}

// Run the test
sendTestEmail().then(result => {
    console.log('\n--- Email Test Results ---');
    console.log('Success:', result.success);
    if (result.success) {
        console.log('Preview URL:', result.previewUrl);
        console.log('\nNote: This is a test email service. For real emails, you need to configure Gmail or other email service.');
    } else {
        console.log('Error:', result.error);
    }
});
