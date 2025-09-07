import os
import sys
import json
from predict import PetDiseasePredictor

def _generate_feature_mapping_code(feature_names):
    """Helper method to generate code for mapping symptoms to features"""
    # This is a placeholder - you'll need to customize this based on your actual features
    code_lines = []
    for feature in feature_names:
        code_lines.append(f"    # Map symptom to feature '{feature}'")
        code_lines.append(f"    input_data['{feature}'] = 0  # Default value")
        
    # Add code to process symptoms
    code_lines.append("    # Process each symptom")
    code_lines.append("    for symptom in symptoms:")
    code_lines.append("        # Map symptom to corresponding feature")
    code_lines.append("        # This is where you implement your symptom-to-feature mapping logic")
    code_lines.append("        # Example: if symptom == 'fever': input_data['temperature'] = 1")
    
    return "\n".join(code_lines)

def generate_api_code(model_dir='ml_models'):
    """
    Generate updated API code based on the trained model.
    
    Args:
        model_dir: Directory containing the model and preprocessor
    """
    # Load metadata
    metadata_path = os.path.join(model_dir, 'model_metadata.json')
    try:
        with open(metadata_path, 'r') as f:
            metadata = json.load(f)
    except FileNotFoundError:
        print(f"Metadata file not found at {metadata_path}")
        return
    
    # Get feature names and target names
    feature_names = metadata.get('feature_names', [])
    target_names = metadata.get('target_names', [])
    
    # Generate the feature mapping code
    feature_mapping_code = _generate_feature_mapping_code(feature_names)
    
    # Generate API code
    api_code = f'''from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import Prediction
from pets.models import Pet, MedicalRecord
import tensorflow as tf
import numpy as np
import os
from .ml_pipeline.predict import PetDiseasePredictor

class PredictionViewSet(viewsets.ModelViewSet):
    queryset = Prediction.objects.all()
    
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        # Initialize the predictor once
        self.predictor = PetDiseasePredictor(model_dir='predictions/ml_models')

    @action(detail=False, methods=['post'])
    def predict_disease(self, request):
        try:
            pet_id = request.data.get('pet_id')
            symptoms = request.data.get('symptoms', [])
            images = request.FILES.getlist('images', [])
            
            # Prepare input data for the model
            input_data = {{}}
            
            # Process symptoms into features
            # This is where you map the symptoms to your model's features
            # Example: Convert symptoms list to feature dictionary
{feature_mapping_code}
            
            # Make prediction using the predictor
            prediction_result = self.predictor.predict(input_data)
            
            # Create medical record
            medical_record = MedicalRecord.objects.create(
                pet_id=pet_id,
                symptoms=', '.join(symptoms)
            )
            
            # Save prediction
            prediction_obj = Prediction.objects.create(
                pet_id=pet_id,
                medical_record=medical_record,
                predicted_disease=prediction_result['predicted_disease'],
                confidence_score=prediction_result['confidence'] or 0.0,
                details={{'raw_prediction': prediction_result['raw_prediction']}}
            )
            
            return Response({{
                'prediction_id': prediction_obj.id,
                'disease': prediction_obj.predicted_disease,
                'confidence': prediction_obj.confidence_score,
                'details': prediction_obj.details
            }})
            
        except Exception as e:
            return Response({{
                'error': str(e)
            }}, status=status.HTTP_400_BAD_REQUEST)
'''
    
    # Write the API code to a file
    api_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'api.py')
    with open(api_path, 'w') as f:
        f.write(api_code)
    
    print(f"Updated API code written to {api_path}")
    return api_path

if __name__ == "__main__":
    # Generate API code
    generate_api_code()

