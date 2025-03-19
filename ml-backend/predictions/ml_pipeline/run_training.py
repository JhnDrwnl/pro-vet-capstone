import os
import sys
import argparse
import glob

def find_dataset_file(filename):
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
        current_dir,  # Current directory
        os.path.dirname(current_dir),  # Parent directory
        os.path.dirname(os.path.dirname(current_dir)),  # Grandparent directory
        project_root,  # Project root
    ]
    
    # Search for exact filename
    for directory in search_dirs:
        file_path = os.path.join(directory, filename)
        if os.path.exists(file_path):
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
            return similar_files[0]
    
    return None

def main():
    """
    Main function to run the training pipeline.
    """
    parser = argparse.ArgumentParser(description='Train a pet disease prediction model')
    parser.add_argument('--data', type=str, default='futuredisease.csv',
                        help='Path to the CSV dataset')
    parser.add_argument('--save-dir', type=str, default='ml_models',
                        help='Directory to save the model and artifacts')
    parser.add_argument('--epochs', type=int, default=50,
                        help='Number of training epochs')
    parser.add_argument('--batch-size', type=int, default=32,
                        help='Batch size for training')
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
        found_path = find_dataset_file(os.path.basename(args.data))
        
        if found_path:
            print(f"Found dataset at: {found_path}")
            data_path = found_path
        else:
            print("Error: Could not find the dataset file.")
            print("Please make sure the dataset file exists and provide the correct path.")
            print("Example: python run_training.py --data \"C:\\path\\to\\your\\futuredisease.csv\"")
            sys.exit(1)
    
    print(f"Using dataset at: {data_path}")
    
    # Resolve the save directory path
    current_dir = os.path.dirname(os.path.abspath(__file__))
    if not os.path.isabs(args.save_dir):
        save_dir = os.path.join(os.path.dirname(current_dir), args.save_dir)
    else:
        save_dir = args.save_dir
    
    # Create save directory if it doesn't exist
    os.makedirs(save_dir, exist_ok=True)
    
    print(f"Saving model to: {save_dir}")
    
    # Add the current directory to the Python path
    if current_dir not in sys.path:
        sys.path.append(current_dir)
    
    # Import the training module
    from train_model import train_pet_disease_model
    
    # Train the model
    result = train_pet_disease_model(
        data_path=data_path,
        model_save_path=save_dir,
        epochs=args.epochs,
        batch_size=args.batch_size
    )
    
    # Update API if requested
    if args.update_api:
        from update_api import generate_api_code
        api_path = generate_api_code(model_dir=save_dir)
        print(f"API code updated at {api_path}")

if __name__ == "__main__":
    main()

