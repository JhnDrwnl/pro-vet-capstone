import pandas as pd
import numpy as np
from sklearn.feature_selection import SelectFromModel
from sklearn.ensemble import RandomForestClassifier

def better_select_features(X, y, problem_type='classification', max_features=100):
    """
    Better feature selection using embedded methods like Random Forest importance.
    
    Args:
        X (pandas.DataFrame): The feature matrix.
        y (pandas.Series): The target variable.
        problem_type (str): 'classification' or 'regression'.
        max_features (int): Maximum number of features to select.
        
    Returns:
        list: List of selected feature names.
    """
    print(f"Performing improved feature selection...")
    
    # Check for categorical columns and handle them
    categorical_columns = X.select_dtypes(include=['object', 'category']).columns
    if len(categorical_columns) > 0:
        print(f"Found {len(categorical_columns)} categorical columns that need encoding")
        
        # For high-cardinality categorical columns, use frequency encoding
        for col in categorical_columns:
            # Calculate frequency of each category
            frequency = X[col].value_counts(normalize=True)
            # Map frequencies back to the dataframe
            X[f'{col}_Frequency'] = X[col].map(frequency)
        
        # Drop original categorical columns
        X = X.drop(columns=categorical_columns)
        print(f"After frequency encoding categorical features, shape: {X.shape}")
    
    # Use Random Forest for feature selection
    print("Using Random Forest feature importance for selection")
    
    # Initialize the selector
    if problem_type == 'classification':
        selector = SelectFromModel(
            RandomForestClassifier(n_estimators=100, random_state=42),
            max_features=max_features
        )
    else:  # regression
        from sklearn.ensemble import RandomForestRegressor
        selector = SelectFromModel(
            RandomForestRegressor(n_estimators=100, random_state=42),
            max_features=max_features
        )
    
    # Fit the selector
    try:
        selector.fit(X, y)
        
        # Get selected feature mask and names
        selected_mask = selector.get_support()
        selected_features = X.columns[selected_mask].tolist()
        
        print(f"Selected {len(selected_features)} features")
        
        # Show top 10 features
        if hasattr(selector.estimator_, 'feature_importances_'):
            importances = selector.estimator_.feature_importances_
            indices = np.argsort(importances)[::-1]
            
            print("Top 10 most important features:")
            for i in range(min(10, len(X.columns))):
                print(f"{X.columns[indices[i]]}: {importances[indices[i]]:.4f}")
        
        return selected_features
    
    except Exception as e:
        print(f"Error in feature selection: {str(e)}")
        print("Using all features instead")
        return X.columns.tolist()