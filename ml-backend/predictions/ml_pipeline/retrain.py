import os
import sys
import glob

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

if __name__ == "__main__":
    # Get filename from command line arguments or use default
    if len(sys.argv) > 1:
        filename = sys.argv[1]
    else:
        filename = "futurediseases.csv"
    
    # Find the file
    file_path = find_file(filename)
    
    if file_path:
        print("\nTo use this file in your training script, run:")
        print(f"python run_training.py --data \"{file_path}\" --save-dir ../ml_models --update-api")