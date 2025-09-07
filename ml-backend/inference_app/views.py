from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from .models import Prediction
from .serializers import PredictionSerializer
from .ml_service import MLInferenceService
import logging

logger = logging.getLogger(__name__)

class PredictionViewSet(viewsets.ModelViewSet):
    """ViewSet for disease predictions"""
    serializer_class = PredictionSerializer
    permission_classes = [AllowAny]  # Allow public access for inference
    queryset = Prediction.objects.all()
    
    def __init__(self, **kwargs):
        super().__init__(**kwargs)
        self.ml_service = MLInferenceService()
    
    def _get_diagnostic_recommendations(self, predicted_disease: str, symptoms: list) -> list:
        """Generate diagnostic recommendations based on predicted disease and symptoms"""
        # Basic diagnostic recommendations based on common diseases
        diagnostic_map = {
            'respiratory_infection': [
                'Complete Blood Count (CBC)',
                'Chest X-ray',
                'Respiratory culture',
                'Temperature monitoring'
            ],
            'gastrointestinal_upset': [
                'Fecal examination',
                'Blood chemistry panel',
                'Abdominal X-ray',
                'Dietary assessment'
            ],
            'skin_condition': [
                'Skin scraping',
                'Fungal culture',
                'Allergy testing',
                'Biopsy if indicated'
            ],
            'dental_disease': [
                'Oral examination under anesthesia',
                'Dental X-rays',
                'Periodontal probing',
                'Professional cleaning'
            ],
            'arthritis': [
                'Joint X-rays',
                'Blood work for inflammation markers',
                'Joint fluid analysis',
                'Mobility assessment'
            ],
            'diabetes': [
                'Blood glucose test',
                'Fructosamine level',
                'Urinalysis',
                'Complete metabolic panel'
            ],
            'kidney_disease': [
                'Blood chemistry (BUN, creatinine)',
                'Urinalysis',
                'Abdominal ultrasound',
                'Blood pressure monitoring'
            ],
            'heart_disease': [
                'Echocardiogram',
                'Electrocardiogram (ECG)',
                'Chest X-ray',
                'Blood pressure measurement'
            ]
        }
        
        # Get specific recommendations for the predicted disease
        specific_diagnostics = diagnostic_map.get(predicted_disease.lower(), [
            'Complete Blood Count (CBC)',
            'Blood chemistry panel',
            'Physical examination',
            'Symptom monitoring'
        ])
        
        # Add general recommendations based on symptoms
        general_diagnostics = []
        if 'fever' in symptoms:
            general_diagnostics.append('Temperature monitoring')
        if 'lethargy' in symptoms:
            general_diagnostics.append('Activity level assessment')
        if 'loss_of_appetite' in symptoms:
            general_diagnostics.append('Nutritional assessment')
        if 'vomiting' in symptoms or 'diarrhea' in symptoms:
            general_diagnostics.append('Gastrointestinal evaluation')
        
        # Combine and deduplicate
        all_diagnostics = list(set(specific_diagnostics + general_diagnostics))
        return all_diagnostics[:6]  # Limit to 6 recommendations

    @action(detail=False, methods=['post'])
    def predict(self, request):
        """Main prediction endpoint"""
        try:
            # Extract input data
            pet_data = request.data.get('pet_data', {})
            symptoms = request.data.get('symptoms', [])
            
            if not pet_data or not symptoms:
                return Response(
                    {'error': 'Missing required data: pet_data and symptoms'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Make prediction
            prediction_result = self.ml_service.predict_disease(pet_data, symptoms)
            
            if 'error' in prediction_result:
                return Response(prediction_result, status=status.HTTP_400_BAD_REQUEST)
            
            # Store prediction
            prediction_obj = Prediction.objects.create(
                pet_id=pet_data.get('pet_id', 'unknown'),
                medical_record_id=pet_data.get('medical_record_id'),
                predicted_disease=prediction_result['prediction'],
                confidence_score=prediction_result['confidence'],
                details=prediction_result
            )
            
            # Format response to match frontend expectations
            response_data = {
                'id': prediction_obj.id,
                'prediction': prediction_result['prediction'],
                'confidence': prediction_result['confidence'],
                'predictions': prediction_result['top_predictions'],
                'top_predictions': prediction_result['top_predictions'],
                'timestamp': prediction_obj.created_at.isoformat(),
                'report': {
                    'diagnostics': self._get_diagnostic_recommendations(prediction_result['prediction'], symptoms)
                }
            }
            
            return Response(response_data)
            
        except Exception as e:
            logger.error(f"Prediction error: {str(e)}")
            return Response(
                {'error': 'Internal server error during prediction'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    @action(detail=False, methods=['get'])
    def health(self, request):
        """Health check endpoint"""
        try:
            # Check if ML service is ready
            is_ready = self.ml_service.is_ready()
            return Response({
                'status': 'healthy' if is_ready else 'unhealthy',
                'ml_service_ready': is_ready,
                'available_species': self.ml_service.get_available_species()
            })
        except Exception as e:
            logger.error(f"Health check error: {str(e)}")
            return Response(
                {'status': 'unhealthy', 'error': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

