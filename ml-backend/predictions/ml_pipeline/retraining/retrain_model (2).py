import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
import os
import sys
import joblib
from sklearn.model_selection import train_test_split
import json

# Add the current directory to the path
current_dir = os.path.dirname(os.path.abspath(__file__))
if current_dir not in sys.path:
    sys.path.append(current_dir)

# Import custom modules - try both relative and direct imports
try:
    # Try direct imports first
    from data_cleaning import clean_data
    from exploratory_analysis import perform_eda
    from feature_engineering import engineer_features
    from feature_selection import select_features
    from baseline_model import train_baseline
    from model_comparison import compare_models
    from hyperparameter_tuning import tune_hyperparameters
    from model_evaluation import evaluate_model
    from feature_importance import analyze_feature_importance
    from model_optimization import diagnose_model_fit, address_overfitting, address_underfitting
except ImportError:
    # If direct imports fail, try relative imports
    from .data_cleaning import clean_data
    from .exploratory_analysis import perform_eda
    from .feature_engineering import engineer_features
    from .feature_selection import select_features
    from .baseline_model import train_baseline
    from .model_comparison import compare_models
    from .hyperparameter_tuning import tune_hyperparameters
    from .model_evaluation import evaluate_model
    from .feature_importance import analyze_feature_importance
    from .model_optimization import diagnose_model_fit, address_overfitting, address_underfitting

def retrain_model(data_path, target_column, problem_type='classification', 
                 test_size=0.2, random_state=42, output_dir='model_output'):
    """
    Complete pipeline for retraining a machine learning model
    
    Parameters:
    -----------
    data_path : str
        Path to the dataset
    target_column : str
        Name of the target column
    problem_type : str
        'classification' or 'regression'
    test_size : float
        Proportion of the dataset to include in the test split
    random_state : int
        Random seed for reproducibility
    output_dir : str
        Directory to save model artifacts
    
    Returns:
    --------
    best_model : estimator
        The best trained model
    metrics : dict
        Performance metrics
    """
    
    # Create output directory
    os.makedirs(output_dir, exist_ok=True)
    
    # Step 1: Data Cleaning
    print("Step 1: Data Cleaning")
    df = clean_data(data_path)
    
    # Step 2: Exploratory Data Analysis
    print("\nStep 2: Exploratory Data Analysis")
    correlation = perform_eda(df, target_column)
    
    # Step 3: Feature Engineering
    print("\nStep 3: Feature Engineering")
    df_engineered = engineer_features(df)
    
    # Step 4: Split data into features and target
    X = df_engineered.drop(columns=[target_column])
    y = df_engineered[target_column]
    
    # Step 5: Feature Selection
    print("\nStep 5: Feature Selection")
    selected_features = select_features(X, y, problem_type, method='all')
    
    # Handle categorical features for model training
    categorical_columns = X.select_dtypes(include=['object', 'category']).columns
    if len(categorical_columns) > 0:
        print(f"Encoding {len(categorical_columns)} categorical columns for model training")
        X_encoded = pd.get_dummies(X, columns=categorical_columns, drop_first=True)
    else:
        X_encoded = X
    
    # Filter to selected features
    # We need to check if the selected features exist in X_encoded
    valid_features = [f for f in selected_features if f in X_encoded.columns]
    if len(valid_features) < len(selected_features):
        print(f"Warning: {len(selected_features) - len(valid_features)} selected features not found in encoded dataset")
    
    if valid_features:
        X_selected = X_encoded[valid_features]
    else:
        print("No valid features selected. Using all features.")
        X_selected = X_encoded
    
    print(f"Final feature matrix shape: {X_selected.shape}")
    
    # Step 6: Split data into train and test sets
    X_train, X_test, y_train, y_test = train_test_split(
        X_selected, y, test_size=test_size, random_state=random_state,
        stratify=y if problem_type == 'classification' and len(y.unique()) > 1 else None
    )
    
    # Step 7: Train a baseline model
    print("\nStep 7: Train a baseline model")
    baseline_model, baseline_metrics = train_baseline(X_train, y_train, X_test, y_test, problem_type)
    
    # Step 8: Compare different models
    print("\nStep 8: Compare different models")
    model_results, best_model_name = compare_models(X_train, y_train, problem_type)
    
    # Step 9: Hyperparameter tuning for the best model
    print("\nStep 9: Hyperparameter tuning")
    best_model, best_params = tune_hyperparameters(
        X_train, y_train, best_model_name, problem_type, method='grid'
    )
    
    # Step 10: Evaluate the best model
    print("\nStep 10: Evaluate the best model")
    metrics = evaluate_model(best_model, X_train, y_train, X_test, y_test, problem_type)
    
    # Step 11: Analyze feature importance
    print("\nStep 11: Analyze feature importance")
    feature_importance = analyze_feature_importance(best_model, X_train, y_train, X_selected.columns)
    
    # Step 12: Diagnose and address overfitting/underfitting
    print("\nStep 12: Diagnose and address overfitting/underfitting")
    diagnosis = diagnose_model_fit(best_model, X_train, y_train, X_test, y_test, problem_type)
    
    if diagnosis == 'overfitting':
        print("\nAddressing overfitting...")
        best_model = address_overfitting(best_model_name, X_train, y_train, X_test, y_test, problem_type)
    elif diagnosis == 'underfitting':
        print("\nAddressing underfitting...")
        best_model, X_train, X_test = address_underfitting(
            best_model_name, X_train, y_train, X_test, y_test, problem_type
        )
    
    # Step 13: Final evaluation
    print("\nStep 13: Final evaluation")
    final_metrics = evaluate_model(best_model, X_train, y_train, X_test, y_test, problem_type)
    
    # Step 14: Save the model and artifacts
    print("\nStep 14: Save the model and artifacts")
    model_path = os.path.join(output_dir, 'best_model.pkl')
    joblib.dump(best_model, model_path)
    print(f"Model saved to {model_path}")
    
    # Save feature names
    feature_names_path = os.path.join(output_dir, 'feature_names.pkl')
    joblib.dump(X_train.columns.tolist(), feature_names_path)
    print(f"Feature names saved to {feature_names_path}")
    
    # Save metrics
    metrics_path = os.path.join(output_dir, 'metrics.json')
    with open(metrics_path, 'w') as f:
        json.dump(final_metrics, f, indent=4)
    print(f"Metrics saved to {metrics_path}")
    
    # Save feature importance
    importance_path = os.path.join(output_dir, 'feature_importance.json')
    with open(importance_path, 'w') as f:
        json.dump(feature_importance, f, indent=4)
    print(f"Feature importance saved to {importance_path}")
    
    return best_model, final_metrics