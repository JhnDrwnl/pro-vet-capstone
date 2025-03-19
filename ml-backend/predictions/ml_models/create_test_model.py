import tensorflow as tf
import numpy as np
import os
from pathlib import Path

def create_test_model():
    """
    Create a simple test model for pet disease prediction
    """
    print("Creating test model...")
    
    # Simple model for testing
    model = tf.keras.Sequential([
        tf.keras.layers.Dense(64, activation='relu', input_shape=(10,)),
        tf.keras.layers.Dropout(0.2),
        tf.keras.layers.Dense(32, activation='relu'),
        tf.keras.layers.Dense(3, activation='softmax')  # 3 disease classes
    ])
    
    model.compile(
        optimizer='adam',
        loss='categorical_crossentropy',
        metrics=['accuracy']
    )
    
    # Print model summary
    model.summary()
    
    return model

def train_test_model(model):
    """
    Train the model with some dummy data
    """
    print("Training model with dummy data...")
    
    # Generate dummy data
    num_samples = 1000
    X = np.random.random((num_samples, 10))
    
    # Generate dummy labels (3 classes)
    y = np.zeros((num_samples, 3))
    for i in range(num_samples):
        class_idx = np.random.randint(0, 3)
        y[i, class_idx] = 1
    
    # Train the model
    model.fit(X, y, epochs=5, batch_size=32, validation_split=0.2, verbose=1)
    
    return model

if __name__ == "__main__":
    # Create directory if it doesn't exist
    model_dir = os.path.dirname(os.path.abspath(__file__))
    os.makedirs(model_dir, exist_ok=True)
    
    # Path to save the model
    model_path = os.path.join(model_dir, 'pet_disease_model.h5')
    
    # Create the model
    model = create_test_model()
    
    # Train the model with dummy data
    model = train_test_model(model)
    
    # Save the model
    print(f"Saving model to {model_path}...")
    model.save(model_path)
    
    print("Test model created, trained, and saved successfully!")
    
    # Verify the model was saved
    if os.path.exists(model_path):
        print(f"Model file exists at: {model_path}")
        print(f"File size: {os.path.getsize(model_path) / (1024*1024):.2f} MB")
    else:
        print("Error: Model file was not created!")