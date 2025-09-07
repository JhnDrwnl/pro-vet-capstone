import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler, OneHotEncoder
from sklearn.compose import ColumnTransformer
from sklearn.pipeline import Pipeline
import pickle
import os

class DataProcessor:
    def __init__(self, data_path):
        """Initialize the data processor with the path to the dataset."""
        self.data_path = data_path
        self.preprocessor = None
        self.X_train = None
        self.X_test = None
        self.y_train = None
        self.y_test = None
        self.feature_names = None
        self.target_names = None
        
    def load_data(self):
        """Load the dataset from CSV file."""
        print(f"Loading data from {self.data_path}...")
        try:
            self.data = pd.read_csv(self.data_path)
            print(f"Data loaded successfully. Shape: {self.data.shape}")
            return self.data
        except Exception as e:
            print(f"Error loading data: {str(e)}")
            raise
    
    def explore_data(self):
        """Perform basic data exploration."""
        print("\n--- Data Exploration ---")
        print(f"Dataset shape: {self.data.shape}")
        print("\nFirst 5 rows:")
        print(self.data.head())
        print("\nData types:")
        print(self.data.dtypes)
        print("\nSummary statistics:")
        print(self.data.describe())
        print("\nMissing values:")
        print(self.data.isnull().sum())
        
        # Assuming the last column is the target
        self.target_column = self.data.columns[-1]
        print(f"\nTarget column: {self.target_column}")
        print(f"Target distribution:")
        print(self.data[self.target_column].value_counts())
        
        return self.data
    
    def preprocess_data(self, target_column=None, test_size=0.2, random_state=42):
        """
        Preprocess the data for machine learning.
        
        Args:
            target_column: The name of the target column. If None, assumes the last column.
            test_size: Proportion of the dataset to include in the test split.
            random_state: Random seed for reproducibility.
        """
        if target_column is None:
            target_column = self.data.columns[-1]
            
        self.target_column = target_column
        print(f"\n--- Preprocessing Data (Target: {target_column}) ---")
        
        # Split features and target
        X = self.data.drop(columns=[target_column])
        y = self.data[target_column]
        
        self.feature_names = X.columns.tolist()
        self.target_names = y.unique().tolist()
        
        print(f"Features: {len(self.feature_names)}")
        print(f"Target classes: {len(self.target_names)}")
        
        # Identify numeric and categorical columns
        numeric_features = X.select_dtypes(include=['int64', 'float64']).columns.tolist()
        categorical_features = X.select_dtypes(include=['object', 'category']).columns.tolist()
        
        print(f"Numeric features: {len(numeric_features)}")
        print(f"Categorical features: {len(categorical_features)}")
        
        # Create preprocessing pipelines
        numeric_transformer = Pipeline(steps=[
            ('scaler', StandardScaler())
        ])
        
        categorical_transformer = Pipeline(steps=[
            ('onehot', OneHotEncoder(handle_unknown='ignore'))
        ])
        
        # Combine preprocessing steps
        preprocessor = ColumnTransformer(
            transformers=[
                ('num', numeric_transformer, numeric_features),
                ('cat', categorical_transformer, categorical_features)
            ])
        
        # Split the data
        self.X_train, self.X_test, self.y_train, self.y_test = train_test_split(
            X, y, test_size=test_size, random_state=random_state, stratify=y if len(y.unique()) > 1 else None
        )
        
        print(f"Training set size: {self.X_train.shape}")
        print(f"Test set size: {self.X_test.shape}")
        
        # Fit the preprocessor on the training data
        self.preprocessor = preprocessor.fit(self.X_train)
        
        # Transform the data
        self.X_train_processed = self.preprocessor.transform(self.X_train)
        self.X_test_processed = self.preprocessor.transform(self.X_test)
        
        # Check if target is categorical and encode if needed
        if y.dtype == 'object' or y.dtype.name == 'category':
            # Use sparse_output=False instead of sparse=False for newer scikit-learn versions
            try:
                self.target_encoder = OneHotEncoder(sparse_output=False)
            except TypeError:
                # Fall back to sparse=False for older scikit-learn versions
                self.target_encoder = OneHotEncoder(sparse=False)
                
            self.y_train_encoded = self.target_encoder.fit_transform(self.y_train.values.reshape(-1, 1))
            self.y_test_encoded = self.target_encoder.transform(self.y_test.values.reshape(-1, 1))
            print(f"Target encoded: {self.y_train_encoded.shape}")
        else:
            self.target_encoder = None
            self.y_train_encoded = self.y_train.values
            self.y_test_encoded = self.y_test.values
            print("Target is numeric, no encoding needed")
        
        return (self.X_train_processed, self.y_train_encoded, 
                self.X_test_processed, self.y_test_encoded)
    
    def save_preprocessor(self, save_path='ml_models'):
        """Save the preprocessor for later use."""
        os.makedirs(save_path, exist_ok=True)
        preprocessor_path = os.path.join(save_path, 'preprocessor.pkl')
        
        with open(preprocessor_path, 'wb') as f:
            pickle.dump({
                'preprocessor': self.preprocessor,
                'target_encoder': self.target_encoder,
                'feature_names': self.feature_names,
                'target_names': self.target_names,
                'target_column': self.target_column
            }, f)
        
        print(f"Preprocessor saved to {preprocessor_path}")
        return preprocessor_path
    
    def load_preprocessor(self, load_path='ml_models/preprocessor.pkl'):
        """Load a saved preprocessor."""
        with open(load_path, 'rb') as f:
            preprocessor_data = pickle.load(f)
            
        self.preprocessor = preprocessor_data['preprocessor']
        self.target_encoder = preprocessor_data['target_encoder']
        self.feature_names = preprocessor_data['feature_names']
        self.target_names = preprocessor_data['target_names']
        self.target_column = preprocessor_data['target_column']
        
        print(f"Preprocessor loaded from {load_path}")
        print(f"Features: {len(self.feature_names)}")
        print(f"Target classes: {len(self.target_names)}")
        
        return self.preprocessor
    
    def process_input(self, input_data):
        """Process input data for prediction."""
        if isinstance(input_data, dict):
            # Convert dictionary to DataFrame
            input_df = pd.DataFrame([input_data])
        elif isinstance(input_data, pd.DataFrame):
            input_df = input_data
        else:
            raise ValueError("Input must be a dictionary or DataFrame")
        
        # Ensure all expected features are present
        for feature in self.feature_names:
            if feature not in input_df.columns:
                input_df[feature] = 0  # Default value
        
        # Keep only the features the model knows about
        input_df = input_df[self.feature_names]
        
        # Apply the same preprocessing as during training
        processed_input = self.preprocessor.transform(input_df)
        
        return processed_input
    
    def decode_prediction(self, prediction):
        """Decode model prediction back to original target values."""
        if self.target_encoder is not None:
            # For classification with one-hot encoding
            if len(prediction.shape) > 1 and prediction.shape[1] > 1:
                # Multi-class prediction probabilities
                predicted_class_idx = np.argmax(prediction, axis=1)
                decoded_prediction = self.target_encoder.inverse_transform(
                    np.eye(len(self.target_names))[predicted_class_idx]
                )
                return decoded_prediction.ravel()
            else:
                # Binary classification
                threshold = 0.5
                binary_prediction = (prediction > threshold).astype(int)
                decoded_prediction = self.target_encoder.inverse_transform(binary_prediction)
                return decoded_prediction.ravel()
        else:
            # For regression or already decoded predictions
            return prediction

