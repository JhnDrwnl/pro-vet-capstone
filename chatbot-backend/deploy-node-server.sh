#!/bin/bash

# Node.js Server Deployment Script for Google Cloud Run
# Make sure you're authenticated with: gcloud auth login

set -e

# Configuration
PROJECT_ID="innovet-node-backend"  # Replace with your actual project ID
REGION="us-central1"          # Change to your preferred region
SERVICE_NAME="node-server"

echo "🚀 Deploying Node.js Server to Google Cloud Run..."

# Navigate to node-server directory
cd node-server

# Deploy directly from source (no Cloud Build needed)
echo "🚀 Deploying to Cloud Run from source..."
gcloud run deploy $SERVICE_NAME \
    --source . \
    --platform managed \
    --region $REGION \
    --project $PROJECT_ID \
    --allow-unauthenticated \
    --port 8080 \
    --memory 1Gi \
    --cpu 1 \
    --timeout 300 \
    --concurrency 80 \
    --set-env-vars "NODE_ENV=production" \
    --max-instances 10

echo "✅ Node.js server deployed successfully!"
echo "🌐 Service URL: $(gcloud run services describe $SERVICE_NAME --region $REGION --format='value(status.url)')"
