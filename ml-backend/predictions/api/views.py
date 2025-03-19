from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from predictions.models import Prediction
from .serializers import PredictionSerializer
from ..preprocessors.data_processor import process_input_data
import tensorflow as tf
import os

class PredictionViewSet(viewsets.ModelViewSet):
    serializer_class = PredictionSerializer
    
    def get_queryset(self):
        return Prediction.objects.filter(pet__owner=self.request.user)

    @action(detail=False, methods=['post'])
    def predict(self, request):
        try:
            # Get data from request
            pet_id = request.data.get('pet_id')
            medical_record_id = request.data.get('medical_record_id')
            symptoms = request.data.get('symptoms', '')

            # Process input data
            processed_data = process_input_data(symptoms)

            # Load the model
            model_path = os.path.join('predictions', 'ml_models', 'pet_disease_model.h5')
            model = tf.keras.models.load_model(model_path)

            # Make prediction
            prediction = model.predict(processed_data)
            
            # Get the predicted disease (you'll need to map the prediction to disease names)
            diseases = ['Disease1', 'Disease2', 'Disease3']  # Replace with your actual disease classes
            predicted_disease = diseases[prediction.argmax()]
            confidence_score = float(prediction.max())

            # Create prediction record
            prediction_obj = Prediction.objects.create(
                pet_id=pet_id,
                medical_record_id=medical_record_id,
                predicted_disease=predicted_disease,
                confidence_score=confidence_score,
                details={'raw_prediction': prediction.tolist()}
            )

            return Response({
                'id': prediction_obj.id,
                'predicted_disease': predicted_disease,
                'confidence_score': confidence_score,
                'details': prediction_obj.details
            })

        except Exception as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )