import os
import sys
import subprocess
from datetime import datetime

def run_script(script_path, description):
    """Run a Python script and print its output"""
    print(f"\n{'='*80}")
    print(f"Running: {description}")
    print(f"{'='*80}\n")
    
    try:
        result = subprocess.run([sys.executable, script_path], 
                               capture_output=True, text=True, check=True)
        print(result.stdout)
        if result.stderr:
            print(f"Errors/Warnings:\n{result.stderr}")
        return True
    except subprocess.CalledProcessError as e:
        print(f"Error running {script_path}:")
        print(e.stdout)
        print(e.stderr)
        return False

def main():
    """Run the entire retraining pipeline"""
    start_time = datetime.now()
    print(f"Starting retraining pipeline at {start_time}")
    
    # Define scripts to run
    scripts = [
        {
            'path': 'predictions/ml_pipeline/retrain_with_new_data.py',
            'description': 'Retraining models with new data'
        },
        {
            'path': 'predictions/ml_pipeline/compare_models.py',
            'description': 'Comparing old and new models'
        },
        {
            'path': 'predictions/ml_pipeline/test_new_models.py',
            'description': 'Testing new models with sample data'
        },
        {
            'path': 'predictions/ml_pipeline/update_api_with_new_models.py',
            'description': 'Updating API with new models'
        },
        {
            'path': 'predictions/ml_pipeline/hyperparameter_tuning.py',
            'description': 'Implement Hyperparameter Tuning'
        },
        {
            'path': 'predictions/ml_pipeline/algorithm_comparison.py',
            'description': 'Try Different Algorithms'
        },
        {
            'path': 'predictions/ml_pipeline/confusion_matrix_visualization.py',
            'description': 'Implement Confusion Matrix Visualization'
        }

    ]
    
    # Run each script
    for script in scripts:
        success = run_script(script['path'], script['description'])
        if not success:
            print(f"Error running {script['path']}. Stopping pipeline.")
            break
    
    end_time = datetime.now()
    duration = end_time - start_time
    print(f"\nRetraining pipeline completed at {end_time}")
    print(f"Total duration: {duration}")

if __name__ == "__main__":
    main()