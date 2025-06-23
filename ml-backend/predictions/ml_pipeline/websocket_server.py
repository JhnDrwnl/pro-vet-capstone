import asyncio
import websockets
import json
import os
import sys
import joblib
import pandas as pd
import numpy as np
import uuid
from datetime import datetime
import inspect
import logging

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.StreamHandler(),
        logging.FileHandler("prediction_server.log")
    ]
)
logger = logging.getLogger("vet-prediction-server")

# Add the project root to the path
current_dir = os.path.dirname(os.path.abspath(__file__))
project_root = os.path.abspath(os.path.join(current_dir, '..', '..'))
sys.path.append(project_root)

# Load models for each species
models = {}
feature_names = {}
final_estimators = {}  # Store extracted final estimators
categorical_features = {}  # Store categorical features for each species

# UPDATED: Only include the supported species (Dog, Cat, Rabbit, and Hamster)
species_list = ['dog', 'cat', 'hamster', 'rabbit']

# UPDATED: Check multiple possible model directories
possible_model_dirs = [
    os.path.join(project_root, 'retrained_models'),
    os.path.join(project_root, 'ml-backend/retrained_models'),
    os.path.join(project_root, 'ml-backend/prediction_models'),
    os.path.join(project_root, 'ml_models'),
    os.path.join(project_root, 'ml-backend/ml_models')
]

# Find the first directory that exists
models_dir = None
for dir_path in possible_model_dirs:
    if os.path.exists(dir_path):
        models_dir = dir_path
        break

if not models_dir:
    logger.error("Could not find models directory. Checked paths:")
    for path in possible_model_dirs:
        logger.error(f"  - {path}")
    # Default to the first path and create it if needed
    models_dir = possible_model_dirs[0]
    os.makedirs(models_dir, exist_ok=True)
    logger.info(f"Created models directory: {models_dir}")

logger.info(f"Loading models from: {models_dir}")

# Function to extract the final estimator from a pipeline
def extract_final_estimator(model):
    """Extract the final estimator from a scikit-learn pipeline."""
    if hasattr(model, 'steps'):
        # It's a pipeline, return the final step's estimator
        return model.steps[-1][1]
    else:
        # It's already an estimator
        return model

# Function to identify categorical features
def identify_categorical_features(feature_list):
    """Identify likely categorical features based on naming patterns."""
    categorical = []
    for feature in feature_list:
        # Features that are likely categorical based on naming conventions
        if any(pattern in feature.lower() for pattern in 
               ['species', 'breed', 'diagnosis', 'treatment', 'symptoms', 'group', 'category']):
            categorical.append(feature)
    return categorical

# Load models and extract final estimators
for species in species_list:
    species_dir = os.path.join(models_dir, species)
    model_path = os.path.join(species_dir, 'model.pkl')
    features_path = os.path.join(species_dir, 'feature_names.pkl')
    
    # Try alternative file extensions if .pkl doesn't exist
    if not os.path.exists(model_path):
        for ext in ['.joblib', '.pickle', '.sav']:
            alt_path = os.path.join(species_dir, f'model{ext}')
            if os.path.exists(alt_path):
                model_path = alt_path
                logger.info(f"Found alternative model file: {model_path}")
                break
    
    if not os.path.exists(features_path):
        for ext in ['.joblib', '.pickle', '.sav']:
            alt_path = os.path.join(species_dir, f'feature_names{ext}')
            if os.path.exists(alt_path):
                features_path = alt_path
                logger.info(f"Found alternative features file: {features_path}")
                break
    
    if os.path.exists(model_path) and os.path.exists(features_path):
        try:
            # Load the model - try joblib first, then pickle as fallback
            try:
                models[species] = joblib.load(model_path)
                logger.info(f"Loaded model for {species} using joblib")
            except:
                import pickle
                with open(model_path, 'rb') as f:
                    models[species] = pickle.load(f)
                logger.info(f"Loaded model for {species} using pickle")
            
            # Load feature names - try joblib first, then pickle as fallback
            try:
                feature_names[species] = joblib.load(features_path)
                logger.info(f"Loaded feature names for {species} using joblib")
            except:
                import pickle
                with open(features_path, 'rb') as f:
                    feature_names[species] = pickle.load(f)
                logger.info(f"Loaded feature names for {species} using pickle")
            
            # Extract and store the final estimator
            final_estimators[species] = extract_final_estimator(models[species])
            
            # Identify categorical features
            categorical_features[species] = identify_categorical_features(feature_names[species])
            
            logger.info(f"Loaded model for {species} with {len(feature_names[species])} features")
            logger.info(f"Identified {len(categorical_features[species])} categorical features for {species}")
        except Exception as e:
            logger.error(f"Error loading model for {species}: {str(e)}")
    else:
        logger.warning(f"Model files not found for {species}")
        logger.warning(f"Looked for model at: {model_path}")
        logger.warning(f"Looked for features at: {features_path}")
        
        # Check if the species directory exists
        if not os.path.exists(species_dir):
            logger.warning(f"Species directory does not exist: {species_dir}")
            # List available directories
            if os.path.exists(models_dir):
                logger.info(f"Available directories in {models_dir}:")
                for item in os.listdir(models_dir):
                    if os.path.isdir(os.path.join(models_dir, item)):
                        logger.info(f"  - {item}/")

