import os
import pandas as pd

def verify_csv_file(file_path):
    """
    Verify that a CSV file exists and can be read.
    
    Args:
        file_path: Path to the CSV file
    """
    print(f"Verifying file: {file_path}")
    
    # Check if the file exists
    if not os.path.exists(file_path):
        print(f"Error: File does not exist at {file_path}")
        return False
    
    # Check if the file is readable
    try:
        # Try to read the first few rows
        df = pd.read_csv(file_path, nrows=5)
        print(f"Success! File is readable.")
        print(f"File shape: {df.shape}")
        print(f"File columns: {df.columns.tolist()}")
        print(f"First few rows:")
        print(df.head())
        return True
    except Exception as e:
        print(f"Error reading file: {str(e)}")
        return False

if __name__ == "__main__":
    import sys
    
    # Get file path from command line arguments or use default
    if len(sys.argv) > 1:
        file_path = sys.argv[1]
    else:
        file_path = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))), "futuredisease.csv")
    
    # Verify the file
    verify_csv_file(file_path)

