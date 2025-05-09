from typing import Any, Dict, List, Text
from rasa_sdk import Action, Tracker
from rasa_sdk.executor import CollectingDispatcher
from rasa_sdk.events import UserUtteranceReverted, SlotSet, FollowupAction
import random
import firebase_admin
from firebase_admin import credentials
import os
from dotenv import load_dotenv
import requests
import json
import logging
import socket

# Import the middleware executor from the new middleware implementation
from .middleware import register_middlewares

# Set up logging
logger = logging.getLogger(__name__)

# Initialize the middleware executor
executor = register_middlewares()

# Load environment variables
load_dotenv()

# Initialize Firebase Admin SDK with your service account if not already initialized
cred_path = os.path.join(os.path.dirname(__file__), 
                     'provet-calapan-3bc89-firebase-adminsdk-3j1s1-2106f30da1.json')

if not firebase_admin._apps:
    try:
        cred = credentials.Certificate(cred_path)
        firebase_admin.initialize_app(cred)
        logger.info("Firebase initialized successfully")
    except Exception as e:
        logger.error(f"Error initializing Firebase: {str(e)}")

# Get Gemini API key from environment variables
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
# if not GEMINI_API_KEY:
#     # Fallback to hardcoded key for testing (remove in production)
#     GEMINI_API_KEY = "AIzaSyBqAW39u5D6RwW0LJ2qqJQTtIOEwgDQBmA"

# Language detection function
def detect_language(text: str) -> str:
    """
    Detect if text is in English, Tagalog, or Taglish
    Returns: 'english' (English), 'tagalog' (Tagalog), or 'taglish' (Taglish)
    """
    # Common Tagalog words and markers
    tagalog_words = [
        "ano", "bakit", "sino", "paano", "kelan", "san", "pano", "kailan", "ko", 
        "hayop", "alaga", "aso", "pusa", "tuta", "po", "opo", "ang", "mga", "sa", 
        "ng", "ko", "mo", "namin", "ninyo", "kuting", "isda", "pagong", "ibon",
        "kuneho", "magandang", "may", "mayroon", "pwede", "ba", "lang", "opisina",
        "bukas", "Lunes", "Martes", "Miyerkules", "Huwebes", "Biyernes", "Sabado", 
        "Linggo", "doktor", "araw", "mga", "ang", "ilan", "talaga", "ayun", "iyon",
        "kami", "kayo", "sila", "nila", "ito", "iyan", "iyon", "dito", "diyan", 
        "doon", "na", "ay", "at", "kung", "pero", "dahil", "kasi", "para", 
        "bukas", "sarado", "anong",
        "upang", "nang", "kapag", "pag", "hindi", "oo", "wala", "mayroon", 
        "meron", "gusto", "ayaw", "pwede", "dapat", "kailangan", "sana", 
        "siguro", "baka", "tayo", "atin", "natin", "inyo", "ninyo", "kanila", 
        "nila", "akin", "iyo", "kanya", "amin", "inyo", "kanila", "ako", "ikaw", 
        "siya", "kami", "tayo", "kayo", "sila", "niya", "nila", "namin", "natin", 
        "ninyo", "nila", "akin", "iyo", "kaniya", "amin", "inyo", "kanila",
        "maganda", "mabuti", "masama", "malaki", "maliit", "mahal", "mura",
        "masarap", "mabaho", "mainit", "malamig", "mabilis", "mabagal",
        "marami", "kaunti", "lahat", "ilan", "sino", "ano", "saan", "kailan",
        "bakit", "paano", "kumusta", "salamat", "pasensya", "paumanhin",
        "tuloy", "labas", "loob", "itaas", "ibaba", "kanan", "kaliwa",
        "harap", "likod", "tabi", "gitna", "dulo", "simula", "wakas",
        "oras", "araw", "linggo", "buwan", "taon", "umaga", "tanghali",
        "hapon", "gabi", "kahapon", "ngayon", "bukas", "mamaya", "kanina"
    ]

    if not text:
        return "english"  # Default to English if no text
        
    words = text.lower().split()
    tagalog_word_count = sum(1 for word in words if word in tagalog_words)
    
    total_words = len(words)
    if total_words == 0:
        return "english"  # Default to English for empty text
        
    tagalog_ratio = tagalog_word_count / total_words

    # If more than 20% of words are Tagalog, consider it Tagalog or Taglish
    if tagalog_ratio > 0.2:
        # If more than 80% of words are Tagalog, it's pure Tagalog
        if tagalog_ratio > 0.8:
            return "tagalog"
        # Otherwise, it's Taglish
        return "taglish"

    # Default to English
    return "english"

