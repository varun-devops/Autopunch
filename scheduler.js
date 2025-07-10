const WebCrawler = require('./src/crawler/webCrawler');
const Logger = require('./src/utils/logger');
const EmailService = require('./src/utils/emailService');
const cron = require('node-cron');
const moment = require('moment-timezone');
const fs = require('fs');
const path = require('path');

class AutoPunchScheduler {
    constructor() {
        this.logger = new Logger();
        this.emailService = new EmailService();
        this.dailyLog = [];
        this.punchInTime = null;
        this.punchOutTime = null;
    }

    async initialize() {
        this.logger.info('Initializing AutoPunch Scheduler...');
        
        // Schedule Punch In at 10:00 AM IST (4:30 AM UTC)
        cron.schedule('0 10 * * *', async () => {
            await this.performPunchIn();
        }, {
            timezone: 'Asia/Kolkata'
        });

        // Schedule Punch Out at 6:00 PM IST (12:30 PM UTC)
        cron.schedule('0 18 * * *', async () => {
            await this.performPunchOut();
        }, {
            timezone: 'Asia/Kolkata'
        });

        this.logger.success('✓ AutoPunch Scheduler initialized successfully!');
        this.logger.info('Scheduled tasks:');
        this.logger.info('- Punch In: Daily at 10:00 AM IST');
        this.logger.info('- Punch Out: Daily at 6:00 PM IST');
        
        // Keep the process running
        this.logger.info('Scheduler is running... Press Ctrl+C to stop.');
    }

    async performPunchIn() {
        try {
            this.logger.info('=== SCHEDULED PUNCH IN ===');
            this.logger.info(`Starting punch in at ${moment().tz('Asia/Kolkata').format('YYYY-MM-DD HH:mm:ss')} IST`);
            
            const result = await this.executePunchAction('punch_in');
            
            if (result.success) {
                this.punchInTime = result.timestamp;
                this.dailyLog.push(`Punch In Time: ${this.punchInTime} - User: varun.singh@telesys.com`);
                this.logger.success(`✓ Punch In completed successfully at ${this.punchInTime}`);
            } else {
                throw new Error(result.error);
            }
            
        } catch (error) {
            this.logger.error('Punch In failed:', error);
            await this.emailService.sendErrorEmail(`Punch In failed: ${error.message}`);
        }
    }

    async performPunchOut() {
        try {
            this.logger.info('=== SCHEDULED PUNCH OUT ===');
            this.logger.info(`Starting punch out at ${moment().tz('Asia/Kolkata').format('YYYY-MM-DD HH:mm:ss')} IST`);
            
            const result = await this.executePunchAction('punch_out');
            
            if (result.success) {
                this.punchOutTime = result.timestamp;
                this.dailyLog.push(`Punch Out Time: ${this.punchOutTime} - User: varun.singh@telesys.com`);
                this.logger.success(`✓ Punch Out completed successfully at ${this.punchOutTime}`);
                
                // Send daily report email
                await this.sendDailyReport();
                
                // Reset for next day
                this.resetDailyData();
                
            } else {
                throw new Error(result.error);
            }
            
        } catch (error) {
            this.logger.error('Punch Out failed:', error);
            await this.emailService.sendErrorEmail(`Punch Out failed: ${error.message}`);
        }
    }

    async executePunchAction(action) {
        const crawler = new WebCrawler();
        
        try {
            // Initialize browser
            await crawler.initialize();
            this.logger.info('Browser initialized');
            
            // Navigate to login page
            await crawler.navigateToUrl('https://telesyssoftware.securtime.adp.com/login?redirectUrl=%2Fdashboard');
            await crawler.driver.sleep(5000);
            this.logger.info('Navigated to login page');
            
            // Perform login
            await this.performLogin(crawler);
            this.logger.info('Login completed');
            
            // Perform punch action
            const timestamp = await this.performPunchAction(crawler, action);
            
            // Take screenshot
            const screenshotPath = await crawler.takeScreenshot();
            this.logger.info(`Screenshot saved: ${screenshotPath}`);
            
            // Close browser
            await crawler.close();
            this.logger.info('Browser closed');
            
            return {
                success: true,
                timestamp: timestamp,
                screenshot: screenshotPath
            };
            
        } catch (error) {
            this.logger.error(`${action} execution failed:`, error);
            
            // Ensure browser is closed
            try {
                await crawler.close();
            } catch (closeError) {
                this.logger.error('Error closing browser:', closeError);
            }
            
            return {
                success: false,
                error: error.message
            };
        }
    }

