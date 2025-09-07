# Simple Rasa Deployment Script for Windows PowerShell
# Uses pre-built Docker image to avoid dependency conflicts

# Configuration
$PROJECT_ID = "innovet-node-backend"
$REGION = "us-central1"
$SERVICE_NAME = "rasa-chatbot-simple"
$IMAGE_NAME = "gcr.io/$PROJECT_ID/$SERVICE_NAME"

Write-Host "🚀 Deploying Rasa Chatbot (Simple Docker approach)..." -ForegroundColor Green

# Navigate to rasa directory (we're already here)
Write-Host "📁 Current directory: $(Get-Location)" -ForegroundColor Blue

# Build Docker image using the simple Dockerfile
Write-Host "🔨 Building Docker image..." -ForegroundColor Blue
docker build -f Dockerfile.simple -t $IMAGE_NAME .

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Docker build failed!" -ForegroundColor Red
    exit 1
}

# Push to Google Container Registry
Write-Host "📤 Pushing image to Google Container Registry..." -ForegroundColor Blue
docker push $IMAGE_NAME

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Docker push failed!" -ForegroundColor Red
    exit 1
}

# Deploy to Cloud Run
Write-Host "🚀 Deploying to Cloud Run..." -ForegroundColor Blue
gcloud run deploy $SERVICE_NAME `
    --image $IMAGE_NAME `
    --platform managed `
    --region $REGION `
    --project $PROJECT_ID `
    --allow-unauthenticated `
    --port 8080 `
    --memory 2Gi `
    --cpu 1 `
    --timeout 900 `
    --concurrency 80 `
    --max-instances 10

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Rasa service deployed successfully!" -ForegroundColor Green
    
    # Get the service URL
    $serviceUrl = gcloud run services describe $SERVICE_NAME --region $REGION --format='value(status.url)'
    Write-Host "🌐 Service URL: $serviceUrl" -ForegroundColor Cyan
    
    Write-Host ""
    Write-Host "🐳 Image: $IMAGE_NAME" -ForegroundColor Yellow
    Write-Host "🔧 Using official Rasa 3.6.2 image (no dependency conflicts!)" -ForegroundColor Yellow
} else {
    Write-Host "❌ Deployment failed!" -ForegroundColor Red
    exit 1
}


