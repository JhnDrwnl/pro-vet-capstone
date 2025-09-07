import os
import sys
import pandas as pd
import numpy as np
import joblib
import json
import glob
from sklearn.model_selection import train_test_split, StratifiedKFold, cross_val_score
from sklearn.ensemble import RandomForestClassifier, GradientBoostingClassifier, VotingClassifier
from sklearn.metrics import classification_report, accuracy_score, f1_score, confusion_matrix
from sklearn.preprocessing import StandardScaler, OneHotEncoder
from sklearn.compose import ColumnTransformer
from sklearn.pipeline import Pipeline
from sklearn.feature_selection import SelectFromModel
from imblearn.over_sampling import SMOTE
from imblearn.pipeline import Pipeline as ImbPipeline
import matplotlib.pyplot as plt
import seaborn as sns
from xgboost import XGBClassifier
from lightgbm import LGBMClassifier

def find_dataset_file(filename):
    """Find the dataset file by searching in various directories."""
    # Get the current directory
    current_dir = os.path.dirname(os.path.abspath(__file__))
    
    # Get the project root directory (3 levels up from ml_pipeline)
    project_root = os.path.abspath(os.path.join(current_dir, '..', '..'))
    
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
            os.path.join(directory, f"*future*disease*{extension}"),
            os.path.join(directory, f"*disease*{extension}"),
            os.path.join(directory, f"*pet*disease*{extension}")
        ]
        
        for pattern in typo_patterns:
            similar_files.extend(glob.glob(pattern))
        
        if similar_files:
            # Return the first similar file found
            print(f"Found similar file at: {similar_files[0]}")
            return similar_files[0]
    
    print(f"File not found: {filename}")
    return None

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
        df = pd.read_csv(input_file, encoding='utf-8')
    except UnicodeDecodeError:
        try:
            df = pd.read_csv(input_file, encoding='latin1')
        except UnicodeDecodeError:
            try:
                df = pd.read_csv(input_file, encoding='cp1252')
            except Exception as e:
                print(f"Error reading file with multiple encodings: {str(e)}")
                raise
    except FileNotFoundError:
        print(f"File not found: {input_file}")
        raise
    
    # Get unique species
    species_column = 'Pet Species'
    if species_column not in df.columns:
        print(f"Warning: '{species_column}' column not found in dataset.")
        print(f"Available columns: {df.columns.tolist()}")
        raise ValueError(f"Required column '{species_column}' not found in dataset")
    
    species_list = df[species_column].unique()
    print(f"Found {len(species_list)} unique species: {species_list}")
    
    # Create a mapping of species to file paths
    species_files = {}
    
    # Split and save by species
    for species in species_list:
        # Filter data for this species
        species_data = df[df[species_column] == species]
        
        # Create a clean filename (replace spaces with underscores, lowercase)
        species_clean = str(species).lower().replace(' ', '_')
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

