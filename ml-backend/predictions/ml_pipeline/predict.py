import os
import sys
import json
import numpy as np
import pandas as pd
import tensorflow as tf
from .data_processor import DataProcessor

class PetDiseasePredictor:
    def __init__(self, model_dir='ml_models'):
        """
        Initialize the predictor with the model directory.
        
        Args:
            model_dir: Directory containing the model and preprocessor
        """
        self.model_dir = model_dir
        self.model = None
        self.processor = None
        self.metadata = None
        
        # Load the model and preprocessor
        self.load_model_and_preprocessor()
    
    def load_model_and_preprocessor(self):
        """Load the trained model and preprocessor."""
        # Load metadata
        metadata_path = os.path.join(self.model_dir, 'model_metadata.json')
        try:
            with open(metadata_path, 'r') as f:
                self.metadata = json.load(f)
            print(f"Loaded model metadata from {metadata_path}")
        except FileNotFoundError:
            print(f"Metadata file not found at {metadata_path}")
            self.metadata = {
                'model_path': os.path.join(self.model_dir, 'pet_disease_model.h5'),
                'preprocessor_path': os.path.join(self.model_dir, 'preprocessor.pkl')
            }
        
        # Load model
        model_path = self.metadata.get('model_path', os.path.join(self.model_dir, 'pet_disease_model.h5'))
        try:
            self.model = tf.keras.models.load_model(model_path)
            print(f"Loaded model from {model_path}")
        except Exception as e:
            print(f"Error loading model: {str(e)}")
            raise
        
        # Load preprocessor
        preprocessor_path = self.metadata.get('preprocessor_path', os.path.join(self.model_dir, 'preprocessor.pkl'))
        self.processor = DataProcessor(data_path=None)  # Initialize with no data path
        try:
            self.processor.load_preprocessor(preprocessor_path)
            print(f"Loaded preprocessor from {preprocessor_path}")
        except Exception as e:
            print(f"Error loading preprocessor: {str(e)}")
            raise
    
    def predict(self, input_data):
        """
        Make a prediction for the given input data.
        
        Args:
            input_data: Dictionary or DataFrame containing the input features
        
        Returns:
            Dictionary with prediction results
        """
        if self.model is None or self.processor is None:
            raise ValueError("Model or preprocessor not loaded")
        
        # Process the input data
        processed_input = self.processor.process_input(input_data)
        
        # Make prediction
        raw_prediction = self.model.predict(processed_input)
        
        # Decode the prediction
        decoded_prediction = self.processor.decode_prediction(raw_prediction)
        
        # Get confidence scores
        if len(raw_prediction.shape) > 1 and raw_prediction.shape[1] > 1:
            # Multi-class classification
            confidence = np.max(raw_prediction, axis=1)[0]
            predicted_class_idx = np.argmax(raw_prediction, axis=1)[0]
            predicted_disease = decoded_prediction[0]
        else:
            # Binary classification or regression
            if self.metadata.get('model_type') == 'classification':
                confidence = raw_prediction[0][0] if raw_prediction[0][0] > 0.5 else 1 - raw_prediction[0][0]
                predicted_disease = decoded_prediction[0]
            else:
                # Regression
                confidence = None
                predicted_disease = None
        
        # Prepare result
        result = {
            'predicted_disease': predicted_disease,
            'confidence': float(confidence) if confidence is not None else None,
            'raw_prediction': raw_prediction.tolist()
        }
        
        return result

if __name__ == "__main__":
    # Example usage
    predictor = PetDiseasePredictor()
    
    # Example input data (replace with actual features from your dataset)
    example_input = {
        'feature1': 1.0,
        'feature2': 0.5,
        # Add all required features here
    }
    
    # Make prediction
    prediction = predictor.predict(example_input)
    print("\nPrediction result:")
    print(json.dumps(prediction, indent=4))

