import axios from 'axios';

const RASA_URL = 'http://localhost:5005/webhooks/rest/webhook';

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
