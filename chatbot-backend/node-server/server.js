const express = require("express")
const cors = require("cors")
const bodyParser = require("body-parser")
const axios = require("axios")
const admin = require("firebase-admin")
const dotenv = require("dotenv")

// Add these lines at the top of your server.js file, after the existing imports
const timeout = require('connect-timeout');

// Load environment variables
dotenv.config()

// Create Express app
const app = express()
const PORT = process.env.PORT || 3001
const RASA_URL = process.env.RASA_URL || "http://localhost:5005"

// Basic middleware
app.use(cors())
app.use(bodyParser.json())

// Simple logging middleware with timestamp and request ID
app.use((req, res, next) => {
  req.requestId = Math.random().toString(36).substring(2, 15)
  console.log(`[${new Date().toISOString()}][${req.requestId}] ${req.method} ${req.url}`)
  next()
})

// Add this after your existing middleware setup
app.use(timeout('30s')); // Set a 30-second timeout for all requests
app.use((req, res, next) => {
  if (!req.timedout) next();
});

// Language detection function
function detectLanguage(text) {
  // Common Tagalog words and markers
  const tagalogWords = [
    "po",
    "opo",
    "ang",
    "mga",
    "sa",
    "ng",
    "ko",
    "mo",
    "namin",
    "ninyo",
    "kami",
    "kayo",
    "sila",
    "nila",
    "ito",
    "iyan",
    "iyon",
    "dito",
    "diyan",
    "doon",
    "na",
    "ay",
    "at",
    "kung",
    "pero",
    "dahil",
    "kasi",
    "para",
    "upang",
    "nang",
    "kapag",
    "pag",
    "hindi",
    "oo",
    "wala",
    "mayroon",
    "meron",
    "gusto",
    "ayaw",
    "pwede",
    "dapat",
    "kailangan",
    "sana",
    "siguro",
    "baka",
    "tayo",
    "atin",
    "natin",
    "inyo",
    "ninyo",
    "kanila",
    "ano",
    "bakit",
    "sino",
    "paano",
    "kelan",
    "san",
    "pano",
    "kailan",
    "ko",
    "hayop",
    "alaga",
    "aso",
    "pusa",
    "tuta",
    "kuting",
    "isda",
    "pagong",
    "ibon",
    "kuneho",
    "magandang",
    "may",
    "mayroon",
    "pwede",
    "ba",
    "lang",
    "opisina",
    "bukas",
    "Lunes",
    "Martes",
    "Miyerkules",
    "Huwebes",
    "Biyernes",
    "Sabado",
    "Linggo",
    "doktor",
    "araw",
    "mga",
    "ang",
    "ilan",
    "talaga",
    "ayun",
    "iyon",
    "kami",
    "kayo",
    "sila",
    "nila",
    "ito",
    "iyan",
    "iyon",
    "dito",
    "diyan",
    "doon",
    "na",
    "ay",
    "at",
    "kung",
    "pero",
    "dahil",
    "kasi",
    "para",
    "bukas",
    "sarado",
    "anong",
    "upang",
    "nang",
    "kapag",
    "pag",
    "hindi",
    "oo",
    "wala",
    "mayroon",
    "meron",
    "gusto",
    "ayaw",
    "pwede",
    "dapat",
    "kailangan",
    "sana",
    "siguro",
    "baka",
    "tayo",
    "atin",
    "natin",
    "inyo",
    "ninyo",
    "kanila",
    "nila",
    "akin",
    "iyo",
    "kanya",
    "amin",
    "inyo",
    "kanila",
    "ako",
    "ikaw",
    "siya",
    "kami",
    "tayo",
    "kayo",
    "sila",
    "niya",
    "nila",
    "namin",
    "natin",
    "ninyo",
    "nila",
    "akin",
    "iyo",
    "kaniya",
    "amin",
    "inyo",
    "kanila",
    "maganda",
    "mabuti",
    "masama",
    "malaki",
    "maliit",
    "mahal",
    "mura",
    "masarap",
    "mabaho",
    "mainit",
    "malamig",
    "mabilis",
    "mabagal",
    "marami",
    "kaunti",
    "lahat",
    "ilan",
    "sino",
    "ano",
    "saan",
    "kailan",
    "bakit",
    "paano",
    "kumusta",
    "salamat",
    "pasensya",
    "paumanhin",
    "tuloy",
    "labas",
    "loob",
    "itaas",
    "ibaba",
    "kanan",
    "kaliwa",
    "harap",
    "likod",
    "tabi",
    "gitna",
    "dulo",
    "simula",
    "wakas",
    "oras",
    "araw",
    "linggo",
    "buwan",
    "taon",
    "umaga",
    "tanghali",
    "hapon",
    "gabi",
    "kahapon",
    "ngayon",
    "bukas",
    "mamaya",
    "kanina",
  ]

  if (!text || text.trim().length < 3) {
    return "english" // Default to English if no text or very short text
  }

  const words = text.toLowerCase().split(/\s+/)
  let tagalogCount = 0

  for (const word of words) {
    if (tagalogWords.includes(word)) {
      tagalogCount++
    }
  }

  const totalWords = words.length
  const tagalogRatio = totalWords > 0 ? tagalogCount / totalWords : 0

  // If more than 20% of words are Tagalog, consider it Tagalog or Taglish
  if (tagalogRatio > 0.2) {
    // If more than 80% of words are Tagalog, it's pure Tagalog
    if (tagalogRatio > 0.8) {
      return "tagalog"
    }
    // Otherwise, it's Taglish
    return "taglish"
  }

  // Default to English
  return "english"
}

// Track user language preferences
const userLanguagePreferences = new Map()

// Basic routes
app.get("/", (req, res) => {
  console.log(`[${req.requestId}] Root endpoint accessed`)
  res.send("Server is running")
})

