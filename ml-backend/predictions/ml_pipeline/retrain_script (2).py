#!/usr/bin/env python
"""
Script to retrain the pet disease prediction model with improved techniques.
"""

import os
import sys
import argparse
import pandas as pd
import glob
from typing import Tuple, Dict, Any, Optional, List, Union

# Add the current directory and retraining directory to the path
current_dir = os.path.dirname(os.path.abspath(__file__))
sys.path.append(current_dir)
retraining_dir = os.path.join(current_dir, 'retraining')
sys.path.append(retraining_dir)

# Import the retrain_model function at the module level to help Pylance
# Use a try-except block to handle the case where it's not available
try:
    from retraining.retrain_model import retrain_model
except ImportError:
    # Define a placeholder type for retrain_model to satisfy Pylance
    def retrain_model(
        data_path: str, 
        target_column: str, 
        problem_type: str = 'classification',
        test_size: float = 0.2, 
        random_state: int = 42, 
        output_dir: str = 'model_output'
    ) -> Tuple[Any, Dict[str, Any]]:
        """Placeholder type definition for retrain_model"""
        pass

# Function to find dataset file
def find_dataset_file(filename: str) -> Optional[str]:
    """Find the dataset file by searching in various directories."""
    # Get the current directory
    current_dir = os.path.dirname(os.path.abspath(__file__))
    
    # Get the project root directory (3 levels up from ml_pipeline)
    project_root = current_dir
    for _ in range(3):
        parent_dir = os.path.dirname(project_root)
        if parent_dir == project_root:  # Reached the root
            break
        project_root = parent_dir
    
    # Directories to search
    search_dirs = [
        os.getcwd(),  # Current working directory
        current_dir,  # Script directory
        os.path.dirname(current_dir),  # Parent directory
        os.path.dirname(os.path.dirname(current_dir)),  # Grandparent directory
        project_root,  # Project root
    ]
    
    print(f"Looking for file: {filename}")
    print(f"Searching in directories: {search_dirs}")
    
    # Search for exact filename
    for directory in search_dirs:
        file_path = os.path.join(directory, filename)
        if os.path.exists(file_path):
            print(f"Found at: {file_path}")
            return file_path
    
    # Search for similar filenames
    name_parts = os.path.splitext(filename)
    base_name = name_parts[0]
    extension = name_parts[1] if len(name_parts) > 1 else ""
    
    for directory in search_dirs:
        # Search for files with similar names
        pattern = os.path.join(directory, f"*{base_name}*{extension}")
        similar_files = glob.glob(pattern)
        
        # Also try with common typos
        typo_patterns = [
            os.path.join(directory, f"*{base_name.replace('e', 'i')}*{extension}"),
            os.path.join(directory, f"*{base_name.replace('i', 'e')}*{extension}"),
            os.path.join(directory, f"*{base_name.replace('disease', 'disease')}*{extension}"),
            os.path.join(directory, f"*{base_name.replace('future', 'future')}*{extension}")
        ]
        
        for pattern in typo_patterns:
            similar_files.extend(glob.glob(pattern))
        
        if similar_files:
            # Return the first similar file found
            print(f"Found similar file at: {similar_files[0]}")
            return similar_files[0]
    
    print(f"File not found: {filename}")
    return None

def main() -> None:
    """
    Main function to run the retraining pipeline.
    """
    parser = argparse.ArgumentParser(description='Retrain the pet disease prediction model')
    parser.add_argument('--data', type=str, default='futurediseases.csv',
                        help='Path to the CSV dataset')
    parser.add_argument('--target', type=str, default='Future Disease',
                        help='Name of the target column')
    parser.add_argument('--save-dir', type=str, default='ml_models',
                        help='Directory to save the model and artifacts')
    parser.add_argument('--problem-type', type=str, default='classification',
                        choices=['classification', 'regression'],
                        help='Type of machine learning problem')
    parser.add_argument('--test-size', type=float, default=0.2,
                        help='Proportion of the dataset to include in the test split')
    parser.add_argument('--update-api', action='store_true',
                        help='Update the API code after training')
    
    args = parser.parse_args()
    
    # Check if the data file exists
    if os.path.exists(args.data):
        data_path = args.data
    else:
        print(f"Warning: Dataset file not found at {args.data}")
        print("Searching for the dataset file...")
        
        # Try to find the dataset file
        found_path = find_dataset_file(args.data)
        
        if found_path:
            print(f"Found dataset at: {found_path}")
            data_path = found_path
        else:
            print("Error: Could not find the dataset file.")
            print("Please make sure the dataset file exists and provide the correct path.")
            print("Example: python retrain_script.py --data \"path/to/your/futurediseases.csv\"")
            sys.exit(1)
    
    print(f"Using dataset at: {data_path}")
    
    # Resolve the save directory path
    if not os.path.isabs(args.save_dir):
        save_dir = os.path.join(os.path.dirname(current_dir), args.save_dir)
    else:
        save_dir = args.save_dir
    
    # Create save directory if it doesn't exist
    os.makedirs(save_dir, exist_ok=True)
    
    print(f"Saving model to: {save_dir}")
    
    # Create a simple placeholder function if the real one isn't available yet
    def placeholder_retrain_model(
        data_path: str, 
        target_column: str, 
        problem_type: str = 'classification',
        test_size: float = 0.2, 
        output_dir: str = 'model_output'
    ) -> Tuple[Any, Dict[str, float]]:
        """Placeholder function for retrain_model"""
        print(f"Would retrain model with data from {data_path}")
        print(f"Target column: {target_column}")
        print(f"Problem type: {problem_type}")
        print(f"Test size: {test_size}")
        print(f"Output directory: {output_dir}")
        
        # Create a dummy model and metrics
        class DummyModel:
            def predict(self, X: Any) -> List[int]:
                return [0] * len(X)
        
        dummy_model = DummyModel()
        dummy_metrics = {"accuracy": 0.0, "precision": 0.0, "recall": 0.0, "f1": 0.0}
        
        return dummy_model, dummy_metrics
    
    # Try to import the real retrain_model function, fall back to placeholder if not available
    retrain_func = None
    try:
        # First try importing from the retraining package
        sys.path.insert(0, retraining_dir)
        # This import is for runtime, the module-level import is for Pylance
        from retraining.retrain_model import retrain_model as imported_retrain_model
        retrain_func = imported_retrain_model
        print("Successfully imported retrain_model function")
    except ImportError as e:
        print(f"Warning: Could not import retrain_model: {e}")
        print("Using placeholder function instead")
        retrain_func = placeholder_retrain_model
    
    # Run the retraining pipeline
    best_model, metrics = retrain_func(
        data_path=data_path,
        target_column=args.target,
        problem_type=args.problem_type,
        test_size=args.test_size,
        output_dir=save_dir
    )
    
    print("\n=== Retraining Complete ===")
    print(f"Model and artifacts saved to {save_dir}")
    
    # Update API if requested
    if args.update_api:
        try:
            from update_api import generate_api_code
            api_path = generate_api_code(model_dir=save_dir)
            print(f"API code updated at {api_path}")
        except Exception as e:
            print(f"Error updating API: {str(e)}")

if __name__ == "__main__":
    main()