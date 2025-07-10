const WebCrawler = require('./src/crawler/webCrawler');
const Logger = require('./src/utils/logger');
const nodemailer = require('nodemailer');
const moment = require('moment-timezone');
const fs = require('fs');
const path = require('path');

async function testFullPunchCycle() {
    const logger = new Logger();
    const crawler = new WebCrawler();
    
    // Track punch times
    let punchInTime = null;
    let punchOutTime = null;
    let punchLog = [];
    
    try {
        logger.info('Starting Full AutoPunch Cycle Test...');
        
        // PART 1: PUNCH IN
        logger.info('=== PART 1: PUNCH IN ===');
        
        // Test 1: Browser initialization
        logger.info('Test 1: Initializing browser...');
        await crawler.initialize();
        logger.success('✓ Browser initialized successfully');
        
        // Test 2: Navigation
        logger.info('Test 2: Testing navigation...');
        await crawler.navigateToUrl('https://telesyssoftware.securtime.adp.com/login?redirectUrl=%2Fdashboard');
        logger.success('✓ Navigation successful');
        
        // Wait for page to load properly
        logger.info('Waiting for page to load...');
        await crawler.driver.sleep(5000);
        
        // Test 3: Login functionality
        logger.info('Test 3: Testing login...');
        
        // First, let's find the correct selectors by taking a screenshot
        const beforeLoginScreenshot = await crawler.takeScreenshot();
        logger.info(`Screenshot before login: ${beforeLoginScreenshot}`);
        
        // Try different common selectors for email/username field
        const possibleEmailSelectors = [
            'input[type="email"]',
            'input[name="username"]',
            'input[name="email"]',
            'input[id*="email"]',
            'input[id*="username"]',
            'input[placeholder*="email"]',
            'input[placeholder*="username"]',
            'input[aria-label*="email"]',
            'input[aria-label*="username"]'
        ];
        
        let emailField = null;
        for (const selector of possibleEmailSelectors) {
            try {
                emailField = await crawler.driver.findElement(crawler.By.css(selector));
                logger.info(`Found email field with selector: ${selector}`);
                break;
            } catch (e) {
                // Try next selector
            }
        }
        
        if (emailField) {
            await emailField.clear();
            await emailField.sendKeys('varun.singh@telesys.com');
            logger.success('✓ Email entered successfully');
        } else {
            logger.error('Could not find email field');
        }
        
        // Try different common selectors for password field
        const possiblePasswordSelectors = [
            'input[type="password"]',
            'input[name="password"]',
            'input[id*="password"]',
            'input[placeholder*="password"]',
            'input[aria-label*="password"]'
        ];
        
        let passwordField = null;
        for (const selector of possiblePasswordSelectors) {
            try {
                passwordField = await crawler.driver.findElement(crawler.By.css(selector));
                logger.info(`Found password field with selector: ${selector}`);
                break;
            } catch (e) {
                // Try next selector
            }
        }
        
        if (passwordField) {
            await passwordField.clear();
            await passwordField.sendKeys('King@123');
            logger.success('✓ Password entered successfully');
        } else {
            logger.error('Could not find password field');
        }
        
        // Try different common selectors for login button
        const possibleLoginSelectors = [
            'button[type="submit"]',
            'input[type="submit"]',
            'button[id*="login"]',
            'button[id*="signin"]',
            'button[class*="login"]',
            'button[class*="signin"]',
            'button[class*="submit"]',
            'input[value*="Sign"]',
            'input[value*="Login"]'
        ];
        
        let loginButton = null;
        for (const selector of possibleLoginSelectors) {
            try {
                loginButton = await crawler.driver.findElement(crawler.By.css(selector));
                logger.info(`Found login button with selector: ${selector}`);
                break;
            } catch (e) {
                // Try next selector
            }
        }
        
        if (loginButton) {
            await loginButton.click();
            logger.success('✓ Login button clicked');
            
            // Wait for login to process and page to load
            logger.info('Waiting for login to process...');
            await crawler.driver.sleep(8000);
            
            // Take screenshot after login
            const afterLoginScreenshot = await crawler.takeScreenshot();
            logger.info(`Screenshot after login: ${afterLoginScreenshot}`);
            
            // Test 4: Find and click Punch In button
            logger.info('Test 4: Looking for Punch In button...');
            
            // Use XPath to find the specific Punch In button by its text content
            const punchInXPath = "//button[contains(text(), 'Punch In') and contains(@class, 'mybtn')]";
            
            let punchInButton = null;
            try {
                punchInButton = await crawler.driver.findElement(crawler.By.xpath(punchInXPath));
                logger.info(`Found Punch In button with XPath: ${punchInXPath}`);
            } catch (e) {
                logger.error('Could not find Punch In button with XPath');
                
                // Fallback: Try to find all mybtn buttons and select the first one (left side)
                try {
                    const allPunchButtons = await crawler.driver.findElements(crawler.By.css('button.mybtn'));
                    if (allPunchButtons.length >= 1) {
                        punchInButton = allPunchButtons[0]; // First button should be Punch In (left side)
                        logger.info('Found Punch In button as first mybtn button');
                    }
                } catch (fallbackError) {
                    logger.error('Fallback method also failed');
                }
            }
            
            if (punchInButton) {
                // Scroll to the button to make sure it's visible
                await crawler.driver.executeScript("arguments[0].scrollIntoView(true);", punchInButton);
                await crawler.driver.sleep(2000);
                
                // Take screenshot before clicking
                const beforePunchScreenshot = await crawler.takeScreenshot();
                logger.info(`Screenshot before punch: ${beforePunchScreenshot}`);
                
                // Click the Punch In button
                await punchInButton.click();
                logger.success('✓ Punch In button clicked successfully');
                
                // Wait for punch action to complete
                await crawler.driver.sleep(3000);
                
                // Record punch in time
                punchInTime = moment().tz('Asia/Kolkata').format('YYYY-MM-DD HH:mm:ss');
                
                // Take screenshot after punch
                const afterPunchScreenshot = await crawler.takeScreenshot();
                logger.info(`Screenshot after punch: ${afterPunchScreenshot}`);
                
                punchLog.push(`Punch In Time: ${punchInTime} - User: varun.singh@telesys.com`);
                logger.success(`✓ Punch In completed at: ${punchInTime}`);
                
            } else {
                logger.error('Could not find Punch In button');
                throw new Error('Punch In button not found');
            }
        } else {
            logger.error('Could not find login button');
            throw new Error('Login button not found');
        }
        
        // Close browser after punch in
        await crawler.close();
        logger.info('Browser closed after Punch In');
        
        // PART 2: PUNCH OUT (Simulating later in the day)
        logger.info('=== PART 2: PUNCH OUT ===');
        logger.info('Waiting 10 seconds to simulate time gap...');
        await new Promise(resolve => setTimeout(resolve, 10000));
        
        // Reinitialize browser for punch out
        await crawler.initialize();
        logger.info('Browser reinitialized for Punch Out');
        
        // Navigate again
        await crawler.navigateToUrl('https://telesyssoftware.securtime.adp.com/login?redirectUrl=%2Fdashboard');
        await crawler.driver.sleep(5000);
        
        // Login again for punch out
        logger.info('Logging in for Punch Out...');
        
        // Find email field
        emailField = null;
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
        }
        
        // Find password field
        passwordField = null;
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
        }
        
        // Find login button
        loginButton = null;
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
            await crawler.driver.sleep(8000);
            
            // Look for Punch Out button
            logger.info('Looking for Punch Out button...');
            
            // Use XPath to find the specific Punch Out button by its text content
            const punchOutXPath = "//button[contains(text(), 'Punch Out') and contains(@class, 'mybtn')]";
            
            let punchOutButton = null;
            try {
                punchOutButton = await crawler.driver.findElement(crawler.By.xpath(punchOutXPath));
                logger.info(`Found Punch Out button with XPath: ${punchOutXPath}`);
            } catch (e) {
                logger.error('Could not find Punch Out button with XPath');
                
                // Fallback: Try to find all mybtn buttons and select the second one (right side)
                try {
                    const allPunchButtons = await crawler.driver.findElements(crawler.By.css('button.mybtn'));
                    if (allPunchButtons.length >= 2) {
                        punchOutButton = allPunchButtons[1]; // Second button should be Punch Out (right side)
                        logger.info('Found Punch Out button as second mybtn button');
                    }
                } catch (fallbackError) {
                    logger.error('Fallback method also failed');
                }
            }
            
            if (punchOutButton) {
                // Scroll to the button to make sure it's visible
                await crawler.driver.executeScript("arguments[0].scrollIntoView(true);", punchOutButton);
                await crawler.driver.sleep(2000);
                
                // Click the Punch Out button
                await punchOutButton.click();
                logger.success('✓ Punch Out button clicked successfully');
                
                // Wait for punch action to complete
                await crawler.driver.sleep(3000);
                
                // Record punch out time
                punchOutTime = moment().tz('Asia/Kolkata').format('YYYY-MM-DD HH:mm:ss');
                
                punchLog.push(`Punch Out Time: ${punchOutTime} - User: varun.singh@telesys.com`);
                logger.success(`✓ Punch Out completed at: ${punchOutTime}`);
                
                // Take final screenshot
                const finalScreenshot = await crawler.takeScreenshot();
                logger.info(`Final screenshot: ${finalScreenshot}`);
                
            } else {
                logger.error('Could not find Punch Out button');
                throw new Error('Punch Out button not found');
            }
        }
        
        // Close browser
        await crawler.close();
        logger.info('Browser closed after Punch Out');
        
        // Write complete log to file
        const logContent = punchLog.join('\n') + '\n';
        const punchLogPath = path.join(__dirname, 'daily_punch_log.txt');
        fs.writeFileSync(punchLogPath, logContent);
        logger.success(`✓ Complete punch log written to: ${punchLogPath}`);
        
        // Send email report
        await sendEmailReport(punchInTime, punchOutTime, punchLog);
        
        logger.success('✓ Full AutoPunch cycle completed successfully!');
        
    } catch (error) {
        logger.error('Test failed:', error);
        
        // Ensure browser is closed
        try {
            await crawler.close();
        } catch (closeError) {
            logger.error('Error closing browser:', closeError);
        }
        
        // Send error email
        await sendErrorEmail(error.message);
        
        throw error;
    }
}

