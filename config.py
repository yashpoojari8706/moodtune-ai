# Configuration file for MoodTune AI
# Multiple Google Gemini API Keys with automatic rotation
GEMINI_API_KEYS = [
    "AIzaSyBs9oh6pxzBjUaNDG9g7i52hS_jQdf-c-g",
    "AIzaSyAA7jV48e0Tv7_wY7nwskqQwdD-Nzjj1K0", 
    "AIzaSyC0LF4LsYvc5bHzT4rKnS3RfhnPeXG0JOM",
    "AIzaSyBDZQ-7JZiNkwgyRYrZJL4bfiYhAhLOAC8"  # Backup key
]

# Current API key index for rotation
CURRENT_API_KEY_INDEX = 0

# Emotion to neutralizing music prompts
EMOTION_NEUTRALIZATION_PROMPTS = {
    "angry": "calm, peaceful, meditation music to reduce anger and promote relaxation",
    "sad": "uplifting, happy, motivational music to improve mood and boost spirits", 
    "fear": "confident, empowering, courage-building music to reduce anxiety",
    "happy": "relaxing, chill music to maintain good mood without overstimulation",
    "neutral": "popular, trending music to enhance balanced emotional state",
    "disgust": "positive, feel-good music to shift focus to pleasant thoughts",
    "surprise": "familiar, classic music to provide emotional stability"
}