    async performLogin(crawler) {
        // Find and fill email field
        const emailField = await crawler.driver.findElement(crawler.By.css('input[type="email"]'));
        await emailField.clear();
        await emailField.sendKeys('varun.singh@telesys.com');
        
        // Find and fill password field
        const passwordField = await crawler.driver.findElement(crawler.By.css('input[type="password"]'));
        await passwordField.clear();
        await passwordField.sendKeys('King@123');
        
        // Click login button
        const loginButton = await crawler.driver.findElement(crawler.By.css('button[type="submit"]'));
        await loginButton.click();
        
        // Wait for login to complete
        await crawler.driver.sleep(8000);
    }

    async performPunchAction(crawler, action) {
        const timestamp = moment().tz('Asia/Kolkata').format('YYYY-MM-DD HH:mm:ss');
        
        let xpath, buttonText;
        if (action === 'punch_in') {
            xpath = "//button[contains(text(), 'Punch In') and contains(@class, 'mybtn')]";
            buttonText = 'Punch In';
        } else {
            xpath = "//button[contains(text(), 'Punch Out') and contains(@class, 'mybtn')]";
            buttonText = 'Punch Out';
        }
        
        // Find the button
        const button = await crawler.driver.findElement(crawler.By.xpath(xpath));
        this.logger.info(`Found ${buttonText} button`);
        
        // Scroll to button and click
        await crawler.driver.executeScript("arguments[0].scrollIntoView(true);", button);
        await crawler.driver.sleep(2000);
        await button.click();
        
        this.logger.success(`✓ ${buttonText} button clicked successfully`);
        
        // Wait for action to complete
        await crawler.driver.sleep(3000);
        
        return timestamp;
    }

    async sendDailyReport() {
        try {
            if (this.punchInTime && this.punchOutTime) {
                await this.emailService.sendPunchReport(
                    this.punchInTime,
                    this.punchOutTime,
                    this.dailyLog
                );
                
                // Also save to file
                const logContent = this.dailyLog.join('\n') + '\n';
                const logPath = path.join(__dirname, `daily_punch_log_${moment().tz('Asia/Kolkata').format('YYYY-MM-DD')}.txt`);
                fs.writeFileSync(logPath, logContent);
                
                this.logger.success('✓ Daily report sent and saved');
            } else {
                this.logger.warn('Incomplete punch data - report not sent');
            }
        } catch (error) {
            this.logger.error('Failed to send daily report:', error);
        }
    }

    resetDailyData() {
        this.dailyLog = [];
        this.punchInTime = null;
        this.punchOutTime = null;
        this.logger.info('Daily data reset for next day');
    }

    // Manual execution methods for testing
    async testPunchIn() {
        this.logger.info('=== MANUAL PUNCH IN TEST ===');
        await this.performPunchIn();
    }

    async testPunchOut() {
        this.logger.info('=== MANUAL PUNCH OUT TEST ===');
        await this.performPunchOut();
    }

    async testFullCycle() {
        this.logger.info('=== MANUAL FULL CYCLE TEST ===');
        await this.performPunchIn();
        
        // Wait 10 seconds to simulate time gap
        this.logger.info('Waiting 10 seconds before punch out...');
        await new Promise(resolve => setTimeout(resolve, 10000));
        
        await this.performPunchOut();
    }
}

// Main execution
async function main() {
    const scheduler = new AutoPunchScheduler();
    
    try {
        await scheduler.initialize();
        
        // Check command line arguments for testing
        const args = process.argv.slice(2);
        
        if (args.includes('--test-punch-in')) {
            await scheduler.testPunchIn();
        } else if (args.includes('--test-punch-out')) {
            await scheduler.testPunchOut();
        } else if (args.includes('--test-full-cycle')) {
            await scheduler.testFullCycle();
        } else {
            // Normal scheduled operation
            scheduler.logger.info('AutoPunch Scheduler is running...');
            scheduler.logger.info('Use --test-punch-in, --test-punch-out, or --test-full-cycle for manual testing');
        }
        
        // Keep process running
        process.on('SIGINT', () => {
            scheduler.logger.info('Received SIGINT. Shutting down gracefully...');
            process.exit(0);
        });
        
        process.on('SIGTERM', () => {
            scheduler.logger.info('Received SIGTERM. Shutting down gracefully...');
            process.exit(0);
        });
        
    } catch (error) {
        console.error('Failed to start AutoPunch Scheduler:', error);
        process.exit(1);
    }
}

// Run if this is the main module
if (require.main === module) {
    main();
}

module.exports = AutoPunchScheduler;
