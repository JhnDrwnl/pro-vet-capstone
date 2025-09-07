import os
import pickle
import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
import seaborn as sns
from sklearn.metrics import confusion_matrix
from pathlib import Path

# Set paths
BASE_DIR = Path(__file__).resolve().parent.parent.parent.parent
DATA_PATH = os.path.join(BASE_DIR, 'ml-backend/PredictedDiseaseDataset.csv')
MODELS_DIR = os.path.join(BASE_DIR, 'retrained_models')

def load_model_and_data(species):
    """Load model and prepare test data for a specific species"""
    # Load model
    model_path = os.path.join(MODELS_DIR, species.lower(), 'model.pkl')
    feature_names_path = os.path.join(MODELS_DIR, species.lower(), 'feature_names.pkl')
    
    if not os.path.exists(model_path) or not os.path.exists(feature_names_path):
        print(f"Model or feature names not found for {species}")
        return None, None, None
    
    with open(model_path, 'rb') as f:
        model = pickle.load(f)
    
    with open(feature_names_path, 'rb') as f:
        feature_names = pickle.load(f)
    
    # Load data
    df = pd.read_csv(DATA_PATH)
    
    # Filter by species
    species_df = df[df['Pet Species'] == species].copy()
    
    # Feature engineering (same as in retrain_with_new_data.py)
    # Extract duration in days
    def extract_days(duration_str):
        if pd.isna(duration_str):
            return np.nan
        try:
            return float(duration_str.split()[0])
        except:
            return np.nan
    
    species_df['Symptom 1_Duration_Days'] = species_df['Symptom 1_Duration'].apply(extract_days)
    species_df['Symptom 2_Duration_Days'] = species_df['Symptom 2_Duration'].apply(extract_days)
    
    # Map severity to numeric values
    severity_map = {'Mild': 1, 'Moderate': 2, 'Severe': 3}
    species_df['Symptom 1_Severity_Value'] = species_df['Symptom 1_Severity'].map(severity_map)
    species_df['Symptom 2_Severity_Value'] = species_df['Symptom 2_Severity'].map(severity_map)
    
    # Create new features
    species_df['Has_Past_Diagnosis'] = (species_df['Past Diagnosis'] != 'None').astype(int)
    species_df['Is_Vaccinated'] = (species_df['Vaccination_Status'] == 'Vaccinated').astype(int)
    species_df['Combined_Severity'] = species_df['Symptom 1_Severity_Value'].fillna(0) + species_df['Symptom 2_Severity_Value'].fillna(0)
    species_df['Age_Weight_Ratio'] = species_df['Age (years)'] / species_df['Weight (kg)'].replace(0, 0.001)
    species_df['Duration_Ratio'] = species_df['Symptom 1_Duration_Days'] / species_df['Symptom 2_Duration_Days'].replace(0, 0.001)
    
    # Replace infinities with NaN
    species_df.replace([np.inf, -np.inf], np.nan, inplace=True)
    
    # Create feature and target arrays
    X = species_df[feature_names]
    y = species_df['Future Disease']
    
    return model, X, y

def plot_confusion_matrix(model, X, y, species):
    """Plot confusion matrix for the model"""
    # Make predictions
    y_pred = model.predict(X)
    
    # Get unique classes
    classes = np.unique(y)
    
    # Calculate confusion matrix
    cm = confusion_matrix(y, y_pred, labels=classes)
    
    # Normalize confusion matrix
    cm_normalized = cm.astype('float') / cm.sum(axis=1)[:, np.newaxis]
    
    # Create figure
    plt.figure(figsize=(12, 10))
    
    # Plot confusion matrix
    sns.heatmap(cm_normalized, annot=True, fmt='.2f', cmap='Blues', 
                xticklabels=classes, yticklabels=classes)
    
    # Add labels and title
    plt.xlabel('Predicted')
    plt.ylabel('Actual')
    plt.title(f'Confusion Matrix for {species}')
    
    # Rotate x-axis labels
    plt.xticks(rotation=45, ha='right')
    plt.yticks(rotation=45)
    
    # Adjust layout
    plt.tight_layout()
    
    # Save plot
    species_dir = os.path.join(MODELS_DIR, species.lower())
    os.makedirs(species_dir, exist_ok=True)
    plt.savefig(os.path.join(species_dir, 'confusion_matrix.png'))
    plt.close()
    
    print(f"Confusion matrix saved to {os.path.join(species_dir, 'confusion_matrix.png')}")

def main():
    """Main function to visualize confusion matrices"""
    # Species to visualize
    species_list = ['Cat', 'Dog', 'Hamster', 'Rabbit']
    
    for species in species_list:
        print(f"\n{'='*50}")
        print(f"Visualizing confusion matrix for {species}")
        print(f"{'='*50}")
        
        # Load model and data
        model, X, y = load_model_and_data(species)
        
        if model is not None and X is not None and y is not None:
            # Plot confusion matrix
            plot_confusion_matrix(model, X, y, species)
            
            print(f"Completed visualization for {species}")
        else:
            print(f"Skipping visualization for {species}")

if __name__ == "__main__":
    main()