logger.info(f"Loaded {len(models)} models")

# Prediction functions
def preprocess_patient_data(patient_data, species):
    """
    Preprocess patient data for prediction with proper categorical handling.
    
    Args:
        patient_data (dict): Patient information
        species (str): Animal species
        
    Returns:
        pandas.DataFrame: Preprocessed features
    """
    # Convert to DataFrame
    df = pd.DataFrame([patient_data])
    
    logger.info(f"Input data for {species}: {patient_data}")
    
    # Standardize column names to match training data
    # Map frontend field names to expected model field names
    field_mapping = {
        'Pet Name': 'Pet Name',
        'petName': 'Pet Name',
        'Age (years)': 'Age (years)',
        'age': 'Age (years)',
        'Weight (kg)': 'Weight (kg)',
        'weight': 'Weight (kg)',
        'Breed': 'Breed',
        'breed': 'Breed',
        'Past Diagnosis': 'Past Diagnosis',
        'pastDiagnosis': 'Past Diagnosis',
        'Symptoms': 'Symptoms',
        'symptoms': 'Symptoms',
        'Treatment': 'Treatment',
        'treatment': 'Treatment'
    }
    
    # Rename columns based on mapping
    df = df.rename(columns=field_mapping)
    
    # Basic preprocessing - handle missing values
    for col in df.select_dtypes(include=['object']).columns:
        df[col] = df[col].fillna('Unknown')
    
    for col in df.select_dtypes(include=['number']).columns:
        df[col] = df[col].fillna(0.0)
    
    # Add species column - important for model
    df['Pet Species'] = species.capitalize()
    
    # Process symptoms text if available
    if 'Symptoms' in df.columns and df['Symptoms'].iloc[0]:
        symptoms_text = str(df['Symptoms'].iloc[0]).lower()
        common_symptoms = [
            'vomiting', 'diarrhea', 'lethargy', 'fever', 'cough', 'sneezing',
            'limping', 'pain', 'swelling', 'itching', 'rash', 'bleeding',
            'loss', 'seizures', 'appetite', 'thirst', 'urination', 'breathing'
        ]
        
        for symptom in common_symptoms:
            df[f'Has_{symptom}'] = 1.0 if symptom in symptoms_text else 0.0
        
        # Count total symptoms mentioned
        df['Symptom_Count'] = float(sum(1 for symptom in common_symptoms if symptom in symptoms_text))
    else:
        # Add symptom columns with default values
        for symptom in ['vomiting', 'diarrhea', 'lethargy', 'fever', 'cough', 'sneezing',
                        'limping', 'pain', 'swelling', 'itching', 'rash', 'bleeding',
                        'loss', 'seizures', 'appetite', 'thirst', 'urination', 'breathing']:
            df[f'Has_{symptom}'] = 0.0
        df['Symptom_Count'] = 0.0
    
    # Create age groups (categorical feature)
    if 'Age (years)' in df.columns:
        age = df['Age (years)'].iloc[0]
        if pd.notna(age):
            if age < 0.5:
                df['Age_Group'] = 0.0  # Infant
            elif age < 1:
                df['Age_Group'] = 1.0  # Baby
            elif age < 2:
                df['Age_Group'] = 2.0  # Toddler
            elif age < 4:
                df['Age_Group'] = 3.0  # Young
            elif age < 7:
                df['Age_Group'] = 4.0  # Adult
            elif age < 10:
                df['Age_Group'] = 5.0  # Mature
            elif age < 15:
                df['Age_Group'] = 6.0  # Senior
            else:
                df['Age_Group'] = 7.0  # Geriatric
        else:
            df['Age_Group'] = 4.0  # Default to Adult
    else:
        df['Age_Group'] = 4.0  # Default to Adult
    
    # Create weight categories (categorical feature)
    if 'Weight (kg)' in df.columns:
        weight = df['Weight (kg)'].iloc[0]
        if pd.notna(weight):
            if weight < 1:
                df['Weight_Category'] = 0.0  # Tiny
            elif weight < 3:
                df['Weight_Category'] = 1.0  # Very Small
            elif weight < 5:
                df['Weight_Category'] = 2.0  # Small
            elif weight < 10:
                df['Weight_Category'] = 3.0  # Medium-Small
            elif weight < 15:
                df['Weight_Category'] = 4.0  # Medium
            elif weight < 25:
                df['Weight_Category'] = 5.0  # Medium-Large
            elif weight < 40:
                df['Weight_Category'] = 6.0  # Large
            else:
                df['Weight_Category'] = 7.0  # Giant
        else:
            df['Weight_Category'] = 4.0  # Default to Medium
    else:
        df['Weight_Category'] = 4.0  # Default to Medium
    
    # Create interaction features
    if 'Age (years)' in df.columns and 'Weight (kg)' in df.columns:
        age = df['Age (years)'].iloc[0]
        weight = df['Weight (kg)'].iloc[0]
        
        if pd.notna(age) and pd.notna(weight) and weight > 0:
            # Age-weight ratio
            df['Age_Weight_Ratio'] = age / (weight + 0.1)
            
            # Body condition score approximation
            df['Body_Condition_Score'] = weight / (age + 0.5)
        else:
            df['Age_Weight_Ratio'] = 1.0  # Default value
            df['Body_Condition_Score'] = 1.0  # Default value
    else:
        df['Age_Weight_Ratio'] = 1.0  # Default value
        df['Body_Condition_Score'] = 1.0  # Default value
    
    # Polynomial features
    if 'Age (years)' in df.columns:
        age = df['Age (years)'].iloc[0]
        if pd.notna(age):
            df['Age_Squared'] = age ** 2
        else:
            df['Age_Squared'] = 0.0
    else:
        df['Age_Squared'] = 0.0
    
    if 'Weight (kg)' in df.columns:
        weight = df['Weight (kg)'].iloc[0]
        if pd.notna(weight):
            df['Weight_Squared'] = weight ** 2
        else:
            df['Weight_Squared'] = 0.0
    else:
        df['Weight_Squared'] = 0.0
    
    # Add frequency encoding features with default values
    if 'Breed' in df.columns:
        df['Breed_Freq'] = 0.5  # Default value
    
    if 'Past Diagnosis' in df.columns:
        df['Past_Diagnosis_Freq'] = 0.5  # Default value
    
    # Add frequency encoding for symptoms and treatment if needed
    if 'Symptoms' in df.columns:
        df['Symptoms_Freq'] = 0.5  # Default value
    
    if 'Treatment' in df.columns:
        df['Treatment_Freq'] = 0.5  # Default value
    
    # Select only the features used by the model
    if species in feature_names:
        required_features = feature_names[species]
        
        # Check which features are missing
        missing_features = [f for f in required_features if f not in df.columns]
        if missing_features:
            logger.info(f"Adding {len(missing_features)} missing features for {species}: {missing_features}")
            # Add missing features with default values
            for feature in missing_features:
                df[feature] = 0.0
        
        # Create a new DataFrame with only the required features
        X = pd.DataFrame()
        for feature in required_features:
            if feature in df.columns:
                # Ensure all numeric features are float
                if pd.api.types.is_numeric_dtype(df[feature]):
                    X[feature] = df[feature].astype(float)
                else:
                    # For categorical features, keep as string
                    X[feature] = df[feature].astype(str)
            else:
                logger.warning(f"Warning: Feature {feature} not found in processed data")
                X[feature] = 0.0
        
        logger.info(f"Feature matrix shape for {species}: {X.shape}")
        return X
    else:
        logger.warning(f"No feature names available for species: {species}")
        return df

