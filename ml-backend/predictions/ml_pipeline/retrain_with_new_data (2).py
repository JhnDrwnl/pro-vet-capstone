import os
import pandas as pd
import numpy as np
import pickle
import json
from sklearn.model_selection import train_test_split, GridSearchCV
from sklearn.preprocessing import LabelEncoder, StandardScaler, OneHotEncoder
from sklearn.ensemble import RandomForestClassifier, GradientBoostingClassifier
from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score, classification_report
from sklearn.pipeline import Pipeline
from sklearn.compose import ColumnTransformer
from sklearn.impute import SimpleImputer
import matplotlib.pyplot as plt
import seaborn as sns
from pathlib import Path

# Set paths
BASE_DIR = Path(__file__).resolve().parent.parent.parent.parent
DATA_PATH = os.path.join(BASE_DIR, 'ml-backend/PredictedDiseaseDataset.csv')
OUTPUT_DIR = os.path.join(BASE_DIR, 'retrained_models')

# Create output directory if it doesn't exist
os.makedirs(OUTPUT_DIR, exist_ok=True)

def load_and_clean_data(file_path):
    """Load and perform initial cleaning of the dataset"""
    print(f"Loading data from {file_path}")
    df = pd.read_csv(file_path)
    
    # Drop any unnamed columns
    df = df.loc[:, ~df.columns.str.contains('^Unnamed')]
    
    # Check for missing values
    print(f"Missing values before cleaning:\n{df.isnull().sum()}")
    
    # Convert numeric columns
    numeric_cols = ['Age (years)', 'Weight (kg)']
    for col in numeric_cols:
        df[col] = pd.to_numeric(df[col], errors='coerce')
    
    # Extract duration in days
    def extract_days(duration_str):
        if pd.isna(duration_str):
            return np.nan
        try:
            return float(duration_str.split()[0])
        except:
            return np.nan
    
    df['Symptom 1_Duration_Days'] = df['Symptom 1_Duration'].apply(extract_days)
    df['Symptom 2_Duration_Days'] = df['Symptom 2_Duration'].apply(extract_days)
    
    # Map severity to numeric values
    severity_map = {'Mild': 1, 'Moderate': 2, 'Severe': 3}
    df['Symptom 1_Severity_Value'] = df['Symptom 1_Severity'].map(severity_map)
    df['Symptom 2_Severity_Value'] = df['Symptom 2_Severity'].map(severity_map)
    
    # Fill missing values
    df['Past Diagnosis'].fillna('None', inplace=True)
    
    print(f"Missing values after cleaning:\n{df.isnull().sum()}")
    
    return df

def split_by_species(df):
    """Split the dataset by pet species"""
    species_dfs = {}
    for species in df['Pet Species'].unique():
        species_dfs[species] = df[df['Pet Species'] == species].copy()
        print(f"{species} dataset shape: {species_dfs[species].shape}")
    
    return species_dfs

def feature_engineering(df):
    """Perform feature engineering on the dataset"""
    # Create new features
    df['Has_Past_Diagnosis'] = (df['Past Diagnosis'] != 'None').astype(int)
    df['Is_Vaccinated'] = (df['Vaccination_Status'] == 'Vaccinated').astype(int)
    
    # Symptom severity score (combined)
    df['Combined_Severity'] = df['Symptom 1_Severity_Value'].fillna(0) + df['Symptom 2_Severity_Value'].fillna(0)
    
    # Age-weight ratio (can be useful for some species)
    df['Age_Weight_Ratio'] = df['Age (years)'] / df['Weight (kg)'].replace(0, 0.001)
    
    # Symptom duration ratio
    df['Duration_Ratio'] = df['Symptom 1_Duration_Days'] / df['Symptom 2_Duration_Days'].replace(0, 0.001)
    
    # Replace infinities with NaN
    df.replace([np.inf, -np.inf], np.nan, inplace=True)
    
    return df

def prepare_features_and_target(df):
    """Prepare features and target for model training"""
    # Define feature columns
    categorical_features = ['Breed', 'Age Category', 'Past Diagnosis', 
                           'Symptom 1', 'Symptom 1_Severity', 
                           'Symptom 2', 'Symptom 2_Severity',
                           'Vaccination_Status']
    
    numeric_features = ['Age (years)', 'Weight (kg)', 
                        'Symptom 1_Duration_Days', 'Symptom 2_Duration_Days',
                        'Symptom 1_Severity_Value', 'Symptom 2_Severity_Value',
                        'Has_Past_Diagnosis', 'Is_Vaccinated', 'Combined_Severity',
                        'Age_Weight_Ratio', 'Duration_Ratio']
    
    # Remove any features that don't exist in the dataframe
    categorical_features = [f for f in categorical_features if f in df.columns]
    numeric_features = [f for f in numeric_features if f in df.columns]
    
    # Define target
    target = 'Future Disease'
    
    # Create feature and target arrays
    X = df[categorical_features + numeric_features]
    y = df[target]
    
    return X, y, categorical_features, numeric_features

