import requests
from requests.auth import HTTPBasicAuth
import json

# Your Django credentials
username = 'dell'  # Replace with your username
password = 'Veterinary1234'  # Replace with your password

# Base URL
base_url = 'http://localhost:8000/api'

# Create a session to reuse the connection
session = requests.Session()
session.auth = HTTPBasicAuth(username, password)
session.headers.update({'Content-Type': 'application/json'})

# 1. Create a pet
pet_data = {
    "name": "Max",
    "species": "dog",
    "breed": "Labrador",
    "age": 5,
    "weight": 25,
    "owner": 1  # Replace with your user ID
}

print("Creating pet...")
pet_response = session.post(f"{base_url}/pets/pets/", data=json.dumps(pet_data))
print(f"Status: {pet_response.status_code}")
print(f"Response: {pet_response.text}")

if pet_response.status_code == 201:
    pet_id = pet_response.json()['id']
    
    # 2. Create a medical record
    record_data = {
        "pet": pet_id,
        "symptoms": "lethargy"
    }
    
    print("\nCreating medical record...")
    record_response = session.post(f"{base_url}/pets/medical-records/", data=json.dumps(record_data))
    print(f"Status: {record_response.status_code}")
    print(f"Response: {record_response.text}")
    
    if record_response.status_code == 201:
        record_id = record_response.json()['id']
        
        # 3. Make a prediction
        prediction_data = {
            "pet_id": pet_id,
            "medical_record_id": record_id,
            "symptoms": "lethargy"
        }
        
        print("\nMaking prediction...")
        prediction_response = session.post(f"{base_url}/predictions/predictions/predict/", data=json.dumps(prediction_data))
        print(f"Status: {prediction_response.status_code}")
        print(f"Response: {prediction_response.text}")