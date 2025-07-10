const WebCrawler = require('./crawler/webCrawler');
const Logger = require('./utils/logger');
const nodemailer = require('nodemailer');
const moment = require('moment-timezone');
const cron = require('node-cron');

class AutoPunchScheduler {
    constructor() {
        this.logger = new Logger();
        this.punchData = {
            date: null,
            punchInTime: null,
            punchOutTime: null,
            punchLog: []
        };
    }

    async initialize() {
        this.logger.info('Initializing AutoPunch Scheduler...');
        
        // Schedule punch in at 10:00 AM IST (4:30 AM UTC)
        cron.schedule('0 10 * * *', async () => {
            this.logger.info('Scheduled Punch In triggered at 10:00 AM IST');
            await this.performPunchIn();
        }, {
            scheduled: true,
            timezone: "Asia/Kolkata"
        });
        
        // Schedule punch out at 6:00 PM IST (12:30 PM UTC)
        cron.schedule('0 18 * * *', async () => {
            this.logger.info('Scheduled Punch Out triggered at 6:00 PM IST');
            await this.performPunchOut();
        }, {
            scheduled: true,
            timezone: "Asia/Kolkata"
        });
        
        this.logger.info('AutoPunch Scheduler initialized successfully');
        this.logger.info('Scheduled times:');
        this.logger.info('- Punch In: 10:00 AM IST daily');
        this.logger.info('- Punch Out: 6:00 PM IST daily');
    }

    async performPunchIn() {
        const crawler = new WebCrawler();
        
        try {
            this.logger.info('Starting Punch In process...');
            
            // Reset daily data
            const today = moment().tz('Asia/Kolkata').format('YYYY-MM-DD');
            this.punchData.date = today;
            this.punchData.punchLog = [];
            
            // Initialize browser
            await crawler.initialize();
            
            // Navigate to login page
            await crawler.navigateToUrl('https://telesyssoftware.securtime.adp.com/login?redirectUrl=%2Fdashboard');
            await crawler.driver.sleep(5000);
            
            // Perform login
            await this.performLogin(crawler);
            
            // Find and click Punch In button
            const punchInButton = await this.findPunchButton(crawler, 'Punch In');
            if (punchInButton) {
                await punchInButton.click();
                this.logger.success('✓ Punch In button clicked successfully');
                
                // Record punch in time
                this.punchData.punchInTime = moment().tz('Asia/Kolkata').format('YYYY-MM-DD HH:mm:ss');
                this.punchData.punchLog.push(`Punch In Time: ${this.punchData.punchInTime} - User: varun.singh@telesys.com`);
                
                this.logger.success(`✓ Punch In completed at: ${this.punchData.punchInTime}`);
                
                // Take screenshot
                await crawler.takeScreenshot();
            } else {
                throw new Error('Punch In button not found');
            }
            
            // Close browser
            await crawler.close();
            
            // Save punch in data
            await this.savePunchData();
            
        } catch (error) {
            this.logger.error('Punch In failed:', error);
            await crawler.close();
            await this.sendErrorEmail(`Punch In failed: ${error.message}`);
            throw error;
        }
    }

    async performPunchOut() {
        const crawler = new WebCrawler();
        
        try {
            this.logger.info('Starting Punch Out process...');
            
            // Initialize browser
            await crawler.initialize();
            
            // Navigate to login page
            await crawler.navigateToUrl('https://telesyssoftware.securtime.adp.com/login?redirectUrl=%2Fdashboard');
            await crawler.driver.sleep(5000);
            
            // Perform login
            await this.performLogin(crawler);
            
            // Find and click Punch Out button
            const punchOutButton = await this.findPunchButton(crawler, 'Punch Out');
            if (punchOutButton) {
                await punchOutButton.click();
                this.logger.success('✓ Punch Out button clicked successfully');
                
                // Record punch out time
                this.punchData.punchOutTime = moment().tz('Asia/Kolkata').format('YYYY-MM-DD HH:mm:ss');
                this.punchData.punchLog.push(`Punch Out Time: ${this.punchData.punchOutTime} - User: varun.singh@telesys.com`);
                
                this.logger.success(`✓ Punch Out completed at: ${this.punchData.punchOutTime}`);
                
                // Take screenshot
                await crawler.takeScreenshot();
            } else {
                throw new Error('Punch Out button not found');
            }
            
            // Close browser
            await crawler.close();
            
            // Save complete punch data
            await this.savePunchData();
            
            // Send daily report email
            await this.sendDailyReport();
            
        } catch (error) {
            this.logger.error('Punch Out failed:', error);
            await crawler.close();
            await this.sendErrorEmail(`Punch Out failed: ${error.message}`);
            throw error;
        }
    }