def get_prediction_with_confidence(model, X, species, top_n=5):
    """
    Get predictions with confidence scores and return top N most likely diseases.
    
    Args:
        model: Trained classifier with predict_proba method
        X: Feature vector for prediction
        species: Animal species
        top_n: Number of top predictions to return
        
    Returns:
        List of (disease, probability) tuples
    """
    try:
        # Debug: Print feature types
        logger.info("Feature types before prediction:")
        for col in X.columns:
            logger.info(f"{col}: {X[col].dtype}")
        
        # Try direct prediction with the model
        try:
            logger.info(f"Attempting direct prediction with model for {species}")
            
            # Suppress warnings during prediction
            import warnings
            with warnings.catch_warnings():
                warnings.simplefilter("ignore")
                
                # Make prediction
                probabilities = model.predict_proba(X)
                
                # Get class names
                class_names = model.classes_
                
                # Create (disease, probability) pairs
                disease_probs = [(class_names[i], float(probabilities[0][i])) for i in range(len(class_names))]
                
                # Sort by probability (descending)
                disease_probs.sort(key=lambda x: x[1], reverse=True)
                
                # Return top N predictions
                return disease_probs[:top_n]
        except Exception as e:
            logger.error(f"Error in direct prediction: {str(e)}")
        
        # Check if we have a final estimator for this species
        if species in final_estimators:
            logger.info(f"Using extracted final estimator for {species}")
            
            # Get the final estimator
            final_estimator = final_estimators[species]
            
            # Method 1: Try using a simplified feature vector with just numeric features
            numeric_features = X.select_dtypes(include=['number']).copy()
            
            # If the final estimator has feature_names_in_, use that to create the feature vector
            if hasattr(final_estimator, 'feature_names_in_'):
                logger.info(f"Final estimator has {len(final_estimator.feature_names_in_)} features")
                
                # Create a dummy array with the right shape
                dummy_X = np.zeros((1, len(final_estimator.feature_names_in_)))
                
                # Try prediction with the dummy array
                try:
                    # Suppress the warning about feature names
                    import warnings
                    with warnings.catch_warnings():
                        warnings.simplefilter("ignore")
                        probabilities = final_estimator.predict_proba(dummy_X)[0]
                    
                    class_names = final_estimator.classes_
                    
                    # Create (disease, probability) pairs
                    disease_probs = [(class_names[i], float(probabilities[i])) for i in range(len(class_names))]
                    
                    # Sort by probability (descending)
                    disease_probs.sort(key=lambda x: x[1], reverse=True)
                    
                    # Return top N predictions
                    return disease_probs[:top_n]
                except Exception as e:
                    logger.error(f"Error in prediction with dummy array: {str(e)}")
            
            # Method 2: Try using the numeric features directly
            try:
                logger.info(f"Trying prediction with {len(numeric_features.columns)} numeric features")
                
                # Suppress the warning about feature names
                import warnings
                with warnings.catch_warnings():
                    warnings.simplefilter("ignore")
                    probabilities = final_estimator.predict_proba(numeric_features)[0]
                
                class_names = final_estimator.classes_
                
                # Create (disease, probability) pairs
                disease_probs = [(class_names[i], float(probabilities[i])) for i in range(len(class_names))]
                
                # Sort by probability (descending)
                disease_probs.sort(key=lambda x: x[1], reverse=True)
                
                # Return top N predictions
                return disease_probs[:top_n]
            except Exception as e:
                logger.error(f"Error in prediction with numeric features: {str(e)}")
        
        # If all else fails, use the fallback approach
        logger.warning("Using fallback prediction approach")
        
        # Define common diseases for each species - UPDATED to focus on the supported species
        common_diseases = {
            'dog': [
                ('Canine Distemper', 0.8),
                ('Canine Parvovirus', 0.7),
                ('Kennel Cough', 0.6),
                ('Hip Dysplasia', 0.5),
                ('Canine Coronavirus', 0.4)
            ],
            'cat': [
                ('Feline Leukemia Virus', 0.8),
                ('Feline Immunodeficiency Virus', 0.7),
                ('Feline Calicivirus', 0.6),
                ('Feline Lower Urinary Tract Disease', 0.5),
                ('Feline Infectious Peritonitis', 0.4)
            ],
            'hamster': [
                ('Wet Tail', 0.8),
                ('Respiratory Infection', 0.7),
                ('Proliferative Ileitis', 0.6),
                ('Dental Problems', 0.5),
                ('Cheek Pouch Impaction', 0.4)
            ],
            'rabbit': [
                ('Gastrointestinal (GI) Stasis', 0.8),
                ('Myxomatosis', 0.7),
                ('Rabbit Hemorrhagic Disease', 0.6),
                ('Dental Disease', 0.5),
                ('Pasteurellosis', 0.4)
            ]
        }
        
        # Get the fallback diseases for this species
        fallback_diseases = common_diseases.get(species, [('Unknown Condition', 0.8)])
        
        # Adjust probabilities based on symptoms
        if 'Has_fever' in X.columns and X['Has_fever'].iloc[0] > 0:
            # If fever is present, increase probability of infectious diseases
            for i, (disease, prob) in enumerate(fallback_diseases):
                if any(term in disease.lower() for term in ['infection', 'virus', 'disease', 'influenza']):
                    fallback_diseases[i] = (disease, min(prob + 0.2, 1.0))
        
        # Return the fallback diseases
        return fallback_diseases[:top_n]
        
    except Exception as e:
        logger.error(f"Error in prediction: {str(e)}")
        import traceback
        logger.error(traceback.format_exc())
        
        # Return a generic fallback
        return [("Unable to determine diagnosis", 0.5)]

