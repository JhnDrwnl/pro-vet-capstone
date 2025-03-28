import pandas as pd
import numpy as np
from sklearn.model_selection import learning_curve
from sklearn.ensemble import RandomForestClassifier, RandomForestRegressor
from sklearn.svm import SVC, SVR
import matplotlib.pyplot as plt

def diagnose_model_fit(model, X_train, y_train, X_test, y_test, problem_type='classification'):
    """
    Diagnoses whether the model is overfitting, underfitting, or well-fit.
    
    Args:
        model: The trained model.
        X_train (pandas.DataFrame): Training feature matrix.
        y_train (pandas.Series): Training target variable.
        X_test (pandas.DataFrame): Testing feature matrix.
        y_test (pandas.Series): Testing target variable.
        problem_type (str): 'classification' or 'regression'.
        
    Returns:
        str: Diagnosis ('overfitting', 'underfitting', or 'good_fit').
    """
    print("Diagnosing model fit...")
    
    # Make predictions
    y_train_pred = model.predict(X_train)
    y_test_pred = model.predict(X_test)
    
    # Calculate training and test errors
    if problem_type == 'classification':
        from sklearn.metrics import accuracy_score
        train_score = accuracy_score(y_train, y_train_pred)
        test_score = accuracy_score(y_test, y_test_pred)
    else:  # regression
        from sklearn.metrics import r2_score
        train_score = r2_score(y_train, y_train_pred)
        test_score = r2_score(y_test, y_test_pred)
    
    print(f"Training score: {train_score:.4f}")
    print(f"Test score: {test_score:.4f}")
    
    # Diagnose based on the difference between training and test scores
    score_diff = train_score - test_score
    
    if score_diff > 0.2:  # Threshold can be adjusted
        diagnosis = 'overfitting'
        print("Diagnosis: Overfitting (model performs much better on training data than test data)")
    elif train_score < 0.7:  # Threshold can be adjusted
        diagnosis = 'underfitting'
        print("Diagnosis: Underfitting (model performs poorly on both training and test data)")
    else:
        diagnosis = 'good_fit'
        print("Diagnosis: Good fit (model performs well on both training and test data)")
    
    return diagnosis

def address_overfitting(model_name, X_train, y_train, X_test, y_test, problem_type='classification'):
    """
    Addresses overfitting by training a more regularized model.
    
    Args:
        model_name (str): Name of the model.
        X_train (pandas.DataFrame): Training feature matrix.
        y_train (pandas.Series): Training target variable.
        X_test (pandas.DataFrame): Testing feature matrix.
        y_test (pandas.Series): Testing target variable.
        problem_type (str): 'classification' or 'regression'.
        
    Returns:
        model: The trained model with reduced overfitting.
    """
    print("Addressing overfitting...")
    
    # Create a more regularized model based on the model name
    if problem_type == 'classification':
        if 'RandomForest' in model_name:
            print("Using RandomForest with stronger regularization")
            model = RandomForestClassifier(
                n_estimators=100,
                max_depth=10,  # Limit depth
                min_samples_split=5,  # Require more samples to split
                min_samples_leaf=4,  # Require more samples in leaves
                max_features='sqrt',  # Use fewer features
                random_state=42
            )
        elif 'SVM' in model_name:
            print("Using SVM with stronger regularization")
            model = SVC(
                C=0.1,  # Smaller C means stronger regularization
                kernel='rbf',
                probability=True,
                random_state=42
            )
        else:
            print(f"No specific overfitting strategy for {model_name}, using RandomForest with regularization")
            model = RandomForestClassifier(
                n_estimators=100,
                max_depth=10,
                min_samples_split=5,
                min_samples_leaf=4,
                max_features='sqrt',
                random_state=42
            )
    else:  # regression
        if 'RandomForest' in model_name:
            print("Using RandomForest with stronger regularization")
            model = RandomForestRegressor(
                n_estimators=100,
                max_depth=10,
                min_samples_split=5,
                min_samples_leaf=4,
                max_features='sqrt',
                random_state=42
            )
        elif 'SVR' in model_name:
            print("Using SVR with stronger regularization")
            model = SVR(
                C=0.1,
                kernel='rbf'
            )
        else:
            print(f"No specific overfitting strategy for {model_name}, using RandomForest with regularization")
            model = RandomForestRegressor(
                n_estimators=100,
                max_depth=10,
                min_samples_split=5,
                min_samples_leaf=4,
                max_features='sqrt',
                random_state=42
            )
    
    # Train the model
    model.fit(X_train, y_train)
    
    # Evaluate the model
    y_train_pred = model.predict(X_train)
    y_test_pred = model.predict(X_test)
    
    if problem_type == 'classification':
        from sklearn.metrics import accuracy_score
        train_score = accuracy_score(y_train, y_train_pred)
        test_score = accuracy_score(y_test, y_test_pred)
    else:  # regression
        from sklearn.metrics import r2_score
        train_score = r2_score(y_train, y_train_pred)
        test_score = r2_score(y_test, y_test_pred)
    
    print(f"After addressing overfitting:")
    print(f"Training score: {train_score:.4f}")
    print(f"Test score: {test_score:.4f}")
    
    return model