    async performLogin(crawler) {
        // Find email field
        const possibleEmailSelectors = [
            'input[type="email"]',
            'input[name="username"]',
            'input[name="email"]',
            'input[id*="email"]',
            'input[id*="username"]'
        ];
        
        let emailField = null;
        for (const selector of possibleEmailSelectors) {
            try {
                emailField = await crawler.driver.findElement(crawler.By.css(selector));
                break;
            } catch (e) {
                // Try next selector
            }
        }
        
        if (emailField) {
            await emailField.clear();
            await emailField.sendKeys('varun.singh@telesys.com');
            this.logger.success('✓ Email entered successfully');
        } else {
            throw new Error('Email field not found');
        }
        
        // Find password field
        const possiblePasswordSelectors = [
            'input[type="password"]',
            'input[name="password"]',
            'input[id*="password"]'
        ];
        
        let passwordField = null;
        for (const selector of possiblePasswordSelectors) {
            try {
                passwordField = await crawler.driver.findElement(crawler.By.css(selector));
                break;
            } catch (e) {
                // Try next selector
            }
        }
        
        if (passwordField) {
            await passwordField.clear();
            await passwordField.sendKeys('King@123');
            this.logger.success('✓ Password entered successfully');
        } else {
            throw new Error('Password field not found');
        }
        
        // Find and click login button
        const possibleLoginSelectors = [
            'button[type="submit"]',
            'input[type="submit"]',
            'button[id*="login"]',
            'button[id*="signin"]'
        ];
        
        let loginButton = null;
        for (const selector of possibleLoginSelectors) {
            try {
                loginButton = await crawler.driver.findElement(crawler.By.css(selector));
                break;
            } catch (e) {
                // Try next selector
            }
        }
        
        if (loginButton) {
            await loginButton.click();
            this.logger.success('✓ Login button clicked successfully');
            await crawler.driver.sleep(8000); // Wait for login to complete
        } else {
            throw new Error('Login button not found');
        }
    }

    async findPunchButton(crawler, buttonType) {
        const selectors = [
            'button[class*="mybtn"]',
            'button[type="undefined"]',
            'button.mybtn',
            'button[class="mybtn"]'
        ];
        
        const xpathSelectors = [
            `//button[contains(text(), '${buttonType}')]`,
            "//button[contains(@class, 'mybtn')]",
            "//button[@type='undefined']"
        ];
        
        // Try CSS selectors first
        for (const selector of selectors) {
            try {
                const button = await crawler.driver.findElement(crawler.By.css(selector));
                const buttonText = await button.getText();
                if (buttonText.includes(buttonType)) {
                    this.logger.info(`Found ${buttonType} button with selector: ${selector}`);
                    return button;
                }
            } catch (e) {
                // Try next selector
            }
        }
        
        // Try XPath selectors
        for (const xpath of xpathSelectors) {
            try {
                const button = await crawler.driver.findElement(crawler.By.xpath(xpath));
                this.logger.info(`Found ${buttonType} button with XPath: ${xpath}`);
                return button;
            } catch (e) {
                // Try next selector
            }
        }
        
        return null;
    }

    async savePunchData() {
        const fs = require('fs');
        const path = require('path');
        
        const logContent = this.punchData.punchLog.join('\n') + '\n';
        const fileName = `punch_log_${this.punchData.date}.txt`;
        const filePath = path.join(__dirname, '../reports', fileName);
        
        // Ensure reports directory exists
        const reportsDir = path.dirname(filePath);
        if (!fs.existsSync(reportsDir)) {
            fs.mkdirSync(reportsDir, { recursive: true });
        }
        
        fs.writeFileSync(filePath, logContent);
        this.logger.success(`✓ Punch data saved to: ${filePath}`);
    }

