import tensorflow as tf
from tensorflow.keras.models import Sequential
from tensorflow.keras.layers import Dense, Dropout, BatchNormalization
from tensorflow.keras.optimizers import Adam
from tensorflow.keras.callbacks import EarlyStopping, ModelCheckpoint
import numpy as np
import os
import matplotlib.pyplot as plt

class ModelBuilder:
    def __init__(self, input_dim, output_dim, model_type='classification'):
        """
        Initialize the model builder.
        
        Args:
            input_dim: Dimension of the input features
            output_dim: Dimension of the output (1 for binary, n for multi-class)
            model_type: 'classification' or 'regression'
        """
        self.input_dim = input_dim
        self.output_dim = output_dim
        self.model_type = model_type
        self.model = None
        self.history = None
    
    def build_model(self, hidden_layers=[64, 32], dropout_rate=0.2):
        """
        Build a neural network model.
        
        Args:
            hidden_layers: List of neurons in each hidden layer
            dropout_rate: Dropout rate for regularization
        """
        model = Sequential()
        
        # Input layer
        model.add(Dense(hidden_layers[0], input_dim=self.input_dim, activation='relu'))
        model.add(BatchNormalization())
        model.add(Dropout(dropout_rate))
        
        # Hidden layers
        for units in hidden_layers[1:]:
            model.add(Dense(units, activation='relu'))
            model.add(BatchNormalization())
            model.add(Dropout(dropout_rate))
        
        # Output layer
        if self.model_type == 'classification':
            if self.output_dim == 1:
                # Binary classification
                model.add(Dense(1, activation='sigmoid'))
                loss = 'binary_crossentropy'
                metrics = ['accuracy']
            else:
                # Multi-class classification
                model.add(Dense(self.output_dim, activation='softmax'))
                loss = 'categorical_crossentropy'
                metrics = ['accuracy']
        else:
            # Regression
            model.add(Dense(1, activation='linear'))
            loss = 'mean_squared_error'
            metrics = ['mae']
        
        # Compile the model
        model.compile(
            optimizer=Adam(learning_rate=0.001),
            loss=loss,
            metrics=metrics
        )
        
        self.model = model
        print(model.summary())
        return model
    
    def train_model(self, X_train, y_train, X_val=None, y_val=None, 
                   epochs=50, batch_size=32, save_path='ml_models'):
        """
        Train the model.
        
        Args:
            X_train: Training features
            y_train: Training targets
            X_val: Validation features (if None, will use validation_split)
            y_val: Validation targets
            epochs: Number of training epochs
            batch_size: Batch size for training
            save_path: Directory to save the model
        """
        if self.model is None:
            raise ValueError("Model not built. Call build_model first.")
        
        # Create directory if it doesn't exist
        os.makedirs(save_path, exist_ok=True)
        
        # Callbacks
        callbacks = [
            EarlyStopping(
                monitor='val_loss',
                patience=10,
                restore_best_weights=True
            ),
            ModelCheckpoint(
                filepath=os.path.join(save_path, 'best_model.h5'),
                monitor='val_loss',
                save_best_only=True
            )
        ]
        
        # Train the model
        if X_val is not None and y_val is not None:
            # Use provided validation data
            history = self.model.fit(
                X_train, y_train,
                validation_data=(X_val, y_val),
                epochs=epochs,
                batch_size=batch_size,
                callbacks=callbacks,
                verbose=1
            )
        else:
            # Use validation split
            history = self.model.fit(
                X_train, y_train,
                validation_split=0.2,
                epochs=epochs,
                batch_size=batch_size,
                callbacks=callbacks,
                verbose=1
            )
        
        self.history = history.history
        return history
    
    def evaluate_model(self, X_test, y_test):
        """
        Evaluate the model on test data.
        
        Args:
            X_test: Test features
            y_test: Test targets
        """
        if self.model is None:
            raise ValueError("Model not trained. Call train_model first.")
        
        # Evaluate the model
        results = self.model.evaluate(X_test, y_test, verbose=1)
        
        # Print results
        print("\n--- Model Evaluation ---")
        for metric_name, value in zip(self.model.metrics_names, results):
            print(f"{metric_name}: {value:.4f}")
        
        # Make predictions
        y_pred = self.model.predict(X_test)
        
        # For classification, get class predictions
        if self.model_type == 'classification':
            if self.output_dim > 1:
                # Multi-class
                y_pred_classes = np.argmax(y_pred, axis=1)
                y_true_classes = np.argmax(y_test, axis=1)
            else:
                # Binary
                y_pred_classes = (y_pred > 0.5).astype(int).ravel()
                y_true_classes = y_test.astype(int).ravel()
            
            # Calculate confusion matrix
            from sklearn.metrics import confusion_matrix, classification_report
            cm = confusion_matrix(y_true_classes, y_pred_classes)
            print("\nConfusion Matrix:")
            print(cm)
            
            # Classification report
            print("\nClassification Report:")
            print(classification_report(y_true_classes, y_pred_classes))
        
        return results
    
    def save_model(self, save_path='ml_models', model_name='pet_disease_model.h5'):
        """
        Save the trained model.
        
        Args:
            save_path: Directory to save the model
            model_name: Name of the model file
        """
        if self.model is None:
            raise ValueError("Model not trained. Call train_model first.")
        
        # Create directory if it doesn't exist
        os.makedirs(save_path, exist_ok=True)
        
        # Save the model
        model_path = os.path.join(save_path, model_name)
        self.model.save(model_path)
        print(f"Model saved to {model_path}")
        
        # Save model architecture as JSON
        model_json = self.model.to_json()
        with open(os.path.join(save_path, 'model_architecture.json'), 'w') as json_file:
            json_file.write(model_json)
        
        return model_path
    
    def load_model(self, model_path):
        """
        Load a saved model.
        
        Args:
            model_path: Path to the saved model
        """
        self.model = tf.keras.models.load_model(model_path)
        print(f"Model loaded from {model_path}")
        print(self.model.summary())
        return self.model
    
    def plot_training_history(self, save_path='ml_models'):
        """
        Plot the training history.
        
        Args:
            save_path: Directory to save the plots
        """
        if self.history is None:
            raise ValueError("No training history available. Train the model first.")
        
        # Create directory if it doesn't exist
        os.makedirs(save_path, exist_ok=True)
        
        # Plot training & validation loss
        plt.figure(figsize=(12, 4))
        
        # Loss plot
        plt.subplot(1, 2, 1)
        plt.plot(self.history['loss'])
        plt.plot(self.history['val_loss'])
        plt.title('Model Loss')
        plt.ylabel('Loss')
        plt.xlabel('Epoch')
        plt.legend(['Train', 'Validation'], loc='upper right')
        
        # Metric plot (accuracy for classification, MAE for regression)
        plt.subplot(1, 2, 2)
        if self.model_type == 'classification':
            plt.plot(self.history['accuracy'])
            plt.plot(self.history['val_accuracy'])
            plt.title('Model Accuracy')
            plt.ylabel('Accuracy')
        else:
            plt.plot(self.history['mae'])
            plt.plot(self.history['val_mae'])
            plt.title('Model MAE')
            plt.ylabel('MAE')
        
        plt.xlabel('Epoch')
        plt.legend(['Train', 'Validation'], loc='lower right')
        
        # Save the plot
        plt.tight_layout()
        plot_path = os.path.join(save_path, 'training_history.png')
        plt.savefig(plot_path)
        plt.close()
        
        print(f"Training history plot saved to {plot_path}")
        return plot_path