def address_underfitting(model_name, X_train, y_train, X_test, y_test, problem_type='classification'):
    """
    Addresses underfitting by training a more complex model.
    
    Args:
        model_name (str): Name of the model.
        X_train (pandas.DataFrame): Training feature matrix.
        y_train (pandas.Series): Training target variable.
        X_test (pandas.DataFrame): Testing feature matrix.
        y_test (pandas.Series): Testing target variable.
        problem_type (str): 'classification' or 'regression'.
        
    Returns:
        tuple: (model, X_train_new, X_test_new) - The trained model and potentially transformed feature matrices.
    """
    print("Addressing underfitting...")
    
    # Create a more complex model based on the model name
    if problem_type == 'classification':
        if 'RandomForest' in model_name:
            print("Using RandomForest with more complexity")
            model = RandomForestClassifier(
                n_estimators=200,  # More trees
                max_depth=None,  # No depth limit
                min_samples_split=2,  # Default
                min_samples_leaf=1,  # Default
                max_features='sqrt',
                random_state=42
            )
        elif 'SVM' in model_name:
            print("Using SVM with more complexity")
            model = SVC(
                C=10.0,  # Larger C means less regularization
                kernel='rbf',
                gamma='scale',
                probability=True,
                random_state=42
            )
        else:
            print(f"No specific underfitting strategy for {model_name}, using RandomForest with more complexity")
            model = RandomForestClassifier(
                n_estimators=200,
                max_depth=None,
                min_samples_split=2,
                min_samples_leaf=1,
                max_features='sqrt',
                random_state=42
            )
    else:  # regression
        if 'RandomForest' in model_name:
            print("Using RandomForest with more complexity")
            model = RandomForestRegressor(
                n_estimators=200,
                max_depth=None,
                min_samples_split=2,
                min_samples_leaf=1,
                max_features='sqrt',
                random_state=42
            )
        elif 'SVR' in model_name:
            print("Using SVR with more complexity")
            model = SVR(
                C=10.0,
                kernel='rbf',
                gamma='scale'
            )
        else:
            print(f"No specific underfitting strategy for {model_name}, using RandomForest with more complexity")
            model = RandomForestRegressor(
                n_estimators=200,
                max_depth=None,
                min_samples_split=2,
                min_samples_leaf=1,
                max_features='sqrt',
                random_state=42
            )
    
    # Train the model
    model.fit(X_train, y_train)
    
    # Evaluate the model
    y_train_pred = model.predict(X_train)
    y_test_pred = model.predict(X_test)
    
    if problem_type == 'classification':
        from sklearn.metrics import accuracy_score
        train_score = accuracy_score(y_train, y_train_pred)
        test_score = accuracy_score(y_test, y_test_pred)
    else:  # regression
        from sklearn.metrics import r2_score
        train_score = r2_score(y_train, y_train_pred)
        test_score = r2_score(y_test, y_test_pred)
    
    print(f"After addressing underfitting:")
    print(f"Training score: {train_score:.4f}")
    print(f"Test score: {test_score:.4f}")
    
    return model, X_train, X_test