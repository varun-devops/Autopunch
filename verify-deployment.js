#!/usr/bin/env node

const fs = require('fs-extra');
const path = require('path');

console.log('🔍 Pre-Deployment Verification\n');

// Check critical files
const criticalFiles = [
    'netlify.toml',
    'package.json',
    'index.html',
    'build.js',
    'src/index.js',
    'functions/punch-scheduler.js',
    'functions/manual-trigger.js',
    'functions/status.js'
];

console.log('📋 Checking critical files...');
let allFilesOk = true;

for (const file of criticalFiles) {
    const exists = fs.existsSync(path.join(__dirname, file));
    const status = exists ? '✅' : '❌';
    console.log(`${status} ${file}`);
    if (!exists) allFilesOk = false;
}

// Check netlify.toml syntax
console.log('\n🔧 Checking netlify.toml...');
try {
    const netlifyConfig = fs.readFileSync(path.join(__dirname, 'netlify.toml'), 'utf8');
    
    // Basic syntax checks
    if (netlifyConfig.includes('[build]')) {
        console.log('✅ Build section found');
    } else {
        console.log('❌ Build section missing');
        allFilesOk = false;
    }
    
    if (netlifyConfig.includes('command = "npm run build"')) {
        console.log('✅ Build command correct');
    } else {
        console.log('❌ Build command incorrect');
        allFilesOk = false;
    }
    
    if (netlifyConfig.includes('publish = "dist"')) {
        console.log('✅ Publish directory correct');
    } else {
        console.log('❌ Publish directory incorrect');
        allFilesOk = false;
    }
    
} catch (error) {
    console.log('❌ Error reading netlify.toml:', error.message);
    allFilesOk = false;
}

// Test build command
console.log('\n🏗️ Testing build command...');
try {
    const { execSync } = require('child_process');
    execSync('npm run build', { stdio: 'pipe' });
    console.log('✅ Build command works');
    
    // Check if dist directory was created
    if (fs.existsSync(path.join(__dirname, 'dist'))) {
        console.log('✅ Dist directory created');
    } else {
        console.log('❌ Dist directory not created');
        allFilesOk = false;
    }
    
} catch (error) {
    console.log('❌ Build command failed:', error.message);
    allFilesOk = false;
}

// Check package.json scripts
console.log('\n📦 Checking package.json...');
try {
    const packageJson = JSON.parse(fs.readFileSync(path.join(__dirname, 'package.json'), 'utf8'));
    
    if (packageJson.scripts && packageJson.scripts.build) {
        console.log('✅ Build script exists');
    } else {
        console.log('❌ Build script missing');
        allFilesOk = false;
    }
    
    // Check dependencies
    const requiredDeps = ['express', 'moment-timezone', 'fs-extra', 'selenium-webdriver'];
    const missingDeps = requiredDeps.filter(dep => !packageJson.dependencies[dep]);
    
    if (missingDeps.length === 0) {
        console.log('✅ Required dependencies present');
    } else {
        console.log('❌ Missing dependencies:', missingDeps.join(', '));
        allFilesOk = false;
    }
    
} catch (error) {
    console.log('❌ Error reading package.json:', error.message);
    allFilesOk = false;
}

// Final result
console.log('\n' + '='.repeat(50));
if (allFilesOk) {
    console.log('🎉 ALL CHECKS PASSED - READY FOR DEPLOYMENT!');
    console.log('\n🚀 Next steps:');
    console.log('1. Push to GitHub: git push origin main');
    console.log('2. Connect to Netlify');
    console.log('3. Set environment variables');
    console.log('4. Deploy!');
    console.log('5. Set up cron jobs at cron-job.org');
} else {
    console.log('❌ SOME CHECKS FAILED - FIX ISSUES BEFORE DEPLOYMENT');
    console.log('\nPlease fix the issues above before deploying.');
}
console.log('='.repeat(50));
