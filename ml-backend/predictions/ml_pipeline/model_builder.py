import pandas as pd
import numpy as np
import os
import argparse
import joblib
import json
import logging
from datetime import datetime
from sklearn.model_selection import train_test_split, cross_val_score, StratifiedKFold
from sklearn.preprocessing import StandardScaler
from sklearn.pipeline import Pipeline
from sklearn.ensemble import RandomForestClassifier, GradientBoostingClassifier, VotingClassifier
from sklearn.metrics import classification_report, accuracy_score, f1_score, confusion_matrix
import matplotlib.pyplot as plt
from data_cleaner import DataCleaner

# Set up logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

class ImprovedModelTrainer:
    def __init__(self, data_path, target_column='Future Disease', output_dir='improved_models'):
        """Initialize the model trainer with data path and configuration."""
        self.data_path = data_path
        self.target_column = target_column
        self.output_dir = output_dir
        self.data_cleaner = DataCleaner(data_path)
        
        # Create output directory
        os.makedirs(output_dir, exist_ok=True)
        
        # Initialize variables
        self.df = None
        self.X_train = None
        self.X_test = None
        self.y_train = None
        self.y_test = None
        self.feature_names = None
        self.best_model = None
        self.best_model_name = None
        self.metrics = {}
        
    def load_and_explore_data(self):
        """Load and explore the dataset."""
        logger.info("=== Running Improved Model Training Pipeline ===\n")
        
        # Load data using the data cleaner
        self.df = self.data_cleaner.load_data()
        
        # Data exploration
        logger.info("--- Data Exploration ---")
        logger.info(f"Dataset shape: {self.df.shape}")
        logger.info("\nFirst 5 rows:")
        logger.info(self.df.head())
        logger.info("\nData types:")
        logger.info(self.df.dtypes)
        logger.info("\nMissing values:")
        logger.info(self.df.isnull().sum())
        
        # Target distribution
        logger.info(f"\nTarget column: {self.target_column}")
        logger.info("Target distribution:")
        logger.info(self.df[self.target_column].value_counts())
        
        return self.df
    
    def preprocess_data(self):
        """Clean and preprocess the data."""
        logger.info("\n--- Data Preprocessing ---")
        
        # Clean the data
        self.df = self.data_cleaner.clean_data()
        
        # Create basic features
        logger.info("Creating basic features...")
        
        # Create age groups if age column exists
        if 'Age (years)' in self.df.columns:
            self.df['Age_Group'] = pd.cut(
                self.df['Age (years)'], 
                bins=[0, 1, 3, 7, 12, 20],
                labels=['Puppy/Kitten', 'Young', 'Adult', 'Senior', 'Geriatric']
            )
        
        # Create weight categories if weight column exists
        if 'Weight (kg)' in self.df.columns:
            self.df['Weight_Category'] = pd.cut(
                self.df['Weight (kg)'],
                bins=[0, 2, 5, 10, 20, 50],
                labels=['Tiny', 'Small', 'Medium', 'Large', 'Giant']
            )
        
        # Create interaction features
        if 'Age (years)' in self.df.columns and 'Weight (kg)' in self.df.columns:
            self.df['Age_Weight_Ratio'] = self.df['Age (years)'] / (self.df['Weight (kg)'] + 0.1)
        
        # Extract text features from symptoms
        if 'Symptoms' in self.df.columns:
            common_symptoms = [
                'vomiting', 'diarrhea', 'lethargy', 'fever', 'cough', 'sneezing',
                'limping', 'pain', 'swelling', 'itching', 'rash', 'bleeding'
            ]
            
            for symptom in common_symptoms:
                self.df[f'Has_{symptom}'] = self.df['Symptoms'].str.contains(
                    symptom, case=False, na=False).astype(int)
        
        # Encode categorical features
        self.df = self.data_cleaner.encode_categorical_features(self.df)
        
        logger.info("Data preprocessing completed")
        return self.df
    
    def split_data(self):
        """Split the data into training and testing sets."""
        logger.info("\n--- Splitting Data ---")
        
        # Separate features and target
        X = self.df.drop(columns=[self.target_column])
        y = self.df[self.target_column]
        
        # Store feature names for later use
        self.feature_names = X.columns.tolist()
        
        # Split the data
        self.X_train, self.X_test, self.y_train, self.y_test = train_test_split(
            X, y, test_size=0.2, random_state=42, stratify=y
        )
        
        logger.info(f"Training set size: {self.X_train.shape}")
        logger.info(f"Test set size: {self.X_test.shape}")
        
        return self.X_train, self.X_test, self.y_train, self.y_test
    
    def train_models(self):
        """Train multiple models and select the best one."""
        logger.info("\n--- Training Models ---")
        
        # Define preprocessing steps
        preprocessor = StandardScaler()
        
        # Define base models
        base_models = {
            'random_forest': RandomForestClassifier(
                n_estimators=200, 
                max_depth=20,
                min_samples_split=5,
                min_samples_leaf=2,
                class_weight='balanced',
                random_state=42,
                n_jobs=-1
            ),
            'gradient_boosting': GradientBoostingClassifier(
                n_estimators=200,
                learning_rate=0.1,
                max_depth=5,
                random_state=42
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
            
            # Cross-validation
            cv = StratifiedKFold(n_splits=5, shuffle=True, random_state=42)
            cv_scores = cross_val_score(pipeline, self.X_train, self.y_train, cv=cv, scoring='f1_weighted')
            
            logger.info(f"Cross-validation F1 scores: {cv_scores}")
            logger.info(f"Mean CV F1 score: {cv_scores.mean():.4f}")
            
            # Fit the pipeline on the full training set
            pipeline.fit(self.X_train, self.y_train)
            
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
                'cv_score': cv_scores.mean()
            }
            
            # Print classification report
            logger.info("\nClassification Report:")
            logger.info(classification_report(self.y_test, y_pred))
            
            # Plot confusion matrix
            plt.figure(figsize=(10, 8))
            cm = confusion_matrix(self.y_test, y_pred)
            plt.imshow(cm, interpolation='nearest', cmap=plt.cm.Blues)
            plt.title(f'Confusion Matrix - {name}')
            plt.colorbar()
            plt.ylabel('True Label')
            plt.xlabel('Predicted Label')
            plt.tight_layout()
            plt.savefig(os.path.join(self.output_dir, f'confusion_matrix_{name}.png'))
            plt.close()
        
        # Find the best model based on F1 score
        self.best_model_name = max(results, key=lambda k: results[k]['f1_score'])
        self.best_model = results[self.best_model_name]['pipeline']
        
        logger.info(f"\nBest model: {self.best_model_name}")
        logger.info(f"Best model accuracy: {results[self.best_model_name]['accuracy']:.4f}")
        logger.info(f"Best model F1 score: {results[self.best_model_name]['f1_score']:.4f}")
        
        # Store metrics
        self.metrics = {
            'accuracy': float(results[self.best_model_name]['accuracy']),
            'f1_score': float(results[self.best_model_name]['f1_score']),
            'cv_score': float(results[self.best_model_name]['cv_score']),
            'num_features': len(self.feature_names),
            'num_classes': len(np.unique(self.y_train)),
            'num_samples': len(self.df),
            'timestamp': datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        }
        
        return self.best_model, self.metrics
    
    def save_model(self):
        """Save the best model and related artifacts."""
        logger.info("\n--- Saving Model ---")
        
        # Save the best model
        model_path = os.path.join(self.output_dir, 'best_model.pkl')
        joblib.dump(self.best_model, model_path)
        
        # Save feature names
        feature_names_path = os.path.join(self.output_dir, 'feature_names.pkl')
        joblib.dump(self.feature_names, feature_names_path)
        
        # Save metrics
        metrics_path = os.path.join(self.output_dir, 'metrics.json')
        with open(metrics_path, 'w') as f:
            json.dump(self.metrics, f, indent=4)
        
        logger.info(f"Model saved to {model_path}")
        logger.info(f"Feature names saved to {feature_names_path}")
        logger.info(f"Metrics saved to {metrics_path}")
        
        return model_path
    
    def run_pipeline(self):
        """Run the complete training pipeline."""
        try:
            self.load_and_explore_data()
            self.preprocess_data()
            self.split_data()
            self.train_models()
            model_path = self.save_model()
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
    return parser.parse_args()

if __name__ == "__main__":
    args = parse_args()
    
    trainer = ImprovedModelTrainer(
        data_path=args.data,
        target_column=args.target,
        output_dir=args.output
    )
    
    model_path = trainer.run_pipeline()
    