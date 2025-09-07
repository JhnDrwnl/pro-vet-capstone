# 🏥 ML Inference Service - Clean Deployment

This is a **clean, lightweight ML inference service** that serves pre-trained disease prediction models without any training overhead.

## 🎯 What This Service Does

- **Loads pre-trained models** for different animal species (dog, cat, hamster, rabbit, bird)
- **Makes disease predictions** based on pet data and symptoms
- **Provides REST API endpoints** for easy integration
- **No training code** - only inference and prediction

## 🚀 Quick Start

### 1. Test Locally First

#### **Using Git Bash (Recommended for Windows):**
```bash
# Make scripts executable
chmod +x test-inference.sh deploy-inference.sh

# Test the service
./test-inference.sh
```

#### **Using PowerShell:**
```powershell
# Test the service
python test-inference.py
```

#### **Manual Installation:**
```bash
# Install dependencies
pip install -r requirements-inference.txt

# Test the service
python test-inference.py
```

### 2. Deploy to Google Cloud Run

#### **Using Git Bash:**
```bash
# Deploy using bash script
./deploy-inference.sh

# Or with custom parameters
./deploy-inference.sh YOUR_PROJECT_ID YOUR_REGION SERVICE_NAME
```

#### **Using PowerShell:**
```powershell
# Deploy using PowerShell script
.\deploy-inference.ps1
```

## 📁 Clean File Structure

```
ml-backend/
├── inference_app/                 # Clean inference app
│   ├── __init__.py
│   ├── models.py                  # Prediction models
│   ├── views.py                   # API endpoints
│   ├── serializers.py             # Data serialization
│   ├── urls.py                    # URL routing
│   └── ml_service.py              # Core ML logic
├── species_models/                # Pre-trained models
│   ├── dog/
│   ├── cat/
│   ├── hamster/
│   ├── rabbit/
│   └── bird/
├── requirements-inference.txt      # Lightweight dependencies
├── requirements-inference-safe.txt # Ultra-safe versions for Windows
├── inference_settings.py           # Clean Django settings
├── inference_urls.py              # Main URL config
├── inference_wsgi.py              # WSGI application
├── Dockerfile.inference           # Docker configuration
├── deploy-inference.sh            # Bash deployment script (Git Bash)
├── deploy-inference.ps1           # PowerShell deployment script
├── test-inference.sh              # Bash test script (Git Bash)
├── test-inference.py              # Python test script
└── INFERENCE_README.md            # This file
```

## 🔮 API Endpoints

### Health Check
```
GET /health/predictions/health/
```

### Disease Prediction
```
POST /api/predictions/predict/
Content-Type: application/json

{
  "pet_data": {
    "species": "dog",
    "age": 3,
    "weight": 15,
    "breed": "Golden Retriever"
  },
  "symptoms": ["fever", "lethargy", "loss_of_appetite"]
}
```

### Response
```json
{
  "id": 1,
  "prediction": "Canine Parvovirus",
  "confidence": 0.85,
  "top_predictions": [
    {"disease": "Canine Parvovirus", "probability": 0.85},
    {"disease": "Gastroenteritis", "probability": 0.12},
    {"disease": "Food Poisoning", "probability": 0.03}
  ],
  "timestamp": "2024-01-15T10:30:00Z"
}
```

## 🐳 Docker Deployment

### Build Image
```bash
docker build -f Dockerfile.inference -t ml-inference:latest .
```

### Run Locally
```bash
docker run -p 8000:8000 ml-inference:latest
```

### Deploy to Cloud Run

#### **Using Git Bash:**
```bash
# Use the deployment script
./deploy-inference.sh

# Or manual deployment
docker tag ml-inference:latest gcr.io/YOUR_PROJECT_ID/ml-inference:latest
docker push gcr.io/YOUR_PROJECT_ID/ml-inference:latest
gcloud run deploy ml-inference \
  --image gcr.io/YOUR_PROJECT_ID/ml-inference:latest \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --memory 2Gi \
  --cpu 2
```

## ⚙️ Configuration

### Environment Variables
- `DEBUG`: Set to `False` for production
- `SECRET_KEY`: Django secret key (auto-generated if not set)

### Model Loading
The service automatically loads models from the `species_models/` directory. Each species should have:
- `model.pkl`: Trained scikit-learn model
- `feature_names.pkl`: List of feature names

## 🧪 Testing

### Local Testing

#### **Git Bash (Recommended):**
```bash
./test-inference.sh
```

#### **Manual Testing:**
```bash
python test-inference.py
```

### API Testing
```bash
# Health check
curl http://localhost:8000/health/predictions/health/

# Prediction
curl -X POST http://localhost:8000/api/predictions/predict/ \
  -H "Content-Type: application/json" \
  -d '{
    "pet_data": {"species": "dog", "age": 3, "weight": 15},
    "symptoms": ["fever", "lethargy"]
  }'
```

## 🔧 Troubleshooting

### Common Issues

1. **Models not loading**
   - Check `species_models/` directory structure
   - Ensure models are in `.pkl` format
   - Verify feature names match

2. **Dependencies missing**
   - Install from `requirements-inference.txt`
   - If that fails, try `requirements-inference-safe.txt`
   - Use Python 3.10 for best compatibility

3. **Port conflicts**
   - Change port in `inference_settings.py`
   - Update Dockerfile if needed

4. **Windows compilation issues**
   - Use Git Bash instead of PowerShell
   - Use the safe requirements file
   - Consider using Conda for better Windows support

### Windows-Specific Solutions

If you encounter NumPy compilation issues on Windows:

```bash
# Option 1: Use safe requirements
pip install -r requirements-inference-safe.txt

# Option 2: Use Conda (recommended for Windows)
conda create -n ml-inference python=3.10
conda activate ml-inference
conda install numpy pandas scikit-learn joblib
pip install Django djangorestframework django-cors-headers gunicorn python-dotenv
```

## 📊 Performance

- **Memory**: 2GB recommended for model loading
- **CPU**: 2 cores for concurrent predictions
- **Response Time**: <100ms for predictions
- **Concurrency**: 80 concurrent requests

## 🚫 What's NOT Included

- ❌ Training scripts
- ❌ Data preprocessing for training
- ❌ Model evaluation tools
- ❌ Jupyter notebooks
- ❌ Large datasets
- ❌ Development tools

## 🎉 Benefits

1. **Lightweight**: Only essential inference code
2. **Fast**: Pre-trained models load once
3. **Scalable**: Easy to deploy and scale
4. **Clean**: No training dependencies
5. **Production Ready**: Proper error handling and logging
6. **Cross-Platform**: Works on Windows (Git Bash), macOS, and Linux

---

**Ready to deploy your ML inference service?** 🚀

#### **Git Bash Users:**
```bash
./deploy-inference.sh
```

#### **PowerShell Users:**
```powershell
.\deploy-inference.ps1
```
