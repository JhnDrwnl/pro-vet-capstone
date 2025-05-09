from typing import Any, Dict, List, Text
from rasa_sdk import Action, Tracker
from rasa_sdk.executor import CollectingDispatcher
from rasa_sdk.events import UserUtteranceReverted, SlotSet
import firebase_admin
from firebase_admin import credentials
import os
import json
import requests
import logging
import time
from dotenv import load_dotenv
import socket

# Import the improved language detection from language_utils if available
try:
    from .language_utils import detect_language as detect_language_improved
    use_improved_detection = True
    print("Using improved language detection from language_utils")
except ImportError:
    use_improved_detection = False
    print("Using built-in language detection")

# Set up logging
logger = logging.getLogger(__name__)

# Load environment variables
load_dotenv()

# Set Gemini API key from environment variable or use hardcoded value
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
# if not GEMINI_API_KEY:
#     # Fallback to hardcoded key for testing (remove in production)
#     GEMINI_API_KEY = "AIzaSyBqAW39u5D6RwW0LJ2qqJQTtIOEwgDQBmA"
    
logger.info(f"Using Gemini API key: {GEMINI_API_KEY[:5]}...")  # Log first 5 chars for security

# Initialize Firebase Admin SDK with your service account
cred_path = os.path.join(os.path.dirname(__file__), 
                         'provet-calapan-3bc89-firebase-adminsdk-3j1s1-2106f30da1.json')

# Initialize the app if it hasn't been initialized yet
if not firebase_admin._apps:
    try:
        cred = credentials.Certificate(cred_path)
        firebase_admin.initialize_app(cred)
        logger.info("Firebase initialized successfully")
    except Exception as e:
        logger.error(f"Error initializing Firebase: {str(e)}")
        # Continue without Firebase - we'll use direct API calls

# Check network connectivity
def check_network_connectivity():
    """Check if we can resolve Google's DNS and connect to the API endpoint"""
    try:
        # Try to resolve the domain
        socket.gethostbyname("generativelanguage.googleapis.com")
        logger.info("DNS resolution successful for generativelanguage.googleapis.com")
        
        # Try to establish a connection
        test_socket = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        test_socket.settimeout(5)
        test_socket.connect(("generativelanguage.googleapis.com", 443))
        test_socket.close()
        logger.info("Connection test successful for generativelanguage.googleapis.com:443")
        return True
    except socket.gaierror as e:
        logger.error(f"DNS resolution failed: {str(e)}")
        return False
    except socket.error as e:
        logger.error(f"Connection test failed: {str(e)}")
        return False
    except Exception as e:
        logger.error(f"Network test failed with unexpected error: {str(e)}")
        return False

# Fallback language detection function if language_utils is not available
def detect_language(text: str) -> str:
    """
    Detect if text is in English, Tagalog, or Taglish
    Returns: 'english', 'tagalog', or 'taglish'
    """
    # Common Tagalog words and markers - expanded list
    tagalog_words = [
        "po", "opo", "ang", "mga", "sa", "ng", "ko", "mo", "namin", "ninyo", 
        "kami", "kayo", "sila", "nila", "ito", "iyan", "iyon", "dito", "diyan", 
        "doon", "na", "ay", "at", "kung", "pero", "dahil", "kasi", "para", 
        "upang", "nang", "kapag", "pag", "hindi", "oo", "wala", "mayroon", 
        "meron", "gusto", "ayaw", "pwede", "dapat", "kailangan", "sana", 
        "siguro", "baka", "tayo", "atin", "natin", "inyo", "ninyo", "kanila", 
        "nila", "akin", "iyo", "kanya", "amin", "inyo", "kanila", "ako", "ikaw", 
        "siya", "kami", "tayo", "kayo", "sila", "ano", "bakit", "paano", "kailan",
        "saan", "sino", "kumusta", "magandang", "umaga", "hapon", "gabi", "araw",
        "salamat", "pasensya", "paumanhin", "oras", "bukas", "sarado", "ngayon"
    ]

    # More lenient detection for short messages
    if not text:
        return "english"  # Default to English if no text
        
    # Check for common Tagalog greetings directly
    text_lower = text.lower()
    if any(greeting in text_lower for greeting in ["kumusta", "kamusta", "mabuhay", "magandang araw", 
                                                  "magandang umaga", "magandang hapon", "magandang gabi"]):
        return "tagalog"
        
    words = text_lower.split()
    
    # For very short messages (1-3 words), check if ANY word is Tagalog
    if len(words) <= 3:
        for word in words:
            if word in tagalog_words:
                return "tagalog"
    
    # For longer messages, use ratio approach
    tagalog_word_count = sum(1 for word in words if word in tagalog_words)
    
    total_words = len(words)
    if total_words == 0:
        return "english"  # Default to English for empty text
        
    tagalog_ratio = tagalog_word_count / total_words

    # More lenient threshold - if more than 15% of words are Tagalog
    if tagalog_ratio > 0.15:
        # If more than 70% of words are Tagalog, it's pure Tagalog
        if tagalog_ratio > 0.7:
            return "tagalog"
        # Otherwise, it's Taglish
        return "taglish"

    # Default to English
    return "english"

