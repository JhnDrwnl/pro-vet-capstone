#!/bin/bash

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
PROJECT_ID="innovet-node-backend"
SERVICE_NAME="innovet-backend"
REGION="asia-southeast1"

echo -e "${BLUE}🚀 Deploying Node.js Backend to Cloud Run (Source Deployment)${NC}"
echo -e "${YELLOW}Project: ${PROJECT_ID}${NC}"
echo -e "${YELLOW}Service: ${SERVICE_NAME}${NC}"
echo -e "${YELLOW}Region: ${REGION}${NC}"
echo ""

# Check if gcloud is installed
if ! command -v gcloud &> /dev/null; then
    echo -e "${RED}❌ gcloud CLI is not installed. Please install it first.${NC}"
    exit 1
fi

# Check if user is authenticated
if ! gcloud auth list --filter=status:ACTIVE --format="value(account)" | grep -q .; then
    echo -e "${RED}❌ Not authenticated with gcloud. Please run: gcloud auth login${NC}"
    exit 1
fi

# Check if project is set
CURRENT_PROJECT=$(gcloud config get-value project 2>/dev/null)
if [ "$CURRENT_PROJECT" != "$PROJECT_ID" ]; then
    echo -e "${YELLOW}⚠️  Setting project to ${PROJECT_ID}...${NC}"
    gcloud config set project $PROJECT_ID
fi

echo -e "${BLUE}📦 Deploying from source code...${NC}"

# Deploy to Cloud Run from source
gcloud run deploy $SERVICE_NAME \
    --source . \
    --region $REGION \
    --allow-unauthenticated \
    --port 8080 \
    --memory 512Mi \
    --cpu 1 \
    --max-instances 10 \
    --timeout 300 \
    --concurrency 80

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Deployment successful!${NC}"
    
    # Get service URL
    SERVICE_URL=$(gcloud run services describe $SERVICE_NAME --region=$REGION --format="value(status.url)")
    echo -e "${GREEN}🌐 Service URL: ${SERVICE_URL}${NC}"
    
    # Test health endpoint
    echo -e "${BLUE}🔍 Testing health endpoint...${NC}"
    if command -v curl &> /dev/null; then
        HEALTH_RESPONSE=$(curl -s "${SERVICE_URL}/api/health" 2>/dev/null)
        if [ $? -eq 0 ] && [ "$HEALTH_RESPONSE" != "" ]; then
            echo -e "${GREEN}✅ Health check passed: ${HEALTH_RESPONSE}${NC}"
        else
            echo -e "${YELLOW}⚠️  Health check failed or endpoint not responding${NC}"
        fi
    else
        echo -e "${YELLOW}⚠️  curl not available - cannot test health endpoint${NC}"
    fi
    
    echo ""
    echo -e "${GREEN}🎉 Your backend is now running on Cloud Run!${NC}"
    echo -e "${BLUE}📝 Next steps:${NC}"
    echo -e "   1. Update your frontend API_URL to: ${SERVICE_URL}"
    echo -e "   2. Test your endpoints"
    echo -e "   3. Monitor logs: gcloud logs tail --service=$SERVICE_NAME --region=$REGION"
    
else
    echo -e "${RED}❌ Deployment failed!${NC}"
    echo -e "${YELLOW}💡 Check the error messages above for details${NC}"
    exit 1
fi