# Base class for language-aware actions
class LanguageAwareAction(Action):
    def __init__(self):
        super().__init__()
        self.action_name = None
        self.response_template = None
    
    def name(self) -> Text:
        return self.action_name

    async def run(
        self,
        dispatcher: CollectingDispatcher,
        tracker: Tracker,
        domain: Dict[Text, Any],
    ) -> List[Dict[Text, Any]]:
        # Get language from slot
        language = tracker.get_slot("language")
        
        # If language is not set, detect from the latest message
        if not language:
            user_message = tracker.latest_message.get("text", "")
            language = detect_language(user_message)
            logger.info(f"Language not in slot, detected: {language} from message: '{user_message}'")
        else:
            logger.debug(f"Using language from slot: {language}")
        
        # Check if this is a domain intent or out-of-scope
        intent = tracker.latest_message.get("intent", {}).get("name", "")
        confidence = tracker.latest_message.get("intent", {}).get("confidence", 0.0)
        
        # If confidence is low, use Gemini fallback instead
        if confidence < 0.75:  # Increased threshold for better fallback handling
            logger.info(f"Low confidence ({confidence:.2f}) for intent {intent}, using Gemini fallback instead")
            return [SlotSet("language", language), FollowupAction("action_gemini_fallback")]
        
        # Simply use the response template - Rasa will handle the language condition
        dispatcher.utter_message(response=self.response_template)
        
        # Set the language slot
        return [SlotSet("language", language)]

# Custom actions for each intent
class ActionGreeting(LanguageAwareAction):
    def __init__(self):
        super().__init__()
        self.action_name = "action_greeting"
        self.response_template = "utter_GreetingIntent"

class ActionGoodbye(LanguageAwareAction):
    def __init__(self):
        super().__init__()
        self.action_name = "action_goodbye"
        self.response_template = "utter_GoodbyeIntent"

class ActionOfficeHours(LanguageAwareAction):
    def __init__(self):
        super().__init__()
        self.action_name = "action_office_hours"
        self.response_template = "utter_OfficeHoursIntent"

class ActionOfficeDays(LanguageAwareAction):
    def __init__(self):
        super().__init__()
        self.action_name = "action_office_days"
        self.response_template = "utter_OfficeDaysIntent"

class ActionOfficeLocation(LanguageAwareAction):
    def __init__(self):
        super().__init__()
        self.action_name = "action_office_location"
        self.response_template = "utter_OfficeLocationIntent"

class ActionVeterinariansInfo(LanguageAwareAction):
    def __init__(self):
        super().__init__()
        self.action_name = "action_veterinarians_info"
        self.response_template = "utter_VeterinariansIntent"

class ActionServicesOffered(LanguageAwareAction):
    def __init__(self):
        super().__init__()
        self.action_name = "action_services_offered"
        self.response_template = "utter_ServicesOfferedIntent"

class ActionServicesOffer(LanguageAwareAction):
    def __init__(self):
        super().__init__()
        self.action_name = "action_services_offer"
        self.response_template = "utter_ServicesOfferIntent"

class ActionAppointment(LanguageAwareAction):
    def __init__(self):
        super().__init__()
        self.action_name = "action_appointment"
        self.response_template = "utter_AppointmentIntent"

class ActionPetSpeciesAccepted(LanguageAwareAction):
    def __init__(self):
        super().__init__()
        self.action_name = "action_pet_species_accepted"
        self.response_template = "utter_PetSpeciesAcceptedIntent"

class ActionWalkinBasicServices(LanguageAwareAction):
    def __init__(self):
        super().__init__()
        self.action_name = "action_walkin_basic_services"
        self.response_template = "utter_WalkInBasicVeterinaryServicesIntent"

class ActionAppointmentBasicServices(LanguageAwareAction):
    def __init__(self):
        super().__init__()
        self.action_name = "action_appointment_basic_services"
        self.response_template = "utter_AppointmentBasicVeterinaryServicesIntent"

class ActionBasicServiceChecklist(LanguageAwareAction):
    def __init__(self):
        super().__init__()
        self.action_name = "action_basic_service_checklist"
        self.response_template = "utter_BasicServiceChecklistIntent"

class ActionWalkinElectiveServices(LanguageAwareAction):
    def __init__(self):
        super().__init__()
        self.action_name = "action_walkin_elective_services"
        self.response_template = "utter_WalkinElectiveVeterinaryServicesIntent"

class ActionAppointmentElectiveServices(LanguageAwareAction):
    def __init__(self):
        super().__init__()
        self.action_name = "action_appointment_elective_services"
        self.response_template = "utter_AppointmentElectiveVeterinaryServicesIntent"

