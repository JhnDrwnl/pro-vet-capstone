import pandas as pd
import numpy as np
import matplotlib.pyplot as plt

def perform_eda(df, target_column):
    """
    Performs exploratory data analysis on the dataset.
    
    Args:
        df (pandas.DataFrame): The dataset to analyze.
        target_column (str): The name of the target column.
        
    Returns:
        dict: Dictionary containing correlation values.
    """
    print(f"Dataset shape: {df.shape}")
    print(f"Dataset columns: {df.columns.tolist()}")
    print(f"Dataset info:")
    print(df.info())
    print(f"Dataset description:")
    print(df.describe())
    
    # Calculate correlation with target
    correlation = {}
    if target_column in df.columns:
        # Check if target column is numeric
        if pd.api.types.is_numeric_dtype(df[target_column]):
            numeric_cols = df.select_dtypes(include=['number']).columns
            for col in numeric_cols:
                if col != target_column:
                    correlation[col] = df[col].corr(df[target_column])
            
            print(f"Correlation with target ({target_column}):")
            for col, corr in sorted(correlation.items(), key=lambda x: abs(x[1]), reverse=True):
                print(f"{col}: {corr:.4f}")
        else:
            print(f"Target column '{target_column}' is categorical. Skipping correlation analysis.")
            
            # For categorical targets, show value distribution
            print(f"Target value distribution:")
            value_counts = df[target_column].value_counts()
            print(value_counts)
            
            # Show relationship between numeric features and categorical target
            print("\nAnalyzing relationship between numeric features and categorical target:")
            numeric_cols = df.select_dtypes(include=['number']).columns
            
            for col in numeric_cols:
                # Calculate mean of numeric feature for each target class
                means = df.groupby(target_column)[col].mean().sort_values(ascending=False)
                print(f"\nMean {col} by {target_column} category:")
                print(means.head(10))  # Show top 10 categories to avoid too much output
    
    return correlation