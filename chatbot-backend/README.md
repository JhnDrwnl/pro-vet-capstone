# ProVet Multilingual Chatbot

This project integrates Rasa with Firebase Gemini Extension to create a multilingual chatbot capable of understanding and responding in English, Tagalog, and Taglish.

## Setup Instructions

### Prerequisites
- Python 3.8 or higher
- Node.js 14 or higher
- Firebase account with Gemini Extension installed
- Rasa installed

### 1. Set up the Rasa environment

\`\`\`bash
# Navigate to the chatbot-backend directory
cd chatbot-backend

# Create and activate a virtual environment
python -m venv rasa-venv
source rasa-venv/bin/activate  # On Windows: rasa-venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt
\`\`\`

### 2. Set up the Node.js server

\`\`\`bash
# Navigate to the node-server directory
cd node-server

# Install dependencies
npm install
\`\`\`

### 3. Configure Firebase credentials

Make sure your Firebase service account key files are in the correct locations:
- `chatbot-backend/node-server/provet-calapan-3bc89-firebase-adminsdk-3j1s1-2106f30da1.json`
- `chatbot-backend/rasa/actions/provet-calapan-3bc89-firebase-adminsdk-lxw7c-064f94b960.json`

### 4. Configure environment variables

Create a `.env` file in the `chatbot-backend` directory with the following content:

\`\`\`
PORT=5005
RASA_URL=http://localhost:5005
GEMINI_API_KEY=AIzaSyBqAW39u5D6RwW0LJ2qqJQTtIOEwgDQBmA
\`\`\`

### 5. Train the Rasa model

\`\`\`bash
# Navigate to the rasa directory
cd rasa

# Train the model
rasa train
\`\`\`

### 6. Start the services

In separate terminal windows:

\`\`\`bash
# Start the Rasa server
cd chatbot-backend/rasa
rasa run --enable-api --cors "*"

# Start the Rasa actions server
cd chatbot-backend/rasa
rasa run actions

# Start the Node.js server
cd chatbot-backend/node-server
npm start
\`\`\`

### 7. Integrate the chatbot component in your Vue.js frontend

Import and use the Chatbot.vue component in your application.

## Usage

The chatbot will:
1. Use Rasa for intent recognition and structured conversation flows
2. Fall back to Gemini when Rasa cannot confidently identify an intent
3. Maintain conversation context for coherent responses
4. Automatically detect and respond in English, Tagalog, or Taglish

## Troubleshooting

If you encounter issues:
1. Check that all services are running
2. Verify Firebase credentials are correct
3. Ensure the Gemini Extension is properly installed in your Firebase project
4. Check the logs for error messages
