import axios from 'axios';
import config from '@/config/environment';

// Use environment configuration for Rasa URL
const RASA_URL = config.chatbot.apiUrl.replace('/chat', '/webhooks/rest/webhook');

export default {
  async sendMessage(message) {
    try {
      const response = await axios.post(RASA_URL, {
        sender: "user",
        message: message
      });
      return response.data[0]?.text || "Sorry, I don't understand.";
    } catch (error) {
      console.error("Chatbot error:", error);
      return "Oops! Something went wrong.";
    }
  }
};
