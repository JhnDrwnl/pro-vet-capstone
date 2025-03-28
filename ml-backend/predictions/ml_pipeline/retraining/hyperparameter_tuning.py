import pandas as pd
import numpy as np
from sklearn.model_selection import GridSearchCV, RandomizedSearchCV
from sklearn.linear_model import LogisticRegression, LinearRegression
from sklearn.ensemble import RandomForestClassifier, RandomForestRegressor
from sklearn.svm import SVC, SVR
from sklearn.neighbors import KNeighborsClassifier, KNeighborsRegressor
from sklearn.tree import DecisionTreeClassifier, DecisionTreeRegressor

def tune_hyperparameters(X_train, y_train, model_name, problem_type='classification', method='grid', cv=5):
    """
    Tunes hyperparameters for the specified model.
    
    Args:
        X_train (pandas.DataFrame): Training feature matrix.
        y_train (pandas.Series): Training target variable.
        model_name (str): Name of the model to tune.
        problem_type (str): 'classification' or 'regression'.
        method (str): 'grid' or 'random' search.
        cv (int): Number of cross-validation folds.
        
    Returns:
        tuple: (best_model, best_params) - The best model and its parameters.
    """
    print(f"Tuning hyperparameters for {model_name} using {method} search...")
    
    # Define model and parameter grid based on model name and problem type
    if problem_type == 'classification':
        if model_name == 'LogisticRegression':
            model = LogisticRegression(random_state=42)
            param_grid = {
                'C': [0.001, 0.01, 0.1, 1, 10, 100],
                'solver': ['liblinear', 'saga'],
                'max_iter': [1000]
            }
        elif model_name == 'RandomForest':
            model = RandomForestClassifier(random_state=42)
            param_grid = {
                'n_estimators': [50, 100, 200],
                'max_depth': [None, 10, 20, 30],
                'min_samples_split': [2, 5, 10],
                'min_samples_leaf': [1, 2, 4]
            }
        elif model_name == 'DecisionTree':
            model = DecisionTreeClassifier(random_state=42)
            param_grid = {
                'max_depth': [None, 10, 20, 30],
                'min_samples_split': [2, 5, 10],
                'min_samples_leaf': [1, 2, 4],
                'criterion': ['gini', 'entropy']
            }
        elif model_name == 'KNN':
            model = KNeighborsClassifier()
            param_grid = {
                'n_neighbors': [3, 5, 7, 9, 11],
                'weights': ['uniform', 'distance'],
                'p': [1, 2]
            }
        elif model_name == 'SVM':
            model = SVC(random_state=42, probability=True)
            param_grid = {
                'C': [0.1, 1, 10, 100],
                'kernel': ['linear', 'rbf', 'poly'],
                'gamma': ['scale', 'auto', 0.1, 0.01]
            }
        else:
            raise ValueError(f"Unsupported classification model: {model_name}")
        
        scoring = 'f1_weighted'
    
    else:  # regression
        if model_name == 'LinearRegression':
            model = LinearRegression()
            param_grid = {}  # Linear regression doesn't have hyperparameters to tune
        elif model_name == 'RandomForest':
            model = RandomForestRegressor(random_state=42)
            param_grid = {
                'n_estimators': [50, 100, 200],
                'max_depth': [None, 10, 20, 30],
                'min_samples_split': [2, 5, 10],
                'min_samples_leaf': [1, 2, 4]
            }
        elif model_name == 'DecisionTree':
            model = DecisionTreeRegressor(random_state=42)
            param_grid = {
                'max_depth': [None, 10, 20, 30],
                'min_samples_split': [2, 5, 10],
                'min_samples_leaf': [1, 2, 4],
                'criterion': ['squared_error', 'friedman_mse', 'absolute_error']
            }
        elif model_name == 'KNN':
            model = KNeighborsRegressor()
            param_grid = {
                'n_neighbors': [3, 5, 7, 9, 11],
                'weights': ['uniform', 'distance'],
                'p': [1, 2]
            }
        elif model_name == 'SVR':
            model = SVR()
            param_grid = {
                'C': [0.1, 1, 10, 100],
                'kernel': ['linear', 'rbf', 'poly'],
                'gamma': ['scale', 'auto', 0.1, 0.01],
                'epsilon': [0.1, 0.2, 0.5]
            }
        else:
            raise ValueError(f"Unsupported regression model: {model_name}")
        
        scoring = 'neg_mean_squared_error'
    
    # If there are no hyperparameters to tune, return the model as is
    if not param_grid:
        print(f"No hyperparameters to tune for {model_name}")
        model.fit(X_train, y_train)
        return model, {}
    
    # Perform hyperparameter search
    if method == 'grid':
        search = GridSearchCV(model, param_grid, scoring=scoring, cv=cv, n_jobs=-1, verbose=1)
    else:  # random search
        search = RandomizedSearchCV(model, param_grid, n_iter=20, scoring=scoring, cv=cv, n_jobs=-1, random_state=42, verbose=1)
    
    search.fit(X_train, y_train)
    
    # Get the best model and parameters
    best_model = search.best_estimator_
    best_params = search.best_params_
    
    print(f"Best parameters: {best_params}")
    print(f"Best score: {search.best_score_:.4f}")
    
    return best_model, best_params