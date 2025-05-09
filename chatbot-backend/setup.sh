#!/bin/bash

# Create a Python virtual environment
python -m venv venv

# Activate the virtual environment
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Initialize Rasa project
rasa init --no-prompt

# Replace the default files with our custom files
# (This is handled by the user copying the files from this guide)

# Train the model
rasa train

echo "Setup complete! You can now run the Rasa server with:"
echo "rasa run --enable-api --cors \"*\" --port 5005"
echo "And in a separate terminal, run the actions server with:"
echo "rasa run actions"
