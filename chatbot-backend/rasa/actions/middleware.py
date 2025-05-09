# File: chatbot-backend/rasa/actions/middleware.py

from typing import Dict, Text, Any, List, Callable, Awaitable
from rasa_sdk.executor import ActionExecutor
import logging
import inspect

# Set up logging
logger = logging.getLogger(__name__)

# Import language detection function - assuming it's in a separate file
# If detect_language is in actions.py, you'll need to move it to a separate file
# to avoid circular imports
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
        # ... (rest of the words)
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

class LanguageDetectionMiddleware:
    """Custom middleware for detecting language from user messages and setting it as a slot."""
    
    def __init__(self):
        """Initialize the middleware."""
        logger.info("Language Detection Middleware initialized")
    
    async def process_request(self, request: Dict[Text, Any]) -> Dict[Text, Any]:
        """Process the incoming request before it reaches the action server.
        
        Args:
            request: The incoming request data
            
        Returns:
            The modified request
        """
        # Log the incoming request for debugging
        logger.debug(f"Incoming request: {request}")
        
        # Return the request unchanged - we'll handle language detection in process_action
        return request
    
    async def process_action(self, action_call: Dict[Text, Any], tracker: Dict[Text, Any], domain: Dict[Text, Any]) -> Dict[Text, Any]:
        """Process the action call before it's executed.
        
        Args:
            action_call: The action call data
            tracker: The conversation tracker
            domain: The domain data
            
        Returns:
            The modified action call
        """
        # Get the latest user message if available
        latest_message = tracker.get("latest_message", {})
        user_message = latest_message.get("text", "")
        
        # Check if we already have a language slot set
        current_language = next((event.get("value") for event in tracker.get("events", []) 
                               if event.get("event") == "slot" and event.get("name") == "language"), None)
        
        # Only detect language if we have a user message and no language is set yet
        # or if the action being called is action_detect_language
        action_name = action_call.get("next_action", "")
        
        if (user_message and not current_language) or action_name == "action_detect_language":
            try:
                # Detect language
                language = detect_language(user_message)
                logger.info(f"Detected language: {language} for message: '{user_message}'")
                
                # Add language to events if not already there
                if "events" not in action_call:
                    action_call["events"] = []
                
                # Add SlotSet event for language
                action_call["events"].append({"event": "slot", "name": "language", "value": language})
                
            except Exception as e:
                logger.error(f"Error detecting language: {e}")
        else:
            if current_language:
                logger.debug(f"Using existing language: {current_language}")
            else:
                logger.debug("No user message to detect language from")
        
        return action_call
    
    async def process_response(self, response: Dict[Text, Any], tracker: Dict[Text, Any]) -> Dict[Text, Any]:
        """Process the outgoing response after the action has been executed.
        
        Args:
            response: The action response
            tracker: The conversation tracker
            
        Returns:
            The modified response
        """
        # Return the response unchanged
        return response

# Custom ActionExecutor extension to support middleware
class MiddlewareActionExecutor(ActionExecutor):
    """Extended ActionExecutor that supports middleware."""
    
    def __init__(self):
        super().__init__()
        self.middlewares = []
    
    def register_middleware(self, middleware):
        """Register a middleware with the action executor."""
        self.middlewares.append(middleware)
        logger.info(f"Registered middleware: {middleware.__class__.__name__}")
    
    async def run(self, action_call):
        """Run the action with middleware processing."""
        # Extract tracker and domain from the action call
        tracker = action_call.get("tracker", {})
        domain = action_call.get("domain", {})
        
        # Process request through middlewares
        for middleware in self.middlewares:
            if hasattr(middleware, "process_request") and callable(middleware.process_request):
                action_call = await middleware.process_request(action_call)
        
        # Process action through middlewares
        for middleware in self.middlewares:
            if hasattr(middleware, "process_action") and callable(middleware.process_action):
                action_call = await middleware.process_action(action_call, tracker, domain)
        
        # Run the action
        response = await super().run(action_call)
        
        # Process response through middlewares
        for middleware in self.middlewares:
            if hasattr(middleware, "process_response") and callable(middleware.process_response):
                response = await middleware.process_response(response, tracker)
        
        return response

# Create a singleton instance of the middleware executor
middleware_executor = MiddlewareActionExecutor()

# Function to register the middleware with the action executor
def register_middlewares():
    """Register all middlewares with the action executor."""
    middleware_executor.register_middleware(LanguageDetectionMiddleware())
    logger.info("Language Detection Middleware registered")
    return middleware_executor