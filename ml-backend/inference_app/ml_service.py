import os
import joblib
import numpy as np
import pandas as pd
import logging
from typing import Dict, List, Any, Tuple

logger = logging.getLogger(__name__)

class MLInferenceService:
    """Clean ML inference service for disease prediction"""
    
    def __init__(self):
        self.models_dir = os.path.join(os.path.dirname(__file__), '..', 'species_models')
        self.species_models = {}
        self.feature_names = {}
        self.is_initialized = False
        self._load_models()
    
    def _load_models(self):
        """Load all available species models"""
        try:
            if not os.path.exists(self.models_dir):
                logger.warning(f"Models directory not found: {self.models_dir}")
                return
            
            # Load models for each species
            for species_dir in os.listdir(self.models_dir):
                species_path = os.path.join(self.models_dir, species_dir)
                
                if not os.path.isdir(species_path):
                    continue
                
                model_path = os.path.join(species_path, 'model.pkl')
                features_path = os.path.join(species_path, 'feature_names.pkl')
                
                if os.path.exists(model_path) and os.path.exists(features_path):
                    try:
                        model = joblib.load(model_path)
                        features = joblib.load(features_path)
                        
                        self.species_models[species_dir] = model
                        self.feature_names[species_dir] = features
                        
                        logger.info(f"Loaded model for {species_dir} with {len(features)} features")
                    except Exception as e:
                        logger.error(f"Error loading model for {species_dir}: {str(e)}")
            
            self.is_initialized = len(self.species_models) > 0
            logger.info(f"ML service initialized with {len(self.species_models)} species models")
            
        except Exception as e:
            logger.error(f"Error initializing ML service: {str(e)}")
            self.is_initialized = False
    
    def is_ready(self) -> bool:
        """Check if the ML service is ready"""
        return self.is_initialized
    
    def get_available_species(self) -> List[str]:
        """Get list of available species for prediction"""
        return list(self.species_models.keys())
    
    def predict_disease(self, pet_data: Dict[str, Any], symptoms: List[str]) -> Dict[str, Any]:
        """
        Predict disease based on pet data and symptoms
        
        Args:
            pet_data: Dictionary with pet information (species, age, weight, etc.)
            symptoms: List of symptoms
            
        Returns:
            Dictionary with prediction results
        """
        try:
            if not self.is_ready():
                return {'error': 'ML service not ready'}
            
            # Extract species and normalize
            species = pet_data.get('species', '').lower().replace(' ', '_')
            
            if species not in self.species_models:
                return {
                    'error': f"No model available for species '{species}'",
                    'available_species': self.get_available_species()
                }
            
            # Get model and features
            model = self.species_models[species]
            features = self.feature_names[species]
            
            # Prepare feature vector
            feature_vector = self._prepare_features(pet_data, symptoms, features)
            
            # Make prediction
            prediction = model.predict(feature_vector)[0]
            probabilities = model.predict_proba(feature_vector)[0]
            
            # Get top predictions
            top_indices = np.argsort(probabilities)[::-1][:3]
            top_classes = [model.classes_[i] for i in top_indices]
            top_probs = [float(probabilities[i]) for i in top_indices]
            
            return {
                'prediction': prediction,
                'confidence': float(max(probabilities)),
                'top_predictions': [
                    {'disease': disease, 'probability': prob}
                    for disease, prob in zip(top_classes, top_probs)
                ],
                'species': species,
                'model_confidence': 'high' if max(probabilities) > 0.7 else 'medium'
            }
            
        except Exception as e:
            logger.error(f"Prediction error: {str(e)}")
            return {'error': f'Prediction failed: {str(e)}'}
    
    def _prepare_features(self, pet_data: Dict[str, Any], symptoms: List[str], features: List[str]) -> np.ndarray:
        """Prepare feature vector for prediction"""
        try:
            # Create base features dictionary
            feature_dict = {}
            
            # Age features
            age = pet_data.get('age', 0)
            feature_dict['age'] = age
            feature_dict['age_group'] = self._get_age_group(age)
            
            # Weight features
            weight = pet_data.get('weight', 0)
            feature_dict['weight'] = weight
            feature_dict['weight_category'] = self._get_weight_category(weight)
            
            # Species features
            species = pet_data.get('species', '').lower()
            feature_dict['species'] = species
            
            # Breed features
            breed = pet_data.get('breed', '')
            feature_dict['breed'] = breed
            
            # Symptoms features (one-hot encoding)
            all_symptoms = [
                'fever', 'cough', 'lethargy', 'loss_of_appetite',
                'vomiting', 'diarrhea', 'difficulty_breathing',
                'skin_issues', 'limping', 'excessive_thirst',
                'urination_problems', 'behavioral_changes'
            ]
            
            for symptom in all_symptoms:
                feature_dict[f'symptom_{symptom}'] = 1 if symptom in symptoms else 0
            
            # Create feature vector matching the expected features
            feature_vector = np.zeros(len(features))
            
            for i, feature in enumerate(features):
                if feature in feature_dict:
                    feature_vector[i] = feature_dict[feature]
                # Missing features remain 0 (default)
            
            return feature_vector.reshape(1, -1)
            
        except Exception as e:
            logger.error(f"Feature preparation error: {str(e)}")
            # Return zero vector as fallback
            return np.zeros((1, len(features)))
    
    def _get_age_group(self, age: float) -> str:
        """Convert age to age group"""
        if age <= 1:
            return 'puppy_kitten'
        elif age <= 3:
            return 'young'
        elif age <= 7:
            return 'adult'
        elif age <= 12:
            return 'senior'
        else:
            return 'geriatric'
    
    def _get_weight_category(self, weight: float) -> str:
        """Convert weight to weight category"""
        if weight <= 2:
            return 'tiny'
        elif weight <= 5:
            return 'small'
        elif weight <= 10:
            return 'medium'
        elif weight <= 20:
            return 'large'
        else:
            return 'giant'

