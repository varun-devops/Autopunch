#!/usr/bin/env node

const fs = require('fs-extra');
const path = require('path');

console.log('🚀 AutoPunch Deployment Checker\n');

// Check required files
const requiredFiles = [
    'package.json',
    'netlify.toml', 
    'index.html',
    'src/index.js',
    'functions/punch-scheduler.js',
    'functions/manual-trigger.js',
    'functions/status.js'
];

console.log('📋 Checking required files...');
let allFilesExist = true;

for (const file of requiredFiles) {
    const exists = fs.existsSync(path.join(__dirname, file));
    console.log(`${exists ? '✅' : '❌'} ${file}`);
    if (!exists) allFilesExist = false;
}

console.log('\n📦 Required environment variables:');
const requiredEnvVars = [
    'TARGET_URL',
    'LOGIN_USERNAME', 
    'LOGIN_PASSWORD',
    'USERNAME_SELECTOR',
    'PASSWORD_SELECTOR',
    'LOGIN_BUTTON_SELECTOR',
    'PUNCH_BUTTON_SELECTOR'
];

for (const envVar of requiredEnvVars) {
    console.log(`🔑 ${envVar}`);
}

console.log('\n🌐 External Scheduling Required:');
console.log('Set up these cron jobs at https://cron-job.org:');
console.log('');
console.log('📅 10:00 AM IST (4:30 AM UTC):');
console.log('   URL: https://your-site.netlify.app/.netlify/functions/punch-scheduler');
console.log('   Schedule: 30 4 * * *');
console.log('');
console.log('📅 6:00 PM IST (12:30 PM UTC):');
console.log('   URL: https://your-site.netlify.app/.netlify/functions/punch-scheduler');
console.log('   Schedule: 30 12 * * *');

console.log('\n🔧 Deployment Steps:');
console.log('1. Set environment variables in Netlify dashboard');
console.log('2. Connect GitHub repository to Netlify');
console.log('3. Set build command: npm run build');
console.log('4. Set publish directory: dist');
console.log('5. Deploy!');
console.log('6. Set up external cron jobs');

console.log('\n📊 Endpoints after deployment:');
console.log('- Dashboard: https://your-site.netlify.app/');
console.log('- Status: https://your-site.netlify.app/.netlify/functions/status');
console.log('- Manual trigger: https://your-site.netlify.app/.netlify/functions/manual-trigger');

if (allFilesExist) {
    console.log('\n✅ All files ready for deployment!');
} else {
    console.log('\n❌ Some files are missing. Please check the errors above.');
}

console.log('\n🎯 Features:');
console.log('✅ No email sending - logs saved locally');
console.log('✅ No screenshots - optimized for serverless');
console.log('✅ India timezone (IST) support');
console.log('✅ 10am and 6pm daily execution');
console.log('✅ Live dashboard with manual controls');
console.log('✅ JSON and text log formats');

console.log('\n🔥 Ready for live deployment on Netlify!');
