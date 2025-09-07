import pandas as pd
import os
from pathlib import Path

# Set the path to your dataset - FIXED PATH
BASE_DIR = Path(__file__).resolve().parent  # This points to ml-backend
DATA_PATH = os.path.join(BASE_DIR, 'PredictedDiseaseDataset.csv')  # Removed duplicate ml-backend
OUTPUT_PATH = os.path.join(BASE_DIR, 'PredictedDiseaseDataset_cleaned.csv')  # New output path

def clean_dataset():
    print(f"Loading dataset from {DATA_PATH}")
    
    try:
        # Load the dataset
        df = pd.read_csv(DATA_PATH)
        
        # Print original shape and check for NaN values
        print(f"Original dataset shape: {df.shape}")
        print("Missing values in each column:")
        print(df.isna().sum())
        
        # Check species distribution
        print("Species distribution:")
        print(df['Pet Species'].value_counts(dropna=False))  # Include NaN values
        
        # Remove rows with NaN in Pet Species (likely the empty Bird rows)
        df_cleaned = df.dropna(subset=['Pet Species'])
        
        # Remove the empty column if it exists
        if 'Unnamed: 14' in df_cleaned.columns:
            df_cleaned = df_cleaned.drop('Unnamed: 14', axis=1)
            print("Removed empty column 'Unnamed: 14'")
        
        # Print new shape after cleaning
        print(f"Cleaned dataset shape: {df_cleaned.shape}")
        print("Species distribution after cleaning:")
        print(df_cleaned['Pet Species'].value_counts())
        
        # Create backup of current file
        backup_path = DATA_PATH + '.backup'
        df.to_csv(backup_path, index=False)
        print(f"Current dataset backed up to {backup_path}")
        
        # Save the cleaned dataset to a NEW file to avoid permission issues
        df_cleaned.to_csv(OUTPUT_PATH, index=False)
        print(f"Saved cleaned dataset to {OUTPUT_PATH}")
        
        print("\nTo use the cleaned dataset:")
        print(f"1. Close any programs that might have {DATA_PATH} open")
        print(f"2. Rename {OUTPUT_PATH} to {DATA_PATH}")
        print("   OR update your scripts to use the new file path")
        
        return True
    
    except Exception as e:
        print(f"Error: {str(e)}")
        return False

if __name__ == "__main__":
    clean_dataset()