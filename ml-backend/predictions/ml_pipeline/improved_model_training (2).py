import pandas as pd
import numpy as np
import os
import argparse
import joblib
import re
import logging
import signal
import time
from datetime import datetime
from contextlib import contextmanager
from sklearn.model_selection import train_test_split, GridSearchCV, StratifiedKFold
from sklearn.preprocessing import StandardScaler, OneHotEncoder
from sklearn.compose import ColumnTransformer
from sklearn.pipeline import Pipeline
from sklearn.ensemble import RandomForestClassifier, GradientBoostingClassifier, VotingClassifier
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import classification_report, accuracy_score, f1_score, confusion_matrix
import matplotlib.pyplot as plt
import seaborn as sns

# Set up logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# Define timeout context manager for Windows compatibility
@contextmanager
def time_limit(seconds):
    def signal_handler(signum, frame):
        raise TimeoutError(f"Model training timed out after {seconds} seconds")
    
    # Use SIGALRM if available (Unix/Linux/Mac)
    if hasattr(signal, 'SIGALRM'):
        signal.signal(signal.SIGALRM, signal_handler)
        signal.alarm(seconds)
        try:
            yield
        finally:
            signal.alarm(0)
    else:
        # For Windows, use a simpler approach with start time tracking
        start_time = time.time()
        yield
        if time.time() - start_time > seconds:
            raise TimeoutError(f"Model training timed out after {seconds} seconds")