app.get("/health", (req, res) => {
  console.log(`[${req.requestId}] Health endpoint accessed`)
  res.json({
    status: "ok",
    timestamp: new Date().toISOString(),
    rasa_url: RASA_URL,
  })
})

app.get("/test", (req, res) => {
  console.log(`[${req.requestId}] Test endpoint accessed`)
  res.json({
    message: "Test endpoint working",
    timestamp: new Date().toISOString(),
  })
})

// Replace your existing /chat endpoint with this improved version
app.post("/chat", async (req, res) => {
  try {
    console.log(`[${req.requestId}] Received chat request:`, req.body);
    const { message, sender_id } = req.body;

    if (!message || !sender_id) {
      return res.status(400).json({
        error: "Message and sender_id are required",
        messages: [{ text: "Please provide both message and sender_id", type: "bot" }],
      });
    }

    // Check if user has a language preference, otherwise detect language
    let detectedLanguage = userLanguagePreferences.get(sender_id);

    // If no stored preference or message contains language switch command
    if (
      !detectedLanguage ||
      message.toLowerCase().includes("switch language") ||
      message.toLowerCase().includes("change language")
    ) {
      detectedLanguage = detectLanguage(message);
      // Store the user's language preference
      userLanguagePreferences.set(sender_id, detectedLanguage);
    }

    console.log(`[${req.requestId}] Using language: ${detectedLanguage} for user: ${sender_id}`);

    // Send message to Rasa with language information
    console.log(`[${req.requestId}] Sending to Rasa at ${RASA_URL}/webhooks/rest/webhook:`, {
      sender: sender_id,
      message: message,
      metadata: { language: detectedLanguage },
    });

    try {
      const rasaResponse = await axios.post(
        `${RASA_URL}/webhooks/rest/webhook`,
        {
          sender: sender_id,
          message: message,
          metadata: { language: detectedLanguage },
        },
        {
          timeout: 25000, // 25 second timeout - increased from 10s
        }
      );

      console.log(`[${req.requestId}] Rasa response:`, rasaResponse.data);

      // Process Rasa response
      let responseMessages = [];
      if (rasaResponse.data && rasaResponse.data.length > 0) {
        responseMessages = rasaResponse.data.map((msg) => ({
          text: msg.text,
          type: "bot",
        }));
      } else {
        // If Rasa doesn't return a response, use a default message based on detected language
        let defaultMessage;
        switch (detectedLanguage) {
          case "tagalog":
            defaultMessage = "Paumanhin, hindi ko maintindihan ang iyong mensahe. Maaari mo bang ipaliwanag ulit?";
            break;
          case "taglish":
            defaultMessage = "Sorry po, hindi ko fully na-understand ang message niyo. Pwede po ba i-clarify?";
            break;
          default:
            defaultMessage = "I'm sorry, I didn't understand your message. Could you please rephrase it?";
        }

        responseMessages = [{ text: defaultMessage, type: "bot" }];
      }

      res.json({
        messages: responseMessages,
        detected_language: detectedLanguage,
      });
    } catch (error) {
      console.error(`[${req.requestId}] Error calling Rasa:`, error.message);
      if (error.response) {
        console.error(`[${req.requestId}] Response status:`, error.response.status);
        console.error(`[${req.requestId}] Response data:`, error.response.data);
      }

      // Provide language-specific error messages
      let errorMessage;
      switch (detectedLanguage) {
        case "tagalog":
          errorMessage = "Paumanhin, nagkaroon ng problema sa pagkonekta sa sistema. Pakisubukang muli mamaya.";
          break;
        case "taglish":
          errorMessage = "Sorry po, may problem sa connection sa system. Please try again later po.";
          break;
        default:
          errorMessage = "I'm sorry, I'm having trouble connecting to my brain. Please try again later.";
      }

      res.status(500).json({
        error: "Failed to communicate with Rasa",
        messages: [{ text: errorMessage, type: "bot" }],
        detected_language: detectedLanguage,
      });
    }
  } catch (error) {
    console.error(`[${req.requestId}] Error processing chat request:`, error.message);
    res.status(500).json({
      error: "Failed to process chat request",
      message: error.message,
      messages: [
        { text: "I'm sorry, I encountered an error processing your request. Please try again later.", type: "bot" },
      ],
    });
  }
});

// Language switching endpoint
app.post("/set-language", (req, res) => {
  const { sender_id, language } = req.body

  if (!sender_id || !language) {
    return res.status(400).json({
      error: "sender_id and language are required",
    })
  }

  if (!["english", "tagalog", "taglish"].includes(language)) {
    return res.status(400).json({
      error: "language must be one of: english, tagalog, taglish",
    })
  }

  userLanguagePreferences.set(sender_id, language)

  let confirmationMessage
  switch (language) {
    case "tagalog":
      confirmationMessage = "Ang wika ay napalitan na sa Tagalog."
      break
    case "taglish":
      confirmationMessage = "Your language has been changed to Taglish po."
      break
    default:
      confirmationMessage = "Your language has been changed to English."
  }

  res.json({
    success: true,
    language: language,
    message: confirmationMessage,
  })
})

// Initialize Firebase Admin SDK
try {
  const serviceAccount = require("./provet-calapan-3bc89-firebase-adminsdk-3j1s1-2106f30da1.json")
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  })
  console.log("Firebase initialized successfully")
} catch (error) {
  console.error("Firebase initialization error:", error.message)
  // Continue without Firebase if there's an error
}

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
  console.log(`Rasa URL: ${RASA_URL}`)
  console.log(`Health endpoint: http://localhost:${PORT}/health}`)
  console.log(`Test endpoint: http://localhost:${PORT}/test`)
})