from rest_framework import serializers
from predictions.models import Prediction

class PredictionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Prediction
        fields = '__all__'
        read_only_fields = ['prediction_date', 'is_confirmed', 'confirmed_by']