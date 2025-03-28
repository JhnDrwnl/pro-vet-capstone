import os
import sys
import argparse
import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.feature_selection import SelectFromModel
from sklearn.metrics import classification_report, accuracy_score, f1_score
from sklearn.utils import resample
from collections import Counter
from sklearn.feature_extraction.text import CountVectorizer
import joblib
import json

# Add the current directory to the path
current_dir = os.path.dirname(os.path.abspath(__file__))
sys.path.append(current_dir)

# Define all necessary functions directly in this file

def clean_data(data_path):
    """
    Loads the data from the specified data path and performs basic cleaning.
    
    Args:
        data_path (str): The path to the data file (e.g., CSV).
        
    Returns:
        pandas.DataFrame: The cleaned data.
    """
    # Load the data
    try:
        df = pd.read_csv(data_path, encoding='latin1')
    except UnicodeDecodeError:
        try:
            df = pd.read_csv(data_path, encoding='ISO-8859-1')
        except UnicodeDecodeError:
            df = pd.read_csv(data_path, encoding='cp1252')
    
    print(f"Loaded data with shape: {df.shape}")
    
    # Handle missing values
    print(f"Missing values before cleaning:\n{df.isnull().sum()}")
    
    # For categorical features: fill with mode or create 'Unknown' category
    for col in df.select_dtypes(include=['object']).columns:
        df[col] = df[col].fillna(df[col].mode()[0] if not df[col].mode().empty else 'Unknown')
    
    # For numerical features: fill with median (more robust than mean)
    for col in df.select_dtypes(include=['number']).columns:
        df[col] = df[col].fillna(df[col].median())
    
    # Remove duplicates
    df_size_before = len(df)
    df = df.drop_duplicates()
    print(f"Removed {df_size_before - len(df)} duplicate rows")
    
    print(f"Missing values after cleaning:\n{df.isnull().sum()}")
    print(f"Final data shape: {df.shape}")
    
    return df

