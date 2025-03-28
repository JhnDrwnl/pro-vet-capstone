import pandas as pd
import os

def split_dataset_by_species(input_file, output_dir):
    """
    Split the dataset by species and save as separate CSV files.
    
    Args:
        input_file (str): Path to the input CSV file
        output_dir (str): Directory to save the output files
    
    Returns:
        dict: Mapping of species to output file paths
    """
    # Create output directory if it doesn't exist
    os.makedirs(output_dir, exist_ok=True)
    
    # Load the dataset
    print(f"Loading dataset from {input_file}...")
    try:
        df = pd.read_csv(input_file, encoding='latin1')
    except UnicodeDecodeError:
        try:
            df = pd.read_csv(input_file, encoding='ISO-8859-1')
        except UnicodeDecodeError:
            df = pd.read_csv(input_file, encoding='cp1252')
    
    # Get unique species
    species_column = 'Pet Species'
    species_list = df[species_column].unique()
    print(f"Found {len(species_list)} unique species: {species_list}")
    
    # Create a mapping of species to file paths
    species_files = {}
    
    # Split and save by species
    for species in species_list:
        # Filter data for this species
        species_data = df[df[species_column] == species]
        
        # Create a clean filename (replace spaces with underscores, lowercase)
        species_clean = species.lower().replace(' ', '_')
        output_file = os.path.join(output_dir, f"future_{species_clean}_disease.csv")
        
        # Save to CSV
        species_data.to_csv(output_file, index=False)
        
        # Store in mapping
        species_files[species] = output_file
        
        print(f"Saved {len(species_data)} records for {species} to {output_file}")
    
    # Create a summary file with counts
    summary = pd.DataFrame({
        'Species': list(species_files.keys()),
        'Count': [len(df[df[species_column] == species]) for species in species_files.keys()],
        'File': list(species_files.values())
    })
    
    summary_file = os.path.join(output_dir, "species_summary.csv")
    summary.to_csv(summary_file, index=False)
    print(f"Saved summary to {summary_file}")
    
    return species_files

if __name__ == "__main__":
    # Get the current directory
    current_dir = os.path.dirname(os.path.abspath(__file__))
    
    # Define input and output paths
    input_file = os.path.join(current_dir, "..", "..", "futurediseases.csv")
    output_dir = os.path.join(current_dir, "..", "..", "species_data")
    
    # Split the dataset
    species_files = split_dataset_by_species(input_file, output_dir)