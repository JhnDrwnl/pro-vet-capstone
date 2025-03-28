import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
from sklearn.inspection import permutation_importance

def analyze_feature_importance(model, X_train, y_train, feature_names, n_repeats=10, random_state=42):
    """
    Analyzes feature importance for the trained model.
    
    Args:
        model: The trained model.
        X_train (pandas.DataFrame): Training feature matrix.
        y_train (pandas.Series): Training target variable.
        feature_names (list): List of feature names.
        n_repeats (int): Number of times to permute each feature.
        random_state (int): Random seed for reproducibility.
        
    Returns:
        dict: Dictionary mapping feature names to importance scores.
    """
    print("Analyzing feature importance...")
    
    # Try to get feature importance directly from the model
    feature_importance = {}
    
    try:
        # For models with feature_importances_ attribute (e.g., tree-based models)
        if hasattr(model, 'feature_importances_'):
            importances = model.feature_importances_
            for i, importance in enumerate(importances):
                feature_importance[feature_names[i]] = float(importance)
            
            # Sort features by importance
            sorted_features = sorted(feature_importance.items(), key=lambda x: x[1], reverse=True)
            
            print("\nFeature Importance (from model):")
            for feature, importance in sorted_features:
                print(f"{feature}: {importance:.4f}")
            
            return dict(sorted_features)
    
    except Exception as e:
        print(f"Could not get feature importance directly from model: {str(e)}")
    
    # If direct method fails, use permutation importance
    try:
        print("Using permutation importance...")
        
        # Convert X_train to numpy array if it's a DataFrame
        X_train_array = X_train.values if hasattr(X_train, 'values') else X_train
        
        # Calculate permutation importance
        perm_importance = permutation_importance(
            model, X_train_array, y_train, n_repeats=n_repeats, random_state=random_state
        )
        
        # Map importance scores to feature names
        for i, importance in enumerate(perm_importance.importances_mean):
            feature_importance[feature_names[i]] = float(importance)
        
        # Sort features by importance
        sorted_features = sorted(feature_importance.items(), key=lambda x: x[1], reverse=True)
        
        print("\nFeature Importance (permutation method):")
        for feature, importance in sorted_features:
            print(f"{feature}: {importance:.4f}")
        
        return dict(sorted_features)
    
    except Exception as e:
        print(f"Could not calculate permutation importance: {str(e)}")
        
        # If all methods fail, return empty dictionary
        print("Could not determine feature importance.")
        return {}