def improved_engineer_features(df):
    """Enhanced feature engineering with text features and better encoding."""
    print("Performing improved feature engineering...")
    
    # Make a copy of the dataframe
    df_engineered = df.copy()
    
    # 1. Create age groups (categorical bins)
    if 'Age (years)' in df_engineered.columns:
        df_engineered['Age_Group'] = pd.cut(
            df_engineered['Age (years)'], 
            bins=[0, 1, 3, 7, 12, 20],
            labels=['Puppy/Kitten', 'Young', 'Adult', 'Senior', 'Geriatric']
        )
    
    # 2. Create weight categories
    if 'Weight (kg)' in df_engineered.columns:
        df_engineered['Weight_Category'] = pd.cut(
            df_engineered['Weight (kg)'],
            bins=[0, 2, 5, 10, 20, 50],
            labels=['Tiny', 'Small', 'Medium', 'Large', 'Giant']
        )
    
    # 3. Extract text features from symptoms using bag of words
    if 'Symptoms' in df_engineered.columns:
        try:
            # Use CountVectorizer to create bag-of-words features from symptoms
            vectorizer = CountVectorizer(max_features=50, stop_words='english')
            
            # Handle NaN values
            symptoms = df_engineered['Symptoms'].fillna('')
            
            # Create symptom features
            symptom_features = vectorizer.fit_transform(symptoms)
            symptom_feature_names = [f'Symptom_{word}' for word in vectorizer.get_feature_names_out()]
            
            # Convert to DataFrame and join with original data
            symptom_df = pd.DataFrame(
                symptom_features.toarray(),
                columns=symptom_feature_names,
                index=df_engineered.index
            )
            df_engineered = pd.concat([df_engineered, symptom_df], axis=1)
            
            print(f"Added {len(symptom_feature_names)} symptom text features")
        except Exception as e:
            print(f"Warning: Could not process symptom text features: {str(e)}")
    
    # 4. Create interaction features between important variables
    if 'Age (years)' in df_engineered.columns and 'Weight (kg)' in df_engineered.columns:
        df_engineered['Age_Weight_Ratio'] = df_engineered['Age (years)'] / (df_engineered['Weight (kg)'] + 0.1)
    
    # 5. One-hot encode categorical variables with limited cardinality
    categorical_cols = []
    if 'Pet Species' in df_engineered.columns:
        categorical_cols.append('Pet Species')
    if 'Age_Group' in df_engineered.columns:
        categorical_cols.append('Age_Group')
    if 'Weight_Category' in df_engineered.columns:
        categorical_cols.append('Weight_Category')
    
    for col in categorical_cols:
        if col in df_engineered.columns:
            try:
                dummies = pd.get_dummies(df_engineered[col], prefix=col, drop_first=False)
                df_engineered = pd.concat([df_engineered, dummies], axis=1)
                print(f"One-hot encoded {col} with {df_engineered[col].nunique()} unique values")
            except Exception as e:
                print(f"Warning: Could not one-hot encode {col}: {str(e)}")
    
    # 6. For high-cardinality categorical features, use frequency encoding
    high_cardinality_cols = []
    if 'Breed' in df_engineered.columns:
        high_cardinality_cols.append('Breed')
    if 'Past Diagnosis' in df_engineered.columns:
        high_cardinality_cols.append('Past Diagnosis')
    
    for col in high_cardinality_cols:
        if col in df_engineered.columns:
            try:
                # Calculate frequency of each category
                frequency = df_engineered[col].value_counts(normalize=True)
                # Map frequencies back to the dataframe
                df_engineered[f'{col}_Frequency'] = df_engineered[col].map(frequency)
                print(f"Frequency encoded {col} with {df_engineered[col].nunique()} unique values")
            except Exception as e:
                print(f"Warning: Could not frequency encode {col}: {str(e)}")
    
    # 7. Create interaction between Age and Past Diagnosis if available
    if 'Age (years)' in df_engineered.columns and 'Past Diagnosis' in df_engineered.columns:
        try:
            # Get top 5 most common past diagnoses
            top_diagnoses = df_engineered['Past Diagnosis'].value_counts().nlargest(5).index
            
            # Create binary indicators for top diagnoses
            for diagnosis in top_diagnoses:
                df_engineered[f'Had_{diagnosis}'] = (df_engineered['Past Diagnosis'] == diagnosis).astype(int)
                
                # Create interaction with age
                df_engineered[f'Age_Had_{diagnosis}'] = df_engineered['Age (years)'] * df_engineered[f'Had_{diagnosis}']
            
            print(f"Created interaction features for top {len(top_diagnoses)} past diagnoses")
        except Exception as e:
            print(f"Warning: Could not create diagnosis interaction features: {str(e)}")
    
    # Drop original categorical columns that have been encoded
    columns_to_drop = categorical_cols + high_cardinality_cols
    columns_to_drop = [col for col in columns_to_drop if col in df_engineered.columns]
    df_engineered = df_engineered.drop(columns=columns_to_drop)
    
    print(f"Improved feature engineering complete. New shape: {df_engineered.shape}")
    return df_engineered

