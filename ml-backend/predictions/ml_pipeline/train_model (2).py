import os
import sys
import pandas as pd
import numpy as np
import tensorflow as tf
from data_processor import DataProcessor
from model_builder import ModelBuilder
import json

def train_pet_disease_model(data_path, model_save_path='ml_models', epochs=50, batch_size=32):
    """
    Train a pet disease prediction model using the provided dataset.
    
    Args:
        data_path: Path to the CSV dataset
        model_save_path: Directory to save the model and artifacts
        epochs: Number of training epochs
        batch_size: Batch size for training
    """
    print("\n=== Pet Disease Prediction Model Training ===\n")
    
    # Create save directory if it doesn't exist
    os.makedirs(model_save_path, exist_ok=True)
    
    # Step 1: Load and preprocess data
    processor = DataProcessor(data_path)
    data = processor.load_data()
    processor.explore_data()
    
    # Step 2: Preprocess the data
    X_train_processed, y_train_encoded, X_test_processed, y_test_encoded = processor.preprocess_data()
    
    # Save the preprocessor for later use
    preprocessor_path = processor.save_preprocessor(model_save_path)
    
    # Step 3: Build the model
    input_dim = X_train_processed.shape[1]
    
    # Determine if it's binary, multi-class, or regression
    if processor.target_encoder is not None:
        # Classification
        output_dim = y_train_encoded.shape[1] if len(y_train_encoded.shape) > 1 else 1
        model_type = 'classification'
    else:
        # Regression
        output_dim = 1
        model_type = 'regression'
    
    print(f"\nBuilding {model_type} model with input dimension {input_dim} and output dimension {output_dim}")
    
    # Create model builder
    model_builder = ModelBuilder(input_dim, output_dim, model_type)
    
    # Build model architecture
    model = model_builder.build_model(
        hidden_layers=[128, 64, 32],  # Customize based on your data complexity
        dropout_rate=0.3
    )
    
    # Step 4: Train the model
    print("\n--- Training Model ---")
    history = model_builder.train_model(
        X_train_processed, y_train_encoded,
        X_val=X_test_processed, y_val=y_test_encoded,
        epochs=epochs,
        batch_size=batch_size,
        save_path=model_save_path
    )
    
    # Step 5: Evaluate the model
    results = model_builder.evaluate_model(X_test_processed, y_test_encoded)
    
    # Step 6: Save the model
    model_path = model_builder.save_model(
        save_path=model_save_path,
        model_name='pet_disease_model.h5'
    )
    
    # Step 7: Plot training history
    plot_path = model_builder.plot_training_history(save_path=model_save_path)
    
    # Step 8: Save model metadata
    metadata = {
        'model_type': model_type,
        'input_dim': input_dim,
        'output_dim': output_dim,
        'feature_names': processor.feature_names,
        'target_names': processor.target_names,
        'target_column': processor.target_column,
        'metrics': {metric: float(value) for metric, value in zip(model.metrics_names, results)},
        'model_path': model_path,
        'preprocessor_path': preprocessor_path,
        'training_history_plot': plot_path
    }
    
    metadata_path = os.path.join(model_save_path, 'model_metadata.json')
    with open(metadata_path, 'w') as f:
        json.dump(metadata, f, indent=4)
    
    print(f"\nModel metadata saved to {metadata_path}")
    print("\n=== Model Training Complete ===")
    
    return {
        'model_path': model_path,
        'preprocessor_path': preprocessor_path,
        'metadata_path': metadata_path
    }

if __name__ == "__main__":
    # Get data path from command line arguments or use default
    if len(sys.argv) > 1:
        data_path = sys.argv[1]
    else:
        data_path = "futuredisease.csv"
    
    # Train the model
    train_pet_disease_model(data_path)

