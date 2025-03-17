from rest_framework import viewsets, status
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
            input_data = {}
            
            # Process symptoms into features
            # This is where you map the symptoms to your model's features
            # Example: Convert symptoms list to feature dictionary
    # Map symptom to feature 'Pet Species'
    input_data['Pet Species'] = 0  # Default value
    # Map symptom to feature 'Breed'
    input_data['Breed'] = 0  # Default value
    # Map symptom to feature 'Past Diagnosis'
    input_data['Past Diagnosis'] = 0  # Default value
    # Map symptom to feature 'Symptoms'
    input_data['Symptoms'] = 0  # Default value
    # Map symptom to feature 'Treatment'
    input_data['Treatment'] = 0  # Default value
    # Process each symptom
    for symptom in symptoms:
        # Map symptom to corresponding feature
        # This is where you implement your symptom-to-feature mapping logic
        # Example: if symptom == 'fever': input_data['temperature'] = 1
            
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
                details={'raw_prediction': prediction_result['raw_prediction']}
            )
            
            return Response({
                'prediction_id': prediction_obj.id,
                'disease': prediction_obj.predicted_disease,
                'confidence': prediction_obj.confidence_score,
                'details': prediction_obj.details
            })
            
        except Exception as e:
            return Response({
                'error': str(e)
            }, status=status.HTTP_400_BAD_REQUEST)
