# File: chatbot-backend/rasa/actions/language_utils.py

def detect_language(text: str) -> str:
    """
    Detect if text is in English, Tagalog, or Taglish
    Returns: 'english', 'tagalog', or 'taglish'
    """
    if not text or len(text.strip()) < 3:
        return "english"  # Default for very short texts
    
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
    
    # Common English words
    english_words = [
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
    ]
    
    # Count Tagalog and English words
    words = text.lower().split()
    tagalog_count = sum(1 for word in words if word in tagalog_words)
    english_count = sum(1 for word in words if word in english_words)
    
    total_words = len(words)
    tagalog_ratio = tagalog_count / total_words if total_words > 0 else 0
    english_ratio = english_count / total_words if total_words > 0 else 0
    
    # Determine language based on word ratios
    if tagalog_ratio > 0.2 and english_ratio > 0.2:
        return "taglish"
    elif tagalog_ratio > english_ratio:
        return "tagalog"
    else:
        return "english"