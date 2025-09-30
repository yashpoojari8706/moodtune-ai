import { NextRequest, NextResponse } from 'next/server';

// FastAPI backend URL - adjust port if needed
const FASTAPI_URL = 'http://localhost:8000';

// Analyze audio using FastAPI backend
const analyzeAudioMood = async (audioBlob: string) => {
  try {
    // Convert base64 to blob
    const response = await fetch(audioBlob);
    const blob = await response.blob();
    
    // Create FormData for FastAPI
    const formData = new FormData();
    formData.append('audio_file', blob, 'audio.wav');
    
    // Send to FastAPI backend
    const apiResponse = await fetch(`${FASTAPI_URL}/predict/`, {
      method: 'POST',
      body: formData,
    });
    
    if (!apiResponse.ok) {
      throw new Error(`FastAPI error: ${apiResponse.status}`);
    }
    
    const result = await apiResponse.json();
    
    // Map FastAPI emotions to our mood system
    const emotionToMood = {
      'happy': { mood: 'euphoric', energy: 85, valence: 90, intensity: 70 },
      'sad': { mood: 'melancholic', energy: 25, valence: 20, intensity: 60 },
      'angry': { mood: 'angry', energy: 80, valence: 15, intensity: 95 },
      'fear': { mood: 'anxious', energy: 70, valence: 25, intensity: 85 },
      'surprise': { mood: 'excited', energy: 75, valence: 70, intensity: 80 },
      'disgust': { mood: 'frustrated', energy: 40, valence: 30, intensity: 70 },
      'neutral': { mood: 'contemplative', energy: 50, valence: 50, intensity: 40 }
    };
    
    const primaryEmotion = result.predicted_emotion.toLowerCase();
    const moodMapping = emotionToMood[primaryEmotion as keyof typeof emotionToMood] || emotionToMood['neutral'];
    
    return {
      ...moodMapping,
      confidence: Math.max(...Object.values(result.top_emotions).map(Number)) * 100,
      rawEmotions: result.top_emotions,
      detectedEmotion: result.predicted_emotion,
      neutralizingSongs: result.neutralizing_songs || [],
      emotionExplanation: result.emotion_explanation || ''
    };
    
  } catch (error) {
    console.error('Error calling FastAPI:', error);
    // Fallback to text analysis
    throw error;
  }
};

// Mock mood analysis - in a real app, you'd use AI services like OpenAI, Hugging Face, etc.
const analyzeMood = async (text: string) => {
  // Simple keyword-based mood detection for demo
  const lowerText = text.toLowerCase();
  
  let energy = 50;
  let valence = 50;
  let intensity = 50;
  let detectedMood = "neutral";

  // Energy keywords
  if (lowerText.includes("tired") || lowerText.includes("exhausted") || lowerText.includes("sleepy")) {
    energy = Math.max(10, energy - 30);
  }
  if (lowerText.includes("energetic") || lowerText.includes("pumped") || lowerText.includes("excited")) {
    energy = Math.min(90, energy + 30);
  }

  // Valence keywords
  if (lowerText.includes("sad") || lowerText.includes("depressed") || lowerText.includes("down") || lowerText.includes("upset")) {
    valence = Math.max(10, valence - 40);
  }
  if (lowerText.includes("happy") || lowerText.includes("joy") || lowerText.includes("great") || lowerText.includes("amazing")) {
    valence = Math.min(90, valence + 40);
  }

  // Intensity keywords
  if (lowerText.includes("angry") || lowerText.includes("furious") || lowerText.includes("rage")) {
    intensity = Math.min(95, intensity + 40);
    valence = Math.max(10, valence - 30);
  }
  if (lowerText.includes("calm") || lowerText.includes("peaceful") || lowerText.includes("relaxed")) {
    intensity = Math.max(15, intensity - 30);
  }

  // Determine mood category
  if (valence > 70 && energy > 70) detectedMood = "euphoric";
  else if (valence > 70 && energy < 30) detectedMood = "content";
  else if (valence < 30 && energy > 70) detectedMood = "angry";
  else if (valence < 30 && energy < 30) detectedMood = "melancholic";
  else if (valence > 50 && energy > 50) detectedMood = "upbeat";
  else if (valence < 50 && energy > 50) detectedMood = "frustrated";
  else if (valence > 50 && energy < 50) detectedMood = "peaceful";
  else detectedMood = "contemplative";

  return {
    mood: detectedMood,
    energy,
    valence,
    intensity,
    confidence: Math.random() * 30 + 70 // Mock confidence score
  };
};

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { text, audioBlob } = body;

    if (!text && !audioBlob) {
      return NextResponse.json(
        { error: "Either text or audioBlob is required" },
        { status: 400 }
      );
    }

    let moodAnalysis;
    let transcription = text;

    // If audio is provided, use FastAPI backend for emotion recognition
    if (audioBlob) {
      try {
        moodAnalysis = await analyzeAudioMood(audioBlob);
        transcription = `Audio analysis detected: ${moodAnalysis.detectedEmotion}`;
      } catch (error) {
        console.error("FastAPI analysis failed, falling back to text analysis:", error);
        // Fallback to text analysis if FastAPI fails
        const fallbackText = text || "I'm sharing my mood through voice";
        moodAnalysis = await analyzeMood(fallbackText);
        transcription = fallbackText;
      }
    } else {
      // Use text-based analysis
      moodAnalysis = await analyzeMood(text);
    }

    return NextResponse.json({
      success: true,
      analysis: moodAnalysis,
      transcription: transcription,
      source: audioBlob ? 'audio' : 'text'
    });

  } catch (error) {
    console.error("Error analyzing mood:", error);
    return NextResponse.json(
      { error: "Failed to analyze mood" },
      { status: 500 }
    );
  }
}
