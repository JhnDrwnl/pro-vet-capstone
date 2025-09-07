#!/bin/bash

# Bash script to deploy ML inference service to Google Cloud Run
# This deploys ONLY the inference service, not training
# Run this in Git Bash

# Configuration
PROJECT_ID=${1:-"innovet-node-backend"}  # Change to your project ID
REGION=${2:-"us-central1"}               # Change to your preferred region
SERVICE_NAME=${3:-"ml-inference"}        # Name for your ML service
IMAGE_TAG=${4:-"latest"}

echo "🚀 Starting ML Inference Service Deployment..."
echo "📋 Project ID: $PROJECT_ID"
echo "🌍 Region: $REGION"
echo "🏥 Service Name: $SERVICE_NAME"
echo ""

# Check if gcloud is installed
if ! command -v gcloud &> /dev/null; then
    echo "❌ Error: gcloud CLI is not installed or not in PATH"
    echo "Please install gcloud CLI first: https://cloud.google.com/sdk/docs/install"
    exit 1
fi

# Check authentication
if ! gcloud auth list --filter=status:ACTIVE --format="value(account)" | grep -q .; then
    echo "❌ Error: Not authenticated with gcloud"
    echo "Please run: gcloud auth login"
    exit 1
fi

# Get authenticated account
ACCOUNT=$(gcloud auth list --filter=status:ACTIVE --format="value(account)")
echo "✅ Authenticated as: $ACCOUNT"

# Set project
echo "🔧 Setting project to: $PROJECT_ID"
gcloud config set project $PROJECT_ID
if [ $? -ne 0 ]; then
    echo "❌ Error: Failed to set project"
    exit 1
fi

# Build and push Docker image
IMAGE_NAME="gcr.io/$PROJECT_ID/$SERVICE_NAME"
echo "🐳 Building Docker image: $IMAGE_NAME"

docker build -f Dockerfile.inference -t $IMAGE_NAME:$IMAGE_TAG .
if [ $? -ne 0 ]; then
    echo "❌ Error: Docker build failed"
    exit 1
fi

echo "📤 Pushing image to Google Container Registry..."
docker push $IMAGE_NAME:$IMAGE_TAG
if [ $? -ne 0 ]; then
    echo "❌ Error: Docker push failed"
    exit 1
fi

# Deploy to Cloud Run
echo "🚀 Deploying to Cloud Run..."

gcloud run deploy $SERVICE_NAME \
    --image $IMAGE_NAME:$IMAGE_TAG \
    --platform managed \
    --region $REGION \
    --allow-unauthenticated \
    --memory 4Gi \
    --cpu 2 \
    --timeout 300 \
    --concurrency 40 \
    --max-instances 5 \
    --set-env-vars "DEBUG=False" \
    --port 8000

if [ $? -ne 0 ]; then
    echo "❌ Error: Cloud Run deployment failed"
    exit 1
fi

# Get service URL
SERVICE_URL=$(gcloud run services describe $SERVICE_NAME --region $REGION --format="value(status.url)")

echo ""
echo "🎉 ML Inference Service deployed successfully!"
echo ""
echo "📊 Service Information:"
echo "🏥 Service Name: $SERVICE_NAME"
echo "🌐 Service URL: $SERVICE_URL"
echo "🔧 Region: $REGION"
echo ""
echo "🧪 Test Endpoints:"
echo "🏥 Health Check: $SERVICE_URL/health/predictions/health/"
echo "🔮 Prediction: $SERVICE_URL/api/predictions/predict/"
echo ""
echo "📝 Example Prediction Request:"
echo "POST $SERVICE_URL/api/predictions/predict/"
echo "Content-Type: application/json"
echo ""
echo '{
  "pet_data": {
    "species": "dog",
    "age": 3,
    "weight": 15,
    "breed": "Golden Retriever"
  },
  "symptoms": ["fever", "lethargy", "loss_of_appetite"]
}'
echo ""
echo "✅ Deployment complete! Your ML inference service is now running."

