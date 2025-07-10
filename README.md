# AutoPunch Web Crawler

A powerful automated web crawler that performs login, button clicking, and generates PDF reports. Runs on a daily schedule and is deployable to Netlify.

## Features

- ✅ Automated browser login with credentials
- ✅ Automated button clicking
- ✅ PDF report generation with execution details
- ✅ Daily scheduling at 10:00 AM
- ✅ Screenshot capture for verification
- ✅ Comprehensive logging system
- ✅ Web API for manual execution
- ✅ Netlify deployment ready
- ✅ Error handling and retry logic

## Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Configuration

Copy the example environment file and configure it:

```bash
copy .env.example .env
```

Edit `.env` with your website details:

```env
# Website Configuration
TARGET_URL=https://your-website.com/login
LOGIN_USERNAME=your_username
LOGIN_PASSWORD=your_password

# CSS Selectors for your website
USERNAME_SELECTOR=#username
PASSWORD_SELECTOR=#password
LOGIN_BUTTON_SELECTOR=#login-button
PUNCH_BUTTON_SELECTOR=#punch-button

# Scheduling (10 AM daily)
CRON_SCHEDULE=0 10 * * *
TIMEZONE=Asia/Kolkata
```

### 3. Run Locally

```bash
# Run once for testing
npm start

# Run with web server
npm run dev
```

### 4. Deploy to Netlify

1. Connect your repository to Netlify
2. Set environment variables in Netlify dashboard
3. Deploy!

## Configuration Guide

### Website Selectors

You need to inspect your target website and find the CSS selectors for:

- **Username field**: Usually `#username`, `#email`, or `input[name="username"]`
- **Password field**: Usually `#password` or `input[name="password"]`
- **Login button**: Usually `#login`, `button[type="submit"]`, or `.login-btn`
- **Punch button**: The button you want to click after login

### Finding CSS Selectors

1. Open your target website in Chrome
2. Right-click on the element you want to select
3. Choose "Inspect" or "Inspect Element"
4. Right-click on the highlighted HTML
5. Choose "Copy" > "Copy selector"

### Scheduling

The `CRON_SCHEDULE` uses cron syntax:
- `0 10 * * *` = 10:00 AM daily
- `0 9 * * 1-5` = 9:00 AM weekdays only
- `0 */2 * * *` = Every 2 hours

## Project Structure

```
autopunch/
├── src/
│   ├── index.js              # Main application
│   ├── server.js             # Web API server
│   ├── config/
│   │   └── config.js         # Configuration management
│   ├── crawler/
│   │   └── webCrawler.js     # Selenium web crawler
│   ├── scheduler/
│   │   └── scheduler.js      # Cron job scheduler
│   └── utils/
│       ├── logger.js         # Logging utility
│       └── pdfGenerator.js   # PDF report generator
├── functions/                # Netlify Functions
│   ├── api.js               # Main API handler
│   └── scheduler.js         # Scheduled function
├── dist/
│   └── index.html           # Web dashboard
├── reports/                 # Generated PDF reports
├── logs/                    # Application logs
└── screenshots/             # Captured screenshots
```

## API Endpoints

When running the web server:

- `GET /` - Dashboard
- `GET /health` - Health check
- `POST /api/run` - Manual execution
- `GET /api/logs` - View recent logs
- `GET /api/schedule` - View scheduled tasks

## Netlify Deployment

### Environment Variables

Set these in your Netlify dashboard:

```
TARGET_URL=https://your-website.com/login
LOGIN_USERNAME=your_username
LOGIN_PASSWORD=your_password
USERNAME_SELECTOR=#username
PASSWORD_SELECTOR=#password
LOGIN_BUTTON_SELECTOR=#login-button
PUNCH_BUTTON_SELECTOR=#punch-button
BROWSER_HEADLESS=true
CRON_SCHEDULE=0 10 * * *
TIMEZONE=Asia/Kolkata
```

### Scheduled Functions

Netlify doesn't support cron jobs directly. You have two options:

1. **GitHub Actions** (Recommended):
   - Create `.github/workflows/schedule.yml`
   - Use GitHub Actions to trigger your Netlify function

2. **External Cron Service**:
   - Use services like cron-job.org
   - Set up a webhook to your Netlify function

## Security Notes

- Store credentials securely in environment variables
- Use HTTPS URLs only
- Consider using encrypted credential storage
- Review website terms of service before automating

## Troubleshooting

### Common Issues

1. **Selectors not found**: Inspect the website and update CSS selectors
2. **Login failed**: Check credentials and selectors
3. **Timeout errors**: Increase `BROWSER_TIMEOUT` value
4. **Chrome driver issues**: Update Chrome and chromedriver

### Debug Mode

Set `BROWSER_HEADLESS=false` to see the browser in action.

### Logs

Check the logs directory for detailed execution logs:

```bash
# View recent logs
npm run logs

# Or check the files directly
type logs\autopunch.log
```

## License

MIT License - see LICENSE file for details.

## Support

If you encounter any issues:

1. Check the logs for detailed error messages
2. Verify your website selectors are correct
3. Test with `BROWSER_HEADLESS=false` to see what's happening
4. Ensure your website allows automated access

---

**Note**: This tool is for educational purposes. Always respect website terms of service and rate limits.
