# AutoPunch Live - Netlify Deployment

Automated attendance system with 10am and 6pm daily execution in India time (IST). No email reports - all logs saved locally in the `/logs` directory.

## 🚀 Features

- ✅ Automated punch in/out at 10 AM and 6 PM IST daily
- ✅ Live dashboard with real-time status
- ✅ Manual trigger capabilities
- ✅ Logs saved to `/logs` directory (no email)
- ✅ No screenshot saving (optimized for serverless)
- ✅ India timezone support
- ✅ Serverless deployment on Netlify

## 🔧 Setup for Netlify Deployment

### 1. Environment Variables
Set these in your Netlify dashboard under Site Settings > Environment Variables:

```bash
TARGET_URL=your_target_website_url
LOGIN_USERNAME=your_username
LOGIN_PASSWORD=your_password
USERNAME_SELECTOR=css_selector_for_username_field
PASSWORD_SELECTOR=css_selector_for_password_field
LOGIN_BUTTON_SELECTOR=css_selector_for_login_button
PUNCH_BUTTON_SELECTOR=css_selector_for_punch_button
NODE_ENV=production
BROWSER_HEADLESS=true
BROWSER_TIMEOUT=60000
```

### 2. Deploy to Netlify

#### Option A: GitHub Integration
1. Push this code to your GitHub repository
2. Connect the repository to Netlify
3. Set build command: `npm run build`
4. Set publish directory: `dist`
5. Deploy!

#### Option B: Netlify CLI
```bash
# Install Netlify CLI
npm install -g netlify-cli

# Login to Netlify
netlify login

# Deploy
netlify deploy --prod
```

### 3. Schedule Setup (Important!)

Since Netlify Functions don't support reliable cron scheduling, you need to set up external triggers:

#### Use cron-job.org (Recommended):

1. Go to [cron-job.org](https://cron-job.org)
2. Create account and add these cron jobs:

**For 10 AM IST (4:30 AM UTC):**
- URL: `https://your-netlify-site.netlify.app/.netlify/functions/punch-scheduler`
- Schedule: `30 4 * * *` (4:30 AM UTC = 10:00 AM IST)
- Method: GET

**For 6 PM IST (12:30 PM UTC):**
- URL: `https://your-netlify-site.netlify.app/.netlify/functions/punch-scheduler`
- Schedule: `30 12 * * *` (12:30 PM UTC = 6:00 PM IST)
- Method: GET

## 📊 Available Endpoints

### Live Dashboard
- **URL**: `https://your-site.netlify.app/`
- **Description**: Real-time dashboard with status and controls

### API Endpoints

#### Manual Trigger
- **URL**: `/.netlify/functions/manual-trigger`
- **Method**: POST
- **Body**: `{"type": "punch-in"}` or `{"type": "punch-out"}`

#### Status Check
- **URL**: `/.netlify/functions/status`
- **Method**: GET
- **Returns**: Today's logs and recent history

#### Scheduled Function
- **URL**: `/.netlify/functions/punch-scheduler`
- **Method**: GET
- **Description**: Main scheduler function (called by external cron)

## 📋 Log Structure

### Daily Reports
Location: `/logs/autopunch-report-YYYY-MM-DD.json`

```json
[
  {
    "timestamp": "2025-07-11 10:00:15",
    "success": true,
    "duration": 15420,
    "steps": [...],
    "error": null
  }
]
```

### History Log
Location: `/logs/autopunch-history.log`

```
2025-07-11 10:00:15 - SUCCESS - Duration: 15420ms
2025-07-11 18:00:22 - SUCCESS - Duration: 12340ms
```

## 🔍 Monitoring & Debugging

### Dashboard Features
- Real-time IST time display
- Today's execution count and success rate
- Manual trigger buttons
- Status indicators

### Manual Testing
```bash
# Test manual trigger
curl -X POST https://your-site.netlify.app/.netlify/functions/manual-trigger \
  -H "Content-Type: application/json" \
  -d '{"type": "test"}'

# Check status
curl https://your-site.netlify.app/.netlify/functions/status
```

## 🚨 Important Notes

1. **No Email**: All reports are saved to logs, no email functionality
2. **No Screenshots**: Disabled for performance and storage optimization
3. **External Scheduling**: Use cron-job.org for reliable 10am/6pm execution
4. **India Time**: All operations in Asia/Kolkata timezone
5. **Serverless Limitations**: Functions have 10-second timeout on free tier

## 🛠️ Local Development

```bash
# Install dependencies
npm install

# Run locally
npm run dev

# Test functions locally
netlify dev
```

## 📝 Deployment Checklist

- [ ] Environment variables set in Netlify
- [ ] Repository connected to Netlify
- [ ] Build command: `npm run build`
- [ ] Publish directory: `dist`
- [ ] External cron jobs set up for 10am and 6pm IST
- [ ] Test manual triggers work
- [ ] Verify logs are being saved
- [ ] Dashboard loads correctly

## 🔧 Troubleshooting

### Common Issues

1. **Function timeout**: Increase BROWSER_TIMEOUT env var
2. **Scheduling not working**: Verify external cron service setup
3. **Dashboard not loading**: Check build process and redirects
4. **Logs not saving**: Check file permissions and Netlify Functions logs

### Debug URLs
- Netlify Function logs: Netlify Dashboard > Functions > View logs
- Site logs: Netlify Dashboard > Site > Functions tab
- Status endpoint: `your-site.netlify.app/.netlify/functions/status`

## 📚 Tech Stack

- **Backend**: Node.js + Express
- **Browser Automation**: Selenium WebDriver
- **Deployment**: Netlify Functions
- **Frontend**: Vanilla HTML/CSS/JS
- **Scheduling**: External cron service
- **Time Zone**: moment-timezone (Asia/Kolkata)

---

**Ready for live deployment! 🚀**