def train_improved_species_model(species_file, target_column, output_dir, test_size=0.2):
    """
    Train an improved model for a specific species.
    
    Args:
        species_file (str): Path to the species-specific CSV file
        target_column (str): Name of the target column
        output_dir (str): Directory to save the model and artifacts
        test_size (float): Proportion of data to use for testing
    
    Returns:
        tuple: (model, metrics) - The trained model and its performance metrics
    """
    # Extract species name from filename
    species = os.path.basename(species_file).split('_')[1]
    print(f"\n{'='*50}")
    print(f"Training improved model for species: {species}")
    print(f"{'='*50}")
    
    # Create species-specific output directory
    species_output_dir = os.path.join(output_dir, species)
    os.makedirs(species_output_dir, exist_ok=True)
    
    # Step 1: Load and clean data
    print("\nStep 1: Loading and cleaning data")
    try:
        df = pd.read_csv(species_file, encoding='utf-8')
    except UnicodeDecodeError:
        try:
            df = pd.read_csv(species_file, encoding='latin1')
        except UnicodeDecodeError:
            try:
                df = pd.read_csv(species_file, encoding='cp1252')
            except Exception as e:
                print(f"Error reading file with multiple encodings: {str(e)}")
                raise
    
    print(f"Loaded data with shape: {df.shape}")
    
    # Check if target column exists
    if target_column not in df.columns:
        print(f"Warning: Target column '{target_column}' not found in dataset.")
        print(f"Available columns: {df.columns.tolist()}")
        raise ValueError(f"Target column '{target_column}' not found in dataset")
    
    # Handle missing values
    for col in df.select_dtypes(include=['object']).columns:
        df[col] = df[col].fillna("Unknown")
    
    for col in df.select_dtypes(include=['number']).columns:
        # Use median for skewed distributions, mean otherwise
        try:
            skewness = df[col].skew()
            if abs(skewness) > 1:
                df[col] = df[col].fillna(df[col].median())
            else:
                df[col] = df[col].fillna(df[col].mean())
        except:
            # If skew calculation fails, use median
            df[col] = df[col].fillna(df[col].median())
    
    # Step 2: Advanced feature engineering
    print("\nStep 2: Advanced feature engineering")
    
    # Create age groups with more granular bins
    if 'Age (years)' in df.columns:
        try:
            df['Age_Group'] = pd.cut(
                df['Age (years)'], 
                bins=[0, 0.5, 1, 2, 4, 7, 10, 15, 100],  # Extended upper limit
                labels=['Infant', 'Baby', 'Toddler', 'Young', 'Adult', 'Mature', 'Senior', 'Geriatric']
            )
        except Exception as e:
            print(f"Warning: Error creating age groups: {str(e)}")
            # Create a simpler version
            df['Age_Group'] = pd.cut(
                df['Age (years)'],
                bins=[0, 1, 5, 10, 100],
                labels=['Young', 'Adult', 'Senior', 'Geriatric']
            )
    
    # Create weight categories with more granular bins
    if 'Weight (kg)' in df.columns:
        try:
            df['Weight_Category'] = pd.cut(
                df['Weight (kg)'],
                bins=[0, 1, 3, 5, 10, 15, 25, 40, 1000],  # Extended upper limit
                labels=['Tiny', 'Very Small', 'Small', 'Medium-Small', 'Medium', 'Medium-Large', 'Large', 'Giant']
            )
        except Exception as e:
            print(f"Warning: Error creating weight categories: {str(e)}")
            # Create a simpler version
            df['Weight_Category'] = pd.cut(
                df['Weight (kg)'],
                bins=[0, 5, 15, 1000],
                labels=['Small', 'Medium', 'Large']
            )
    
    # Extract text features from symptoms
    if 'Symptoms' in df.columns:
        # Create binary indicators for common symptoms
        common_symptoms = [
            'vomiting', 'diarrhea', 'lethargy', 'fever', 'cough', 'sneezing',
            'limping', 'pain', 'swelling', 'itching', 'rash', 'bleeding',
            'loss', 'seizures', 'appetite', 'thirst', 'urination', 'breathing'
        ]
        
        for symptom in common_symptoms:
            df[f'Has_{symptom}'] = df['Symptoms'].str.contains(
                symptom, case=False, na=False).astype(int)
        
        # Count total symptoms mentioned
        df['Symptom_Count'] = df[[f'Has_{s}' for s in common_symptoms]].sum(axis=1)
    
    # Create interaction features
    if 'Age (years)' in df.columns and 'Weight (kg)' in df.columns:
        # Age-weight ratio
        df['Age_Weight_Ratio'] = df['Age (years)'] / (df['Weight (kg)'] + 0.1)
        
        # Body condition score approximation
        df['Body_Condition_Score'] = df['Weight (kg)'] / (df['Age (years)'] + 0.5)
    
    # Polynomial features
    if 'Age (years)' in df.columns:
        df['Age_Squared'] = df['Age (years)'] ** 2
    
    if 'Weight (kg)' in df.columns:
        df['Weight_Squared'] = df['Weight (kg)'] ** 2
    
    # Frequency encoding for high-cardinality categorical features
    cat_cols = df.select_dtypes(include=['object']).columns
    for col in cat_cols:
        if col != target_column and df[col].nunique() > 10:
            freq = df[col].value_counts(normalize=True)
            df[f'{col}_Freq'] = df[col].map(freq)
    
    print(f"Feature engineering complete. New shape: {df.shape}")
    
    # Step 3: Split data and prepare for modeling
    print("\nStep 3: Preparing data for modeling")
    
    # Split features and target
    X = df.drop(columns=[target_column])
    y = df[target_column]
    
    # Print target distribution
    print(f"\nTarget distribution:")
    print(y.value_counts().head(10))
    print(f"Total classes: {y.nunique()}")
    
    # Store feature names
    feature_names = X.columns.tolist()
    
    # Split data into train and test sets
    try:
        X_train, X_test, y_train, y_test = train_test_split(
            X, y, test_size=test_size, random_state=42,
            stratify=y if len(y.unique()) > 1 else None
        )
    except ValueError as e:
        print(f"Warning: Error in stratified split: {str(e)}")
        # Fall back to non-stratified split
        X_train, X_test, y_train, y_test = train_test_split(
            X, y, test_size=test_size, random_state=42
        )
    
    print(f"Training set size: {X_train.shape}")
    print(f"Test set size: {X_test.shape}")
    
    # Step 4: Build preprocessing pipeline
    print("\nStep 4: Building preprocessing pipeline")
    
    # Define preprocessing for numeric and categorical features
    numeric_features = X.select_dtypes(include=['int64', 'float64']).columns
    categorical_features = X.select_dtypes(include=['object', 'category']).columns
    
    # Create preprocessing pipelines
    numeric_transformer = Pipeline(steps=[
        ('scaler', StandardScaler())
    ])
    
    categorical_transformer = Pipeline(steps=[
        ('onehot', OneHotEncoder(handle_unknown='ignore', sparse_output=False))
    ])
    
    # Combine preprocessing steps
    preprocessor = ColumnTransformer(
        transformers=[
            ('num', numeric_transformer, numeric_features),
            ('cat', categorical_transformer, categorical_features)
        ])
    
    # Step 5: Train ensemble of models
    print("\nStep 5: Training ensemble of models")
    
    # Define base models with reduced complexity for faster training
    base_models = {
        'random_forest': RandomForestClassifier(
            n_estimators=100,  # Reduced from 200
            max_depth=15,      # Reduced from 20
            min_samples_split=5,
            min_samples_leaf=2,
            class_weight='balanced',
            random_state=42,
            n_jobs=-1
        ),
    #     'gradient_boosting': GradientBoostingClassifier(
    #         n_estimators=50,  # Reduced from 100/200
    #         learning_rate=0.1,
    #         max_depth=3,      # Reduced from 5
    #         min_samples_split=20,
    #         subsample=0.8,    # Add subsampling
    #         random_state=42,
    #         verbose=1  # Add this line
    #     )
    }
    
    # Try to add XGBoost and LightGBM if available
    try:
        base_models['xgboost'] = XGBClassifier(
            n_estimators=100,  # Reduced from 200
            learning_rate=0.1,
            max_depth=5,
            random_state=42,
            use_label_encoder=False,
            eval_metric='mlogloss'
        )
    except Exception as e:
        print(f"Warning: Could not add XGBoost model: {str(e)}")
    
    try:
        base_models['lightgbm'] = LGBMClassifier(
            n_estimators=100,  # Reduced from 200
            learning_rate=0.1,
            max_depth=5,
            random_state=42,
            verbose=-1
        )
    except Exception as e:
        print(f"Warning: Could not add LightGBM model: {str(e)}")
    
    # Train and evaluate each model
    model_pipelines = {}
    model_scores = {}
    
    for name, model in base_models.items():
        print(f"\nTraining {name}...")
        
        try:
            # Create pipeline with SMOTE for handling class imbalance
            pipeline = ImbPipeline(steps=[
                ('preprocessor', preprocessor),
                ('smote', SMOTE(random_state=42)),
                ('classifier', model)
            ])
            
            # Fit the pipeline
            pipeline.fit(X_train, y_train)
            
            # Make predictions
            y_pred = pipeline.predict(X_test)
            
            # Calculate metrics
            accuracy = accuracy_score(y_test, y_pred)
            f1 = f1_score(y_test, y_pred, average='weighted')
            
            print(f"{name} - Accuracy: {accuracy:.4f}, F1 Score: {f1:.4f}")
            
            # Store results
            model_pipelines[name] = pipeline
            model_scores[name] = {
                'accuracy': accuracy,
                'f1_score': f1
            }
            
            # Print classification report
            print("\nClassification Report:")
            print(classification_report(y_test, y_pred))
        except Exception as e:
            print(f"Error training {name} model: {str(e)}")
            continue
    
    # Check if we have any successful models
    if not model_pipelines:
        print("No models were successfully trained. Exiting.")
        raise RuntimeError("No models were successfully trained")
    
    # Create voting ensemble if we have at least 2 models
    if len(model_pipelines) >= 2:
        print("\nCreating voting ensemble...")
        
        try:
            # Select top models for ensemble
            top_models = sorted(model_scores.items(), key=lambda x: x[1]['f1_score'], reverse=True)
            top_model_names = [name for name, _ in top_models[:min(3, len(top_models))]]
            
            # Create estimators for voting classifier
            estimators = [(name, model_pipelines[name].named_steps['classifier']) for name in top_model_names]
            
            # Create voting classifier pipeline
            ensemble_pipeline = ImbPipeline(steps=[
                ('preprocessor', preprocessor),
                ('smote', SMOTE(random_state=42)),
                ('classifier', VotingClassifier(estimators=estimators, voting='soft'))
            ])
            
            # Fit the ensemble
            ensemble_pipeline.fit(X_train, y_train)
            
            # Make predictions
            y_pred_ensemble = ensemble_pipeline.predict(X_test)
            
            # Calculate metrics
            accuracy_ensemble = accuracy_score(y_test, y_pred_ensemble)
            f1_ensemble = f1_score(y_test, y_pred_ensemble, average='weighted')
            
            print(f"Ensemble - Accuracy: {accuracy_ensemble:.4f}, F1 Score: {f1_ensemble:.4f}")
            
            # Print classification report
            print("\nEnsemble Classification Report:")
            print(classification_report(y_test, y_pred_ensemble))
            
            # Add ensemble to models
            model_pipelines['ensemble'] = ensemble_pipeline
            model_scores['ensemble'] = {
                'accuracy': accuracy_ensemble,
                'f1_score': f1_ensemble
            }
        except Exception as e:
            print(f"Error creating ensemble: {str(e)}")
    
    # Step 6: Select best model
    print("\nStep 6: Selecting best model")
    
    # Find the best model based on F1 score
    best_model_name = max(model_scores, key=lambda k: model_scores[k]['f1_score'])
    best_model = model_pipelines[best_model_name]
    
    print(f"Best model: {best_model_name}")
    print(f"Best model accuracy: {model_scores[best_model_name]['accuracy']:.4f}")
    print(f"Best model F1 score: {model_scores[best_model_name]['f1_score']:.4f}")
    
    # Step 7: Save model and artifacts
    print("\nStep 7: Saving model and artifacts")
    
    # Save best model
    model_path = os.path.join(species_output_dir, 'model.pkl')
    joblib.dump(best_model, model_path)
    print(f"Best model saved to {model_path}")
    
    # Save feature names
    feature_names_path = os.path.join(species_output_dir, 'feature_names.pkl')
    joblib.dump(feature_names, feature_names_path)
    print(f"Feature names saved to {feature_names_path}")
    
    # Save metrics
    metrics = {
        'accuracy': float(model_scores[best_model_name]['accuracy']),
        'f1_score': float(model_scores[best_model_name]['f1_score']),
        'num_classes': int(y.nunique()),
        'num_samples': int(len(df)),
        'num_features': int(len(feature_names)),
        'best_model': best_model_name
    }
    
    metrics_path = os.path.join(species_output_dir, 'metrics.json')
    with open(metrics_path, 'w') as f:
        json.dump(metrics, f, indent=4)
    print(f"Metrics saved to {metrics_path}")
    
    # Create and save confusion matrix
    try:
        plt.figure(figsize=(10, 8))
        y_pred = best_model.predict(X_test)
        cm = confusion_matrix(y_test, y_pred)
        sns.heatmap(cm, annot=False, fmt='d', cmap='Blues')  # Set annot=False for large matrices
        plt.title(f'Confusion Matrix - {best_model_name}')
        plt.ylabel('True Label')
        plt.xlabel('Predicted Label')
        plt.tight_layout()
        plt.savefig(os.path.join(species_output_dir, 'confusion_matrix.png'))
        plt.close()
    except Exception as e:
        print(f"Warning: Could not create confusion matrix: {str(e)}")
    
    return best_model, metrics

