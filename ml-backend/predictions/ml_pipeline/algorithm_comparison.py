import os
import pandas as pd
import numpy as np
import pickle
from sklearn.model_selection import train_test_split, cross_val_score
from sklearn.ensemble import RandomForestClassifier, GradientBoostingClassifier, AdaBoostClassifier
from sklearn.svm import SVC
from sklearn.neighbors import KNeighborsClassifier
from sklearn.neural_network import MLPClassifier
from sklearn.metrics import accuracy_score, classification_report
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import StandardScaler, OneHotEncoder
from sklearn.compose import ColumnTransformer
from sklearn.impute import SimpleImputer
import json
import matplotlib.pyplot as plt
from pathlib import Path

# Set paths
BASE_DIR = Path(__file__).resolve().parent.parent.parent.parent
DATA_PATH = os.path.join(BASE_DIR, 'ml-backend/PredictedDiseaseDataset.csv')
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

def compare_algorithms(X_train, X_test, y_train, y_test, categorical_features, numeric_features):
    """Compare different algorithms"""
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
    
    # Define algorithms to compare
    algorithms = {
        'Random Forest': RandomForestClassifier(n_estimators=100, random_state=42),
        'Gradient Boosting': GradientBoostingClassifier(n_estimators=100, random_state=42),
        'AdaBoost': AdaBoostClassifier(n_estimators=100, random_state=42),
        'SVM': SVC(probability=True, random_state=42),
        'K-Nearest Neighbors': KNeighborsClassifier(n_neighbors=5),
        'Neural Network': MLPClassifier(hidden_layer_sizes=(100,), max_iter=1000, random_state=42)
    }
    
    # Compare algorithms
    results = {}
    
    for name, algorithm in algorithms.items():
        print(f"Evaluating {name}...")
        
        # Create pipeline
        pipeline = Pipeline(steps=[
            ('preprocessor', preprocessor),
            ('classifier', algorithm)
        ])
        
        # Fit pipeline
        pipeline.fit(X_train, y_train)
        
        # Make predictions
        y_pred = pipeline.predict(X_test)
        
        # Calculate metrics
        accuracy = accuracy_score(y_test, y_pred)
        report = classification_report(y_test, y_pred, output_dict=True)
        
        # Perform cross-validation
        cv_scores = cross_val_score(pipeline, X_train, y_train, cv=5, scoring='accuracy')
        
        # Store results
        results[name] = {
            'accuracy': accuracy,
            'cv_mean': cv_scores.mean(),
            'cv_std': cv_scores.std(),
            'report': report,
            'model': pipeline
        }
        
        print(f"{name} - Test Accuracy: {accuracy:.4f}, CV Accuracy: {cv_scores.mean():.4f} ± {cv_scores.std():.4f}")
    
    return results

def plot_algorithm_comparison(results, species):
    """Plot algorithm comparison results"""
    # Extract accuracies
    names = list(results.keys())
    test_accuracies = [results[name]['accuracy'] for name in names]
    cv_means = [results[name]['cv_mean'] for name in names]
    cv_stds = [results[name]['cv_std'] for name in names]
    
    # Create figure
    plt.figure(figsize=(12, 6))
    
    # Plot test accuracies
    plt.bar(names, test_accuracies, alpha=0.7, label='Test Accuracy')
    
    # Plot CV accuracies with error bars
    plt.errorbar(names, cv_means, yerr=cv_stds, fmt='o', color='red', 
                 ecolor='black', elinewidth=2, capsize=5, label='CV Accuracy')
    
    # Add labels and title
    plt.xlabel('Algorithm')
    plt.ylabel('Accuracy')
    plt.title(f'Algorithm Comparison for {species}')
    plt.xticks(rotation=45)
    plt.ylim(0.5, 1.0)  # Adjust as needed
    plt.legend()
    plt.tight_layout()
    
    # Save plot
    species_dir = os.path.join(OUTPUT_DIR, species.lower())
    os.makedirs(species_dir, exist_ok=True)
    plt.savefig(os.path.join(species_dir, 'algorithm_comparison.png'))
    plt.close()

def save_best_model(results, feature_names, species):
    """Save the best model based on test accuracy"""
    # Find best model
    best_name = max(results, key=lambda x: results[x]['accuracy'])
    best_model = results[best_name]['model']
    best_accuracy = results[best_name]['accuracy']
    best_cv = results[best_name]['cv_mean']
    best_report = results[best_name]['report']
    
    print(f"Best model for {species}: {best_name} with accuracy {best_accuracy:.4f}")
    
    # Create species directory if it doesn't exist
    species_dir = os.path.join(OUTPUT_DIR, species.lower())
    os.makedirs(species_dir, exist_ok=True)
    
    # Save model
    model_path = os.path.join(species_dir, 'best_model.pkl')
    with open(model_path, 'wb') as f:
        pickle.dump(best_model, f)
    
    # Save metrics
    metrics = {
        'best_algorithm': best_name,
        'test_accuracy': best_accuracy,
        'cv_accuracy': best_cv,
        'classification_report': best_report
    }
    
    metrics_path = os.path.join(species_dir, 'best_metrics.json')
    with open(metrics_path, 'w') as f:
        json.dump(metrics, f, indent=4)
    
    # Save feature names
    feature_names_path = os.path.join(species_dir, 'feature_names.pkl')
    with open(feature_names_path, 'wb') as f:
        pickle.dump(feature_names, f)
    
    print(f"Best model, metrics, and feature names saved to {species_dir}")

def main():
    """Main function to compare algorithms"""
    # Species to compare
    species_list = ['Cat', 'Dog', 'Hamster', 'Rabbit']
    
    for species in species_list:
        print(f"\n{'='*50}")
        print(f"Comparing algorithms for {species}")
        print(f"{'='*50}")
        
        # Load and prepare data
        X_train, X_test, y_train, y_test, categorical_features, numeric_features = load_and_prepare_data(species)
        
        # Compare algorithms
        results = compare_algorithms(X_train, X_test, y_train, y_test, categorical_features, numeric_features)
        
        # Plot comparison
        plot_algorithm_comparison(results, species)
        
        # Save best model
        feature_names = categorical_features + numeric_features
        save_best_model(results, feature_names, species)
        
        print(f"Completed algorithm comparison for {species}")

if __name__ == "__main__":
    main()