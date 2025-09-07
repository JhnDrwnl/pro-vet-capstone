#!/usr/bin/env python3
"""
Simple test script for ML inference service
Run this to test if your inference service works locally
"""

import os
import sys
import django

# Add the current directory to Python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

# Set Django settings
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'inference_settings')
django.setup()

from inference_app.ml_service import MLInferenceService

def test_inference_service():
    """Test the ML inference service"""
    print("🧪 Testing ML Inference Service...")
    print("=" * 50)
    
    # Initialize the service
    try:
        ml_service = MLInferenceService()
        print(f"✅ ML Service initialized: {ml_service.is_ready()}")
        
        if not ml_service.is_ready():
            print("❌ ML Service is not ready")
            return False
        
        # Get available species
        species = ml_service.get_available_species()
        print(f"🐾 Available species: {species}")
        
        if not species:
            print("❌ No species models found")
            return False
        
        # Test prediction with first available species
        test_species = species[0]
        print(f"\n🔮 Testing prediction for species: {test_species}")
        
        # Sample pet data
        pet_data = {
            'species': test_species,
            'age': 3,
            'weight': 15,
            'breed': 'Test Breed'
        }
        
        symptoms = ['fever', 'lethargy']
        
        # Make prediction
        result = ml_service.predict_disease(pet_data, symptoms)
        
        if 'error' in result:
            print(f"❌ Prediction failed: {result['error']}")
            return False
        
        print("✅ Prediction successful!")
        print(f"   Disease: {result['prediction']}")
        print(f"   Confidence: {result['confidence']:.2f}")
        print(f"   Top predictions: {result['top_predictions']}")
        
        return True
        
    except Exception as e:
        print(f"❌ Error testing inference service: {str(e)}")
        return False

def test_api_endpoints():
    """Test if Django API endpoints are accessible"""
    print("\n🌐 Testing API Endpoints...")
    print("=" * 50)
    
    try:
        from django.test import Client
        from django.urls import reverse
        
        client = Client()
        
        # Test health endpoint
        print("🏥 Testing health endpoint...")
        response = client.get('/health/predictions/health/')
        print(f"   Status: {response.status_code}")
        
        if response.status_code == 200:
            print("   ✅ Health endpoint working")
        else:
            print("   ❌ Health endpoint failed")
            return False
        
        return True
        
    except Exception as e:
        print(f"❌ Error testing API endpoints: {str(e)}")
        return False

if __name__ == "__main__":
    print("🚀 ML Inference Service Test Suite")
    print("=" * 50)
    
    # Test ML service
    ml_test_passed = test_inference_service()
    
    # Test API endpoints
    api_test_passed = test_api_endpoints()
    
    print("\n" + "=" * 50)
    print("📊 Test Results:")
    print(f"   ML Service: {'✅ PASSED' if ml_test_passed else '❌ FAILED'}")
    print(f"   API Endpoints: {'✅ PASSED' if api_test_passed else '❌ FAILED'}")
    
    if ml_test_passed and api_test_passed:
        print("\n🎉 All tests passed! Your inference service is ready for deployment.")
    else:
        print("\n⚠️  Some tests failed. Please check the errors above.")
        sys.exit(1)

