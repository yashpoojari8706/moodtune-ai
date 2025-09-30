import { NextRequest, NextResponse } from 'next/server';

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

    // For demo purposes, we'll use text analysis
    // In a real app, you'd transcribe audio first using services like:
    // - OpenAI Whisper API
    // - Google Speech-to-Text
    // - Azure Speech Services
    
    let analysisText = text;
    if (!analysisText && audioBlob) {
      // Mock transcription for demo
      analysisText = "I'm feeling pretty good today, just need some music to match my vibe";
    }

    const moodAnalysis = await analyzeMood(analysisText);

    return NextResponse.json({
      success: true,
      analysis: moodAnalysis,
      transcription: analysisText
    });

  } catch (error) {
    console.error("Error analyzing mood:", error);
    return NextResponse.json(
      { error: "Failed to analyze mood" },
      { status: 500 }
    );
  }
}
