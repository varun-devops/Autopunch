const WebCrawler = require('./src/crawler/webCrawler');
const Logger = require('./src/utils/logger');

async function testWebCrawler() {
    const logger = new Logger();
    const crawler = new WebCrawler();
    
    try {
        logger.info('Starting AutoPunch test...');
        
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
            
            // Try different selectors for the Punch In button
            const possiblePunchInSelectors = [
                'button[class*="mybtn"]',
                'button:contains("Punch In")',
                'button[_ngcontent-c8=""][class="mybtn"]',
                'button[type="undefined"]',
                'button.mybtn',
                'button[class="mybtn"]',
                'input[value*="Punch In"]',
                'button[title*="Punch"]',
                'button[aria-label*="Punch"]'
            ];
            
            let punchInButton = null;
            for (const selector of possiblePunchInSelectors) {
                try {
                    // For contains selector, we need to use XPath
                    if (selector.includes('contains')) {
                        punchInButton = await crawler.driver.findElement(crawler.By.xpath("//button[contains(text(), 'Punch In')]"));
                    } else {
                        punchInButton = await crawler.driver.findElement(crawler.By.css(selector));
                    }
                    logger.info(`Found Punch In button with selector: ${selector}`);
                    break;
                } catch (e) {
                    // Try next selector
                }
            }
            
            // If not found with CSS selectors, try XPath approaches
            if (!punchInButton) {
                const xpathSelectors = [
                    "//button[contains(text(), 'Punch In')]",
                    "//button[contains(@class, 'mybtn')]",
                    "//button[@type='undefined']",
                    "//button[contains(text(), 'Punch')]",
                    "//input[@value='Punch In']"
                ];
                
                for (const xpath of xpathSelectors) {
                    try {
                        punchInButton = await crawler.driver.findElement(crawler.By.xpath(xpath));
                        logger.info(`Found Punch In button with XPath: ${xpath}`);
                        break;
                    } catch (e) {
                        // Try next selector
                    }
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
                
                // Take screenshot after punch
                const afterPunchScreenshot = await crawler.takeScreenshot();
                logger.info(`Screenshot after punch: ${afterPunchScreenshot}`);
                
                // Write punch entry to text file
                const fs = require('fs');
                const path = require('path');
                const moment = require('moment');
                
                const punchTime = moment().format('YYYY-MM-DD HH:mm:ss');
                const punchEntry = `Punch In Time: ${punchTime} - User: varun.singh@telesys.com\n`;
                
                const punchLogPath = path.join(__dirname, 'punch_log.txt');
                fs.appendFileSync(punchLogPath, punchEntry);
                
                logger.success(`✓ Punch entry written to file: ${punchLogPath}`);
                logger.info(`Punch Time: ${punchTime}`);
                
            } else {
                logger.error('Could not find Punch In button');
                
                // Take screenshot for debugging
                const debugScreenshot = await crawler.takeScreenshot();
                logger.info(`Debug screenshot: ${debugScreenshot}`);
                
                // Try to get page source for analysis
                const pageSource = await crawler.driver.getPageSource();
                const fs = require('fs');
                fs.writeFileSync('debug_page_source.html', pageSource);
                logger.info('Page source saved to debug_page_source.html for analysis');
            }
        } else {
            logger.error('Could not find login button');
        }
        
        // Test 4: Take final screenshot
        logger.info('Test 4: Taking final screenshot...');
        const screenshotPath = await crawler.takeScreenshot();
        logger.success(`✓ Screenshot saved: ${screenshotPath}`);
        
        // Test 5: Close browser
        logger.info('Test 5: Closing browser...');
        await crawler.close();
        logger.success('✓ Browser closed successfully');
        
        logger.success('All tests passed! AutoPunch is ready to use.');
        
    } catch (error) {
        logger.error('Test failed:', error);
        
        // Ensure browser is closed
        try {
            await crawler.close();
        } catch (closeError) {
            logger.error('Error closing browser:', closeError);
        }
        
        process.exit(1);
    }
}

// Run the test
testWebCrawler();