    async sendDailyReport() {
        try {
            this.logger.info('Sending daily report email...');
            
            // Create email transporter
            const transporter = nodemailer.createTransporter({
                service: 'gmail',
                auth: {
                    user: process.env.EMAIL_USER || 'your-email@gmail.com',
                    pass: process.env.EMAIL_PASS || 'your-app-password'
                }
            });
            
            // Calculate working hours
            const punchInMoment = moment.tz(this.punchData.punchInTime, 'YYYY-MM-DD HH:mm:ss', 'Asia/Kolkata');
            const punchOutMoment = moment.tz(this.punchData.punchOutTime, 'YYYY-MM-DD HH:mm:ss', 'Asia/Kolkata');
            const duration = moment.duration(punchOutMoment.diff(punchInMoment));
            const hours = Math.floor(duration.asHours());
            const minutes = duration.minutes();
            
            const emailContent = `
            <h2>Daily Punch Report - ${this.punchData.date}</h2>
            <p><strong>Employee:</strong> varun.singh@telesys.com</p>
            <p><strong>Date:</strong> ${this.punchData.date}</p>
            <p><strong>Punch In Time:</strong> ${this.punchData.punchInTime} IST</p>
            <p><strong>Punch Out Time:</strong> ${this.punchData.punchOutTime} IST</p>
            <p><strong>Total Working Hours:</strong> ${hours} hours ${minutes} minutes</p>
            
            <h3>Punch Log:</h3>
            <pre>${this.punchData.punchLog.join('\n')}</pre>
            
            <p><em>This report was generated automatically by AutoPunch System.</em></p>
            <p><em>Generated at: ${moment().tz('Asia/Kolkata').format('YYYY-MM-DD HH:mm:ss')} IST</em></p>
            `;
            
            const mailOptions = {
                from: process.env.EMAIL_USER || 'your-email@gmail.com',
                to: 'varunparihar994@gmail.com',
                subject: `Daily Punch Report - ${this.punchData.date}`,
                html: emailContent
            };
            
            await transporter.sendMail(mailOptions);
            this.logger.success('✓ Daily report email sent successfully to varunparihar994@gmail.com');
            
        } catch (error) {
            this.logger.error('Failed to send daily report email:', error);
            throw error;
        }
    }

    async sendErrorEmail(errorMessage) {
        try {
            this.logger.info('Sending error email...');
            
            const transporter = nodemailer.createTransporter({
                service: 'gmail',
                auth: {
                    user: process.env.EMAIL_USER || 'your-email@gmail.com',
                    pass: process.env.EMAIL_PASS || 'your-app-password'
                }
            });
            
            const emailContent = `
            <h2>AutoPunch Error Report - ${moment().tz('Asia/Kolkata').format('YYYY-MM-DD HH:mm:ss')}</h2>
            <p><strong>Error Message:</strong> ${errorMessage}</p>
            <p><strong>Time:</strong> ${moment().tz('Asia/Kolkata').format('YYYY-MM-DD HH:mm:ss')} IST</p>
            <p><em>Please check the AutoPunch system and resolve the issue.</em></p>
            `;
            
            const mailOptions = {
                from: process.env.EMAIL_USER || 'your-email@gmail.com',
                to: 'varunparihar994@gmail.com',
                subject: `AutoPunch Error - ${moment().tz('Asia/Kolkata').format('YYYY-MM-DD')}`,
                html: emailContent
            };
            
            await transporter.sendMail(mailOptions);
            this.logger.success('✓ Error email sent successfully');
            
        } catch (error) {
            this.logger.error('Failed to send error email:', error);
        }
    }

    // Manual trigger methods for testing
    async testPunchIn() {
        this.logger.info('Manual Punch In test triggered...');
        await this.performPunchIn();
    }

    async testPunchOut() {
        this.logger.info('Manual Punch Out test triggered...');
        await this.performPunchOut();
    }
}

// Export the scheduler
module.exports = AutoPunchScheduler;

// If running this file directly, start the scheduler
if (require.main === module) {
    const scheduler = new AutoPunchScheduler();
    scheduler.initialize().then(() => {
        console.log('AutoPunch Scheduler is running...');
        console.log('Press Ctrl+C to stop');
    }).catch(error => {
        console.error('Failed to start scheduler:', error);
        process.exit(1);
    });
}
