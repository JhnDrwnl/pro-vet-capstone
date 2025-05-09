// File: chatbot-backend/node-server/language_utils.js

/**
 * Detect if text is in English, Tagalog, or Taglish
 * @param {string} text - The text to analyze
 * @returns {string} 'english', 'tagalog', or 'taglish'
 */
function detectLanguage(text) {
  if (!text || text.trim().length < 3) {
    return 'english';  // Default for very short texts
  }
  
  // Common Tagalog words and markers
  const tagalogWords = [
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
  ];
  
  // Common English words
  const englishWords = [
       "the", "a", "an", "is", "are", "am", "was", "were", "have", "has", 
        "what", "who", "where", "when", "why", "how", "many", "weekend", 
        "weekdays", "open", "close", "Monday", "Tuesday", "Wednesday", "break",
        "Thursday", "Friday", "Saturday", "Friday", "holiday", "lunch", 
        "had", "will", "would", "should", "could", "can", "may", "might", 
        "must", "do", "does", "did", "done", "go", "went", "gone", "get", 
        "got", "gotten", "come", "came", "see", "saw", "seen", "know", 
        "knew", "known", "want", "wanted", "take", "took", "taken", "make", 
        "made", "find", "found", "give", "gave", "given", "tell", "told", 
        "think", "thought", "say", "said", "show", "showed", "shown", 
        "leave", "left", "feel", "felt", "become", "became", "begin", 
        "began", "begun", "bring", "brought", "buy", "bought", "choose", 
        "chose", "chosen", "drink", "drank", "drunk", "drive", "drove", 
        "driven", "eat", "ate", "eaten", "fall", "fell", "fallen", "forget", 
        "forgot", "forgotten", "grow", "grew", "grown", "hear", "heard", 
        "keep", "kept", "learn", "learned", "learnt", "meet", "met", "pay", 
        "paid", "put", "read", "run", "ran", "say", "said", "sell", "sold", 
        "send", "sent", "sit", "sat", "sleep", "slept", "speak", "spoke", 
        "spoken", "spend", "spent", "stand", "stood", "teach", "taught", 
        "understand", "understood", "write", "wrote", "written", "that", 
        "this", "these", "those", "it", "they", "them", "their", "there", 
        "here", "where", "when", "why", "how", "what", "who", "whom", 
        "which", "while", "if", "then", "than", "though", "although", 
        "because", "since", "for", "so", "as", "until", "before", "after", 
        "during", "through", "throughout", "between", "among", "within"
  ];
  
  // Count Tagalog and English words
  const words = text.toLowerCase().split(/\s+/);
  let tagalogCount = 0;
  let englishCount = 0;
  
  for (const word of words) {
    if (tagalogWords.includes(word)) {
      tagalogCount++;
    }
    if (englishWords.includes(word)) {
      englishCount++;
    }
  }
  
  const totalWords = words.length;
  const tagalogRatio = totalWords > 0 ? tagalogCount / totalWords : 0;
  const englishRatio = totalWords > 0 ? englishCount / totalWords : 0;
  
  // Determine language based on word ratios
  if (tagalogRatio > 0.2 && englishRatio > 0.2) {
    return 'taglish';
  } else if (tagalogRatio > englishRatio) {
    return 'tagalog';
  } else {
    return 'english';
  }
}

module.exports = { detectLanguage };