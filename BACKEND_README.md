# MoodTune AI Backend Setup

## Overview
This FastAPI backend provides speech emotion recognition using a pre-trained Wav2Vec2 model from Hugging Face.

## Features
- 🎤 **Speech Emotion Recognition**: Analyzes audio files to detect emotions
- 🤖 **AI-Powered**: Uses `r-f/wav2vec-english-speech-emotion-recognition` model
- 🌐 **CORS Enabled**: Configured for Next.js frontend integration
- 📊 **Emotion Mapping**: Maps detected emotions to mood parameters

## Setup Instructions

### 1. Install Python Dependencies
```bash
pip install -r requirements.txt
```

### 2. Start the Backend Server
```bash
python start_backend.py
```

Or manually:
```bash
uvicorn api:app --host 0.0.0.0 --port 8000 --reload
```

### 3. Verify Installation
- Backend API: http://localhost:8000
- API Documentation: http://localhost:8000/docs
- Health Check: http://localhost:8000/

## API Endpoints

### POST /predict/
Analyzes audio files for emotion recognition.

**Request:**
- Method: POST
- Content-Type: multipart/form-data
- Body: audio_file (audio file)

**Response:**
```json
{
  "filename": "audio.wav",
  "content_type": "audio/wav",
  "predicted_emotion": "happy",
  "top_emotions": {
    "happy": 0.85,
    "neutral": 0.15
  }
}
```

## Supported Emotions
- Happy
- Sad
- Angry
- Fear
- Surprise
- Disgust
- Neutral

## Integration with Frontend
The Next.js frontend automatically connects to this backend when:
1. Backend is running on port 8000
2. Frontend is running on port 3000
3. User provides voice input

## Troubleshooting

### Model Loading Issues
If the Wav2Vec2 model fails to load:
1. Check internet connection
2. Ensure sufficient disk space (~1GB for model)
3. Verify transformers library version

### CORS Issues
If frontend can't connect:
1. Verify backend is running on port 8000
2. Check CORS configuration in api.py
3. Ensure frontend is on http://localhost:3000

### Audio Processing Errors
If audio analysis fails:
1. Verify audio file format (WAV recommended)
2. Check librosa installation
3. Ensure audio file is not corrupted
