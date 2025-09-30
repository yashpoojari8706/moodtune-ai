import io
import librosa
import torch
from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from transformers import Wav2Vec2FeatureExtractor, Wav2Vec2ForSequenceClassification
from youtube_service import GeminiMusicService

app = FastAPI(
    title="Speech Emotion Recognition API",
    description="An API to predict emotions from English speech audio files.",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
    openapi_url="/openapi.json"
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

try:
    FEATURE_EXTRACTOR = Wav2Vec2FeatureExtractor.from_pretrained(
        "r-f/wav2vec-english-speech-emotion-recognition"
    )
    MODEL = Wav2Vec2ForSequenceClassification.from_pretrained(
        "r-f/wav2vec-english-speech-emotion-recognition"
    )
except Exception as e:
    print(f"Error loading model: {e}")
    FEATURE_EXTRACTOR = None
    MODEL = None

# Initialize Gemini Music service
try:
    music_service = GeminiMusicService()
    print("✅ Gemini Music service initialized successfully")
except Exception as e:
    print(f"❌ Error initializing Gemini Music service: {e}")
    music_service = None

def predict_emotion(audio_file_object: io.BytesIO):
    if not FEATURE_EXTRACTOR or not MODEL:
        raise RuntimeError("Model is not loaded. The server cannot make predictions.")
    audio, rate = librosa.load(audio_file_object, sr=16000)
    inputs = FEATURE_EXTRACTOR(
        audio, sampling_rate=rate, return_tensors="pt", padding=True
    )
    with torch.no_grad():
        outputs = MODEL(**inputs)
        predictions = torch.nn.functional.softmax(outputs.logits, dim=-1)
        predicted_label_id = torch.argmax(predictions, dim=-1).item()
        emotion = MODEL.config.id2label[predicted_label_id]
    return emotion, predictions.tolist()[0]

@app.post("/predict/")
async def create_prediction(audio_file: UploadFile = File(...)):
    if not audio_file.content_type.startswith("audio/"):
        raise HTTPException(status_code=400, detail="Invalid file type. Please upload an audio file.")

    try:
        predicted_emotion, probabilities = predict_emotion(audio_file.file)
        
        all_emotions = {MODEL.config.id2label[i]: prob for i, prob in enumerate(probabilities)}
        sorted_emotions = sorted(all_emotions.items(), key=lambda item: item[1], reverse=True)
        top_2_emotions = dict(sorted_emotions[:2])

        # Get neutralizing songs from Gemini
        neutralizing_songs = []
        emotion_explanation = ""
        
        if music_service:
            try:
                neutralizing_songs = music_service.get_neutralizing_songs(predicted_emotion, max_results=5)
                emotion_explanation = music_service.get_emotion_explanation(predicted_emotion)
            except Exception as e:
                print(f"Error getting Gemini recommendations: {e}")

        return {
            "filename": audio_file.filename,
            "content_type": audio_file.content_type,
            "predicted_emotion": predicted_emotion,
            "top_emotions": top_2_emotions,
            "neutralizing_songs": neutralizing_songs,
            "emotion_explanation": emotion_explanation
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Could not process audio file: {e}")

@app.get("/songs/{emotion}")
async def get_songs_for_emotion(emotion: str, max_results: int = 5):
    """
    Get neutralizing songs for a specific emotion using Gemini AI
    """
    if not music_service:
        raise HTTPException(status_code=503, detail="Gemini Music service is not available")
    
    try:
        songs = music_service.get_neutralizing_songs(emotion, max_results)
        explanation = music_service.get_emotion_explanation(emotion)
        
        return {
            "emotion": emotion,
            "explanation": explanation,
            "songs": songs
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Error getting songs for emotion: {e}")

@app.get("/")
def read_root():
    return {"message": "Welcome to the Speech Emotion Recognition API. Go to /docs for more info."}