import os
import sys
import argparse
import pandas as pd
import numpy as np
import joblib
import json

# Add the current directory to the path
current_dir = os.path.dirname(os.path.abspath(__file__))
sys.path.append(current_dir)

def load_species_models(models_dir):
    """
    Load all species models from the models directory.
    
    Args:
        models_dir (str): Directory containing species model subdirectories
        
    Returns:
        dict: Dictionary mapping species to (model, features) tuples
    """
    species_models = {}
    
    # List all subdirectories (one per species)
    for species_dir in os.listdir(models_dir):
        species_path = os.path.join(models_dir, species_dir)
        
        # Skip if not a directory
        if not os.path.isdir(species_path):
            continue
        
        # Paths to model and feature files
        model_path = os.path.join(species_path, 'model.pkl')
        features_path = os.path.join(species_path, 'feature_names.pkl')
        
        # Skip if files don't exist
        if not (os.path.exists(model_path) and os.path.exists(features_path)):
            print(f"Warning: Missing files for species {species_dir}")
            continue
        
        # Load model and features
        try:
            model = joblib.load(model_path)
            features = joblib.load(features_path)
            
            # Store in dictionary
            species_models[species_dir] = (model, features)
            print(f"Loaded model for {species_dir} with {len(features)} features")
        except Exception as e:
            print(f"Error loading model for {species_dir}: {str(e)}")
    
    return species_models

def predict_disease(input_data, species_models):
    """
    Predict disease for input data using the appropriate species model.
    
    Args:
        input_data (dict): Input data with pet information
        species_models (dict): Dictionary mapping species to (model, features) tuples
        
    Returns:
        dict: Prediction results
    """
    # Extract species from input data
    species = input_data.get('Pet Species', '').lower().replace(' ', '_')
    
    # Check if we have a model for this species
    if species not in species_models:
        return {
            'error': f"No model available for species '{species}'",
            'available_species': list(species_models.keys())
        }
    
    # Get model and features for this species
    model, features = species_models[species]
    
    # Prepare input data as DataFrame
    input_df = pd.DataFrame([input_data])
    
    # Apply the same feature engineering as during training
    # This is a simplified version - in practice, you'd need to apply
    # the exact same transformations as during training
    
    # Create age groups
    if 'Age (years)' in input_df.columns:
        input_df['Age_Group'] = pd.cut(
            input_df['Age (years)'],
            bins=[0, 1, 3, 7, 12, 20],
            labels=['Puppy/Kitten', 'Young', 'Adult', 'Senior', 'Geriatric']
        )
    
    # Create weight categories
    if 'Weight (kg)' in input_df.columns:
        input_df['Weight_Category'] = pd.cut(
            input_df['Weight (kg)'],
            bins=[0, 2, 5, 10, 20, 50],
            labels=['Tiny', 'Small', 'Medium', 'Large', 'Giant']
        )
    
    # Create interaction features
    if 'Age (years)' in input_df.columns and 'Weight (kg)' in input_df.columns:
        input_df['Age_Weight_Ratio'] = input_df['Age (years)'] / (input_df['Weight (kg)'] + 0.1)
    
    # One-hot encode categorical variables
    categorical_cols = ['Pet Species', 'Age_Group', 'Weight_Category']
    for col in categorical_cols:
        if col in input_df.columns:
            dummies = pd.get_dummies(input_df[col], prefix=col, drop_first=False)
            input_df = pd.concat([input_df, dummies], axis=1)
    
    # Select only the features used by the model
    # For missing features, add columns with zeros
    for feature in features:
        if feature not in input_df.columns:
            input_df[feature] = 0
    
    # Select only the required features in the correct order
    X = input_df[features]
    
    # Make prediction
    prediction = model.predict(X)[0]
    
    # Get prediction probabilities
    probabilities = model.predict_proba(X)[0]
    
    # Get top 3 predictions with probabilities
    top_indices = np.argsort(probabilities)[::-1][:3]
    top_classes = [model.classes_[i] for i in top_indices]
    top_probs = [probabilities[i] for i in top_indices]
    
    # Prepare results
    results = {
        'prediction': prediction,
        'confidence': float(max(probabilities)),
        'top_predictions': [
            {'disease': disease, 'probability': float(prob)}
            for disease, prob in zip(top_classes, top_probs)
        ]
    }
    
    return results

def main():
    parser = argparse.ArgumentParser(description='Predict pet disease using species-specific models')
    parser.add_argument('--models-dir', type=str, default='species_models',
                        help='Directory containing species model subdirectories')
    parser.add_argument('--species', type=str, required=True,
                        help='Pet species (e.g., dog, cat)')
    parser.add_argument('--age', type=float, required=True,
                        help='Pet age in years')
    parser.add_argument('--weight', type=float, required=True,
                        help='Pet weight in kg')
    parser.add_argument('--breed', type=str, default='',
                        help='Pet breed')
    parser.add_argument('--symptoms', type=str, default='',
                        help='Pet symptoms (comma-separated)')
    
    args = parser.parse_args()
    
    # Resolve models directory path
    if not os.path.isabs(args.models_dir):
        models_dir = os.path.join(os.path.dirname(current_dir), args.models_dir)
    else:
        models_dir = args.models_dir
    
    # Load species models
    species_models = load_species_models(models_dir)
    
    # Prepare input data
    input_data = {
        'Pet Species': args.species,
        'Age (years)': args.age,
        'Weight (kg)': args.weight,
        'Breed': args.breed,
        'Symptoms': args.symptoms
    }
    
    # Make prediction
    results = predict_disease(input_data, species_models)
    
    # Print results
    print(json.dumps(results, indent=2))

if __name__ == "__main__":
    main()