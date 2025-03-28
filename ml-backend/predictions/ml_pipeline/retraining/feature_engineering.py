import pandas as pd
import numpy as np

def engineer_features(df):
    """
    Performs feature engineering on the dataset.
    
    Args:
        df (pandas.DataFrame): The dataset to engineer features for.
        
    Returns:
        pandas.DataFrame: The dataset with engineered features.
    """
    print("Performing feature engineering...")
    
    # Make a copy of the dataframe to avoid modifying the original
    df_engineered = df.copy()
    
    # Example: Convert categorical variables to one-hot encoding
    categorical_cols = df_engineered.select_dtypes(include=['object']).columns
    for col in categorical_cols:
        # Skip if too many unique values (to avoid creating too many columns)
        if df_engineered[col].nunique() < 10:
            print(f"One-hot encoding {col} with {df_engineered[col].nunique()} unique values")
            dummies = pd.get_dummies(df_engineered[col], prefix=col, drop_first=True)
            df_engineered = pd.concat([df_engineered, dummies], axis=1)
            df_engineered.drop(columns=[col], inplace=True)
    
    # Example: Create interaction features for numeric columns
    numeric_cols = df_engineered.select_dtypes(include=['number']).columns
    if len(numeric_cols) >= 2:
        # Limit to top 5 numeric columns to avoid creating too many features
        top_numeric_cols = list(numeric_cols)[:5]
        for i in range(len(top_numeric_cols)):
            for j in range(i+1, len(top_numeric_cols)):
                col1 = top_numeric_cols[i]
                col2 = top_numeric_cols[j]
                interaction_name = f"{col1}_x_{col2}"
                print(f"Creating interaction feature: {interaction_name}")
                df_engineered[interaction_name] = df_engineered[col1] * df_engineered[col2]
    
    print(f"Feature engineering complete. New shape: {df_engineered.shape}")
    return df_engineered