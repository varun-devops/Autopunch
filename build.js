const fs = require('fs-extra');
const path = require('path');

async function build() {
    try {
        console.log('🔧 Building AutoPunch for deployment...');
        
        // Ensure dist directory exists
        const distDir = path.join(__dirname, 'dist');
        await fs.ensureDir(distDir);
        
        // Copy index.html to dist
        await fs.copy(
            path.join(__dirname, 'index.html'),
            path.join(distDir, 'index.html')
        );
        
        // Create a simple 404 page
        const html404 = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>AutoPunch - Page Not Found</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            text-align: center;
            padding: 50px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            flex-direction: column;
        }
        h1 { font-size: 3rem; margin-bottom: 20px; }
        p { font-size: 1.2rem; margin-bottom: 30px; }
        a { color: #fff; text-decoration: underline; }
    </style>
</head>
<body>
    <h1>404 - Page Not Found</h1>
    <p>The page you're looking for doesn't exist.</p>
    <a href="/">← Back to AutoPunch Dashboard</a>
</body>
</html>`;
        
        await fs.writeFile(path.join(distDir, '404.html'), html404);
        
        console.log('✅ Build completed successfully!');
        console.log('📁 Files created in dist/ directory');
        
    } catch (error) {
        console.error('❌ Build failed:', error);
        process.exit(1);
    }
}

build();