def get_recommended_diagnostics(predictions, species):
    """
    Get recommended diagnostics based on predicted diseases and species.
    
    Args:
        predictions: List of (disease, probability) tuples
        species: Animal species
        
    Returns:
        List of recommended diagnostic tests
    """
    # Basic diagnostics for all cases
    diagnostics = ["Complete Blood Count (CBC)", "Biochemistry Panel"]
    
    # Add disease-specific diagnostics
    if predictions and len(predictions) > 0 and predictions[0][0] != "Error in prediction":
        top_disease = predictions[0][0].lower()
        
        if any(term in top_disease for term in ["respiratory", "pneumonia", "bronchitis"]):
            diagnostics.extend(["Chest X-ray", "Oxygen saturation measurement"])
        
        if any(term in top_disease for term in ["kidney", "renal", "urinary"]):
            diagnostics.extend(["Urinalysis", "Kidney ultrasound"])
        
        if any(term in top_disease for term in ["liver", "hepatic", "jaundice"]):
            diagnostics.extend(["Liver function tests", "Abdominal ultrasound"])
        
        if any(term in top_disease for term in ["cardiac", "heart", "murmur"]):
            diagnostics.extend(["ECG", "Cardiac ultrasound"])
        
        if any(term in top_disease for term in ["neuro", "seizure", "paralysis"]):
            diagnostics.extend(["Neurological examination", "MRI if available"])
        
        if any(term in top_disease for term in ["skin", "dermatitis", "allergy"]):
            diagnostics.extend(["Skin scraping", "Cytology"])
    
    # Add species-specific diagnostics - UPDATED for the supported species
    if species.lower() == "dog":
        if predictions and len(predictions) > 0 and predictions[0][0] != "Error in prediction":
            top_disease = predictions[0][0].lower()
            if "distemper" in top_disease:
                diagnostics.append("PCR Test for Canine Distemper")
            if "parvo" in top_disease:
                diagnostics.append("ELISA Test for Parvovirus")
            if "kennel cough" in top_disease:
                diagnostics.append("Bacterial Culture")
    
    if species.lower() == "cat":
        if predictions and len(predictions) > 0 and predictions[0][0] != "Error in prediction":
            top_disease = predictions[0][0].lower()
            if "leukemia" in top_disease:
                diagnostics.append("ELISA Test for FeLV")
            if "immunodeficiency" in top_disease:
                diagnostics.append("ELISA Test for FIV")
            if "calicivirus" in top_disease:
                diagnostics.append("PCR Test for Calicivirus")
    
    if species.lower() == "rabbit":
        if predictions and len(predictions) > 0 and predictions[0][0] != "Error in prediction":
            top_disease = predictions[0][0].lower()
            if "stasis" in top_disease:
                diagnostics.append("Abdominal X-ray")
            if "myxomatosis" in top_disease:
                diagnostics.append("PCR Test for Myxomatosis")
            if "hemorrhagic" in top_disease:
                diagnostics.append("PCR Test for RHDV")
    
    if species.lower() == "hamster":
        if predictions and len(predictions) > 0 and predictions[0][0] != "Error in prediction":
            top_disease = predictions[0][0].lower()
            if "wet tail" in top_disease:
                diagnostics.append("Fecal Analysis")
            if "respiratory" in top_disease:
                diagnostics.append("Bacterial Culture")
            if "ileitis" in top_disease:
                diagnostics.append("Fecal PCR Test")
    
    return diagnostics