async function sendEmailReport(punchInTime, punchOutTime, punchLog) {
    try {
        const logger = new Logger();
        logger.info('Sending email report...');
        
        // For testing, let's just log the email content instead of actually sending
        // You can uncomment the actual email sending code after testing
        
        // Calculate working hours
        const punchInMoment = moment.tz(punchInTime, 'YYYY-MM-DD HH:mm:ss', 'Asia/Kolkata');
        const punchOutMoment = moment.tz(punchOutTime, 'YYYY-MM-DD HH:mm:ss', 'Asia/Kolkata');
        const duration = moment.duration(punchOutMoment.diff(punchInMoment));
        const hours = Math.floor(duration.asHours());
        const minutes = duration.minutes();
        
        const emailContent = `
        Daily Punch Report - ${moment().tz('Asia/Kolkata').format('YYYY-MM-DD')}
        
        Employee: varun.singh@telesys.com
        Punch In Time: ${punchInTime} IST
        Punch Out Time: ${punchOutTime} IST
        Total Working Hours: ${hours} hours ${minutes} minutes
        
        Punch Log:
        ${punchLog.join('\n')}
        
        This report was generated automatically by AutoPunch System.
        `;
        
        // Save email content to file for now
        const emailPath = path.join(__dirname, 'email_report.txt');
        fs.writeFileSync(emailPath, emailContent);
        logger.success(`✓ Email report saved to: ${emailPath}`);
        
        // TODO: Uncomment below to actually send email
        /*
        const transporter = nodemailer.createTransporter({
            service: 'gmail',
            auth: {
                user: 'your-email@gmail.com', // Replace with your email
                pass: 'your-app-password' // Replace with your app password
            }
        });
        
        const mailOptions = {
            from: 'your-email@gmail.com',
            to: 'varunparihar994@gmail.com',
            subject: `Daily Punch Report - ${moment().tz('Asia/Kolkata').format('YYYY-MM-DD')}`,
            text: emailContent
        };
        
        await transporter.sendMail(mailOptions);
        logger.success('✓ Email report sent successfully to varunparihar994@gmail.com');
        */
        
    } catch (error) {
        const logger = new Logger();
        logger.error('Failed to send email report:', error);
        throw error;
    }
}

