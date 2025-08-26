# 🚀 Google Cloud Run Deployment Guide for InnoVet Backend

## 📋 Prerequisites

1. **Google Cloud Account** with billing enabled
2. **Google Cloud CLI (gcloud)** installed
3. **Docker** installed and running
4. **Node.js** 18+ installed locally

## 🔧 Setup Steps

### Step 1: Install Google Cloud CLI
```bash
# Download and install from:
# https://cloud.google.com/sdk/docs/install

# Or use package manager:
# Windows (Chocolatey): choco install google-cloud-sdk
# macOS (Homebrew): brew install google-cloud-sdk
```

### Step 2: Authenticate with Google Cloud
```bash
gcloud auth login
gcloud auth application-default login
```

### Step 3: Create/Select Google Cloud Project
```bash
# List existing projects
gcloud projects list

# Create new project (optional)
gcloud projects create innovet-backend-123

# Set your project
gcloud config set project YOUR_PROJECT_ID
```

### Step 4: Enable Required APIs
```bash
gcloud services enable run.googleapis.com
gcloud services enable containerregistry.googleapis.com
gcloud services enable cloudbuild.googleapis.com
```

## 🚀 Deployment

### Option 1: Using the Deployment Script (Recommended)
```bash
# Make script executable
chmod +x deploy-cloud-run.sh

# Edit the script to set your PROJECT_ID
# Then run:
./deploy-cloud-run.sh
```

### Option 2: Manual Deployment
```bash
# 1. Build Docker image
docker build -t gcr.io/YOUR_PROJECT_ID/innovet-backend .

# 2. Push to Google Container Registry
docker push gcr.io/YOUR_PROJECT_ID/innovet-backend

# 3. Deploy to Cloud Run
gcloud run deploy innovet-backend \
    --image gcr.io/YOUR_PROJECT_ID/innovet-backend \
    --platform managed \
    --region asia-southeast1 \
    --allow-unauthenticated \
    --port 8080 \
    --memory 512Mi \
    --cpu 1 \
    --max-instances 10 \
    --min-instances 0
```

## ⚙️ Environment Variables

### Set Environment Variables in Cloud Run:
```bash
gcloud run services update innovet-backend \
    --region asia-southeast1 \
    --set-env-vars NODE_ENV=production,FIREBASE_PROJECT_ID=your-project-id
```

### Or use the web console:
1. Go to Cloud Run in Google Cloud Console
2. Select your service
3. Click "Edit & Deploy New Revision"
4. Go to "Variables & Secrets" tab
5. Add your environment variables

## 🔍 Testing Your Deployment

### Health Check:
```bash
# Get your service URL
SERVICE_URL=$(gcloud run services describe innovet-backend --region=asia-southeast1 --format="value(status.url)")

# Test health endpoint
curl $SERVICE_URL/api/health
```

### Test API Endpoints:
```bash
# Test authentication
curl $SERVICE_URL/api/auth/test


```

## 📊 Monitoring & Logs

### View Logs:
```bash
gcloud logs read "resource.type=cloud_run_revision AND resource.labels.service_name=innovet-backend" --limit=50
```

### View Service Details:
```bash
gcloud run services describe innovet-backend --region=asia-southeast1
```

## 💰 Cost Optimization

### Set Spending Limits:
1. Go to Google Cloud Console → Billing
2. Set budget alerts
3. Monitor usage in Cloud Run metrics

### Optimize Resources:
- **Memory**: Start with 512Mi, adjust based on usage
- **CPU**: Start with 1, scale up if needed
- **Instances**: Set min-instances=0 for cost savings

## 🔄 Updating Your Service

### Automatic Updates (Recommended):
```bash
# Just run the deployment script again
./deploy-cloud-run.sh
```

### Manual Updates:
```bash
# Build new image
docker build -t gcr.io/YOUR_PROJECT_ID/innovet-backend .

# Push and deploy
docker push gcr.io/YOUR_PROJECT_ID/innovet-backend
gcloud run deploy innovet-backend --image gcr.io/YOUR_PROJECT_ID/innovet-backend --region asia-southeast1
```

## 🚨 Troubleshooting

### Common Issues:

1. **Port Issues**: Make sure your app listens on `0.0.0.0:8080`
2. **Environment Variables**: Check if all required vars are set
3. **Firebase Permissions**: Ensure service account has proper access
4. **Memory Issues**: Increase memory allocation if needed

### Debug Commands:
```bash
# Check service status
gcloud run services describe innovet-backend --region=asia-southeast1

# View recent logs
gcloud logs read "resource.type=cloud_run_revision AND resource.labels.service_name=innovet-backend" --limit=100

# Test locally with Docker
docker run -p 8080:8080 -e NODE_ENV=production gcr.io/YOUR_PROJECT_ID/innovet-backend
```

## 🌐 Custom Domain (Optional)

```bash
# Map custom domain
gcloud run domain-mappings create \
    --service innovet-backend \
    --domain api.yourdomain.com \
    --region asia-southeast1
```

## 📱 Frontend Integration

Update your frontend environment variables:
```javascript
// In your frontend .env
VITE_API_BASE_URL=https://your-cloud-run-service-url
```

## ✅ Success Checklist

- [ ] Google Cloud CLI installed and authenticated
- [ ] Project created and APIs enabled
- [ ] Docker image built successfully
- [ ] Service deployed to Cloud Run
- [ ] Health endpoint responding
- [ ] Environment variables configured
- [ ] Frontend updated with new API URL
- [ ] All API endpoints tested
- [ ] Monitoring and alerts configured

---

**Need help?** Check the Google Cloud documentation or run `gcloud help` for command options.
