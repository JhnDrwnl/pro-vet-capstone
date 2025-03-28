import pandas as pd
import numpy as np
from sklearn.feature_selection import SelectKBest, f_classif, f_regression, mutual_info_classif, mutual_info_regression

def select_features(X, y, problem_type='classification', method='all', k=10):
    """
    Selects the most important features from the dataset.
    
    Args:
        X (pandas.DataFrame): The feature matrix.
        y (pandas.Series): The target variable.
        problem_type (str): 'classification' or 'regression'.
        method (str): Method to use for feature selection ('all', 'f_test', 'mutual_info').
        k (int): Number of features to select.
        
    Returns:
        list: List of selected feature names.
    """
    print(f"Performing feature selection using {method} method...")
    
    # Check for categorical columns and handle them
    categorical_columns = X.select_dtypes(include=['object', 'category']).columns
    if len(categorical_columns) > 0:
        print(f"Found {len(categorical_columns)} categorical columns that need encoding: {list(categorical_columns)}")
        
        # One-hot encode remaining categorical columns
        X_encoded = pd.get_dummies(X, columns=categorical_columns, drop_first=True)
        print(f"After encoding all categorical features, shape: {X_encoded.shape}")
    else:
        X_encoded = X
        print("No categorical columns found, proceeding with feature selection.")
    
    # Adjust k if it's larger than the number of features
    k = min(k, X_encoded.shape[1])
    print(f"Selecting top {k} features from {X_encoded.shape[1]} total features")
    
    # Choose the appropriate scoring function based on the problem type
    if problem_type == 'classification':
        f_test_score_func = f_classif
        mi_score_func = mutual_info_classif
    else:  # regression
        f_test_score_func = f_regression
        mi_score_func = mutual_info_regression
    
    selected_features = []
    
    if method in ['all', 'f_test']:
        # F-test based feature selection
        print("Using F-test for feature selection")
        try:
            f_selector = SelectKBest(f_test_score_func, k=k)
            f_selector.fit(X_encoded, y)
            f_support = f_selector.get_support()
            f_selected_features = X_encoded.columns[f_support].tolist()
            print(f"F-test selected features: {f_selected_features}")
            selected_features.extend(f_selected_features)
        except Exception as e:
            print(f"Error in F-test feature selection: {str(e)}")
            print("Skipping F-test feature selection")
    
    if method in ['all', 'mutual_info']:
        # Mutual information based feature selection
        print("Using mutual information for feature selection")
        try:
            mi_selector = SelectKBest(mi_score_func, k=k)
            mi_selector.fit(X_encoded, y)
            mi_support = mi_selector.get_support()
            mi_selected_features = X_encoded.columns[mi_support].tolist()
            print(f"Mutual information selected features: {mi_selected_features}")
            selected_features.extend(mi_selected_features)
        except Exception as e:
            print(f"Error in mutual information feature selection: {str(e)}")
            print("Skipping mutual information feature selection")
    
    # Remove duplicates while preserving order
    unique_selected_features = []
    for feature in selected_features:
        if feature not in unique_selected_features:
            unique_selected_features.append(feature)
    
    # If no features were selected, use all features
    if not unique_selected_features:
        print("No features were selected. Using all features.")
        unique_selected_features = X_encoded.columns.tolist()
    
    print(f"Selected {len(unique_selected_features)} features")
    
    # Map back to original features if possible
    # This is tricky because one-hot encoding creates new feature names
    # For now, we'll just return the selected features from the encoded dataframe
    
    # Create a mapping from encoded features back to original features
    original_to_encoded = {}
    for col in X.columns:
        if col in X_encoded.columns:
            original_to_encoded[col] = [col]  # Direct mapping for numeric features
        else:
            # For categorical features, find all one-hot encoded columns
            encoded_cols = [c for c in X_encoded.columns if c.startswith(f"{col}_")]
            if encoded_cols:
                original_to_encoded[col] = encoded_cols
    
    # Check which original features have at least one encoded feature selected
    original_selected = []
    for orig_col, encoded_cols in original_to_encoded.items():
        if any(enc_col in unique_selected_features for enc_col in encoded_cols):
            original_selected.append(orig_col)
    
    print(f"Mapped back to {len(original_selected)} original features: {original_selected}")
    
    # Return both the encoded features (for model training) and original features (for reference)
    return unique_selected_features