class ImprovedModelTrainer:
    def __init__(self, data_path, target_column='Future Disease', output_dir='improved_models', sample_size=None):
        """
        Initialize the improved model trainer.
        
        Args:
            data_path: Path to the CSV dataset
            target_column: Name of the target column
            output_dir: Directory to save models and artifacts
            sample_size: Optional number of samples to use (for faster training)
        """
        self.data_path = self._resolve_path(data_path)
        self.target_column = target_column
        self.output_dir = output_dir
        self.sample_size = sample_size
        os.makedirs(output_dir, exist_ok=True)
        
        # Initialize attributes
        self.data = None
        self.data_engineered = None
        self.X_train = None
        self.X_test = None
        self.y_train = None
        self.y_test = None
        self.models = {}
        self.best_model = None
        self.feature_names = None
    
    def _resolve_path(self, path):
        """Resolve relative or absolute path to ensure file can be found."""
        # If path is absolute, return it
        if os.path.isabs(path):
            return path
        
        # Try different relative paths
        possible_paths = [
            path,
            os.path.join(os.getcwd(), path),
            os.path.abspath(path)
        ]
        
        for p in possible_paths:
            if os.path.exists(p):
                logger.info(f"Found data file at: {p}")
                return p
                
        # If we get here, we couldn't find the file
        logger.error(f"Could not find data file at any of these locations: {possible_paths}")
        raise FileNotFoundError(f"Could not find data file: {path}")
    
    def _fix_concatenated_text(self, text):
        """Fix text where the same word/phrase is concatenated multiple times."""
        if not isinstance(text, str):
            return text
            
        # Split the text into potential repeated segments
        # This regex pattern looks for repeated words or phrases
        pattern = r'(\b\w+(?:\s+\w+)*(?:\s*$$[^)]*$$)?)\1+'
        
        # Find all matches
        matches = re.findall(pattern, text)
        
        # If matches found, replace with single occurrence
        if matches:
            for match in matches:
                # Create a pattern that matches the repeated segment
                repeat_pattern = f"({re.escape(match)})+"
                # Replace with just one occurrence
                text = re.sub(repeat_pattern, match, text)
        
        return text
    
    def load_and_explore_data(self):
        """Load and explore the dataset."""
        logger.info(f"Loading data from {self.data_path}...")
        
        # Try different encodings to handle potential issues
        try:
            self.data = pd.read_csv(self.data_path, encoding='utf-8')
        except UnicodeDecodeError:
            try:
                self.data = pd.read_csv(self.data_path, encoding='latin1')
            except UnicodeDecodeError:
                try:
                    self.data = pd.read_csv(self.data_path, encoding='cp1252')
                except Exception as e:
                    logger.error(f"Failed to load data with multiple encodings: {str(e)}")
                    raise
        
        logger.info(f"Data loaded successfully. Shape: {self.data.shape}")
        
        # Apply sampling if specified
        if self.sample_size and self.sample_size < len(self.data):
            self.data = self.data.sample(self.sample_size, random_state=42)
            logger.info(f"Using sample of {self.sample_size} rows for faster training")
        
        # Basic data exploration
        logger.info("\n--- Data Exploration ---")
        logger.info(f"Dataset shape: {self.data.shape}")
        logger.info("\nFirst 5 rows:")
        logger.info(self.data.head())
        logger.info("\nData types:")
        logger.info(self.data.dtypes)
        logger.info("\nMissing values:")
        logger.info(self.data.isnull().sum())
        
        # Target distribution
        logger.info(f"\nTarget column: {self.target_column}")
        logger.info(f"Target distribution:")
        target_counts = self.data[self.target_column].value_counts()
        logger.info(target_counts)
        
        # Visualize target distribution
        plt.figure(figsize=(10, 6))
        target_counts.nlargest(15).plot(kind='bar')
        plt.title('Top 15 Disease Classes')
        plt.ylabel('Count')
        plt.xlabel('Disease')
        plt.tight_layout()
        plt.savefig(os.path.join(self.output_dir, 'target_distribution.png'))
        
        return self.data
    
    def clean_data(self):
        """Clean the data by fixing concatenated values and other issues."""
        logger.info("\n--- Cleaning Data ---")
        
        # Make a copy of the dataframe
        df_clean = self.data.copy()
        
        # Fix concatenated text in string columns
        for col in df_clean.select_dtypes(include=['object']).columns:
            logger.info(f"Cleaning column: {col}")
            # Check if there are concatenated values (same word repeated)
            df_clean[col] = df_clean[col].astype(str).apply(self._fix_concatenated_text)
        
        # Handle missing values
        for col in df_clean.select_dtypes(include=['object']).columns:
            if df_clean[col].isnull().sum() > 0:
                df_clean[col] = df_clean[col].fillna("Unknown")
            
        for col in df_clean.select_dtypes(include=['number']).columns:
            if df_clean[col].isnull().sum() > 0:
                # Check if distribution is skewed
                skewness = df_clean[col].skew()
                if abs(skewness) > 1:  # Skewed distribution
                    df_clean[col] = df_clean[col].fillna(df_clean[col].median())
                else:  # Normal distribution
                    df_clean[col] = df_clean[col].fillna(df_clean[col].mean())
        
        logger.info("Data cleaning completed")
        self.data = df_clean
        return df_clean
    
    def advanced_feature_engineering(self):
        """Perform advanced feature engineering."""
        logger.info("\n--- Advanced Feature Engineering ---")
        
        # Make a copy of the dataframe
        df_engineered = self.data.copy()
        
        # 1. Create age groups with more granular bins
        if 'Age (years)' in df_engineered.columns:
            df_engineered['Age_Group'] = pd.cut(
                df_engineered['Age (years)'], 
                bins=[0, 0.5, 1, 2, 4, 7, 10, 15, 20],
                labels=['Infant', 'Baby', 'Toddler', 'Young', 'Adult', 'Mature', 'Senior', 'Geriatric']
            )
        
        # 2. Create weight categories with more granular bins
        if 'Weight (kg)' in df_engineered.columns:
            df_engineered['Weight_Category'] = pd.cut(
                df_engineered['Weight (kg)'],
                bins=[0, 1, 3, 5, 10, 15, 25, 40, 100],
                labels=['Tiny', 'Very Small', 'Small', 'Medium-Small', 'Medium', 'Medium-Large', 'Large', 'Giant']
            )
        
        # 3. Extract text features from symptoms using NLP techniques
        if 'Symptoms' in df_engineered.columns:
            # Create binary indicators for common symptoms
            common_symptoms = [
                'vomiting', 'diarrhea', 'lethargy', 'fever', 'cough', 'sneezing',
                'limping', 'pain', 'swelling', 'itching', 'rash', 'bleeding',
                'loss', 'seizures', 'appetite', 'thirst', 'urination', 'breathing'
            ]
            
            for symptom in common_symptoms:
                df_engineered[f'Has_{symptom}'] = df_engineered['Symptoms'].str.contains(
                    symptom, case=False, na=False).astype(int)
            
            # Count total symptoms mentioned
            df_engineered['Symptom_Count'] = df_engineered[
                [f'Has_{s}' for s in common_symptoms]].sum(axis=1)
        
        # 4. Create interaction features
        if 'Age (years)' in df_engineered.columns and 'Weight (kg)' in df_engineered.columns:
            # Age-weight ratio (important for many conditions)
            df_engineered['Age_Weight_Ratio'] = df_engineered['Age (years)'] / (df_engineered['Weight (kg)'] + 0.1)
            
            # Body condition score approximation
            ideal_weight_ratio = 1.0  # Simplified approximation
            df_engineered['Body_Condition_Score'] = (df_engineered['Weight (kg)'] / 
                                                   (ideal_weight_ratio * df_engineered['Age (years)'] + 0.5))
        
        # 5. Create polynomial features for important numerical variables
        if 'Age (years)' in df_engineered.columns:
            df_engineered['Age_Squared'] = df_engineered['Age (years)'] ** 2
        
        if 'Weight (kg)' in df_engineered.columns:
            df_engineered['Weight_Squared'] = df_engineered['Weight (kg)'] ** 2
        
        # 6. Frequency encoding for high-cardinality categorical features
        # This is safer than target encoding and doesn't cause the error
        high_card_cols = []
        for col in df_engineered.select_dtypes(include=['object']).columns:
            if col != self.target_column and df_engineered[col].nunique() > 10:
                high_card_cols.append(col)
                
                # Calculate frequency encoding
                freq = df_engineered[col].value_counts(normalize=True)
                df_engineered[f'{col}_Freq'] = df_engineered[col].map(freq)
        
        # Store the engineered dataframe
        self.data_engineered = df_engineered
        logger.info(f"Feature engineering complete. New shape: {df_engineered.shape}")
        
        # Return the engineered dataframe
        return df_engineered
    
    def prepare_data_for_modeling(self, test_size=0.2, random_state=42):
        """Prepare data for modeling with advanced preprocessing."""
        logger.info("\n--- Preparing Data for Modeling ---")
        
        # Split features and target
        X = self.data_engineered.drop(columns=[self.target_column])
        y = self.data_engineered[self.target_column]
        
        # Store feature names
        self.feature_names = X.columns.tolist()
        
        # Split data into train and test sets with stratification
        X_train, X_test, y_train, y_test = train_test_split(
            X, y, test_size=test_size, random_state=random_state, stratify=y
        )
        
        logger.info(f"Training set size: {X_train.shape}")
        logger.info(f"Test set size: {X_test.shape}")
        
        # Store the splits
        self.X_train = X_train
        self.X_test = X_test
        self.y_train = y_train
        self.y_test = y_test
        
        return X_train, X_test, y_train, y_test
    
    def train_and_evaluate_models(self):
        """Train and evaluate multiple models with hyperparameter tuning."""
        logger.info("\n--- Training and Evaluating Models ---")
        
        # Define preprocessing for numeric and categorical features
        numeric_features = self.X_train.select_dtypes(include=['int64', 'float64']).columns
        categorical_features = self.X_train.select_dtypes(include=['object', 'category']).columns
        
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
        
        # Define base models with optimized parameters
        base_models = {
            'logistic_regression': LogisticRegression(
                C=1.0,
                max_iter=100,
                class_weight='balanced',
                random_state=42,
                n_jobs=-1
            ),
            'random_forest': RandomForestClassifier(
                n_estimators=100,  # Reduced from 200
                max_depth=10,      # Reduced from 20
                min_samples_split=5,
                min_samples_leaf=2,
                class_weight='balanced',
                random_state=42,
                n_jobs=-1
            ),
            'gradient_boosting': GradientBoostingClassifier(
                n_estimators=50,   # Reduced from 200
                learning_rate=0.1,
                max_depth=3,       # Reduced from 5
                min_samples_split=50,
                subsample=0.8,     # Added subsampling
                validation_fraction=0.1,
                n_iter_no_change=5, # Early stopping
                tol=0.01,
                random_state=42,
                verbose=1          # Added verbosity
            )
        }
        
        # Train and evaluate each model
        results = {}
        for name, model in base_models.items():
            logger.info(f"\nTraining {name}...")
            
            # Create pipeline
            pipeline = Pipeline(steps=[
                ('preprocessor', preprocessor),
                ('classifier', model)
            ])
            
            # Fit the pipeline with timeout
            try:
                with time_limit(3600):  # 1 hour timeout
                    start_time = time.time()
                    pipeline.fit(self.X_train, self.y_train)
                    training_time = time.time() - start_time
                    logger.info(f"Training completed in {training_time:.2f} seconds")
            except TimeoutError as e:
                logger.warning(f"{name} training timed out: {str(e)}")
                continue
            except Exception as e:
                logger.error(f"Error training {name}: {str(e)}")
                continue
            
            # Make predictions
            y_pred = pipeline.predict(self.X_test)
            
            # Calculate metrics
            accuracy = accuracy_score(self.y_test, y_pred)
            f1 = f1_score(self.y_test, y_pred, average='weighted')
            
            logger.info(f"{name} - Accuracy: {accuracy:.4f}, F1 Score: {f1:.4f}")
            
            # Store results
            results[name] = {
                'pipeline': pipeline,
                'accuracy': accuracy,
                'f1_score': f1,
                'training_time': training_time
            }
            
            # Store model
            self.models[name] = pipeline
            
            # Print classification report
            logger.info("\nClassification Report:")
            logger.info(classification_report(self.y_test, y_pred))
            
            # Plot confusion matrix
            plt.figure(figsize=(10, 8))
            cm = confusion_matrix(self.y_test, y_pred)
            sns.heatmap(cm, annot=False, cmap='Blues')  # Set annot=False for large matrices
            plt.title(f'Confusion Matrix - {name}')
            plt.ylabel('True Label')
            plt.xlabel('Predicted Label')
            plt.tight_layout()
            plt.savefig(os.path.join(self.output_dir, f'confusion_matrix_{name}.png'))
            plt.close()
        
        # Check if we have any successful models
        if not results:
            logger.error("No models were successfully trained. Exiting.")
            raise RuntimeError("No models were successfully trained")
        
        # Find the best model based on F1 score
        best_model_name = max(results, key=lambda k: results[k]['f1_score'])
        self.best_model = results[best_model_name]['pipeline']
        
        logger.info(f"\nBest model: {best_model_name}")
        logger.info(f"Best model accuracy: {results[best_model_name]['accuracy']:.4f}")
        logger.info(f"Best model F1 score: {results[best_model_name]['f1_score']:.4f}")
        logger.info(f"Best model training time: {results[best_model_name]['training_time']:.2f} seconds")
        
        # Create and train an ensemble model if we have at least 2 models
        if len(results) >= 2:
            logger.info("\nTraining ensemble model...")
            
            # Create voting classifier with only successful models
            estimators = [(name, results[name]['pipeline'].named_steps['classifier']) 
                         for name in results.keys()]
            
            # Create a new pipeline with the voting classifier
            ensemble_pipeline = Pipeline(steps=[
                ('preprocessor', preprocessor),
                ('classifier', VotingClassifier(estimators=estimators, voting='soft'))
            ])
            
            # Fit the ensemble with timeout
            try:
                with time_limit(1800):  # 30 minute timeout
                    start_time = time.time()
                    ensemble_pipeline.fit(self.X_train, self.y_train)
                    ensemble_time = time.time() - start_time
                    logger.info(f"Ensemble training completed in {ensemble_time:.2f} seconds")
                
                # Make predictions
                y_pred_ensemble = ensemble_pipeline.predict(self.X_test)
                
                # Calculate metrics
                accuracy_ensemble = accuracy_score(self.y_test, y_pred_ensemble)
                f1_ensemble = f1_score(self.y_test, y_pred_ensemble, average='weighted')
                
                logger.info(f"Ensemble - Accuracy: {accuracy_ensemble:.4f}, F1 Score: {f1_ensemble:.4f}")
                
                # Store ensemble model
                self.models['ensemble'] = ensemble_pipeline
                results['ensemble'] = {
                    'pipeline': ensemble_pipeline,
                    'accuracy': accuracy_ensemble,
                    'f1_score': f1_ensemble,
                    'training_time': ensemble_time
                }
                
                # If ensemble is better, update best model
                if f1_ensemble > results[best_model_name]['f1_score']:
                    self.best_model = ensemble_pipeline
                    best_model_name = 'ensemble'
                
                # Print classification report for ensemble
                logger.info("\nEnsemble Classification Report:")
                logger.info(classification_report(self.y_test, y_pred_ensemble))
                
                # Plot confusion matrix for ensemble
                plt.figure(figsize=(10, 8))
                cm = confusion_matrix(self.y_test, y_pred_ensemble)
                sns.heatmap(cm, annot=False, cmap='Blues')  # Set annot=False for large matrices
                plt.title('Confusion Matrix - Ensemble')
                plt.ylabel('True Label')
                plt.xlabel('Predicted Label')
                plt.tight_layout()
                plt.savefig(os.path.join(self.output_dir, 'confusion_matrix_ensemble.png'))
                plt.close()
            
            except (TimeoutError, Exception) as e:
                logger.warning(f"Ensemble training failed: {str(e)}")
                logger.info("Using best individual model instead")
        
        # Return results
        return results
    
    def fine_tune_best_model(self):
        """Fine-tune the best model with grid search."""
        logger.info("\n--- Fine-tuning Best Model ---")
        
        # Get the best model name
        best_model_name = max(self.models, key=lambda k: accuracy_score(
            self.y_test, self.models[k].predict(self.X_test)))
        
        logger.info(f"Fine-tuning {best_model_name}...")
        
        # Get the best pipeline
        best_pipeline = self.models[best_model_name]
        
        # Define parameter grid based on the best model
        if best_model_name == 'random_forest':
            param_grid = {
                'classifier__n_estimators': [50, 100],
                'classifier__max_depth': [5, 10],
                'classifier__min_samples_split': [5, 10]
            }
        elif best_model_name == 'gradient_boosting':
            param_grid = {
                'classifier__n_estimators': [30, 50],
                'classifier__learning_rate': [0.05, 0.1],
                'classifier__max_depth': [2, 3]
            }
        elif best_model_name == 'logistic_regression':
            param_grid = {
                'classifier__C': [0.1, 1.0, 10.0],
                'classifier__solver': ['liblinear', 'saga']
            }
        else:  # ensemble
            # For ensemble, we'll skip fine-tuning
            logger.info("Skipping fine-tuning for ensemble model")
            return best_pipeline
        
        # Create grid search with reduced parameters for faster execution
        grid_search = GridSearchCV(
            best_pipeline,
            param_grid,
            cv=StratifiedKFold(n_splits=3, shuffle=True, random_state=42),
            scoring='f1_weighted',
            n_jobs=-1,
            verbose=1
        )
        
        try:
            # Fit grid search with timeout
            with time_limit(1800):  # 30 minute timeout
                grid_search.fit(self.X_train, self.y_train)
            
            # Get best parameters
            logger.info(f"Best parameters: {grid_search.best_params_}")
            
            # Evaluate best model
            best_model = grid_search.best_estimator_
            y_pred = best_model.predict(self.X_test)
            
            # Calculate metrics
            accuracy = accuracy_score(self.y_test, y_pred)
            f1 = f1_score(self.y_test, y_pred, average='weighted')
            
            logger.info(f"Fine-tuned model - Accuracy: {accuracy:.4f}, F1 Score: {f1:.4f}")
            
            # Print classification report
            logger.info("\nClassification Report:")
            logger.info(classification_report(self.y_test, y_pred))
            
            # Update best model
            self.best_model = best_model
            
            # Plot confusion matrix
            plt.figure(figsize=(10, 8))
            cm = confusion_matrix(self.y_test, y_pred)
            sns.heatmap(cm, annot=False, cmap='Blues')  # Set annot=False for large matrices
            plt.title('Confusion Matrix - Fine-tuned Model')
            plt.ylabel('True Label')
            plt.xlabel('Predicted Label')
            plt.tight_layout()
            plt.savefig(os.path.join(self.output_dir, 'confusion_matrix_fine_tuned.png'))
            plt.close()
            
            return best_model
        except Exception as e:
            logger.error(f"Error during fine-tuning: {str(e)}")
            logger.info("Using best model without fine-tuning")
            return best_pipeline
    
    def save_model(self):
        """Save the best model and artifacts."""
        logger.info("\n--- Saving Model and Artifacts ---")
        
        # Save best model
        model_path = os.path.join(self.output_dir, 'best_model.pkl')
        joblib.dump(self.best_model, model_path)
        logger.info(f"Best model saved to {model_path}")
        
        # Save feature names
        feature_names_path = os.path.join(self.output_dir, 'feature_names.pkl')
        joblib.dump(self.feature_names, feature_names_path)
        logger.info(f"Feature names saved to {feature_names_path}")
        
        # Save target classes
        target_classes_path = os.path.join(self.output_dir, 'target_classes.pkl')
        joblib.dump(self.y_train.unique(), target_classes_path)
        logger.info(f"Target classes saved to {target_classes_path}")
        
        # Save model summary
        y_pred = self.best_model.predict(self.X_test)
        accuracy = accuracy_score(self.y_test, y_pred)
        f1 = f1_score(self.y_test, y_pred, average='weighted')
        
        summary = {
            'accuracy': float(accuracy),
            'f1_score': float(f1),
            'num_features': len(self.feature_names),
            'num_classes': len(self.y_train.unique()),
            'num_samples': len(self.data),
            'timestamp': datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        }
        
        summary_path = os.path.join(self.output_dir, 'model_summary.json')
        import json
        with open(summary_path, 'w') as f:
            json.dump(summary, f, indent=4)
        logger.info(f"Model summary saved to {summary_path}")
        
        return model_path
    
    def run_pipeline(self):
        """Run the complete model training pipeline."""
        logger.info("\n=== Running Improved Model Training Pipeline ===\n")
        
        try:
            # Step 1: Load and explore data
            self.load_and_explore_data()
            
            # Step 2: Clean data
            self.clean_data()
            
            # Step 3: Advanced feature engineering
            self.advanced_feature_engineering()
            
            # Step 4: Prepare data for modeling
            self.prepare_data_for_modeling()
            
            # Step 5: Train and evaluate models
            self.train_and_evaluate_models()
            
            # Step 6: Fine-tune best model
            self.fine_tune_best_model()
            
            # Step 7: Save model and artifacts
            model_path = self.save_model()
            
            logger.info("\n=== Model Training Pipeline Complete ===")
            
            return model_path
        except Exception as e:
            logger.error(f"Error in pipeline: {str(e)}", exc_info=True)
            raise

def parse_args():
    """Parse command line arguments."""
    parser = argparse.ArgumentParser(description='Train an improved ML model for pet disease prediction')
    parser.add_argument('--data', type=str, required=True, help='Path to the data file')
    parser.add_argument('--target', type=str, default='Future Disease', help='Target column name')
    parser.add_argument('--output', type=str, default='improved_models', help='Output directory for models')
    parser.add_argument('--sample', type=int, default=None, help='Number of samples to use (for faster training)')
    return parser.parse_args()

if __name__ == "__main__":
    args = parse_args()
    
    trainer = ImprovedModelTrainer(
        data_path=args.data,
        target_column=args.target,
        output_dir=args.output,
        sample_size=args.sample
    )
    
    model_path = trainer.run_pipeline()
    
    logger.info(f"\nBest model saved to {model_path}")