class ActionWalkinHealthCertificate(LanguageAwareAction):
    def __init__(self):
        super().__init__()
        self.action_name = "action_walkin_health_certificate"
        self.response_template = "utter_WalkinVeterinaryHealthCertificateIntent"

class ActionAppointmentHealthCertificate(LanguageAwareAction):
    def __init__(self):
        super().__init__()
        self.action_name = "action_appointment_health_certificate"
        self.response_template = "utter_AppointmentVeterinaryHealthCertificateIntent"

class ActionHealthCertificateChecklist(LanguageAwareAction):
    def __init__(self):
        super().__init__()
        self.action_name = "action_health_certificate_checklist"
        self.response_template = "utter_HealthCertificateServiceChecklistIntent"

class ActionElectiveServiceChecklist(LanguageAwareAction):
    def __init__(self):
        super().__init__()
        self.action_name = "action_elective_service_checklist"
        self.response_template = "utter_ElectiveServiceChecklistIntent"

class ActionDefaultFallback(Action):
    """Default fallback action that routes to Gemini fallback"""
    
    def name(self) -> Text:
        return "action_default_fallback"
        
    async def run(
        self,
        dispatcher: CollectingDispatcher,
        tracker: Tracker,
        domain: Dict[Text, Any],
    ) -> List[Dict[Text, Any]]:
        logger.info("Default fallback triggered, routing to Gemini fallback")
        return [FollowupAction("action_gemini_fallback")]

