import pandas as pd
import numpy as np

def clean_data(data_path):
    """
    Loads the data from the specified data path and performs basic cleaning.
    
    Args:
        data_path (str): The path to the data file (e.g., CSV).
        
    Returns:
        pandas.DataFrame: The cleaned data.
    """
    # Load the data
    try:
        df = pd.read_csv(data_path, encoding='latin1')
    except UnicodeDecodeError:
        try:
            df = pd.read_csv(data_path, encoding='ISO-8859-1')
        except UnicodeDecodeError:
            df = pd.read_csv(data_path, encoding='cp1252')
    
    print(f"Loaded data with shape: {df.shape}")
    
    # Handle missing values
    print(f"Missing values before cleaning:\n{df.isnull().sum()}")
    
    # For categorical features: fill with mode or create 'Unknown' category
    for col in df.select_dtypes(include=['object']).columns:
        df[col] = df[col].fillna(df[col].mode()[0] if not df[col].mode().empty else 'Unknown')
    
    # For numerical features: fill with median (more robust than mean)
    for col in df.select_dtypes(include=['number']).columns:
        df[col] = df[col].fillna(df[col].median())
    
    # Remove duplicates
    df_size_before = len(df)
    df = df.drop_duplicates()
    print(f"Removed {df_size_before - len(df)} duplicate rows")
    
    print(f"Missing values after cleaning:\n{df.isnull().sum()}")
    print(f"Final data shape: {df.shape}")
    
    return df