def better_select_features(X, y, problem_type='classification', max_features=100):
    """
    Better feature selection using embedded methods like Random Forest importance.
    
    Args:
        X (pandas.DataFrame): The feature matrix.
        y (pandas.Series): The target variable.
        problem_type (str): 'classification' or 'regression'.
        max_features (int): Maximum number of features to select.
        
    Returns:
        list: List of selected feature names.
    """
    print(f"Performing improved feature selection...")
    
    # Check for categorical columns and handle them
    categorical_columns = X.select_dtypes(include=['object', 'category']).columns
    if len(categorical_columns) > 0:
        print(f"Found {len(categorical_columns)} categorical columns that need encoding")
        
        # For high-cardinality categorical columns, use frequency encoding
        for col in categorical_columns:
            # Calculate frequency of each category
            frequency = X[col].value_counts(normalize=True)
            # Map frequencies back to the dataframe
            X[f'{col}_Frequency'] = X[col].map(frequency)
        
        # Drop original categorical columns
        X = X.drop(columns=categorical_columns)
        print(f"After frequency encoding categorical features, shape: {X.shape}")
    
    # Use Random Forest for feature selection
    print("Using Random Forest feature importance for selection")
    
    # Initialize the selector
    if problem_type == 'classification':
        selector = SelectFromModel(
            RandomForestClassifier(n_estimators=100, random_state=42),
            max_features=max_features
        )
    else:  # regression
        from sklearn.ensemble import RandomForestRegressor
        selector = SelectFromModel(
            RandomForestRegressor(n_estimators=100, random_state=42),
            max_features=max_features
        )
    
    # Fit the selector
    try:
        selector.fit(X, y)
        
        # Get selected feature mask and names
        selected_mask = selector.get_support()
        selected_features = X.columns[selected_mask].tolist()
        
        print(f"Selected {len(selected_features)} features")
        
        # Show top 10 features
        if hasattr(selector.estimator_, 'feature_importances_'):
            importances = selector.estimator_.feature_importances_
            indices = np.argsort(importances)[::-1]
            
            print("Top 10 most important features:")
            for i in range(min(10, len(X.columns))):
                print(f"{X.columns[indices[i]]}: {importances[indices[i]]:.4f}")
        
        return selected_features
    
    except Exception as e:
        print(f"Error in feature selection: {str(e)}")
        print("Using all features instead")
        return X.columns.tolist()

def handle_class_imbalance(X_train, y_train, method='undersample', min_samples=50, max_samples=500):
    """
    Handle class imbalance using resampling techniques.
    
    Args:
        X_train (pandas.DataFrame): Training feature matrix.
        y_train (pandas.Series): Training target variable.
        method (str): 'undersample', 'oversample', or 'both'.
        min_samples (int): Minimum samples per class after resampling.
        max_samples (int): Maximum samples per class after resampling.
        
    Returns:
        tuple: (X_resampled, y_resampled) - Resampled training data.
    """
    print(f"Handling class imbalance using {method} method...")
    
    # Count samples per class
    class_counts = Counter(y_train)
    print(f"Original class distribution: {len(class_counts)} classes")
    print(f"Min class count: {min(class_counts.values())}, Max class count: {max(class_counts.values())}")
    
    # Combine X and y for resampling
    train_data = pd.concat([X_train, pd.Series(y_train, name='target')], axis=1)
    target_col = 'target'
    
    # Initialize resampled data
    resampled_data = pd.DataFrame(columns=train_data.columns)
    
    if method in ['undersample', 'both']:
        # Undersample majority classes
        for class_val, count in class_counts.items():
            class_data = train_data[train_data[target_col] == class_val]
            
            # If class has more than max_samples, undersample it
            if count > max_samples:
                class_data = resample(
                    class_data, 
                    replace=False,
                    n_samples=max_samples,
                    random_state=42
                )
            
            resampled_data = pd.concat([resampled_data, class_data])
    
    if method in ['oversample', 'both']:
        # Oversample minority classes
        for class_val, count in class_counts.items():
            if method == 'both':
                # If we've already undersampled, get the class data from resampled_data
                class_data = resampled_data[resampled_data[target_col] == class_val]
                count = len(class_data)
            else:
                # Otherwise get it from the original data
                class_data = train_data[train_data[target_col] == class_val]
            
            # If class has fewer than min_samples, oversample it
            if count < min_samples:
                # Calculate how many samples to generate
                n_samples = min(min_samples, max(count * 2, min_samples))
                
                # Oversample with replacement
                class_data_oversampled = resample(
                    class_data,
                    replace=True,
                    n_samples=n_samples,
                    random_state=42
                )
                
                if method == 'both':
                    # Remove original samples from resampled_data and add oversampled ones
                    resampled_data = resampled_data[resampled_data[target_col] != class_val]
                    resampled_data = pd.concat([resampled_data, class_data_oversampled])
                else:
                    # Add oversampled data to resampled_data
                    resampled_data = pd.concat([resampled_data, class_data_oversampled])
            elif method == 'oversample':
                # If not oversampling this class, still add it to resampled_data
                resampled_data = pd.concat([resampled_data, class_data])
    
    # Split back into X and y
    X_resampled = resampled_data.drop(columns=[target_col])
    y_resampled = resampled_data[target_col]
    
    # Print resampling results
    new_class_counts = Counter(y_resampled)
    print(f"After resampling: {len(new_class_counts)} classes")
    print(f"Min class count: {min(new_class_counts.values())}, Max class count: {max(new_class_counts.values())}")
    print(f"Original data shape: {X_train.shape}, Resampled data shape: {X_resampled.shape}")
    
    return X_resampled, y_resampled

