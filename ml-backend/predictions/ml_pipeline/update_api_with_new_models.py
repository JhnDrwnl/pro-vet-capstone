import os
import shutil
from pathlib import Path

# Set paths
BASE_DIR = Path(__file__).resolve().parent.parent.parent.parent
NEW_MODELS_DIR = os.path.join(BASE_DIR, 'retrained_models')
API_MODELS_DIR = os.path.join(BASE_DIR, 'predictions', 'ml_models')

def update_api_models():
    """Update the API models with the new retrained models"""
    # Create API models directory if it doesn't exist
    os.makedirs(API_MODELS_DIR, exist_ok=True)
    
    # Species to update
    species_list = ['Cat', 'Dog', 'Hamster', 'Rabbit']
    
    for species in species_list:
        species_lower = species.lower()
        
        # Source and destination paths
        source_dir = os.path.join(NEW_MODELS_DIR, species_lower)
        dest_dir = os.path.join(API_MODELS_DIR, species_lower)
        
        if os.path.exists(source_dir):
            # Create destination directory if it doesn't exist
            os.makedirs(dest_dir, exist_ok=True)
            
            # Copy model files
            for file_name in ['model.pkl', 'feature_names.pkl', 'metrics.json']:
                source_file = os.path.join(source_dir, file_name)
                dest_file = os.path.join(dest_dir, file_name)
                
                if os.path.exists(source_file):
                    shutil.copy2(source_file, dest_file)
                    print(f"Copied {source_file} to {dest_file}")
                else:
                    print(f"Warning: {source_file} not found")
            
            print(f"Updated API models for {species}")
        else:
            print(f"Warning: No retrained models found for {species}")
    
    print("API models update complete")

if __name__ == "__main__":
    update_api_models()