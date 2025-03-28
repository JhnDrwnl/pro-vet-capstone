import pandas as pd
import numpy as np
from sklearn.metrics import (
    accuracy_score, precision_score, recall_score, f1_score,
    confusion_matrix, classification_report,
    r2_score, mean_squared_error, mean_absolute_error
)
import matplotlib.pyplot as plt

def evaluate_model(model, X_train, y_train, X_test, y_test, problem_type='classification'):
    """
    Evaluates the model on training and test data.
    
    Args:
        model: The trained model.
        X_train (pandas.DataFrame): Training feature matrix.
        y_train (pandas.Series): Training target variable.
        X_test (pandas.DataFrame): Testing feature matrix.
        y_test (pandas.Series): Testing target variable.
        problem_type (str): 'classification' or 'regression'.
        
    Returns:
        dict: Dictionary of evaluation metrics.
    """
    print("Evaluating model performance...")
    
    # Make predictions on training and test data
    y_train_pred = model.predict(X_train)
    y_test_pred = model.predict(X_test)
    
    # Calculate metrics based on problem type
    if problem_type == 'classification':
        # Training metrics
        train_accuracy = accuracy_score(y_train, y_train_pred)
        train_precision = precision_score(y_train, y_train_pred, average='weighted', zero_division=0)
        train_recall = recall_score(y_train, y_train_pred, average='weighted', zero_division=0)
        train_f1 = f1_score(y_train, y_train_pred, average='weighted', zero_division=0)
        
        # Test metrics
        test_accuracy = accuracy_score(y_test, y_test_pred)
        test_precision = precision_score(y_test, y_test_pred, average='weighted', zero_division=0)
        test_recall = recall_score(y_test, y_test_pred, average='weighted', zero_division=0)
        test_f1 = f1_score(y_test, y_test_pred, average='weighted', zero_division=0)
        
        # Confusion matrix
        cm = confusion_matrix(y_test, y_test_pred)
        
        # Classification report
        report = classification_report(y_test, y_test_pred)
        
        # Compile metrics
        metrics = {
            'train': {
                'accuracy': train_accuracy,
                'precision': train_precision,
                'recall': train_recall,
                'f1': train_f1
            },
            'test': {
                'accuracy': test_accuracy,
                'precision': test_precision,
                'recall': test_recall,
                'f1': test_f1
            }
        }
        
        # Print metrics
        print("\nTraining Metrics:")
        print(f"Accuracy: {train_accuracy:.4f}")
        print(f"Precision: {train_precision:.4f}")
        print(f"Recall: {train_recall:.4f}")
        print(f"F1 Score: {train_f1:.4f}")
        
        print("\nTest Metrics:")
        print(f"Accuracy: {test_accuracy:.4f}")
        print(f"Precision: {test_precision:.4f}")
        print(f"Recall: {test_recall:.4f}")
        print(f"F1 Score: {test_f1:.4f}")
        
        print("\nConfusion Matrix:")
        print(cm)
        
        print("\nClassification Report:")
        print(report)
        
    else:  # regression
        # Training metrics
        train_r2 = r2_score(y_train, y_train_pred)
        train_mse = mean_squared_error(y_train, y_train_pred)
        train_rmse = np.sqrt(train_mse)
        train_mae = mean_absolute_error(y_train, y_train_pred)
        
        # Test metrics
        test_r2 = r2_score(y_test, y_test_pred)
        test_mse = mean_squared_error(y_test, y_test_pred)
        test_rmse = np.sqrt(test_mse)
        test_mae = mean_absolute_error(y_test, y_test_pred)
        
        # Compile metrics
        metrics = {
            'train': {
                'r2': train_r2,
                'mse': train_mse,
                'rmse': train_rmse,
                'mae': train_mae
            },
            'test': {
                'r2': test_r2,
                'mse': test_mse,
                'rmse': test_rmse,
                'mae': test_mae
            }
        }
        
        # Print metrics
        print("\nTraining Metrics:")
        print(f"R² Score: {train_r2:.4f}")
        print(f"MSE: {train_mse:.4f}")
        print(f"RMSE: {train_rmse:.4f}")
        print(f"MAE: {train_mae:.4f}")
        
        print("\nTest Metrics:")
        print(f"R² Score: {test_r2:.4f}")
        print(f"MSE: {test_mse:.4f}")
        print(f"RMSE: {test_rmse:.4f}")
        print(f"MAE: {test_mae:.4f}")
    
    return metrics