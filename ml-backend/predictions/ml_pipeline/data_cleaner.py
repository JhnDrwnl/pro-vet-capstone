import pandas as pd
import os
import re
import numpy as np
from sklearn.preprocessing import LabelEncoder
import logging

# Set up logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

class DataCleaner:
    def __init__(self, data_path):
        self.data_path = self._resolve_path(data_path)
        self.df = None
        
    def _resolve_path(self, path):
        """Resolve relative or absolute path to ensure file can be found."""
        # If path is absolute, return it
        if os.path.isabs(path):
            return path
        
        # Try different relative paths
        possible_paths = [
            path,
            os.path.join(os.getcwd(), path),
            os.path.abspath(path)
        ]
        
        for p in possible_paths:
            if os.path.exists(p):
                logger.info(f"Found data file at: {p}")
                return p
                
        # If we get here, we couldn't find the file
        logger.error(f"Could not find data file at any of these locations: {possible_paths}")
        raise FileNotFoundError(f"Could not find data file: {path}")
    
    def load_data(self):
        """Load data with proper error handling for different encodings."""
        logger.info(f"Loading data from {self.data_path}...")
        
        try:
            self.df = pd.read_csv(self.data_path, encoding='utf-8')
        except UnicodeDecodeError:
            try:
                self.df = pd.read_csv(self.data_path, encoding='latin1')
            except UnicodeDecodeError:
                try:
                    self.df = pd.read_csv(self.data_path, encoding='cp1252')
                except Exception as e:
                    logger.error(f"Failed to load data with multiple encodings: {str(e)}")
                    raise
        
        logger.info(f"Data loaded successfully. Shape: {self.df.shape}")
        return self.df
    
    def clean_data(self):
        """Clean the data by fixing concatenated values and other issues."""
        if self.df is None:
            self.load_data()
        
        logger.info("Cleaning data...")
        
        # Make a copy to avoid modifying the original
        df_clean = self.df.copy()
        
        # Fix concatenated text in string columns
        for col in df_clean.select_dtypes(include=['object']).columns:
            # Check if there are concatenated values (same word repeated)
            df_clean[col] = df_clean[col].astype(str).apply(self._fix_concatenated_text)
        
        # Handle missing values
        for col in df_clean.select_dtypes(include=['object']).columns:
            df_clean[col] = df_clean[col].fillna("Unknown")
            
        for col in df_clean.select_dtypes(include=['number']).columns:
            df_clean[col] = df_clean[col].fillna(df_clean[col].median())
        
        logger.info("Data cleaning completed")
        self.df = df_clean
        return df_clean
    
    def _fix_concatenated_text(self, text):
        """Fix text where the same word/phrase is concatenated multiple times."""
        if not isinstance(text, str):
            return text
            
        # Split the text into potential repeated segments
        # This regex pattern looks for repeated words or phrases
        pattern = r'(\b\w+(?:\s+\w+)*(?:\s*$$[^)]*$$)?)\1+'
        
        # Find all matches
        matches = re.findall(pattern, text)
        
        # If matches found, replace with single occurrence
        if matches:
            for match in matches:
                # Create a pattern that matches the repeated segment
                repeat_pattern = f"({re.escape(match)})+"
                # Replace with just one occurrence
                text = re.sub(repeat_pattern, match, text)
        
        return text
    
    def encode_categorical_features(self, df=None, target_column=None):
        """Encode categorical features using one-hot encoding."""
        if df is None:
            df = self.df
            
        if df is None:
            raise ValueError("No data available. Please load and clean data first.")
        
        logger.info("Encoding categorical features...")
        
        # Create a copy to avoid modifying the original
        df_encoded = df.copy()
        
        # Get categorical columns (excluding target if provided)
        categorical_cols = df_encoded.select_dtypes(include=['object']).columns
        if target_column and target_column in categorical_cols:
            categorical_cols = [col for col in categorical_cols if col != target_column]
        
        # Apply one-hot encoding to categorical columns
        for col in categorical_cols:
            # Get dummies and add prefix to avoid column name conflicts
            dummies = pd.get_dummies(df_encoded[col], prefix=col, dummy_na=False)
            
            # Add dummy columns to dataframe
            df_encoded = pd.concat([df_encoded, dummies], axis=1)
            
            # Drop original column
            df_encoded.drop(col, axis=1, inplace=True)
        
        # If target column is categorical and provided, encode it with label encoder
        if target_column and target_column in df.select_dtypes(include=['object']).columns:
            logger.info(f"Encoding target column: {target_column}")
            le = LabelEncoder()
            df_encoded[target_column] = le.fit_transform(df_encoded[target_column])
            
            # Save the mapping for later use
            self.target_mapping = dict(zip(le.transform(le.classes_), le.classes_))
            self.inverse_target_mapping = dict(zip(le.classes_, le.transform(le.classes_)))
        
        logger.info("Categorical encoding completed")
        return df_encoded
    
    def get_clean_encoded_data(self, target_column=None):
        """Get clean and encoded data in one step."""
        self.load_data()
        self.clean_data()
        return self.encode_categorical_features(target_column=target_column)