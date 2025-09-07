"""
URL configuration for inference_app
"""
from django.urls import path
from . import views

app_name = 'inference_app'

urlpatterns = [
    # Health check endpoint
    path('predictions/health/', views.PredictionViewSet.as_view({'get': 'health'}), name='health'),
    
    # Prediction endpoint
    path('predictions/predict/', views.PredictionViewSet.as_view({'post': 'predict'}), name='predict'),
]
