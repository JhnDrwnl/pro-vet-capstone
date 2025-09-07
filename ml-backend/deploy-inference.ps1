# PowerShell script to deploy ML inference service to Google Cloud Run
# This deploys ONLY the inference service, not training

param(
    [string]$ProjectId = "innovet-node-backend",  # Change to your project ID
    [string]$Region = "us-central1",             # Change to your preferred region
    [string]$ServiceName = "ml-inference",       # Name for your ML service
    [string]$ImageTag = "latest"
)

Write-Host "🚀 Starting ML Inference Service Deployment..." -ForegroundColor Green
Write-Host "📋 Project ID: $ProjectId" -ForegroundColor Cyan
Write-Host "🌍 Region: $Region" -ForegroundColor Cyan
Write-Host "🏥 Service Name: $ServiceName" -ForegroundColor Cyan
Write-Host ""

# Check if gcloud is installed
try {
    $gcloudVersion = gcloud --version 2>$null
    if ($LASTEXITCODE -ne 0) {
        throw "gcloud not found"
    }
    Write-Host "✅ gcloud CLI found" -ForegroundColor Green
} catch {
    Write-Host "❌ Error: gcloud CLI is not installed or not in PATH" -ForegroundColor Red
    Write-Host "Please install gcloud CLI first: https://cloud.google.com/sdk/docs/install" -ForegroundColor Yellow
    exit 1
}

# Check authentication
try {
    $account = gcloud auth list --filter=status:ACTIVE --format="value(account)" 2>$null
    if (-not $account) {
        throw "Not authenticated"
    }
    Write-Host "✅ Authenticated as: $account" -ForegroundColor Green
} catch {
    Write-Host "❌ Error: Not authenticated with gcloud" -ForegroundColor Red
    Write-Host "Please run: gcloud auth login" -ForegroundColor Yellow
    exit 1
}

# Set project
Write-Host "🔧 Setting project to: $ProjectId" -ForegroundColor Yellow
gcloud config set project $ProjectId
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Error: Failed to set project" -ForegroundColor Red
    exit 1
}

# Build and push Docker image
$imageName = "gcr.io/$ProjectId/$ServiceName"
Write-Host "🐳 Building Docker image: $imageName" -ForegroundColor Yellow

docker build -f Dockerfile.inference -t $imageName:$ImageTag .
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Error: Docker build failed" -ForegroundColor Red
    exit 1
}

Write-Host "📤 Pushing image to Google Container Registry..." -ForegroundColor Yellow
docker push $imageName:$ImageTag
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Error: Docker push failed" -ForegroundColor Red
    exit 1
}

# Deploy to Cloud Run
Write-Host "🚀 Deploying to Cloud Run..." -ForegroundColor Yellow

gcloud run deploy $ServiceName `
    --image $imageName:$ImageTag `
    --platform managed `
    --region $Region `
    --allow-unauthenticated `
    --memory 2Gi `
    --cpu 2 `
    --timeout 300 `
    --concurrency 80 `
    --max-instances 10 `
    --set-env-vars "DEBUG=False" `
    --port 8000

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Error: Cloud Run deployment failed" -ForegroundColor Red
    exit 1
}

# Get service URL
$serviceUrl = gcloud run services describe $ServiceName --region $Region --format="value(status.url)"
Write-Host ""
Write-Host "🎉 ML Inference Service deployed successfully!" -ForegroundColor Green
Write-Host ""
Write-Host "📊 Service Information:" -ForegroundColor Cyan
Write-Host "🏥 Service Name: $ServiceName" -ForegroundColor White
Write-Host "🌐 Service URL: $serviceUrl" -ForegroundColor White
Write-Host "🔧 Region: $Region" -ForegroundColor White
Write-Host ""
Write-Host "🧪 Test Endpoints:" -ForegroundColor Cyan
Write-Host "🏥 Health Check: $serviceUrl/health/predictions/health/" -ForegroundColor White
Write-Host "🔮 Prediction: $serviceUrl/api/predictions/predict/" -ForegroundColor White
Write-Host ""
Write-Host "📝 Example Prediction Request:" -ForegroundColor Yellow
Write-Host "POST $serviceUrl/api/predictions/predict/" -ForegroundColor White
Write-Host "Content-Type: application/json" -ForegroundColor White
Write-Host ""
Write-Host '{
  "pet_data": {
    "species": "dog",
    "age": 3,
    "weight": 15,
    "breed": "Golden Retriever"
  },
  "symptoms": ["fever", "lethargy", "loss_of_appetite"]
}' -ForegroundColor Gray
Write-Host ""
Write-Host "✅ Deployment complete! Your ML inference service is now running." -ForegroundColor Green

