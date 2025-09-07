import pandas as pd
import numpy as np
import os
import argparse
import joblib
import json
import logging
import glob
from sklearn.metrics import classification_report, accuracy_score, f1_score, confusion_matrix
import matplotlib.pyplot as plt
from data_cleaner import DataCleaner

# Set up logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

def load_and_evaluate_models(model_dir, data_path, target_column='Future Disease'):
    """Load and evaluate models from the specified directory."""
    logger.info(f"Loading and evaluating models from {model_dir}...")
    
    # Load and clean test data
    cleaner = DataCleaner(data_path)
    test_data = cleaner.load_data()
    test_data = cleaner.clean_data()
    
    # Find all model directories
    if os.path.isdir(os.path.join(model_dir, 'dog')) or os.path.isdir(os.path.join(model_dir, 'cat')):
        # This is a species-specific model directory
        model_dirs = [os.path.join(model_dir, d) for d in os.listdir(model_dir) 
                     if os.path.isdir(os.path.join(model_dir, d))]
        is_species_model = True
    else:
        # This is a general model directory
        model_dirs = [model_dir]
        is_species_model = False
    
    results = {}
    
    for model_dir in model_dirs:
        try:
            # Get model name (directory name)
            model_name = os.path.basename(model_dir)
            
            # Load model and feature names
            model_path = os.path.join(model_dir, 'best_model.pkl')
            feature_names_path = os.path.join(model_dir, 'feature_names.pkl')
            
            if not os.path.exists(model_path) or not os.path.exists(feature_names_path):
                logger.warning(f"Model or feature names not found in {model_dir}. Skipping.")
                continue
            
            model = joblib.load(model_path)
            feature_names = joblib.load(feature_names_path)
            
            # Prepare test data
            if is_species_model:
                # Filter test data for this species
                species = model_name.replace('_', ' ').title()
                species_test_data = test_data[test_data['Pet Species'] == species].copy()
                
                if len(species_test_data) == 0:
                    logger.warning(f"No test data available for {species}. Skipping evaluation.")
                    continue
                
                logger.info(f"Evaluating model for {species} with {len(species_test_data)} test samples")
                eval_data = species_test_data
            else:
                logger.info(f"Evaluating general model with {len(test_data)} test samples")
                eval_data = test_data
            
            # Prepare features
            X_test = eval_data.copy()
            y_test = X_test[target_column].copy()
            X_test = X_test.drop(columns=[target_column])
            
            # Ensure X_test has the same features as the model was trained on
            for feature in feature_names:
                if feature not in X_test.columns:
                    X_test[feature] = 0  # Add missing columns with default values
            
            # Keep only the features the model was trained on
            X_test = X_test[feature_names]
            
            # Make predictions
            y_pred = model.predict(X_test)
            
            # Calculate metrics
            accuracy = accuracy_score(y_test, y_pred)
            f1 = f1_score(y_test, y_pred, average='weighted')
            
            logger.info(f"Model: {model_name}")
            logger.info(f"Accuracy: {accuracy:.4f}")
            logger.info(f"F1 Score: {f1:.4f}")
            
            # Print classification report
            logger.info("\nClassification Report:")
            logger.info(classification_report(y_test, y_pred))
            
            # Plot confusion matrix
            plt.figure(figsize=(10, 8))
            cm = confusion_matrix(y_test, y_pred)
            plt.imshow(cm, interpolation='nearest', cmap=plt.cm.Blues)
            plt.title(f'Confusion Matrix - {model_name}')
            plt.colorbar()
            plt.ylabel('True Label')
            plt.xlabel('Predicted Label')
            plt.tight_layout()
            plt.savefig(os.path.join(model_dir, 'evaluation_confusion_matrix.png'))
            plt.close()
            
            # Store results
            results[model_name] = {
                'accuracy': float(accuracy),
                'f1_score': float(f1),
                'num_test_samples': len(eval_data)
            }
            
            # Save evaluation results
            eval_results_path = os.path.join(model_dir, 'evaluation_results.json')
            with open(eval_results_path, 'w') as f:
                json.dump(results[model_name], f, indent=4)
            
            logger.info(f"Evaluation results saved to {eval_results_path}")
            
        except Exception as e:
            logger.error(f"Error evaluating model in {model_dir}: {str(e)}", exc_info=True)
    
    return results

def main():
    """Main function to evaluate models."""
    parser = argparse.ArgumentParser(description='Evaluate ML models for pet disease prediction')
    parser.add_argument('--data', type=str, required=True, help='Path to the test data file')
    parser.add_argument('--model-dir', type=str, default='improved_models', help='Directory containing the models')
    parser.add_argument('--species-models', type=str, default='improved_species_models', help='Directory containing species-specific models')
    parser.add_argument('--target', type=str, default='Future Disease', help='Target column name')
    args = parse_args()
    
    # Evaluate general model
    if os.path.exists(args.model_dir):
        general_results = load_and_evaluate_models(args.model_dir, args.data, args.target)
        logger.info("\nGeneral Model Evaluation Results:")
        for model_name, metrics in general_results.items():
            logger.info(f"Model: {model_name}")
            logger.info(f"Accuracy: {metrics['accuracy']:.4f}")
            logger.info(f"F1 Score: {metrics['f1_score']:.4f}")
    
    # Evaluate species-specific models
    if os.path.exists(args.species_models):
        species_results = load_and_evaluate_models(args.species_models, args.data, args.target)
        logger.info("\nSpecies-Specific Model Evaluation Results:")
        for model_name, metrics in species_results.items():
            logger.info(f"Model: {model_name}")
            logger.info(f"Accuracy: {metrics['accuracy']:.4f}")
            logger.info(f"F1 Score: {metrics['f1_score']:.4f}")
    
    logger.info("\nModel evaluation completed!")

def parse_args():
    """Parse command line arguments."""
    parser = argparse.ArgumentParser(description='Evaluate ML models for pet disease prediction')
    parser.add_argument('--data', type=str, required=True, help='Path to the test data file')
    parser.add_argument('--model-dir', type=str, default='improved_models', help='Directory containing the models')
    parser.add_argument('--species-models', type=str, default='improved_species_models', help='Directory containing species-specific models')
    parser.add_argument('--target', type=str, default='Future Disease', help='Target column name')
    return parser.parse_args()

if __name__ == "__main__":
    args = parse_args()
    main()