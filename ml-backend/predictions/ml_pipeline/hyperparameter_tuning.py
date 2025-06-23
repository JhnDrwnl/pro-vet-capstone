import os
import pandas as pd
import numpy as np
import pickle
from sklearn.model_selection import train_test_split, GridSearchCV
from sklearn.ensemble import RandomForestClassifier, GradientBoostingClassifier
from sklearn.metrics import accuracy_score, classification_report
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import StandardScaler, OneHotEncoder
from sklearn.compose import ColumnTransformer
from sklearn.impute import SimpleImputer
import json
from pathlib import Path

# Set paths
BASE_DIR = Path(__file__).resolve().parent.parent.parent  # This points to ml-backend
DATA_PATH = os.path.join(BASE_DIR, 'PredictedDiseaseDataset.csv')  # Dataset in ml-backend
OUTPUT_DIR = os.path.join(BASE_DIR, 'retrained_models')

def load_and_prepare_data(species):
    """Load and prepare data for a specific species"""
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
    categorical_features = [f for f in categorical_features if f in species_df.columns]
    numeric_features = [f for f in numeric_features if f in species_df.columns]
    
    # Define target
    target = 'Future Disease'
    
    # Create feature and target arrays
    X = species_df[categorical_features + numeric_features]
    y = species_df[target]
    
    # Split into train and test sets
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42, stratify=y)
    
    return X_train, X_test, y_train, y_test, categorical_features, numeric_features

def tune_hyperparameters(X_train, y_train, categorical_features, numeric_features):
    """Tune hyperparameters for the model"""
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
    
    # Define the model pipeline
    pipeline = Pipeline(steps=[
        ('preprocessor', preprocessor),
        ('classifier', RandomForestClassifier(random_state=42))
    ])
    
    # Define hyperparameter grid
    param_grid = {
        'classifier__n_estimators': [50, 100, 200],
        'classifier__max_depth': [None, 10, 20, 30],
        'classifier__min_samples_split': [2, 5, 10],
        'classifier__min_samples_leaf': [1, 2, 4]
    }
    
    # Create grid search
    grid_search = GridSearchCV(
        pipeline,
        param_grid=param_grid,
        cv=5,
        scoring='accuracy',
        n_jobs=-1,
        verbose=1
    )
    
    # Fit grid search
    print("Starting hyperparameter tuning...")
    grid_search.fit(X_train, y_train)
    
    # Print best parameters
    print(f"Best parameters: {grid_search.best_params_}")
    print(f"Best cross-validation score: {grid_search.best_score_:.4f}")
    
    return grid_search.best_estimator_, grid_search.best_params_, grid_search.best_score_

def evaluate_tuned_model(model, X_test, y_test):
    """Evaluate the tuned model"""
    y_pred = model.predict(X_test)
    
    # Calculate accuracy
    accuracy = accuracy_score(y_test, y_pred)
    
    # Print classification report
    print(f"Test accuracy: {accuracy:.4f}")
    print(classification_report(y_test, y_pred))
    
    return accuracy, classification_report(y_test, y_pred, output_dict=True)

def save_tuned_model(model, best_params, cv_score, test_metrics, feature_names, species):
    """Save the tuned model and metrics"""
    # Create species directory if it doesn't exist
    species_dir = os.path.join(OUTPUT_DIR, species.lower())
    os.makedirs(species_dir, exist_ok=True)
    
    # Save model
    model_path = os.path.join(species_dir, 'tuned_model.pkl')
    with open(model_path, 'wb') as f:
        pickle.dump(model, f)
    
    # Save metrics
    metrics = {
        'best_params': best_params,
        'cv_score': cv_score,
        'test_accuracy': test_metrics[0],
        'classification_report': test_metrics[1]
    }
    
    metrics_path = os.path.join(species_dir, 'tuned_metrics.json')
    with open(metrics_path, 'w') as f:
        json.dump(metrics, f, indent=4)
    
    # Save feature names
    feature_names_path = os.path.join(species_dir, 'feature_names.pkl')
    with open(feature_names_path, 'wb') as f:
        pickle.dump(feature_names, f)
    
    print(f"Tuned model, metrics, and feature names saved to {species_dir}")

def main():
    """Main function to run hyperparameter tuning"""
    # Species to tune
    species_list = ['Cat', 'Dog', 'Hamster', 'Rabbit']
    
    for species in species_list:
        print(f"\n{'='*50}")
        print(f"Tuning model for {species}")
        print(f"{'='*50}")
        
        # Load and prepare data
        X_train, X_test, y_train, y_test, categorical_features, numeric_features = load_and_prepare_data(species)
        
        # Tune hyperparameters
        best_model, best_params, cv_score = tune_hyperparameters(X_train, y_train, categorical_features, numeric_features)
        
        # Evaluate tuned model
        test_metrics = evaluate_tuned_model(best_model, X_test, y_test)
        
        # Save tuned model
        feature_names = categorical_features + numeric_features
        save_tuned_model(best_model, best_params, cv_score, test_metrics, feature_names, species)
        
        print(f"Completed tuning for {species}")

if __name__ == "__main__":
    main()