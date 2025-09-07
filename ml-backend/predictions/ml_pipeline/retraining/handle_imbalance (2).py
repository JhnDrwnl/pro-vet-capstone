import pandas as pd
import numpy as np
from sklearn.utils import resample
from collections import Counter

def handle_class_imbalance(X_train, y_train, method='undersample', min_samples=50, max_samples=500):
    """
    Handle class imbalance using resampling techniques.
    
    Args:
        X_train (pandas.DataFrame): Training feature matrix.
        y_train (pandas.Series): Training target variable.
        method (str): 'undersample', 'oversample', or 'both'.
        min_samples (int): Minimum samples per class after resampling.
        max_samples (int): Maximum samples per class after resampling.
        
    Returns:
        tuple: (X_resampled, y_resampled) - Resampled training data.
    """
    print(f"Handling class imbalance using {method} method...")
    
    # Count samples per class
    class_counts = Counter(y_train)
    print(f"Original class distribution: {len(class_counts)} classes")
    print(f"Min class count: {min(class_counts.values())}, Max class count: {max(class_counts.values())}")
    
    # Combine X and y for resampling
    train_data = pd.concat([X_train, pd.Series(y_train, name='target')], axis=1)
    target_col = 'target'
    
    # Initialize resampled data
    resampled_data = pd.DataFrame(columns=train_data.columns)
    
    if method in ['undersample', 'both']:
        # Undersample majority classes
        for class_val, count in class_counts.items():
            class_data = train_data[train_data[target_col] == class_val]
            
            # If class has more than max_samples, undersample it
            if count > max_samples:
                class_data = resample(
                    class_data, 
                    replace=False,
                    n_samples=max_samples,
                    random_state=42
                )
            
            resampled_data = pd.concat([resampled_data, class_data])
    
    if method in ['oversample', 'both']:
        # Oversample minority classes
        for class_val, count in class_counts.items():
            if method == 'both':
                # If we've already undersampled, get the class data from resampled_data
                class_data = resampled_data[resampled_data[target_col] == class_val]
                count = len(class_data)
            else:
                # Otherwise get it from the original data
                class_data = train_data[train_data[target_col] == class_val]
            
            # If class has fewer than min_samples, oversample it
            if count < min_samples:
                # Calculate how many samples to generate
                n_samples = min(min_samples, max(count * 2, min_samples))
                
                # Oversample with replacement
                class_data_oversampled = resample(
                    class_data,
                    replace=True,
                    n_samples=n_samples,
                    random_state=42
                )
                
                if method == 'both':
                    # Remove original samples from resampled_data and add oversampled ones
                    resampled_data = resampled_data[resampled_data[target_col] != class_val]
                    resampled_data = pd.concat([resampled_data, class_data_oversampled])
                else:
                    # Add oversampled data to resampled_data
                    resampled_data = pd.concat([resampled_data, class_data_oversampled])
            elif method == 'oversample':
                # If not oversampling this class, still add it to resampled_data
                resampled_data = pd.concat([resampled_data, class_data])
    
    # Split back into X and y
    X_resampled = resampled_data.drop(columns=[target_col])
    y_resampled = resampled_data[target_col]
    
    # Print resampling results
    new_class_counts = Counter(y_resampled)
    print(f"After resampling: {len(new_class_counts)} classes")
    print(f"Min class count: {min(new_class_counts.values())}, Max class count: {max(new_class_counts.values())}")
    print(f"Original data shape: {X_train.shape}, Resampled data shape: {X_resampled.shape}")
    
    return X_resampled, y_resampled