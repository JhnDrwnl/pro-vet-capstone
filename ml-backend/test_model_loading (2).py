# test_model_loading.py
import os
import sys
from django.conf import settings

# Add the project directory to the Python path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'vetml.settings')

import django
django.setup()

from predictions.ml_pipeline.predict import load_model

def test_model_loading():
    try:
        model, preprocessor = load_model()
        print("✅ Model loaded successfully!")
        print(f"Model type: {type(model)}")
        return True
    except Exception as e:
        print(f"❌ Error loading model: {e}")
        return False

if __name__ == "__main__":
    test_model_loading()