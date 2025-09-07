#!/bin/bash

# Master Deployment Script for Chatbot Backend
# Deploys Node.js service to Google Cloud Run using source deployment

set -e

# Configuration
PROJECT_ID="innovet-node-backend"  # Replace with your actual project ID
REGION="us-central1"          # Change to your preferred region

echo "🚀 Starting deployment of Chatbot Backend to Google Cloud Run..."
echo "📋 Project ID: $PROJECT_ID"
echo "🌍 Region: $REGION"
echo "🔧 Using source deployment (no Cloud Build required)"
echo ""

# Check if gcloud is installed and authenticated
if ! command -v gcloud &> /dev/null; then
    echo "❌ Error: gcloud CLI is not installed. Please install it first."
    exit 1
fi

# Check authentication
if ! gcloud auth list --filter=status:ACTIVE --format="value(account)" | grep -q .; then
    echo "❌ Error: Not authenticated with gcloud. Please run: gcloud auth login"
    exit 1
fi

# Set project
echo "🔧 Setting project to: $PROJECT_ID"
gcloud config set project $PROJECT_ID

# Deploy Node.js service
echo ""
echo "🖥️ Deploying Node.js Server Service..."
./deploy-node-server.sh

echo ""
echo "🎉 Node.js service deployed successfully!"
echo ""
echo "📊 Service URL:"
echo "🖥️ Node.js Server: $(gcloud run services describe node-server --region $REGION --format='value(status.url)')"
echo ""
echo "💡 Next steps:"
echo "1. Update your frontend to use the new service URL"
echo "2. Test the service"
echo "3. Configure environment variables if needed"
echo ""
echo "🔧 Note: Service deployed using source deployment (no Docker build required)"