class ActionGeminiFallback(Action):
    def name(self) -> Text:
        return "action_gemini_fallback"

    async def run(
        self,
        dispatcher: CollectingDispatcher,
        tracker: Tracker,
        domain: Dict[Text, Any],
    ) -> List[Dict[Text, Any]]:
        user_message = tracker.latest_message.get("text", "")
        
        # Debug logging
        intent = tracker.latest_message.get("intent", {}).get("name", "")
        confidence = tracker.latest_message.get("intent", {}).get("confidence", 0.0)
        intent_ranking = tracker.latest_message.get("intent_ranking", [])
        top_intents = ", ".join([f"{i['name']}({i['confidence']:.2f})" for i in intent_ranking[:3]]) if intent_ranking else "None"
        
        logger.info(f"Message: '{user_message}' | Intent: {intent}({confidence:.2f}) | Top intents: {top_intents}")
        logger.info(f"Gemini fallback triggered for: '{user_message}'")
        
        # Check if this is an out-of-scope query
        is_out_of_scope = intent == "nlu_fallback" or confidence < 0.75
        if is_out_of_scope:
            logger.info(f"Handling out-of-scope query: '{user_message}'")
        
        conversation_history = self._get_conversation_history(tracker)
        
        language = tracker.get_slot("language")
        if not language:
            language = detect_language(user_message)
            logger.info(f"Language not in slot for fallback, detected: {language}")
        
        context = {
            "conversation_history": conversation_history,
            "detected_language": language,
            "user_query": user_message,
            "is_out_of_scope": is_out_of_scope
        }
        
        # Check network connectivity before making API call
        try:
            # Test DNS resolution
            socket.gethostbyname("generativelanguage.googleapis.com")
            logger.info("DNS resolution successful for generativelanguage.googleapis.com")
            
            # Test connection
            s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
            s.settimeout(2)
            s.connect(("generativelanguage.googleapis.com", 443))
            s.close()
            logger.info("Connection test successful for generativelanguage.googleapis.com:443")
            
            # List available models to verify API key and connectivity
            self._list_available_models()
            
            # Call Gemini API directly
            logger.info(f"Calling Gemini API with language: {language}")
            response = self._call_gemini_api(self._create_prompt(context), language)
            
            if response and 'candidates' in response and len(response['candidates']) > 0:
                ai_response = response['candidates'][0]['content']['parts'][0]['text']
                logger.info(f"Gemini response received, first 50 chars: {ai_response[:50]}...")
                dispatcher.utter_message(text=ai_response)
            else:
                # Fallback to a default response if Gemini fails
                logger.warning("No valid response from Gemini API, using fallback response")
                self._respond_in_language(dispatcher, language)
                
        except Exception as e:
            logger.error(f"Error calling Gemini API: {str(e)}")
            # Fallback to a default response if there's an error
            self._respond_in_language(dispatcher, language)
            
        # Return UserUtteranceReverted() to not influence the conversation flow
        return [SlotSet("language", language), UserUtteranceReverted()]

    def _list_available_models(self):
        """List available models to debug"""
        api_key = GEMINI_API_KEY
        if not api_key:
            logger.error("Gemini API key not found - skipping API call")
            return
        
        url = f"https://generativelanguage.googleapis.com/v1beta/models?key={api_key}"
        
        try:
            response = requests.get(url)
            response.raise_for_status()
            models_data = response.json()
            
            if 'models' in models_data:
                models = models_data['models']
                logger.info(f"Found {len(models)} available Gemini models:")
                
                for i, model in enumerate(models, 1):
                    name = model.get('name', 'Unknown')
                    display_name = model.get('displayName', 'No display name')
                    version = model.get('version', 'Unknown')
                    description = model.get('description', 'No description')
                    supports_generation = "Yes" if model.get('supportedGenerationMethods', []) else "No"
                    
                    logger.info(f"Model {i}: {name}")
                    logger.info(f"  Display name: {display_name}")
                    logger.info(f"  Version: {version}")
                    logger.info(f"  Description: {description[:100]}{'...' if len(description) > 100 else ''}")
                    logger.info(f"  Supports content generation: {supports_generation}")
                    logger.info(f"  ---")
            else:
                logger.warning("No models found in API response")
                
            return models_data
        except Exception as e:
            logger.error(f"Error listing models: {e}")
            return None

    def _call_gemini_api(self, prompt: str, language: str) -> Dict:
        """Call the Gemini API using REST"""
        api_key = GEMINI_API_KEY
        if not api_key:
            logger.error("Gemini API key not found - skipping API call")
            return None
        
        # The correct base URL for v1beta
        base_url = "https://generativelanguage.googleapis.com/v1beta"
        
        # Use an available model from the list that supports content generation
        model_name = "models/gemini-1.5-pro"
        
        # Construct the full URL correctly
        url = f"{base_url}/{model_name}:generateContent?key={api_key}"
        
        # Log the URL being used (without the API key)
        logger.info(f"Sending request to Gemini API using URL: {base_url}/{model_name}:generateContent?key=REDACTED")
        
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
                "maxOutputTokens": 1024,
            }
        }
        
        headers = {
            "Content-Type": "application/json"
        }
        
        # Measure response time
        import time
        start_time = time.time()
        
        response = requests.post(url, headers=headers, json=payload)
        
        # Log response time
        elapsed_time = time.time() - start_time
        logger.info(f"Gemini API response time: {elapsed_time:.2f} seconds")
        
        if response.status_code == 200:
            logger.info("Gemini API call successful")
            return response.json()
        else:
            logger.error(f"Error calling Gemini API: {response.status_code} - {response.text}")
            return None

    def _get_conversation_history(self, tracker: Tracker) -> List[Dict[str, str]]:
        # Get the last 5 conversation turns (excluding the current one)
        events = []
        for event in reversed(tracker.events):
            if event.get("event") == "user" and "text" in event:
                events.append({"role": "user", "content": event["text"]})
            elif event.get("event") == "bot" and "text" in event:
                events.append({"role": "assistant", "content": event["text"]})
            
            # Limit to last 5 turns (10 messages)
            if len(events) >= 10:
                break
                
        # Reverse to get chronological order
        return list(reversed(events))

    def _create_prompt(self, context: Dict[str, Any]) -> str:
        history = context["conversation_history"]
        language = context["detected_language"]
        user_query = context["user_query"]
        is_out_of_scope = context.get("is_out_of_scope", False)
        
        # Create a system prompt that instructs Gemini how to respond
        system_prompt = """
        You are ProBot, a helpful veterinary assistant for the Provincial Veterinary Office in Calapan City, Oriental Mindoro.
        
        Your role is to provide information about veterinary services, office hours, locations, and pet care advice.
        
        Important guidelines:
        1. Be friendly, professional, and concise in your responses.
        2. If you don't know the answer, politely say so and offer to connect the user with a staff member.
        3. Never make up information about specific veterinarians, treatments, or medical advice.
        4. Respond in the same language the user is using (English, Tagalog, or Taglish).
        5. For Taglish, maintain a similar ratio of English and Tagalog as the user's message.
        6. Keep responses helpful but brief (2-4 sentences when possible).
        7. If the question is outside the scope of veterinary services, politely explain that you're a veterinary assistant and can only help with pet and veterinary-related questions.
        
        The Provincial Veterinary Office is located at Oriental Mindoro Provincial Capitol Complex, Barangay Camilmil, Calapan City.
        Office hours are Monday to Friday, 8:00 AM to 5:00 PM, with a lunch break from 12:00 PM to 1:00 PM.
        The office is closed on weekends and holidays.
        
        The veterinarians are:
        - Dr. Grimaldo C. Catapang (Provincial Veterinarian)
        - Dr. Alfredo P. Manglicmot (Veterinarian IV)
        - Dr. Anna Rochelle A. Bongaling (Veterinarian IV)
        
        Services offered include:
        - Basic veterinary services (consultation, treatment, vaccination, deworming)
        - Elective veterinary services (spay/neuter, castration, artificial insemination)
        - Veterinary health certificates
        - Community support services
        """
        
        # Add special instruction for out-of-scope queries
        if is_out_of_scope:
            system_prompt += """
            
            IMPORTANT: The current query appears to be outside the scope of veterinary services.
            If the question is about general knowledge, politics, entertainment, or other non-veterinary topics,
            politely explain that you're a veterinary assistant and can only help with pet and veterinary-related questions.
            Suggest that they ask about pet care, veterinary services, or the Provincial Veterinary Office instead.
            """
        
        # Format conversation history
        conversation = ""
        for message in history:
            role = "User" if message["role"] == "user" else "Assistant"
            conversation += f"{role}: {message['content']}\n"
        
        # Add the current query
        conversation += f"User: {user_query}\n"
        
        # Add language instruction
        language_instruction = ""
        if language == "tagalog":
            language_instruction = "Please respond in pure Tagalog."
        elif language == "taglish":
            language_instruction = "Please respond in Taglish (mix of Tagalog and English)."
        else:
            language_instruction = "Please respond in English."
        
        # Combine everything
        full_prompt = f"{system_prompt}\n\nConversation History:\n{conversation}\n\n{language_instruction}\nAssistant:"
        
        return full_prompt

    def _respond_in_language(self, dispatcher: CollectingDispatcher, language: str):
        """Send a default fallback response in the appropriate language"""
        if language == "tagalog":
            dispatcher.utter_message(text="Paumanhin, hindi ko maintindihan ang iyong mensahe. Maaari mo bang ipaliwanag ulit? Tandaan na ako ay isang veterinary assistant at makakatulong lamang sa mga katanungan tungkol sa alaga at serbisyong beterinaryo.")
        elif language == "taglish":
            dispatcher.utter_message(text="Sorry po, hindi ko fully na-understand ang message niyo. Pwede po ba i-clarify? Please remember na I'm a veterinary assistant at tumutulong lang po ako sa mga questions about pets at veterinary services.")
        else:
            dispatcher.utter_message(text="I'm sorry, I didn't understand your message. Could you please rephrase it? Please note that I'm a veterinary assistant and can only help with questions about pets and veterinary services.")

