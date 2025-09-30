# MoodTune AI - YouTube Integration

## 🎵 Overview
The MoodTune AI backend now includes YouTube integration to provide song recommendations that help neutralize detected emotions. When an emotion is detected from speech, the system automatically suggests appropriate music to help balance your emotional state.

## 🔧 New Features

### 1. Emotion Neutralization
- **Angry** → Calm, meditation, peaceful music
- **Sad** → Uplifting, happy, motivational music  
- **Fear** → Confident, empowering, courage music
- **Happy** → Relaxing, chill music (maintain good mood)
- **Neutral** → Popular, trending music
- **Disgust** → Positive, feel-good music
- **Surprise** → Familiar, classic music

### 2. API Endpoints

#### `/predict/` (Enhanced)
Upload an audio file and get:
- Emotion prediction
- Top 2 emotions with probabilities
- **NEW**: 5 neutralizing song recommendations
- **NEW**: Explanation of why the music helps

**Response Format:**
```json
{
  "filename": "audio.wav",
  "content_type": "audio/wav",
  "predicted_emotion": "sad",
  "top_emotions": {"sad": 0.85, "neutral": 0.12},
  "neutralizing_songs": [
    {
      "song_name": "Happy - Pharrell Williams",
      "link": "https://www.youtube.com/watch?v=ZbZSe6N_BXs"
    }
  ],
  "emotion_explanation": "Uplifting and motivational music can help improve mood and boost spirits."
}
```

#### `/songs/{emotion}` (New)
Get song recommendations for a specific emotion:
```
GET /songs/sad?max_results=5
```

## 🚀 Setup Instructions

### 1. Install Dependencies
```bash
pip install -r requirements.txt
```

### 2. API Key Configuration
The YouTube API key is already configured in `config.py`:
```python
YOUTUBE_API_KEY = "AIzaSyAVJAzwPWBAA6OUg9eR6kSav9YYyrPwijc"
```

### 3. Start the Backend
```bash
python start_backend.py
```

### 4. Test the Integration
```bash
python test_api.py
```

## 📁 New Files Added

- `config.py` - Configuration including API key and emotion mapping
- `youtube_service.py` - YouTube API integration service
- `test_api.py` - Test script for the new functionality
- `README_YOUTUBE_INTEGRATION.md` - This documentation

## 🎯 Usage Examples

### Test Emotion-Based Recommendations
```bash
curl "http://localhost:8000/songs/angry"
curl "http://localhost:8000/songs/sad"
curl "http://localhost:8000/songs/happy"
```

### Upload Audio for Full Analysis
```bash
curl -X POST "http://localhost:8000/predict/" \
     -H "accept: application/json" \
     -H "Content-Type: multipart/form-data" \
     -F "audio_file=@your_audio.wav"
```

## 🔍 Response Format
Each song recommendation includes:
- **song_name**: Clean title of the song
- **link**: Direct YouTube URL

No additional metadata - just the essential song name and link as requested!

## 🛠️ Technical Details

- Uses YouTube Data API v3
- Searches in Music category (videoCategoryId='10')
- Orders results by relevance
- Implements error handling for API failures
- Randomly selects search terms for variety

## 📊 API Documentation
Visit `http://localhost:8000/docs` for interactive API documentation.