class ActionGeminiFallback(Action):
    def name(self) -> Text:
        return "action_gemini_fallback"

    async def run(
        self,
        dispatcher: CollectingDispatcher,
        tracker: Tracker,
        domain: Dict[Text, Any],
    ) -> List[Dict[Text, Any]]:
        # Get the latest user message
        user_message = tracker.latest_message.get("text", "")

        # Debug logging
        intent = tracker.latest_message.get("intent", {}).get("name", "")
        confidence = tracker.latest_message.get("intent", {}).get("confidence", 0.0)
        
        logger.info(f"Gemini fallback triggered for: '{user_message}'")
        
        # Get language from slot or detect it
        language = tracker.get_slot("language")
        if not language:
            if use_improved_detection:
                language = detect_language_improved(user_message)
            else:
                language = detect_language(user_message)
        
        # Create context for Gemini
        context = {
            "conversation_history": self._get_conversation_history(tracker),
            "detected_language": language,
            "user_query": user_message
        }
        
        # Check network connectivity before attempting API calls
        network_ok = check_network_connectivity()
        if not network_ok:
            logger.error("Network connectivity check failed - skipping API calls")
            self._respond_in_language(dispatcher, language)
            return [SlotSet("language", language), UserUtteranceReverted()]
        
        # First, let's list available models to debug
        self._list_available_models()
        
        try:
            # Simplified approach without threading - with timeout in the request itself
            logger.info("Calling Gemini API directly")
            
            # Create the prompt
            prompt = self._create_prompt(context)
            
            # Call the API with a timeout in the request
            response = self._call_gemini_api(prompt, language)
            
            if response and 'candidates' in response and len(response['candidates']) > 0:
                ai_response = response['candidates'][0]['content']['parts'][0]['text']
                logger.info(f"Gemini response received: {ai_response[:50]}...")
                dispatcher.utter_message(text=ai_response)
            else:
                logger.warning("No valid response from Gemini API, using fallback response")
                self._respond_in_language(dispatcher, language)
                
        except Exception as e:
            logger.error(f"Error in fallback action: {str(e)}")
            self._respond_in_language(dispatcher, language)
            
        # Return events
        return [SlotSet("language", language), UserUtteranceReverted()]
    
    def _call_gemini_api(self, prompt: str, language: str) -> Dict:
        """Call the Gemini API using REST"""
        api_key = GEMINI_API_KEY
        if not api_key:
            logger.error("Gemini API key not found")
            return None
            
        # Updated URL to use the correct API version (v1beta instead of v1)
        #url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key={api_key}"
        
        # The correct base URL for v1beta
        base_url = "https://generativelanguage.googleapis.com/v1beta"
        
        # The correct model name format - note the "models/" prefix is already included
        model_name = "models/gemini-1.5-pro"
        
        # Construct the full URL correctly
        url = f"{base_url}/{model_name}:generateContent?key={api_key}"

        payload = {
            "contents": [
                {
                    "role": "user",
                    "parts": [{"text": prompt}]
                }
            ],
            "generationConfig": {
                "temperature": 0.7,
                "topP": 0.8,
                "topK": 40,
                "maxOutputTokens": 256,  # Reduced from 512 to 256 for faster responses
            }
        }
        
        headers = {
            "Content-Type": "application/json"
        }
        
        logger.info(f"Sending request to Gemini API using URL: {url}")
        try:
            # Add timeout to the request
            start_time = time.time()
            response = requests.post(url, headers=headers, json=payload, timeout=8)
            end_time = time.time()
            
            logger.info(f"Gemini API response time: {end_time - start_time:.2f} seconds")
            
            if response.status_code == 200:
                logger.info(f"Gemini API call successful")
                return response.json()
            else:
                logger.error(f"Error calling Gemini API: {response.status_code} - {response.text}")
                return None
        except requests.exceptions.Timeout:
            logger.error("Gemini API request timed out")
            return None
        except requests.exceptions.RequestException as e:
            logger.error(f"Request exception when calling Gemini API: {str(e)}")
            return None
    
    def _get_conversation_history(self, tracker: Tracker) -> List[Dict[str, str]]:
        # Get the last 3 conversation turns (excluding the current one) - reduced from 5 to 3
        events = []
        for event in reversed(tracker.events):
            if event.get("event") == "user" and "text" in event:
                events.append({"role": "user", "content": event["text"]})
            elif event.get("event") == "bot" and "text" in event:
                events.append({"role": "assistant", "content": event["text"]})
            
            # Limit to last 3 turns (6 messages) - reduced from 5 to 3
            if len(events) >= 6:
                break
                
        # Reverse to get chronological order
        return list(reversed(events))
    
    def _create_prompt(self, context: Dict[str, Any]) -> str:
        history = context["conversation_history"]
        language = context["detected_language"]
        user_query = context["user_query"]
        
        # Simplified system prompt for faster processing
        system_prompt = """
        You are ProBot, a helpful veterinary assistant for the Provincial Veterinary Office in Calapan City, Oriental Mindoro.
        
        Your role is to provide information about veterinary services, office hours, locations, and pet care advice.
        
        Important guidelines:
        1. Be friendly, professional, and concise in your responses.
        2. If the question is about veterinary services, pet care, or the Provincial Veterinary Office, provide detailed information.
        3. If the question is outside the scope of veterinary services but still about general pet care, provide helpful information.
        4. For questions completely unrelated to pets or veterinary services, politely answer with your knowledge but keep it very brief.
        5. Never make up information about specific veterinarians, treatments, or medical advice.
        6. Respond in the same language the user is using (English, Tagalog, or Taglish).
        7. Keep responses helpful but brief (1-3 sentences when possible).
        
        The Provincial Veterinary Office is located at Oriental Mindoro Provincial Capitol Complex, Barangay Camilmil, Calapan City.
        Office hours are Monday to Friday, 8:00 AM to 5:00 PM.
        """
        
        # Format conversation history - simplified to just the last message for faster processing
        conversation = f"User: {user_query}\n"
        
        # Add language instruction
        language_instruction = ""
        if language == "tagalog":
            language_instruction = "Please respond in pure Tagalog. Make sure to use proper Tagalog grammar and vocabulary."
        elif language == "taglish":
            language_instruction = "Please respond in Taglish (mix of Tagalog and English). Use a natural mix of both languages."
        else:
            language_instruction = "Please respond in English."
        
        # Combine everything
        full_prompt = f"{system_prompt}\n\n{conversation}\n\n{language_instruction}\nAssistant:"
        
        return full_prompt
    
    def _respond_in_language(self, dispatcher: CollectingDispatcher, language: str):
        """Send a default fallback response in the appropriate language"""
        if language == "tagalog":
            dispatcher.utter_message(text="Paumanhin, hindi ko maintindihan ang iyong mensahe. Maaari mo bang ipaliwanag ulit?")
        elif language == "taglish":
            dispatcher.utter_message(text="Sorry po, hindi ko fully na-understand ang message niyo. Pwede po ba i-clarify?")
        else:
            dispatcher.utter_message(text="I'm sorry, I didn't understand your message. Could you please rephrase it?")
            
    def _list_available_models(self):
        """List available Gemini models"""
        api_key = GEMINI_API_KEY
        if not api_key:
            logger.error("Gemini API key not found")
            return
            
        # Updated URL to use the correct API version (v1beta instead of v1)
        url = f"https://generativelanguage.googleapis.com/v1beta/models?key={api_key}"
        
        try:
            response = requests.get(url, timeout=5)
            if response.status_code == 200:
                models_data = response.json()
                
                # Extract and log model names and details in a more readable format
                if 'models' in models_data:
                    model_list = models_data['models']
                    logger.info(f"Found {len(model_list)} available Gemini models:")
                    
                    for i, model in enumerate(model_list):
                        model_name = model.get('name', 'Unknown')
                        display_name = model.get('displayName', 'No display name')
                        version = model.get('version', 'Unknown version')
                        description = model.get('description', 'No description')
                        
                        # Log each model with its details
                        logger.info(f"Model {i+1}: {model_name}")
                        logger.info(f"  Display name: {display_name}")
                        logger.info(f"  Version: {version}")
                        logger.info(f"  Description: {description[:100]}..." if len(description) > 100 else f"  Description: {description}")
                        
                        # Check if model supports content generation
                        supported_generation_methods = model.get('supportedGenerationMethods', [])
                        if 'generateContent' in supported_generation_methods:
                            logger.info(f"  Supports content generation: Yes")
                        else:
                            logger.info(f"  Supports content generation: No")
                            
                        logger.info("---")
                else:
                    logger.warning("No models found in the API response")
                    logger.info(f"Full response: {models_data}")
            else:
                logger.error(f"Error listing models: {response.status_code} - {response.text}")
        except Exception as e:
            logger.error(f"Exception listing models: {str(e)}")