# Action for language detection
class ActionDetectLanguage(Action):
    def name(self) -> Text:
        return "action_detect_language"

    async def run(
        self,
        dispatcher: CollectingDispatcher,
        tracker: Tracker,
        domain: Dict[Text, Any],
    ) -> List[Dict[Text, Any]]:
        # Get the latest user message
        user_message = tracker.latest_message.get("text", "")
        
        # Check for explicit language request
        entities = tracker.latest_message.get("entities", [])
        requested_language = next((e["value"] for e in entities if e["entity"] == "language"), None)
        
        if requested_language:
            # User explicitly requested a language
            language = requested_language.lower()
            logger.info(f"User explicitly requested language: {language}")
        else:
            # Detect language from message
            language = detect_language(user_message)
            logger.info(f"Detected language from message: '{user_message}' -> {language}")
        
        # Standardize language codes
        if language in ["english", "en"]:
            language = "english"
        elif language in ["tagalog", "tl"]:
            language = "tagalog"
        elif language in ["taglish"]:
            language = "taglish"
        else:
            language = "english"  # Default
        
        # If this is an explicit language change request, confirm to the user
        if requested_language:
            if language == "tagalog":
                dispatcher.utter_message(text="Nagpalit na ako sa Tagalog. Anong maitutulong ko sa iyo?")
            elif language == "taglish":
                dispatcher.utter_message(text="I've switched to Taglish po. How can I help you?")
            else:
                dispatcher.utter_message(text="I've switched to English. How can I help you?")
        
        return [SlotSet("language", language)]

# Action for handling out-of-scope queries
class ActionOutOfScope(Action):
    def name(self) -> Text:
        return "action_out_of_scope"
        
    async def run(
        self,
        dispatcher: CollectingDispatcher,
        tracker: Tracker,
        domain: Dict[Text, Any],
    ) -> List[Dict[Text, Any]]:
        logger.info("Out of scope intent triggered, routing to Gemini fallback")
        return [FollowupAction("action_gemini_fallback")]