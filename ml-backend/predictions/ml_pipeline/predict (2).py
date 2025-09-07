import pandas as pd
import numpy as np
import os
import argparse
import joblib
import logging
from data_cleaner import DataCleaner

# Set up logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

def load_model(model_path):
    """Load a trained model from the specified path."""
    logger.info(f"Loading model from {model_path}...")
    
    try:
        model = joblib.load(model_path)
        return model
    except Exception as e:
        logger.error(f"Error loading model: {str(e)}")
        raise

def load_feature_names(feature_names_path):
    """Load feature names from the specified path."""
    logger.info(f"Loading feature names from {feature_names_path}...")
    
    try:
        feature_names = joblib.load(feature_names_path)
        return feature_names
    except Exception as e:
        logger.error(f"Error loading feature names: {str(e)}")
        raise

def prepare_input_data(input_data, feature_names):
    """Prepare input data for prediction."""
    logger.info("Preparing input data for prediction...")
    
    # Create a copy of the input data
    data = input_data.copy()
    
    # Clean the data
    cleaner = DataCleaner(None)  # Initialize without a file path
    cleaner.df = data  # Set the dataframe directly
    data = cleaner.clean_data()
    
    # Create basic features
    if 'Age (years)' in data.columns:
        data['Age_Group'] = pd.cut(
            data['Age (years)'], 
            bins=[0, 1, 3, 7, 12, 20],
            labels=['Puppy/Kitten', 'Young', 'Adult', 'Senior', 'Geriatric']
        )
    
    if 'Weight (kg)' in data.columns:
        data['Weight_Category'] = pd.cut(
            data['Weight (kg)'],
            bins=[0, 2, 5, 10, 20, 50],
            labels=['Tiny', 'Small', 'Medium', 'Large', 'Giant']
        )
    
    if 'Age (years)' in data.columns and 'Weight (kg)' in data.columns:
        data['Age_Weight_Ratio'] = data['Age (years)'] / (data['Weight (kg)'] + 0.1)
    
    if 'Symptoms' in data.columns:
        common_symptoms = [
            'vomiting', 'diarrhea', 'lethargy', 'fever', 'cough', 'sneezing',
            'limping', 'pain', 'swelling', 'itching', 'rash', 'bleeding'
        ]
        
        for symptom in common_symptoms:
            data[f'Has_{symptom}'] = data['Symptoms'].str.contains(
                symptom, case=False, na=False).astype(int)
    
    # Encode categorical features
    data = cleaner.encode_categorical_features(data)
    
    # Ensure all required features are present
    for feature in feature_names:
        if feature not in data.columns:
            data[feature] = 0  # Add missing columns with default values
    
    # Keep only the features the model was trained on
    data = data[feature_names]
    
    return data

def predict(model, input_data, feature_names):
    """Make predictions using the trained model."""
    logger.info("Making predictions...")
    
    # Prepare input data
    X = prepare_input_data(input_data, feature_names)
    
    # Make predictions
    predictions = model.predict(X)
    
    # Get prediction probabilities if available
    if hasattr(model, 'predict_proba'):
        probabilities = model.predict_proba(X)
        # Get the maximum probability for each prediction
        max_probabilities = np.max(probabilities, axis=1)
    else:
        max_probabilities = np.ones(len(predictions))
    
    # Create a dataframe with predictions
    results = pd.DataFrame({
        'Predicted_Disease': predictions,
        'Confidence': max_probabilities
    })
    
    return results

def main():
    """Main function to make predictions."""
    parser = argparse.ArgumentParser(description='Make predictions using trained ML models')
    parser.add_argument('--model', type=str, required=True, help='Path to the trained model')
    parser.add_argument('--features', type=str, required=True, help='Path to the feature names')
    parser.add_argument('--input', type=str, required=True, help='Path to the input data file')
    parser.add_argument('--output', type=str, default='predictions.csv', help='Path to save predictions')
    args = parse_args()
    
    # Load model and feature names
    model = load_model(args.model)
    feature_names = load_feature_names(args.features)
    
    # Load input data
    cleaner = DataCleaner(args.input)
    input_data = cleaner.load_data()
    
    # Make predictions
    predictions = predict(model, input_data, feature_names)
    
    # Add original data to predictions
    results = pd.concat([input_data.reset_index(drop=True), predictions], axis=1)
    
    # Save predictions
    results.to_csv(args.output, index=False)
    logger.info(f"Predictions saved to {args.output}")

def parse_args():
    """Parse command line arguments."""
    parser = argparse.ArgumentParser(description='Make predictions using trained ML models')
    parser.add_argument('--model', type=str, required=True, help='Path to the trained model')
    parser.add_argument('--features', type=str, required=True, help='Path to the feature names')
    parser.add_argument('--input', type=str, required=True, help='Path to the input data file')
    parser.add_argument('--output', type=str, default='predictions.csv', help='Path to save predictions')
    return parser.parse_args()

if __name__ == "__main__":
    args = parse_args()
    main()