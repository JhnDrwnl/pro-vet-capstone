import os
import sys
import pandas as pd
import numpy as np
import joblib
import json
import matplotlib.pyplot as plt
import seaborn as sns
from sklearn.metrics import accuracy_score, f1_score, classification_report, confusion_matrix

def load_and_evaluate_models(models_dir, data_path, target_column):
    """
    Load and evaluate all models in the models directory.
    
    Args:
        models_dir (str): Directory containing model subdirectories
        data_path (str): Path to the test dataset
        target_column (str): Name of the target column
    
    Returns:
        dict: Evaluation results for each model
    """
    print(f"Loading and evaluating models from {models_dir}...")
    
    # Load test data
    try:
        test_data = pd.read_csv(data_path, encoding='utf-8')
    except UnicodeDecodeError:
        try:
            test_data = pd.read_csv(data_path, encoding='latin1')
        except UnicodeDecodeError:
            test_data = pd.read_csv(data_path, encoding='cp1252')
    
    print(f"Loaded test data with shape: {test_data.shape}")
    
    # Get unique species
    species_column = 'Pet Species'
    species_list = test_data[species_column].unique()
    print(f"Found {len(species_list)} unique species in test data: {species_list}")
    
    # Initialize results dictionary
    results = {}
    
    # Evaluate each species model
    for species in species_list:
        species_clean = species.lower().replace(' ', '_')
        species_dir = os.path.join(models_dir, species_clean)
        
        if not os.path.exists(species_dir):
            print(f"No model directory found for species: {species}")
            continue
        
        print(f"\n{'='*50}")
        print(f"Evaluating model for species: {species}")
        print(f"{'='*50}")
        
        # Load model and feature names
        model_path = os.path.join(species_dir, 'model.pkl')
        feature_names_path = os.path.join(species_dir, 'feature_names.pkl')
        
        if not os.path.exists(model_path) or not os.path.exists(feature_names_path):
            print(f"Model or feature names not found for species: {species}")
            continue
        
        try:
            model = joblib.load(model_path)
            feature_names = joblib.load(feature_names_path)
            
            print(f"Loaded model and {len(feature_names)} features for {species}")
            
            # Filter test data for this species
            species_test_data = test_data[test_data[species_column] == species].copy()
            
            if len(species_test_data) == 0:
                print(f"No test data found for species: {species}")
                continue
            
            print(f"Test data for {species}: {len(species_test_data)} samples")
            
            # Split features and target
            X_test = species_test_data.drop(columns=[target_column])
            y_test = species_test_data[target_column]
            
            # Make predictions
            y_pred = model.predict(X_test)
            
            # Calculate metrics
            accuracy = accuracy_score(y_test, y_pred)
            f1 = f1_score(y_test, y_pred, average='weighted')
            
            print(f"Accuracy: {accuracy:.4f}")
            print(f"F1 Score: {f1:.4f}")
            
            # Print classification report
            print("\nClassification Report:")
            print(classification_report(y_test, y_pred))
            
            # Store results
            results[species] = {
                'accuracy': float(accuracy),
                'f1_score': float(f1),
                'num_samples': len(species_test_data),
                'num_classes': len(y_test.unique())
            }
            
            # Create and save confusion matrix
            plt.figure(figsize=(10, 8))
            cm = confusion_matrix(y_test, y_pred)
            sns.heatmap(cm, annot=True, fmt='d', cmap='Blues')
            plt.title(f'Confusion Matrix - {species}')
            plt.ylabel('True Label')
            plt.xlabel('Predicted Label')
            plt.tight_layout()
            plt.savefig(os.path.join(species_dir, 'test_confusion_matrix.png'))
            plt.close()
            
        except Exception as e:
            print(f"Error evaluating model for {species}: {str(e)}")
            import traceback
            traceback.print_exc()
    
    # Save overall results
    results_path = os.path.join(models_dir, 'evaluation_results.json')
    with open(results_path, 'w') as f:
        json.dump(results, f, indent=4)
    print(f"\nEvaluation results saved to {results_path}")
    
    return results

def main():
    import argparse
    
    parser = argparse.ArgumentParser(description='Evaluate species-specific disease prediction models')
    parser.add_argument('--models-dir', type=str, default='improved_species_models',
                        help='Directory containing model subdirectories')
    parser.add_argument('--data', type=str, default='futurediseases_test.csv',
                        help='Path to the test dataset')
    parser.add_argument('--target', type=str, default='Future Disease',
                        help='Name of the target column')
    
    args = parser.parse_args()
    
    # Evaluate models
    results = load_and_evaluate_models(
        models_dir=args.models_dir,
        data_path=args.data,
        target_column=args.target
    )
    
    # Print summary of results
    print("\n\n" + "="*50)
    print("EVALUATION RESULTS SUMMARY")
    print("="*50)
    
    # Calculate overall metrics
    total_samples = sum(results[species]['num_samples'] for species in results)
    weighted_accuracy = sum(results[species]['accuracy'] * results[species]['num_samples'] 
                           for species in results) / total_samples
    weighted_f1 = sum(results[species]['f1_score'] * results[species]['num_samples'] 
                     for species in results) / total_samples
    
    print(f"\nOverall weighted accuracy: {weighted_accuracy:.4f}")
    print(f"Overall weighted F1 score: {weighted_f1:.4f}")
    print(f"Total samples: {total_samples}")
    
    # Print per-species results
    for species, metrics in results.items():
        print(f"\n{species.upper()}:")
        print(f"  Accuracy: {metrics['accuracy']:.4f}")
        print(f"  F1 Score: {metrics['f1_score']:.4f}")
        print(f"  Samples: {metrics['num_samples']}")
        print(f"  Classes: {metrics['num_classes']}")

if __name__ == "__main__":
    main()