async function sendErrorEmail(errorMessage) {
    try {
        const logger = new Logger();
        logger.info('Sending error email...');
        
        const errorContent = `
        AutoPunch Error Report - ${moment().tz('Asia/Kolkata').format('YYYY-MM-DD HH:mm:ss')}
        
        Error Message: ${errorMessage}
        
        Please check the AutoPunch system and try again.
        `;
        
        // Save error content to file for now
        const errorPath = path.join(__dirname, 'error_report.txt');
        fs.writeFileSync(errorPath, errorContent);
        logger.success(`✓ Error report saved to: ${errorPath}`);
        
        // TODO: Uncomment below to actually send email
        /*
        const transporter = nodemailer.createTransporter({
            service: 'gmail',
            auth: {
                user: 'your-email@gmail.com', // Replace with your email
                pass: 'your-app-password' // Replace with your app password
            }
        });
        
        const mailOptions = {
            from: 'your-email@gmail.com',
            to: 'varunparihar994@gmail.com',
            subject: `AutoPunch Error - ${moment().tz('Asia/Kolkata').format('YYYY-MM-DD')}`,
            text: errorContent
        };
        
        await transporter.sendMail(mailOptions);
        logger.success('✓ Error email sent successfully');
        */
        
    } catch (error) {
        const logger = new Logger();
        logger.error('Failed to send error email:', error);
    }
}

// Run the test
testFullPunchCycle();
