#!/bin/bash
# AutoPunch GitHub Deploy Script

echo "🚀 AutoPunch GitHub Deployment"
echo "=============================="

# Step 1: Check if repository exists
if [ ! -d ".git" ]; then
    echo "❌ No git repository found. Initializing..."
    git init
    git add .
    git commit -m "Initial commit: AutoPunch Live - Netlify ready"
fi

echo ""
echo "📋 Next Steps:"
echo ""
echo "1. Create a new repository on GitHub:"
echo "   https://github.com/new"
echo ""
echo "2. Run these commands:"
echo "   git remote add origin https://github.com/YOUR_USERNAME/autopunch-live.git"
echo "   git branch -M main"
echo "   git push -u origin main"
echo ""
echo "3. Go to Netlify.com and connect your repository"
echo ""
echo "4. Set build settings:"
echo "   Build command: npm run build"
echo "   Publish directory: dist"
echo ""
echo "5. Add environment variables in Netlify:"
echo "   TARGET_URL, LOGIN_USERNAME, LOGIN_PASSWORD, etc."
echo ""
echo "6. Set up cron jobs at cron-job.org:"
echo "   10 AM IST: 30 4 * * * → https://your-site.netlify.app/.netlify/functions/punch-scheduler"
echo "   6 PM IST:  30 12 * * * → https://your-site.netlify.app/.netlify/functions/punch-scheduler"
echo ""
echo "✅ Your AutoPunch system will be live!"
