import pandas as pd
import numpy as np
from sklearn.linear_model import LogisticRegression, LinearRegression
from sklearn.ensemble import RandomForestClassifier, RandomForestRegressor
from sklearn.svm import SVC, SVR
from sklearn.neighbors import KNeighborsClassifier, KNeighborsRegressor
from sklearn.tree import DecisionTreeClassifier, DecisionTreeRegressor
from sklearn.model_selection import cross_val_score
import time

def compare_models(X_train, y_train, problem_type='classification', cv=5):
    """
    Compares different models on the dataset.
    
    Args:
        X_train (pandas.DataFrame): Training feature matrix.
        y_train (pandas.Series): Training target variable.
        problem_type (str): 'classification' or 'regression'.
        cv (int): Number of cross-validation folds.
        
    Returns:
        tuple: (results, best_model_name) - Dictionary of model results and name of the best model.
    """
    print(f"Comparing models using {cv}-fold cross-validation...")
    
    # Define models based on problem type
    if problem_type == 'classification':
        models = {
            'LogisticRegression': LogisticRegression(random_state=42, max_iter=1000),
            'RandomForest': RandomForestClassifier(random_state=42),
            'DecisionTree': DecisionTreeClassifier(random_state=42),
            'KNN': KNeighborsClassifier(),
            'SVM': SVC(random_state=42, probability=True)
        }
        scoring = 'f1_weighted'
    else:  # regression
        models = {
            'LinearRegression': LinearRegression(),
            'RandomForest': RandomForestRegressor(random_state=42),
            'DecisionTree': DecisionTreeRegressor(random_state=42),
            'KNN': KNeighborsRegressor(),
            'SVR': SVR()
        }
        scoring = 'neg_mean_squared_error'
    
    # Evaluate each model
    results = {}
    for name, model in models.items():
        start_time = time.time()
        
        try:
            scores = cross_val_score(model, X_train, y_train, cv=cv, scoring=scoring)
            
            if problem_type == 'classification':
                mean_score = scores.mean()
                std_score = scores.std()
                results[name] = {
                    'mean_score': mean_score,
                    'std_score': std_score,
                    'time': time.time() - start_time
                }
                print(f"{name}: F1 = {mean_score:.4f} (±{std_score:.4f}), Time: {results[name]['time']:.2f}s")
            else:  # regression
                # Convert negative MSE to positive RMSE for easier interpretation
                rmse_scores = np.sqrt(-scores)
                mean_rmse = rmse_scores.mean()
                std_rmse = rmse_scores.std()
                results[name] = {
                    'mean_rmse': mean_rmse,
                    'std_rmse': std_rmse,
                    'time': time.time() - start_time
                }
                print(f"{name}: RMSE = {mean_rmse:.4f} (±{std_rmse:.4f}), Time: {results[name]['time']:.2f}s")
        
        except Exception as e:
            print(f"Error evaluating {name}: {str(e)}")
            results[name] = {'error': str(e)}
    
    # Determine the best model
    if problem_type == 'classification':
        best_model_name = max(results.items(), key=lambda x: x[1].get('mean_score', -float('inf')))[0]
        print(f"Best model: {best_model_name} with F1 = {results[best_model_name]['mean_score']:.4f}")
    else:  # regression
        best_model_name = min(results.items(), key=lambda x: x[1].get('mean_rmse', float('inf')))[0]
        print(f"Best model: {best_model_name} with RMSE = {results[best_model_name]['mean_rmse']:.4f}")
    
    return results, best_model_name