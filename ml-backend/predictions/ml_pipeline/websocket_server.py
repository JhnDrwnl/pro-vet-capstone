# predictions/ml_pipeline/websocket_server.py
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

# Add the project root to the path
current_dir = os.path.dirname(os.path.abspath(__file__))
project_root = os.path.abspath(os.path.join(current_dir, '..', '..'))
sys.path.append(project_root)

# Load models for each species
models = {}
feature_names = {}
species_list = ['dog', 'cat', 'chicken', 'fish', 'hamster', 'rabbit', 'snake', 'turtle']
models_dir = os.path.join(project_root, 'ml-backend/prediction_models')

print(f"Loading models from: {models_dir}")

for species in species_list:
    species_dir = os.path.join(models_dir, species)
    model_path = os.path.join(species_dir, 'model.pkl')
    features_path = os.path.join(species_dir, 'feature_names.pkl')
    
    if os.path.exists(model_path) and os.path.exists(features_path):
        try:
            models[species] = joblib.load(model_path)
            feature_names[species] = joblib.load(features_path)
            print(f"Loaded model for {species}")
        except Exception as e:
            print(f"Error loading model for {species}: {str(e)}")
    else:
        print(f"Model files not found for {species}")

print(f"Loaded {len(models)} models")

# Prediction functions
def preprocess_patient_data(patient_data, species):
    """
    Preprocess patient data for prediction.
    
    Args:
        patient_data (dict): Patient information
        species (str): Animal species
        
    Returns:
        pandas.DataFrame: Preprocessed features
    """
    # Convert to DataFrame
    df = pd.DataFrame([patient_data])
    
    # Basic preprocessing - handle missing values
    for col in df.select_dtypes(include=['object']).columns:
        df[col] = df[col].fillna('Unknown')
    
    for col in df.select_dtypes(include=['number']).columns:
        df[col] = df[col].fillna(0)
    
    # Feature engineering (simplified version)
    # Age groups
    if 'Age (years)' in df.columns:
        df['Age_Group'] = pd.cut(
            df['Age (years)'], 
            bins=[0, 1, 3, 7, 12, 20],
            labels=['Puppy/Kitten', 'Young', 'Adult', 'Senior', 'Geriatric']
        )
        # One-hot encode age groups
        age_dummies = pd.get_dummies(df['Age_Group'], prefix='Age')
        df = pd.concat([df, age_dummies], axis=1)
    
    # Weight categories
    if 'Weight (kg)' in df.columns:
        df['Weight_Category'] = pd.cut(
            df['Weight (kg)'],
            bins=[0, 2, 5, 10, 20, 50],
            labels=['Tiny', 'Small', 'Medium', 'Large', 'Giant']
        )
        # One-hot encode weight categories
        weight_dummies = pd.get_dummies(df['Weight_Category'], prefix='Weight')
        df = pd.concat([df, weight_dummies], axis=1)
    
    # Process symptoms text if available
    if 'Symptoms' in df.columns and df['Symptoms'].iloc[0]:
        # Simple keyword extraction (in a real system, you'd use the same vectorizer as training)
        symptoms_text = df['Symptoms'].iloc[0].lower()
        common_symptoms = [
            'vomiting', 'diarrhea', 'lethargy', 'fever', 'cough', 'sneezing',
            'limping', 'pain', 'swelling', 'itching', 'rash', 'bleeding',
            'loss', 'seizures'  # Added missing symptoms
        ]
        for symptom in common_symptoms:
            df[f'Symptom_{symptom}'] = 1 if symptom in symptoms_text else 0
    
    # Add missing features that the model expects
    # Age_Weight_Ratio
    if 'Age (years)' in df.columns and 'Weight (kg)' in df.columns:
        df['Age_Weight_Ratio'] = df['Age (years)'] / (df['Weight (kg)'] + 0.1)
    else:
        df['Age_Weight_Ratio'] = 0  # Default value
    
    # Frequency encodings (simplified)
    if 'Breed' in df.columns:
        df['Breed_Frequency'] = 0.5  # Default value
    
    if 'Past Diagnosis' in df.columns:
        df['Past Diagnosis_Frequency'] = 0.5  # Default value
    else:
        df['Past Diagnosis_Frequency'] = 0.5  # Default value
    
    if 'Symptoms' in df.columns:
        df['Symptoms_Frequency'] = 0.5  # Default value
    
    # Add Treatment_Frequency if needed
    df['Treatment_Frequency'] = 0.5  # Default value
    
    # Select only the features used by the model
    if species in feature_names:
        # Get the features required by the model
        required_features = feature_names[species]
        
        # Check which features are missing
        missing_features = [f for f in required_features if f not in df.columns]
        if missing_features:
            print(f"Adding missing features for {species}: {missing_features}")
            # Add missing features with default values
            for feature in missing_features:
                df[feature] = 0
        
        # Select only the required features in the correct order
        X = pd.DataFrame(index=df.index)
        for feature in required_features:
            X[feature] = df[feature] if feature in df.columns else 0
        
        # Fill any remaining NaN values with 0
        X = X.fillna(0)
        
        return X
    else:
        # If no feature names available, return engineered dataframe
        print(f"No feature names available for species: {species}")
        return df