def train_species_model(species_file, target_column, output_dir, test_size=0.2):
    """
    Train a model for a specific species.
    
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
    print(f"Training model for species: {species}")
    print(f"{'='*50}")
    
    # Create species-specific output directory
    species_output_dir = os.path.join(output_dir, species)
    os.makedirs(species_output_dir, exist_ok=True)
    
    # Step 1: Data Cleaning
    print("\nStep 1: Data Cleaning")
    df = clean_data(species_file)
    
    # Step 2: Feature Engineering
    print("\nStep 2: Feature Engineering")
    df_engineered = improved_engineer_features(df)
    
    # Step 3: Split data into features and target
    if target_column in df_engineered.columns:
        X = df_engineered.drop(columns=[target_column])
        y = df_engineered[target_column]
    else:
        raise ValueError(f"Target column '{target_column}' not found in the dataset")
    
    # Print target distribution
    print(f"\nTarget distribution:")
    print(y.value_counts().head(10))
    print(f"Total classes: {y.nunique()}")
    
    # Step 4: Feature Selection
    print("\nStep 4: Feature Selection")
    selected_features = better_select_features(X, y, max_features=50)
    X_selected = X[selected_features]
    
    # Step 5: Split data into train and test sets
    X_train, X_test, y_train, y_test = train_test_split(
        X_selected, y, test_size=test_size, random_state=42,
        stratify=y if len(y.unique()) > 1 else None
    )
    
    # Step 6: Handle class imbalance
    print("\nStep 6: Handle Class Imbalance")
    X_train_balanced, y_train_balanced = handle_class_imbalance(
        X_train, y_train, method='both', min_samples=5, max_samples=100
    )
    
    # Step 7: Train the model
    print("\nStep 7: Train Model")
    model = RandomForestClassifier(
        n_estimators=100,
        max_depth=20,
        min_samples_split=5,
        min_samples_leaf=2,
        class_weight='balanced',
        random_state=42,
        n_jobs=-1
    )
    
    model.fit(X_train_balanced, y_train_balanced)
    
    # Step 8: Evaluate the model
    print("\nStep 8: Evaluate Model")
    y_pred = model.predict(X_test)
    
    accuracy = accuracy_score(y_test, y_pred)
    f1 = f1_score(y_test, y_pred, average='weighted')
    
    print(f"Accuracy: {accuracy:.4f}")
    print(f"F1 Score (weighted): {f1:.4f}")
    
    # Print detailed classification report
    print("\nClassification Report:")
    report = classification_report(y_test, y_pred)
    print(report)
    
    # Step 9: Save the model and artifacts
    print("\nStep 9: Save Model and Artifacts")
    model_path = os.path.join(species_output_dir, 'model.pkl')
    joblib.dump(model, model_path)
    print(f"Model saved to {model_path}")
    
    # Save feature names
    feature_names_path = os.path.join(species_output_dir, 'feature_names.pkl')
    joblib.dump(selected_features, feature_names_path)
    print(f"Feature names saved to {feature_names_path}")
    
    # Save metrics
    metrics = {
        'accuracy': accuracy,
        'f1_score': f1,
        'num_classes': y.nunique(),
        'num_samples': len(df),
        'num_features': len(selected_features)
    }
    
    metrics_path = os.path.join(species_output_dir, 'metrics.json')
    with open(metrics_path, 'w') as f:
        json.dump(metrics, f, indent=4)
    print(f"Metrics saved to {metrics_path}")
    
    return model, metrics

def main():
    parser = argparse.ArgumentParser(description='Train species-specific disease prediction models')
    parser.add_argument('--data-dir', type=str, default='species_data',
                        help='Directory containing species-specific CSV files')
    parser.add_argument('--target', type=str, default='Future Disease',
                        help='Name of the target column')
    parser.add_argument('--output-dir', type=str, default='species_models',
                        help='Directory to save models and artifacts')
    parser.add_argument('--species', type=str, default='all',
                        help='Specific species to train (or "all" for all species)')
    
    args = parser.parse_args()
    
    # Resolve paths - FIX: Use the project root directory instead of current directory
    project_root = os.path.abspath(os.path.join(current_dir, '..', '..'))
    
    if not os.path.isabs(args.data_dir):
        data_dir = os.path.join(project_root, args.data_dir)
    else:
        data_dir = args.data_dir
    
    if not os.path.isabs(args.output_dir):
        output_dir = os.path.join(project_root, args.output_dir)
    else:
        output_dir = args.output_dir
    
    # Print the paths for debugging
    print(f"Project root: {project_root}")
    print(f"Data directory: {data_dir}")
    print(f"Output directory: {output_dir}")
    
    # Check if data directory exists
    if not os.path.exists(data_dir):
        print(f"Error: Data directory '{data_dir}' does not exist.")
        print("Please make sure you've run the split_by_species.py script first.")
        print("Or specify the correct path with --data-dir.")
        sys.exit(1)
    
    # Create output directory
    os.makedirs(output_dir, exist_ok=True)
    
    # Get species files
    if args.species.lower() == 'all':
        # Find all CSV files in the data directory
        try:
            species_files = [
                os.path.join(data_dir, f) for f in os.listdir(data_dir)
                if f.startswith('future_') and f.endswith('_disease.csv')
            ]
            
            if not species_files:
                print(f"Warning: No species files found in {data_dir}")
                print("Make sure the files follow the naming pattern 'future_SPECIES_disease.csv'")
                sys.exit(1)
                
        except Exception as e:
            print(f"Error accessing data directory: {str(e)}")
            sys.exit(1)
    else:
        # Find the specific species file
        species_clean = args.species.lower().replace(' ', '_')
        species_file = os.path.join(data_dir, f"future_{species_clean}_disease.csv")
        
        if os.path.exists(species_file):
            species_files = [species_file]
        else:
            print(f"Error: File not found for species '{args.species}'")
            print(f"Expected file: {species_file}")
            sys.exit(1)
    
    # Train models for each species
    results = {}
    for species_file in species_files:
        try:
            species = os.path.basename(species_file).split('_')[1]
            model, metrics = train_species_model(
                species_file=species_file,
                target_column=args.target,
                output_dir=output_dir
            )
            results[species] = metrics
        except Exception as e:
            print(f"Error training model for {species_file}: {str(e)}")
    
    # Print summary of results
    print("\n\n" + "="*50)
    print("TRAINING RESULTS SUMMARY")
    print("="*50)
    
    for species, metrics in results.items():
        print(f"\n{species.upper()}:")
        print(f"  Accuracy: {metrics['accuracy']:.4f}")
        print(f"  F1 Score: {metrics['f1_score']:.4f}")
        print(f"  Classes: {metrics['num_classes']}")
        print(f"  Samples: {metrics['num_samples']}")
        print(f"  Features: {metrics['num_features']}")

if __name__ == "__main__":
    main()