def main():
    import argparse
    
    parser = argparse.ArgumentParser(description='Train improved species-specific disease prediction models')
    parser.add_argument('--data', type=str, default='futurediseases.csv',
                        help='Path to the CSV dataset')
    parser.add_argument('--target', type=str, default='Future Disease',
                        help='Name of the target column')
    parser.add_argument('--output-dir', type=str, default='improved_species_models',
                        help='Directory to save models and artifacts')
    parser.add_argument('--species', type=str, default='all',
                        help='Specific species to train (or "all" for all species)')
    
    args = parser.parse_args()
    
    # Create output directory
    os.makedirs(args.output_dir, exist_ok=True)
    
    # Check if the data file exists
    if not os.path.exists(args.data):
        print(f"Warning: Data file not found at {args.data}")
        print("Searching for the dataset file...")
        
        # Try to find the dataset file
        found_path = find_dataset_file(os.path.basename(args.data))
        
        if found_path:
            print(f"Found dataset at: {found_path}")
            args.data = found_path
        else:
            print("Error: Could not find the dataset file.")
            print("Please make sure the dataset file exists and provide the correct path.")
            print("Example: python train_improved_species_models.py --data \"C:\\path\\to\\your\\futurediseases.csv\"")
            sys.exit(1)
    
    # Split dataset by species if needed
    species_data_dir = os.path.join(args.output_dir, 'species_data')
    species_files = split_dataset_by_species(args.data, species_data_dir)
    
    # Train models for each species
    if args.species.lower() == 'all':
        # Train for all species
        species_to_train = species_files.keys()
    else:
        # Train for specific species
        species_to_train = [args.species]
    
    results = {}
    for species in species_to_train:
        if species in species_files:
            try:
                species_file = species_files[species]
                model, metrics = train_improved_species_model(
                    species_file=species_file,
                    target_column=args.target,
                    output_dir=args.output_dir
                )
                results[species] = metrics
            except Exception as e:
                print(f"Error training model for {species}: {str(e)}")
                import traceback
                traceback.print_exc()
        else:
            print(f"No data file found for species: {species}")
    
    # Print summary of results
    print("\n\n" + "="*50)
    print("TRAINING RESULTS SUMMARY")
    print("="*50)
    
    if not results:
        print("\nNo models were successfully trained.")
    else:
        for species, metrics in results.items():
            print(f"\n{species.upper()}:")
            print(f"  Accuracy: {metrics['accuracy']:.4f}")
            print(f"  F1 Score: {metrics['f1_score']:.4f}")
            print(f"  Classes: {metrics['num_classes']}")
            print(f"  Samples: {metrics['num_samples']}")
            print(f"  Features: {metrics['num_features']}")
            print(f"  Best Model: {metrics['best_model']}")

if __name__ == "__main__":
    main()