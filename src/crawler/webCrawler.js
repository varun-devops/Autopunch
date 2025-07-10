const { Builder, By, until, Key } = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');
const fs = require('fs-extra');
const path = require('path');
const Logger = require('../utils/logger');

class WebCrawler {
    constructor() {
        this.driver = null;
        this.By = By;
        this.until = until;
        this.logger = new Logger();
        this.timeout = parseInt(process.env.BROWSER_TIMEOUT) || 30000;
    }

    async initialize() {
        try {
            this.logger.info('Initializing web crawler...');

            // Configure Chrome options
            const chromeOptions = new chrome.Options();
            
            if (process.env.BROWSER_HEADLESS === 'true') {
                chromeOptions.addArguments('--headless');
            }
            
            chromeOptions.addArguments('--no-sandbox');
            chromeOptions.addArguments('--disable-dev-shm-usage');
            chromeOptions.addArguments('--disable-gpu');
            chromeOptions.addArguments('--window-size=1920,1080');
            chromeOptions.addArguments('--disable-extensions');
            chromeOptions.addArguments('--disable-web-security');
            chromeOptions.addArguments('--allow-running-insecure-content');

            // Build the driver
            this.driver = await new Builder()
                .forBrowser('chrome')
                .setChromeOptions(chromeOptions)
                .build();

            // Set timeouts
            await this.driver.manage().setTimeouts({
                implicit: this.timeout,
                pageLoad: this.timeout,
                script: this.timeout
            });

            this.logger.info('Web crawler initialized successfully');
            
        } catch (error) {
            this.logger.error('Failed to initialize web crawler:', error);
            throw error;
        }
    }

    async navigateToUrl(url) {
        try {
            this.logger.info(`Navigating to: ${url}`);
            await this.driver.get(url);
            
            // Wait for page to load
            await this.driver.wait(until.titleContains(''), this.timeout);
            
            this.logger.info('Navigation completed successfully');
            
        } catch (error) {
            this.logger.error('Failed to navigate to URL:', error);
            throw error;
        }
    }

    async performLogin(username, password, usernameSelector, passwordSelector, loginButtonSelector) {
        try {
            this.logger.info('Starting login process...');

            // Wait for username field and enter username
            const usernameField = await this.driver.wait(
                until.elementLocated(By.css(usernameSelector)),
                this.timeout
            );
            await usernameField.clear();
            await usernameField.sendKeys(username);
            this.logger.info('Username entered');

            // Wait for password field and enter password
            const passwordField = await this.driver.wait(
                until.elementLocated(By.css(passwordSelector)),
                this.timeout
            );
            await passwordField.clear();
            await passwordField.sendKeys(password);
            this.logger.info('Password entered');

            // Click login button
            const loginButton = await this.driver.wait(
                until.elementLocated(By.css(loginButtonSelector)),
                this.timeout
            );
            await loginButton.click();
            this.logger.info('Login button clicked');

            // Wait for login to complete (you might need to adjust this based on your specific website)
            await this.driver.sleep(3000);
            
            this.logger.info('Login process completed');
            
        } catch (error) {
            this.logger.error('Failed to perform login:', error);
            throw error;
        }
    }

    async clickPunchButton(punchButtonSelector) {
        try {
            this.logger.info('Looking for punch button...');

            // Wait for punch button to be available
            const punchButton = await this.driver.wait(
                until.elementLocated(By.css(punchButtonSelector)),
                this.timeout
            );

            // Scroll to button if necessary
            await this.driver.executeScript("arguments[0].scrollIntoView(true);", punchButton);
            await this.driver.sleep(1000);

            // Click the punch button
            await punchButton.click();
            this.logger.info('Punch button clicked successfully');

            // Wait for action to complete
            await this.driver.sleep(2000);
            
        } catch (error) {
            this.logger.error('Failed to click punch button:', error);
            throw error;
        }
    }

    async takeScreenshot() {
        // Screenshots disabled for live deployment to save resources
        this.logger.info('Screenshots disabled for live deployment');
        return null;
    }

    async getCurrentUrl() {
        try {
            return await this.driver.getCurrentUrl();
        } catch (error) {
            this.logger.error('Failed to get current URL:', error);
            throw error;
        }
    }

    async getPageTitle() {
        try {
            return await this.driver.getTitle();
        } catch (error) {
            this.logger.error('Failed to get page title:', error);
            throw error;
        }
    }

    async waitForElement(selector, timeout = this.timeout) {
        try {
            return await this.driver.wait(
                until.elementLocated(By.css(selector)),
                timeout
            );
        } catch (error) {
            this.logger.error(`Failed to find element: ${selector}`, error);
            throw error;
        }
    }

    async isElementPresent(selector) {
        try {
            await this.driver.findElement(By.css(selector));
            return true;
        } catch (error) {
            return false;
        }
    }

    async close() {
        try {
            if (this.driver) {
                await this.driver.quit();
                this.logger.info('Browser closed successfully');
            }
        } catch (error) {
            this.logger.error('Error closing browser:', error);
        }
    }
}

module.exports = WebCrawler;
