@echo off
echo 🚀 Setting up Google Cloud for InnoVet Backend...
echo.

echo 📋 Checking prerequisites...
echo.

REM Check if gcloud is installed
where gcloud >nul 2>nul
if %errorlevel% neq 0 (
    echo ❌ Google Cloud CLI is not installed!
    echo.
    echo 📥 Please install it first:
    echo   1. Install Chocolatey: https://chocolatey.org/install
    echo   2. Run: choco install google-cloud-sdk
    echo   3. Restart your terminal
    echo.
    pause
    exit /b 1
)

echo ✅ Google Cloud CLI found
echo.

echo 🔐 Authenticating with Google Cloud...
echo Please follow the browser prompts...
gcloud auth login

if %errorlevel% neq 0 (
    echo ❌ Authentication failed!
    pause
    exit /b 1
)

echo.
echo 🔑 Setting up application credentials...
gcloud auth application-default login

if %errorlevel% neq 0 (
    echo ❌ Application credentials setup failed!
    pause
    exit /b 1
)

echo.
echo 📁 Listing available projects...
gcloud projects list

echo.
echo 🎯 Please enter your Google Cloud Project ID:
set /p PROJECT_ID="Project ID: "

echo.
echo 📋 Setting project to: %PROJECT_ID%
gcloud config set project %PROJECT_ID%

if %errorlevel% neq 0 (
    echo ❌ Failed to set project!
    pause
    exit /b 1
)

echo.
echo ⚙️ Enabling required APIs...
echo Enabling Cloud Run API...
gcloud services enable run.googleapis.com

echo Enabling Container Registry API...
gcloud services enable containerregistry.googleapis.com

echo Enabling Cloud Build API...
gcloud services enable cloudbuild.googleapis.com

echo.
echo ✅ Google Cloud setup completed successfully!
echo.
echo 📝 Next steps:
echo   1. Update deploy-cloud-run.sh with your PROJECT_ID: %PROJECT_ID%
echo   2. Set your environment variables
echo   3. Run: ./deploy-cloud-run.sh
echo.
echo 🌐 Your project is ready for deployment!
echo.
pause
