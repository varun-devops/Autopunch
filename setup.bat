@echo off
echo ========================================
echo AutoPunch Web Crawler Setup
echo ========================================

echo.
echo Installing dependencies...
call npm install

echo.
echo Setting up directories...
if not exist "reports" mkdir reports
if not exist "logs" mkdir logs
if not exist "screenshots" mkdir screenshots

echo.
echo Checking configuration...
if not exist ".env" (
    echo WARNING: .env file not found!
    echo Please copy .env.example to .env and configure it with your website details.
    echo.
    echo Example:
    echo copy .env.example .env
    echo.
    pause
    exit /b 1
)

echo.
echo ========================================
echo Setup completed successfully!
echo ========================================
echo.
echo Next steps:
echo 1. Edit .env file with your website details
echo 2. Run 'npm start' to test the application
echo 3. Run 'npm run dev' to start the web server
echo.
echo For deployment to Netlify:
echo 1. Connect your repository to Netlify
echo 2. Set environment variables in Netlify dashboard
echo 3. Deploy!
echo.
pause
