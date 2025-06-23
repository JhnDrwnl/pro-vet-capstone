import os
import pickle
import pandas as pd
import numpy as np
from pathlib import Path

# Set paths
BASE_DIR = Path(__file__).resolve().parent.parent.parent.parent
MODELS_DIR = os.path.join(BASE_DIR, 'retrained_models')
DATA_PATH = os.path.join(BASE_DIR, 'ml-backend/PredictedDiseaseDataset.csv')

def load_model(species):
    """Load the model for a given species"""
    model_path = os.path.join(MODELS_DIR, species.lower(), 'model.pkl')
    feature_names_path = os.path.join(MODELS_DIR, species.lower(), 'feature_names.pkl')
    
    if os.path.exists(model_path) and os.path.exists(feature_names_path):
        with open(model_path, 'rb') as f:
            model = pickle.load(f)
        
        with open(feature_names_path, 'rb') as f:
            feature_names = pickle.load(f)
        
        return model, feature_names
    else:
        print(f"Model or feature names not found for {species}")
        return None, None

def prepare_sample_data(df, species, sample_size=5):
    """Prepare sample data for testing"""
    # Filter by species
    species_df = df[df['Pet Species'] == species].copy()
    
    # Sample random rows
    if len(species_df) > sample_size:
        sample_df = species_df.sample(sample_size, random_state=42)
    else:
        sample_df = species_df
    
    # Extract duration in days
    def extract_days(duration_str):
        if pd.isna(duration_str):
            return np.nan
        try:
            return float(duration_str.split()[0])
        except:
            return np.nan
    
    sample_df['Symptom 1_Duration_Days'] = sample_df['Symptom 1_Duration'].apply(extract_days)
    sample_df['Symptom 2_Duration_Days'] = sample_df['Symptom 2_Duration'].apply(extract_days)
    
    # Map severity to numeric values
    severity_map = {'Mild': 1, 'Moderate': 2, 'Severe': 3}
    sample_df['Symptom 1_Severity_Value'] = sample_df['Symptom 1_Severity'].map(severity_map)
    sample_df['Symptom 2_Severity_Value'] = sample_df['Symptom 2_Severity'].map(severity_map)
    
    # Create new features
    sample_df['Has_Past_Diagnosis'] = (sample_df['Past Diagnosis'] != 'None').astype(int)
    sample_df['Is_Vaccinated'] = (sample_df['Vaccination_Status'] == 'Vaccinated').astype(int)
    sample_df['Combined_Severity'] = sample_df['Symptom 1_Severity_Value'].fillna(0) + sample_df['Symptom 2_Severity_Value'].fillna(0)
    sample_df['Age_Weight_Ratio'] = sample_df['Age (years)'] / sample_df['Weight (kg)'].replace(0, 0.001)
    sample_df['Duration_Ratio'] = sample_df['Symptom 1_Duration_Days'] / sample_df['Symptom 2_Duration_Days'].replace(0, 0.001)
    
    # Replace infinities with NaN
    sample_df.replace([np.inf, -np.inf], np.nan, inplace=True)
    
    return sample_df

def test_model(model, feature_names, sample_df):
    """Test the model with sample data"""
    # Prepare features
    X = sample_df[feature_names]
    
    # Get actual values
    y_actual = sample_df['Future Disease']
    
    # Make predictions
    y_pred = model.predict(X)
    
    # Create results DataFrame
    results = pd.DataFrame({
        'Breed': sample_df['Breed'],
        'Age': sample_df['Age (years)'],
        'Weight': sample_df['Weight (kg)'],
        'Symptom 1': sample_df['Symptom 1'],
        'Symptom 2': sample_df['Symptom 2'],
        'Actual Disease': y_actual,
        'Predicted Disease': y_pred,
        'Correct': y_actual == y_pred
    })
    
    return results

def main():
    """Main function to test the new models"""
    # Load data
    df = pd.read_csv(DATA_PATH)
    
    # Species to test
    species_list = ['Cat', 'Dog', 'Hamster', 'Rabbit']
    
    for species in species_list:
        print(f"\n{'='*50}")
        print(f"Testing model for {species}")
        print(f"{'='*50}")
        
        # Load model
        model, feature_names = load_model(species)
        
        if model is not None and feature_names is not None:
            # Prepare sample data
            sample_df = prepare_sample_data(df, species)
            
            # Test model
            results = test_model(model, feature_names, sample_df)
            
            # Print results
            print(results)
            
            # Calculate accuracy
            accuracy = results['Correct'].mean()
            print(f"\nTest accuracy: {accuracy:.4f}")
        
        print(f"Completed testing for {species}")

if __name__ == "__main__":
    main()