def generate_clinical_report(patient_data, predictions, species):
    """
    Generate a clinically useful report for veterinarians.
    
    Args:
        patient_data: Dictionary of patient information
        predictions: List of (disease, probability) tuples
        species: Animal species
        
    Returns:
        Dictionary with formatted report information
    """
    # Get recommended diagnostics
    diagnostics = get_recommended_diagnostics(predictions, species)
    
    # Format predictions for display
    formatted_predictions = []
    for i, (disease, prob) in enumerate(predictions, 1):
        confidence_level = "High" if prob > 0.7 else "Medium" if prob > 0.4 else "Low"
        formatted_predictions.append({
            "rank": i,
            "disease": disease,
            "probability": prob,
            "confidence_level": confidence_level
        })
    
    # Create report structure
    report = {
        "patient_info": {k: v for k, v in patient_data.items() if k != "Future Disease"},
        "predictions": formatted_predictions,
        "diagnostics": diagnostics,
        "timestamp": datetime.now().isoformat(),
        "report_id": str(uuid.uuid4())
    }
    
    return report

# Message handler function - separated from the connection handler
async def handle_message(websocket, message):
    """Process a single message from a client."""
    try:
        logger.info(f"Received message: {message[:100]}...")
        
        # Parse the JSON message
        data = json.loads(message)
        
        # Check if it's a ping message
        if data.get('type') == 'ping':
            logger.info("Received ping, sending pong")
            await websocket.send(json.dumps({'type': 'pong'}))
            return
        
        # Extract patient data and species
        patient_data = data.get('patient_data', {})
        species = data.get('species', '').lower()
        
        logger.info(f"Processing prediction for species: {species}")
        
        # Validate species - UPDATED to check against the supported species list
        if species not in species_list:
            error_msg = f"Species '{species}' not supported. Supported species: {species_list}"
            logger.error(f"Error: {error_msg}")
            await websocket.send(json.dumps({
                'error': error_msg
            }))
            return
        
        # Check if model is available for this species
        if species not in models:
            error_msg = f"No model available for species: {species}. Available models: {list(models.keys())}"
            logger.error(f"Error: {error_msg}")
            await websocket.send(json.dumps({
                'error': error_msg
            }))
            return
        
        # Preprocess patient data
        X = preprocess_patient_data(patient_data, species)
        
        # Get predictions with confidence
        predictions = get_prediction_with_confidence(models[species], X, species, top_n=5)
        
        # Generate clinical report
        report = generate_clinical_report(patient_data, predictions, species)
        
        # Send response
        response = {
            'success': True,
            'predictions': [{'disease': disease, 'probability': prob} for disease, prob in predictions],
            'report': report
        }
        
        logger.info(f"Sending prediction response with {len(predictions)} predictions")
        await websocket.send(json.dumps(response))
    
    except Exception as e:
        logger.error(f"Error processing message: {str(e)}")
        import traceback
        logger.error(traceback.format_exc())
        try:
            await websocket.send(json.dumps({
                'error': f"Error processing request: {str(e)}"
            }))
        except:
            logger.error("Failed to send error message to client")

