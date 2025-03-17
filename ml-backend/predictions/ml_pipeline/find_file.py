import os
import sys

def find_file(filename, start_dir=None):
    """
    Find a file by searching in the current directory and parent directories.
    
    Args:
        filename: Name of the file to find
        start_dir: Directory to start the search from (default: current directory)
    """
    if start_dir is None:
        start_dir = os.getcwd()
    
    print(f"Looking for file: {filename}")
    print(f"Starting search from: {start_dir}")
    
    # Check current directory
    current_path = os.path.join(start_dir, filename)
    if os.path.exists(current_path):
        print(f"Found at: {current_path}")
        return current_path
    
    # Check parent directory
    parent_dir = os.path.dirname(start_dir)
    if parent_dir != start_dir:  # Avoid infinite loop at root
        parent_path = os.path.join(parent_dir, filename)
        if os.path.exists(parent_path):
            print(f"Found at: {parent_path}")
            return parent_path
        
        # Check grandparent directory
        grandparent_dir = os.path.dirname(parent_dir)
        if grandparent_dir != parent_dir:  # Avoid infinite loop at root
            grandparent_path = os.path.join(grandparent_dir, filename)
            if os.path.exists(grandparent_path):
                print(f"Found at: {grandparent_path}")
                return grandparent_path
    
    print(f"File not found: {filename}")
    return None

if __name__ == "__main__":
    # Get filename from command line arguments or use default
    if len(sys.argv) > 1:
        filename = sys.argv[1]
    else:
        filename = "futuredisease.csv"
    
    # Find the file
    file_path = find_file(filename)
    
    if file_path:
        print("\nTo use this file in your training script, run:")
        print(f"python run_training.py --data \"{file_path}\" --save-dir ../ml_models --update-api")

