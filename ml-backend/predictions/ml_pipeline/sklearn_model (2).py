from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import accuracy_score, classification_report, confusion_matrix
import joblib
import os
import numpy as np
import matplotlib.pyplot as plt
import json

class SklearnModelBuilder:
    def __init__(self, input_dim=None, output_dim=None, model_type='classification'):
        """Initialize the scikit-learn model builder."""
        self.model_type = model_type
        self.model = None
        self.input_dim = input_dim
        self.output_dim = output_dim
        self.history = {}
        
    def build_model(self):
        """Build a scikit-learn model."""
        print(f"\nBuilding scikit-learn {self.model_type} model")
        
        if self.model_type == 'classification':
            self.model = RandomForestClassifier(
                n_estimators=100,
                max_depth=None,
                min_samples_split=2,
                random_state=42,
                n_jobs=-1,
                class_weight='balanced'
            )
        else:
            # For regression tasks
            from sklearn.ensemble import RandomForestRegressor
            self.model = RandomForestRegressor(
                n_estimators=100,
                max_depth=None,
                min_samples_split=2,
                random_state=42,
                n_jobs=-1
            )
        
        return self.model
    
    def train_model(self, X_train, y_train, X_test, y_test, 
                   epochs=None, batch_size=None, patience=None, 
                   model_save_path='ml_models'):
        """Train the scikit-learn model."""
        if self.model is None:
            self.build_model()
        
        print("\n--- Training Scikit-learn Model ---")
        
        # For multi-class classification with one-hot encoding
        if len(y_train.shape) > 1 and y_train.shape[1] > 1:
            # Convert one-hot encoded targets back to class indices
            y_train_indices = np.argmax(y_train, axis=1)
            y_test_indices = np.argmax(y_test, axis=1)
            
            # Train the model
            self.model.fit(X_train, y_train_indices)
            
            # Make predictions
            y_pred = self.model.predict(X_test)
            y_pred_proba = self.model.predict_proba(X_test)
            
            # Calculate accuracy
            accuracy = accuracy_score(y_test_indices, y_pred)
            print(f"Test accuracy: {accuracy:.4f}")
            
            # Print classification report
            print("\nClassification Report:")
            print(classification_report(y_test_indices, y_pred))
            
            # Create a confusion matrix
            cm = confusion_matrix(y_test_indices, y_pred)
            
            # Store metrics in history
            self.history = {
                'accuracy': [accuracy],
                'val_accuracy': [accuracy],
                'loss': [1 - accuracy],  # Approximation
                'val_loss': [1 - accuracy]  # Approximation
            }
            
        else:
            # Binary classification or regression
            self.model.fit(X_train, y_train)
            
            # Make predictions
            y_pred = self.model.predict(X_test)
            
            # Calculate metrics
            if self.model_type == 'classification':
                accuracy = accuracy_score(y_test, y_pred)
                print(f"Test accuracy: {accuracy:.4f}")
                
                print("\nClassification Report:")
                print(classification_report(y_test, y_pred))
                
                # Store metrics in history
                self.history = {
                    'accuracy': [accuracy],
                    'val_accuracy': [accuracy],
                    'loss': [1 - accuracy],  # Approximation
                    'val_loss': [1 - accuracy]  # Approximation
                }
            else:
                from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score
                mae = mean_absolute_error(y_test, y_pred)
                mse = mean_squared_error(y_test, y_pred)
                r2 = r2_score(y_test, y_pred)
                
                print(f"Mean Absolute Error: {mae:.4f}")
                print(f"Mean Squared Error: {mse:.4f}")
                print(f"R² Score: {r2:.4f}")
                
                # Store metrics in history
                self.history = {
                    'mae': [mae],
                    'val_mae': [mae],
                    'mse': [mse],
                    'val_mse': [mse],
                    'r2': [r2],
                    'val_r2': [r2]
                }
        
        # Save the model
        os.makedirs(model_save_path, exist_ok=True)
        model_path = os.path.join(model_save_path, 'pet_disease_model.pkl')
        joblib.dump(self.model, model_path)
        print(f"Model saved to {model_path}")
        
        # Create a mock history object to match TensorFlow's format
        class MockHistory:
            def __init__(self, history_dict):
                self.history = history_dict
        
        return MockHistory(self.history)
    
    def save_model(self, save_path='ml_models', model_name='pet_disease_model.pkl'):
        """Save the trained scikit-learn model and metadata."""
        if self.model is None:
            print("No model to save. Please build and train a model first.")
            return
        
        os.makedirs(save_path, exist_ok=True)
        
        # Save the model
        model_path = os.path.join(save_path, model_name)
        joblib.dump(self.model, model_path)
        print(f"Model saved to {model_path}")
        
        # Save model architecture as JSON (mock for compatibility)
        architecture_path = os.path.join(save_path, 'model_architecture.json')
        architecture = {
            "model_type": "RandomForestClassifier" if self.model_type == 'classification' else "RandomForestRegressor",
            "parameters": self.model.get_params()
        }
        with open(architecture_path, 'w') as f:
            json.dump(architecture, f, indent=4)
        print(f"Model architecture saved to {architecture_path}")
        
        # Save training history and metadata
        metadata = {
            'input_dim': self.input_dim,
            'output_dim': self.output_dim,
            'model_type': self.model_type,
            'history': self.history
        }
        
        metadata_path = os.path.join(save_path, 'model_metadata.json')
        with open(metadata_path, 'w') as f:
            json.dump(metadata, f, indent=4)
        print(f"Model metadata saved to {metadata_path}")
        
        # Plot feature importances if available
        if hasattr(self.model, 'feature_importances_'):
            plt.figure(figsize=(10, 6))
            importances = self.model.feature_importances_
            indices = np.argsort(importances)[::-1]
            
            plt.title('Feature Importances')
            plt.bar(range(min(20, len(importances))), importances[indices[:20]])
            plt.xticks(range(min(20, len(importances))), indices[:20], rotation=90)
            plt.tight_layout()
            
            # Save the plot
            importance_plot_path = os.path.join(save_path, 'feature_importances.png')
            plt.savefig(importance_plot_path)
            print(f"Feature importances plot saved to {importance_plot_path}")
            plt.close()
            
            # Also create a training history plot for compatibility
            plt.figure(figsize=(12, 5))
            plt.subplot(1, 2, 1)
            plt.plot(self.history.get('loss', [0]))
            plt.plot(self.history.get('val_loss', [0]))
            plt.title('Model Loss')
            plt.ylabel('Loss')
            plt.xlabel('Epoch')
            plt.legend(['Train', 'Validation'], loc='upper right')
            
            if 'accuracy' in self.history:
                plt.subplot(1, 2, 2)
                plt.plot(self.history['accuracy'])
                plt.plot(self.history['val_accuracy'])
                plt.title('Model Accuracy')
                plt.ylabel('Accuracy')
                plt.xlabel('Epoch')
                plt.legend(['Train', 'Validation'], loc='lower right')
            
            history_plot_path = os.path.join(save_path, 'training_history.png')
            plt.tight_layout()
            plt.savefig(history_plot_path)
            print(f"Training history plot saved to {history_plot_path}")
            plt.close()
        
        return model_path