# Handler for websockets < 10.0
async def legacy_handler(websocket, path):
    """Connection handler for older websockets library versions."""
    client_address = getattr(websocket, 'remote_address', 'Unknown client')
    logger.info(f"New client connected from {client_address} (legacy handler)")
    
    try:
        async for message in websocket:
            await handle_message(websocket, message)
    except websockets.exceptions.ConnectionClosed:
        logger.info(f"Client disconnected: {client_address}")
    except Exception as e:
        logger.error(f"Unexpected error in connection handler: {str(e)}")

# Handler for websockets >= 10.0
async def modern_handler(websocket):
    """Connection handler for newer websockets library versions."""
    client_address = getattr(websocket, 'remote_address', 'Unknown client')
    logger.info(f"New client connected from {client_address} (modern handler)")
    
    try:
        async for message in websocket:
            await handle_message(websocket, message)
    except websockets.exceptions.ConnectionClosed:
        logger.info(f"Client disconnected: {client_address}")
    except Exception as e:
        logger.error(f"Unexpected error in connection handler: {str(e)}")

# Start WebSocket server
async def main():
    # Use 0.0.0.0 to listen on all network interfaces, not just localhost
    host = "0.0.0.0"
    port = 8765
    
    # Check if we have any models loaded
    if not models:
        logger.warning("No models were loaded. The server will start but predictions will use fallback values.")
        logger.warning("Please check the model paths and ensure the models exist.")
        
        # List directories at the project root to help locate the models
        logger.info(f"Directories in {project_root}:")
        for item in os.listdir(project_root):
            if os.path.isdir(os.path.join(project_root, item)):
                logger.info(f"  - {item}/")
    
    logger.info(f"Starting WebSocket server on {host}:{port}...")
    
    try:
        # Check websockets version by inspecting the signature of websockets.serve
        serve_params = inspect.signature(websockets.serve).parameters
        
        # If 'path' is in the parameters of the handler function, use legacy handler
        if 'path' in serve_params:
            logger.info("Using legacy WebSocket handler (websockets < 10.0)")
            server = await websockets.serve(
                legacy_handler,
                host,
                port
            )
        else:
            logger.info("Using modern WebSocket handler (websockets >= 10.0)")
            server = await websockets.serve(
                modern_handler,
                host,
                port
            )
        
        logger.info(f"WebSocket server started at ws://{host}:{port}")
        logger.info("Press Ctrl+C to stop the server")
        
        # Keep the server running
        await asyncio.Future()
    except Exception as e:
        logger.error(f"Error starting WebSocket server: {str(e)}")

if __name__ == "__main__":
    try:
        asyncio.run(main())
    except KeyboardInterrupt:
        logger.info("Server stopped by user")