def get_prediction_with_confidence(model, X, top_n=5):
    """
    Get predictions with confidence scores and return top N most likely diseases.
    
    Args:
        model: Trained classifier with predict_proba method
        X: Feature vector for prediction
        top_n: Number of top predictions to return
        
    Returns:
        List of (disease, probability) tuples
    """
    try:
        # Ensure X has all the features the model expects
        if hasattr(model, 'feature_names_in_'):
            missing_features = [f for f in model.feature_names_in_ if f not in X.columns]
            if missing_features:
                print(f"Warning: Model expects features that are not in input: {missing_features}")
                # Add missing features with zeros
                for feature in missing_features:
                    X[feature] = 0
            
            # Ensure correct order of features
            X = X[model.feature_names_in_]
        
        # Get probability distribution across all classes
        probabilities = model.predict_proba(X)[0]
        
        # Get class names
        class_names = model.classes_
        
        # Create (disease, probability) pairs
        disease_probs = [(class_names[i], float(probabilities[i])) for i in range(len(class_names))]
        
        # Sort by probability (descending)
        disease_probs.sort(key=lambda x: x[1], reverse=True)
        
        # Return top N predictions
        return disease_probs[:top_n]
    except Exception as e:
        print(f"Error in prediction: {str(e)}")
        import traceback
        traceback.print_exc()
        return [("Error in prediction", 0.0)]

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
    
    # Add species-specific diagnostics
    if species.lower() == "dog":
        if predictions and len(predictions) > 0 and predictions[0][0] != "Error in prediction":
            top_disease = predictions[0][0].lower()
            if any(term in top_disease for term in ["tick", "ehrlichia", "lyme"]):
                diagnostics.append("Tick-borne disease panel")
            if "parvo" in top_disease:
                diagnostics.append("Parvovirus test")
    
    if species.lower() == "cat":
        if predictions and len(predictions) > 0 and predictions[0][0] != "Error in prediction":
            top_disease = predictions[0][0].lower()
            if any(term in top_disease for term in ["urinary", "cystitis"]):
                diagnostics.append("Urine culture")
            if any(term in top_disease for term in ["fiv", "felv"]):
                diagnostics.append("FIV/FeLV test")
    
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
        print(f"Received message: {message[:100]}...")
        
        # Parse the JSON message
        data = json.loads(message)
        
        # Check if it's a ping message
        if data.get('type') == 'ping':
            print("Received ping, sending pong")
            await websocket.send(json.dumps({'type': 'pong'}))
            return
        
        # Extract patient data and species
        patient_data = data.get('patient_data', {})
        species = data.get('species', '').lower()
        
        print(f"Processing prediction for species: {species}")
        
        # Validate species
        if species not in models:
            error_msg = f"Species '{species}' not supported. Supported species: {list(models.keys())}"
            print(f"Error: {error_msg}")
            await websocket.send(json.dumps({
                'error': error_msg
            }))
            return
        
        # Preprocess patient data
        X = preprocess_patient_data(patient_data, species)
        
        # Get predictions with confidence
        predictions = get_prediction_with_confidence(models[species], X, top_n=5)
        
        # Generate clinical report
        report = generate_clinical_report(patient_data, predictions, species)
        
        # Send response
        response = {
            'success': True,
            'predictions': [{'disease': disease, 'probability': prob} for disease, prob in predictions],
            'report': report
        }
        
        print(f"Sending prediction response with {len(predictions)} predictions")
        await websocket.send(json.dumps(response))
    
    except Exception as e:
        print(f"Error processing message: {str(e)}")
        import traceback
        traceback.print_exc()
        try:
            await websocket.send(json.dumps({
                'error': f"Error processing request: {str(e)}"
            }))
        except:
            print("Failed to send error message to client")

# Handler for websockets < 10.0
async def legacy_handler(websocket, path):
    """Connection handler for older websockets library versions."""
    client_address = getattr(websocket, 'remote_address', 'Unknown client')
    print(f"New client connected from {client_address} (legacy handler)")
    
    try:
        async for message in websocket:
            await handle_message(websocket, message)
    except websockets.exceptions.ConnectionClosed:
        print(f"Client disconnected: {client_address}")
    except Exception as e:
        print(f"Unexpected error in connection handler: {str(e)}")

# Handler for websockets >= 10.0
async def modern_handler(websocket):
    """Connection handler for newer websockets library versions."""
    client_address = getattr(websocket, 'remote_address', 'Unknown client')
    print(f"New client connected from {client_address} (modern handler)")
    
    try:
        async for message in websocket:
            await handle_message(websocket, message)
    except websockets.exceptions.ConnectionClosed:
        print(f"Client disconnected: {client_address}")
    except Exception as e:
        print(f"Unexpected error in connection handler: {str(e)}")

# Start WebSocket server
async def main():
    # Use 0.0.0.0 to listen on all network interfaces, not just localhost
    host = "0.0.0.0"
    port = 8765
    
    print(f"Starting WebSocket server on {host}:{port}...")
    
    try:
        # Check websockets version by inspecting the signature of websockets.serve
        serve_params = inspect.signature(websockets.serve).parameters
        
        # If 'path' is in the parameters of the handler function, use legacy handler
        if 'path' in serve_params:
            print("Using legacy WebSocket handler (websockets < 10.0)")
            server = await websockets.serve(
                legacy_handler,
                host,
                port
            )
        else:
            print("Using modern WebSocket handler (websockets >= 10.0)")
            server = await websockets.serve(
                modern_handler,
                host,
                port
            )
        
        print(f"WebSocket server started at ws://{host}:{port}")
        print("Press Ctrl+C to stop the server")
        
        # Keep the server running
        await asyncio.Future()
    except Exception as e:
        print(f"Error starting WebSocket server: {str(e)}")

if __name__ == "__main__":
    try:
        asyncio.run(main())
    except KeyboardInterrupt:
        print("Server stopped by user")