def build_and_train_model(X_train, y_train, categorical_features, numeric_features):
    """Build and train a model with the given features"""
    # Preprocessing for categorical features
    categorical_transformer = Pipeline(steps=[
        ('imputer', SimpleImputer(strategy='constant', fill_value='missing')),
        ('onehot', OneHotEncoder(handle_unknown='ignore'))
    ])
    
    # Preprocessing for numerical features
    numeric_transformer = Pipeline(steps=[
        ('imputer', SimpleImputer(strategy='median')),
        ('scaler', StandardScaler())
    ])
    
    # Combine preprocessing steps
    preprocessor = ColumnTransformer(
        transformers=[
            ('num', numeric_transformer, numeric_features),
            ('cat', categorical_transformer, categorical_features)
        ])
    
    # Create and train the model
    model = Pipeline(steps=[
        ('preprocessor', preprocessor),
        ('classifier', RandomForestClassifier(n_estimators=100, random_state=42))
    ])
    
    # Train the model
    model.fit(X_train, y_train)
    
    return model

def evaluate_model(model, X_test, y_test):
    """Evaluate the model and return metrics"""
    y_pred = model.predict(X_test)
    
    # Calculate metrics
    accuracy = accuracy_score(y_test, y_pred)
    precision = precision_score(y_test, y_pred, average='weighted')
    recall = recall_score(y_test, y_pred, average='weighted')
    f1 = f1_score(y_test, y_pred, average='weighted')
    
    # Print classification report
    print(classification_report(y_test, y_pred))
    
    # Create metrics dictionary
    metrics = {
        'accuracy': accuracy,
        'precision': precision,
        'recall': recall,
        'f1_score': f1
    }
    
    return metrics, y_pred

def save_model_and_metrics(model, metrics, feature_names, species, output_dir):
    """Save the model, metrics, and feature names"""
    # Create species directory if it doesn't exist
    species_dir = os.path.join(output_dir, species.lower())
    os.makedirs(species_dir, exist_ok=True)
    
    # Save model
    model_path = os.path.join(species_dir, 'model.pkl')
    with open(model_path, 'wb') as f:
        pickle.dump(model, f)
    
    # Save metrics
    metrics_path = os.path.join(species_dir, 'metrics.json')
    with open(metrics_path, 'w') as f:
        json.dump(metrics, f, indent=4)
    
    # Save feature names
    feature_names_path = os.path.join(species_dir, 'feature_names.pkl')
    with open(feature_names_path, 'wb') as f:
        pickle.dump(feature_names, f)
    
    print(f"Model, metrics, and feature names saved to {species_dir}")

def plot_feature_importance(model, feature_names, species, output_dir):
    """Plot feature importance for the model"""
    # Get feature importance from the model
    try:
        # For models with feature_importances_ attribute (like RandomForest)
        importances = model.named_steps['classifier'].feature_importances_
        
        # Get feature names from the preprocessor
        feature_names_out = []
        for name, transformer, features in model.named_steps['preprocessor'].transformers_:
            if name == 'cat':
                # For categorical features, get the one-hot encoded feature names
                for i, feature in enumerate(features):
                    feature_names_out.extend([f"{feature}_{val}" for val in 
                                             transformer.named_steps['onehot'].categories_[i]])
            else:
                # For numerical features, use the original feature names
                feature_names_out.extend(features)
        
        # Create a DataFrame for feature importance
        feature_importance = pd.DataFrame({
            'Feature': feature_names_out,
            'Importance': importances
        })
        
        # Sort by importance
        feature_importance = feature_importance.sort_values('Importance', ascending=False)
        
        # Plot top 20 features
        plt.figure(figsize=(12, 8))
        sns.barplot(x='Importance', y='Feature', data=feature_importance.head(20))
        plt.title(f'Top 20 Feature Importance for {species}')
        plt.tight_layout()
        
        # Save plot
        species_dir = os.path.join(output_dir, species.lower())
        plt.savefig(os.path.join(species_dir, 'feature_importance.png'))
        plt.close()
    except:
        print(f"Could not plot feature importance for {species}")

def main():
    """Main function to run the retraining pipeline"""
    # Load and clean data
    df = load_and_clean_data(DATA_PATH)
    
    # Split by species
    species_dfs = split_by_species(df)
    
    # Process each species
    for species, species_df in species_dfs.items():
        print(f"\n{'='*50}")
        print(f"Processing {species}")
        print(f"{'='*50}")
        
        # Feature engineering
        species_df = feature_engineering(species_df)
        
        # Prepare features and target
        X, y, categorical_features, numeric_features = prepare_features_and_target(species_df)
        
        # Split into train and test sets
        X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42, stratify=y)
        
        print(f"Training set size: {X_train.shape}")
        print(f"Test set size: {X_test.shape}")
        
        # Build and train model
        model = build_and_train_model(X_train, y_train, categorical_features, numeric_features)
        
        # Evaluate model
        metrics, y_pred = evaluate_model(model, X_test, y_test)
        
        # Save model and metrics
        feature_names = categorical_features + numeric_features
        save_model_and_metrics(model, metrics, feature_names, species, OUTPUT_DIR)
        
        # Plot feature importance
        plot_feature_importance(model, feature_names, species, OUTPUT_DIR)
        
        print(f"Completed processing for {species}")

if __name__ == "__main__":
    main()