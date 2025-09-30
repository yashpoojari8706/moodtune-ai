"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageCircle, Mic, ArrowLeft, Upload } from "lucide-react";
import MusicLoader from "./MusicLoader";
import VoiceRecorder from "./VoiceRecorder";
import PlaylistDisplay, { Playlist } from "./PlaylistDisplay";
import OnboardingScreen from "./OnboardingScreen";
import Music3DLoader from "./Music3DLoader";
import FileUpload from "./FileUpload";

type AppState = "loader" | "onboarding" | "input" | "loading" | "playlist";
type InputMode = "voice" | "text" | "file";

interface MoodAnalysis {
  mood: string;
  energy: number;
  valence: number;
  intensity: number;
  confidence: number;
  detectedEmotion?: string;
  neutralizingSongs?: Array<{song_name: string; link: string}>;
  emotionExplanation?: string;
}

export default function MoodTuneApp() {
  const [appState, setAppState] = useState<AppState>("loader");
  const [inputMode, setInputMode] = useState<InputMode>("voice");
  const [loadingStage, setLoadingStage] = useState<"listening" | "analyzing" | "generating">("analyzing");
  const [textInput, setTextInput] = useState("");
  const [moodAnalysis, setMoodAnalysis] = useState<MoodAnalysis | null>(null);
  const [playlist, setPlaylist] = useState<Playlist | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleVoiceRecording = async (audioBlob: Blob) => {
    setAppState("loading");
    setLoadingStage("analyzing");

    try {
      // Convert blob to base64 for sending to API
      const reader = new FileReader();
      reader.readAsDataURL(audioBlob);
      
      const audioData = await new Promise<string>((resolve) => {
        reader.onloadend = () => resolve(reader.result as string);
      });
      
      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          audioBlob: audioData,
          text: null
        })
      });

      if (!response.ok) {
        throw new Error(`API Error: ${response.status}`);
      }

      const { analysis } = await response.json();
      setMoodAnalysis(analysis);
      
      setLoadingStage("generating");
      await generatePlaylist(analysis);
      
    } catch (error) {
      console.error("Error processing voice:", error);
      setAppState("input");
    }
  };

  const handleFileUpload = async (file: File) => {
    setIsProcessing(true);
    setAppState("loading");
    setLoadingStage("analyzing");

    try {
      // Convert file to base64
      const reader = new FileReader();
      reader.readAsDataURL(file);
      
      const audioData = await new Promise<string>((resolve) => {
        reader.onloadend = () => resolve(reader.result as string);
      });
      
      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          audioBlob: audioData,
          text: null
        })
      });

      if (!response.ok) {
        throw new Error(`API Error: ${response.status}`);
      }

      const { analysis } = await response.json();
      setMoodAnalysis(analysis);
      
      setLoadingStage("generating");
      await generatePlaylist(analysis);
      
    } catch (error) {
      console.error("Error processing file:", error);
      setAppState("input");
      setIsProcessing(false);
    }
  };

  const handleTextSubmit = async () => {
    if (!textInput.trim()) return;

    setAppState("loading");
    setLoadingStage("analyzing");

    try {
      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: textInput })
      });

      const { analysis } = await response.json();
      setMoodAnalysis(analysis);
      
      setLoadingStage("generating");
      await generatePlaylist(analysis);
      
    } catch (error) {
      console.error("Error processing text:", error);
      setAppState("input");
    }
  };


  const generatePlaylist = async (analysis: MoodAnalysis) => {
    try {
      const response = await fetch("/api/playlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mood: analysis.mood,
          energy: analysis.energy,
          valence: analysis.valence,
          intensity: analysis.intensity,
          detectedEmotion: analysis.detectedEmotion
        })
      });

      const { playlist: generatedPlaylist } = await response.json();
      
      await new Promise(resolve => setTimeout(resolve, 1000)); // Show generating stage
      
      setPlaylist(generatedPlaylist);
      setAppState("playlist");
      
    } catch (error) {
      console.error("Error generating playlist:", error);
      setAppState("input");
    }
  };

  const handleSurpriseRemix = async () => {
    if (!moodAnalysis) return;

    setAppState("loading");
    setLoadingStage("generating");

    try {
      const response = await fetch("/api/playlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mood: moodAnalysis.mood,
          energy: moodAnalysis.energy,
          valence: moodAnalysis.valence,
          intensity: moodAnalysis.intensity,
          detectedEmotion: moodAnalysis.detectedEmotion,
          surprise: true
        })
      });

      const { playlist: surprisePlaylist } = await response.json();
      
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      setPlaylist(surprisePlaylist);
      setAppState("playlist");
      
    } catch (error) {
      console.error("Error generating surprise remix:", error);
      setAppState("playlist");
    }
  };

  const handleShare = async (playlistToShare: Playlist) => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: playlistToShare.name,
          text: `Check out my ${playlistToShare.mood_detected} mood playlist created by Moodly AI!`,
          url: window.location.href
        });
      } catch (error) {
        console.log("Share cancelled");
      }
    } else {
      // Fallback: copy to clipboard
      const shareText = `🎵 ${playlistToShare.name}\n\n${playlistToShare.description}\n\nTracks:\n${playlistToShare.tracks.map((t, i) => `${i + 1}. ${t.title} - ${t.artist}`).join('\n')}\n\nGenerated by Moodly AI`;
      
      try {
        await navigator.clipboard.writeText(shareText);
        alert("Playlist copied to clipboard!");
      } catch (error) {
        console.error("Failed to copy:", error);
      }
    }
  };

  const handleLoaderComplete = () => {
    setAppState("onboarding");
  };

  const handleOnboardingComplete = () => {
    setAppState("input");
  };

  const resetApp = () => {
    setAppState("input");
    setInputMode("voice");
    setTextInput("");
    setMoodAnalysis(null);
    setPlaylist(null);
  };

  // Dynamic theme based on mood
  const getMoodTheme = () => {
    if (!moodAnalysis) return {
      primary: "from-purple-600 to-pink-600",
      accent: "purple-500",
      bg: "from-purple-900/20 to-pink-900/20"
    };

    const { mood, energy, valence } = moodAnalysis;
    
    if (energy > 70 && valence > 70) return {
      primary: "from-yellow-400 to-orange-500",
      accent: "orange-400",
      bg: "from-yellow-900/20 to-orange-900/20"
    };
    if (energy > 70 && valence < 30) return {
      primary: "from-red-500 to-pink-600",
      accent: "red-400",
      bg: "from-red-900/20 to-pink-900/20"
    };
    if (energy < 30 && valence > 70) return {
      primary: "from-green-400 to-blue-500",
      accent: "green-400",
      bg: "from-green-900/20 to-blue-900/20"
    };
    if (energy < 30 && valence < 30) return {
      primary: "from-indigo-600 to-purple-700",
      accent: "indigo-400",
      bg: "from-indigo-900/20 to-purple-900/20"
    };
    
    return {
      primary: "from-purple-600 to-pink-600",
      accent: "purple-500",
      bg: "from-purple-900/20 to-pink-900/20"
    };
  };

  const theme = getMoodTheme();

  return (
    <div className="min-h-screen bg-black relative overflow-hidden">
      {/* Unified Background with Smooth Gradient */}
      <div className="absolute inset-0">
        <motion.div
          className="absolute inset-0"
          style={{
            background: `linear-gradient(135deg, 
              rgba(0, 0, 0, 1) 0%, 
              rgba(139, 92, 246, 0.15) 25%, 
              rgba(236, 72, 153, 0.1) 50%, 
              rgba(99, 102, 241, 0.15) 75%, 
              rgba(0, 0, 0, 1) 100%)`
          }}
          animate={{
            background: [
              `linear-gradient(135deg, 
                rgba(0, 0, 0, 1) 0%, 
                rgba(139, 92, 246, 0.15) 25%, 
                rgba(236, 72, 153, 0.1) 50%, 
                rgba(99, 102, 241, 0.15) 75%, 
                rgba(0, 0, 0, 1) 100%)`,
              `linear-gradient(225deg, 
                rgba(0, 0, 0, 1) 0%, 
                rgba(99, 102, 241, 0.15) 25%, 
                rgba(139, 92, 246, 0.1) 50%, 
                rgba(236, 72, 153, 0.15) 75%, 
                rgba(0, 0, 0, 1) 100%)`,
              `linear-gradient(315deg, 
                rgba(0, 0, 0, 1) 0%, 
                rgba(236, 72, 153, 0.15) 25%, 
                rgba(99, 102, 241, 0.1) 50%, 
                rgba(139, 92, 246, 0.15) 75%, 
                rgba(0, 0, 0, 1) 100%)`
            ]
          }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
        />
      </div>

      <AnimatePresence mode="wait">
        {appState === "loader" && (
          <Music3DLoader key="loader" onComplete={handleLoaderComplete} />
        )}

        {appState === "onboarding" && (
          <OnboardingScreen key="onboarding" onComplete={handleOnboardingComplete} />
        )}

        {appState === "loading" && (
          <motion.div
            key="loading"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.1 }}
            transition={{ duration: 0.5 }}
          >
            <MusicLoader
              headline="Moodly AI is crafting your vibe..."
              subcopy={
                loadingStage === "listening" ? "Listening to your voice input..." :
                loadingStage === "analyzing" ? "Analyzing your emotional state..." :
                "Generating your personalized 5-track playlist..."
              }
              stage={loadingStage}
            />
          </motion.div>
        )}

        {appState === "input" && (
          <motion.div
            key="input"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="container mx-auto px-4 py-8 min-h-screen flex flex-col justify-center relative overflow-hidden"
          >
            {/* Floating Music Notes Background */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
              {/* Musical Note 1 - Top Left */}
              <motion.div
                className="absolute text-white/50 text-3xl"
                style={{ left: '8%', top: '12%' }}
                animate={{
                  y: [-20, -50, -20],
                  x: [-5, 20, -5],
                  opacity: [0.3, 0.7, 0.3],
                  rotate: [0, 15, 0],
                  scale: [1, 1.1, 1],
                }}
                transition={{
                  duration: 8,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              >
                ♪
              </motion.div>

              {/* Musical Note 2 - Top Right */}
              <motion.div
                className="absolute text-white/40 text-2xl"
                style={{ right: '10%', top: '8%' }}
                animate={{
                  y: [-25, -45, -25],
                  x: [0, -15, 0],
                  opacity: [0.25, 0.6, 0.25],
                  rotate: [0, -10, 0],
                  scale: [1, 0.9, 1],
                }}
                transition={{
                  duration: 7,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: 1.5,
                }}
              >
                ♫
              </motion.div>

              {/* Musical Note 3 - Middle Left */}
              <motion.div
                className="absolute text-white/35 text-xl"
                style={{ left: '3%', top: '45%' }}
                animate={{
                  y: [-15, -35, -15],
                  x: [0, 25, 0],
                  opacity: [0.2, 0.5, 0.2],
                  rotate: [0, 12, 0],
                  scale: [1, 1.2, 1],
                }}
                transition={{
                  duration: 9,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: 3,
                }}
              >
                ♬
              </motion.div>

              {/* Musical Note 4 - Middle Right */}
              <motion.div
                className="absolute text-white/45 text-2xl"
                style={{ right: '6%', top: '35%' }}
                animate={{
                  y: [-22, -42, -22],
                  x: [5, -12, 5],
                  opacity: [0.3, 0.65, 0.3],
                  rotate: [0, -8, 0],
                  scale: [1, 0.8, 1],
                }}
                transition={{
                  duration: 6.5,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: 4.5,
                }}
              >
                ♩
              </motion.div>

              {/* Musical Note 5 - Bottom Left */}
              <motion.div
                className="absolute text-white/40 text-xl"
                style={{ left: '12%', bottom: '15%' }}
                animate={{
                  y: [0, -30, 0],
                  x: [-8, 18, -8],
                  opacity: [0.25, 0.55, 0.25],
                  rotate: [0, 9, 0],
                  scale: [1, 1.15, 1],
                }}
                transition={{
                  duration: 7.5,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: 2,
                }}
              >
                ♪
              </motion.div>

              {/* Musical Note 6 - Bottom Right */}
              <motion.div
                className="absolute text-white/35 text-lg"
                style={{ right: '15%', bottom: '20%' }}
                animate={{
                  y: [-12, -32, -12],
                  x: [0, -20, 0],
                  opacity: [0.2, 0.5, 0.2],
                  rotate: [0, -6, 0],
                  scale: [1, 0.9, 1],
                }}
                transition={{
                  duration: 8.5,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: 6,
                }}
              >
                ♫
              </motion.div>

              {/* Musical Note 7 - Center Top */}
              <motion.div
                className="absolute text-white/30 text-lg"
                style={{ left: '45%', top: '5%' }}
                animate={{
                  y: [-18, -38, -18],
                  x: [-10, 10, -10],
                  opacity: [0.15, 0.45, 0.15],
                  rotate: [0, 5, 0],
                  scale: [1, 1.1, 1],
                }}
                transition={{
                  duration: 10,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: 7,
                }}
              >
                ♬
              </motion.div>

              {/* Musical Note 8 - Center Bottom */}
              <motion.div
                className="absolute text-white/25 text-base"
                style={{ left: '55%', bottom: '8%' }}
                animate={{
                  y: [0, -25, 0],
                  x: [0, -15, 0],
                  opacity: [0.1, 0.4, 0.1],
                  rotate: [0, -4, 0],
                  scale: [1, 0.85, 1],
                }}
                transition={{
                  duration: 11,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: 8.5,
                }}
              >
                ♩
              </motion.div>

              {/* Musical Note 9 - Far Left */}
              <motion.div
                className="absolute text-white/30 text-xl"
                style={{ left: '1%', top: '25%' }}
                animate={{
                  y: [-16, -36, -16],
                  x: [0, 22, 0],
                  opacity: [0.2, 0.5, 0.2],
                  rotate: [0, 11, 0],
                  scale: [1, 1.3, 1],
                }}
                transition={{
                  duration: 9.5,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: 1,
                }}
              >
                ♪
              </motion.div>

              {/* Musical Note 10 - Far Right */}
              <motion.div
                className="absolute text-white/35 text-lg"
                style={{ right: '2%', top: '55%' }}
                animate={{
                  y: [-14, -34, -14],
                  x: [0, -18, 0],
                  opacity: [0.25, 0.55, 0.25],
                  rotate: [0, -7, 0],
                  scale: [1, 0.9, 1],
                }}
                transition={{
                  duration: 8,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: 5,
                }}
              >
                ♫
              </motion.div>

              {/* Musical Note 11 - Top Center Left */}
              <motion.div
                className="absolute text-white/25 text-lg"
                style={{ left: '25%', top: '3%' }}
                animate={{
                  y: [-12, -28, -12],
                  x: [-5, 12, -5],
                  opacity: [0.15, 0.4, 0.15],
                  rotate: [0, 6, 0],
                  scale: [1, 1.05, 1],
                }}
                transition={{
                  duration: 12,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: 9,
                }}
              >
                ♬
              </motion.div>

              {/* Musical Note 12 - Top Center Right */}
              <motion.div
                className="absolute text-white/30 text-base"
                style={{ right: '30%', top: '6%' }}
                animate={{
                  y: [-10, -26, -10],
                  x: [0, -14, 0],
                  opacity: [0.18, 0.45, 0.18],
                  rotate: [0, -5, 0],
                  scale: [1, 0.95, 1],
                }}
                transition={{
                  duration: 10.5,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: 3.5,
                }}
              >
                ♩
              </motion.div>

              {/* Musical Note 13 - Bottom Center Left */}
              <motion.div
                className="absolute text-white/20 text-sm"
                style={{ left: '35%', bottom: '5%' }}
                animate={{
                  y: [0, -20, 0],
                  x: [-8, 16, -8],
                  opacity: [0.12, 0.35, 0.12],
                  rotate: [0, 8, 0],
                  scale: [1, 1.2, 1],
                }}
                transition={{
                  duration: 13,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: 11,
                }}
              >
                ♪
              </motion.div>

              {/* Musical Note 14 - Bottom Center Right */}
              <motion.div
                className="absolute text-white/25 text-base"
                style={{ right: '40%', bottom: '12%' }}
                animate={{
                  y: [-8, -24, -8],
                  x: [0, -10, 0],
                  opacity: [0.15, 0.4, 0.15],
                  rotate: [0, -3, 0],
                  scale: [1, 0.88, 1],
                }}
                transition={{
                  duration: 9,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: 7.5,
                }}
              >
                ♫
              </motion.div>

              {/* Musical Note 15 - Middle Center */}
              <motion.div
                className="absolute text-white/15 text-xs"
                style={{ left: '48%', top: '50%' }}
                animate={{
                  y: [-6, -18, -6],
                  x: [-4, 8, -4],
                  opacity: [0.08, 0.25, 0.08],
                  rotate: [0, 4, 0],
                  scale: [1, 1.1, 1],
                }}
                transition={{
                  duration: 14,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: 12,
                }}
              >
                ♬
              </motion.div>
            </div>
            {/* Enhanced Hero Section */}
            <motion.div 
              className="text-center mb-16 relative"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              {/* Glowing Background Effect */}
              <div className="absolute inset-0 -z-10">
                <motion.div
                  className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-r ${theme.primary} rounded-full blur-3xl opacity-20`}
                  animate={{
                    scale: [1, 1.2, 1],
                    opacity: [0.2, 0.3, 0.2],
                  }}
                  transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                />
              </div>

              <motion.h1 
                className="text-5xl md:text-7xl lg:text-8xl font-bold text-white mb-6 relative"
                animate={{ 
                  backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
                }}
                transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                style={{
                  background: `linear-gradient(90deg, #ffffff, ${theme.accent === 'purple-500' ? '#8b5cf6' : `var(--${theme.accent})`}, #ec4899, #6366f1, #ffffff)`,
                  backgroundSize: '200% 100%',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                }}
              >
                Moodly AI
              </motion.h1>
              
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6, duration: 0.8 }}
                className="space-y-4"
              >
                <p className="text-xl md:text-2xl text-white/90 mb-4 font-medium">
                  Voice-to-Vibe Emotional Music Companion
                </p>
                <motion.p 
                  className="text-white/70 max-w-3xl mx-auto text-base md:text-lg leading-relaxed px-4"
                  animate={{ opacity: [0.7, 1, 0.7] }}
                  transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                >
                  Share your mood through voice or text and get an instant 5-track playlist 
                  with AI-powered vibe notes that match your emotional state perfectly.
                </motion.p>
              </motion.div>

              {/* Animated Pulse Indicator */}
              <motion.div
                className="absolute -bottom-8 left-1/2 -translate-x-1/2"
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              >
                <div className={`w-2 h-2 bg-${theme.accent} rounded-full opacity-60`} />
              </motion.div>
            </motion.div>

            {/* Enhanced Input Mode Selector */}
            <motion.div 
              className="flex justify-center mb-16"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 1 }}
            >
              <div className="relative">
                {/* Glassmorphism Container */}
                <div className="flex bg-white/10 rounded-3xl p-3 backdrop-blur-xl border border-white/20 shadow-2xl shadow-black/20">
                  {/* Background Slider */}
                  <motion.div
                    className={`absolute top-3 h-14 bg-gradient-to-r ${theme.primary} rounded-2xl shadow-lg`}
                    animate={{
                      x: inputMode === "voice" ? 0 : inputMode === "text" ? "calc(33.33% + 2px)" : "calc(66.66% + 4px)",
                      width: "calc(33.33% - 6px)",
                    }}
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  />
                  
                  <motion.button
                    onClick={() => setInputMode("voice")}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className={`relative flex items-center space-x-2 px-4 py-4 rounded-2xl transition-all duration-300 z-10 ${
                      inputMode === "voice" 
                        ? "text-white" 
                        : "text-white/70 hover:text-white"
                    }`}
                  >
                    <motion.div
                      animate={{ rotate: inputMode === "voice" ? [0, 5, -5, 0] : 0 }}
                      transition={{ duration: 0.5 }}
                    >
                      <Mic className="w-4 h-4" />
                    </motion.div>
                    <span className="font-semibold text-xs md:text-sm">Voice</span>
                  </motion.button>
                  
                  <motion.button
                    onClick={() => setInputMode("text")}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className={`relative flex items-center space-x-2 px-4 py-4 rounded-2xl transition-all duration-300 z-10 ${
                      inputMode === "text" 
                        ? "text-white" 
                        : "text-white/70 hover:text-white"
                    }`}
                  >
                    <motion.div
                      animate={{ rotate: inputMode === "text" ? [0, 5, -5, 0] : 0 }}
                      transition={{ duration: 0.5 }}
                    >
                      <MessageCircle className="w-4 h-4" />
                    </motion.div>
                    <span className="font-semibold text-xs md:text-sm">Text</span>
                  </motion.button>

                  <motion.button
                    onClick={() => setInputMode("file")}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className={`relative flex items-center space-x-2 px-4 py-4 rounded-2xl transition-all duration-300 z-10 ${
                      inputMode === "file" 
                        ? "text-white" 
                        : "text-white/70 hover:text-white"
                    }`}
                  >
                    <motion.div
                      animate={{ rotate: inputMode === "file" ? [0, 5, -5, 0] : 0 }}
                      transition={{ duration: 0.5 }}
                    >
                      <Upload className="w-4 h-4" />
                    </motion.div>
                    <span className="font-semibold text-xs md:text-sm">Upload</span>
                  </motion.button>
                </div>

                {/* Glow Effect */}
                <div className={`absolute inset-0 bg-gradient-to-r ${theme.primary} rounded-3xl blur-xl opacity-20 -z-10`} />
              </div>
            </motion.div>

            {/* Enhanced Input Content */}
            <div className="max-w-2xl mx-auto">
              {inputMode === "voice" && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5 }}
                  className="relative"
                >
                  {/* Glow effect for voice recorder */}
                  <div className={`absolute inset-0 bg-gradient-to-r ${theme.primary} rounded-3xl blur-2xl opacity-20 -z-10`} />
                  <VoiceRecorder onRecordingComplete={handleVoiceRecording} />
                </motion.div>
              )}

              {inputMode === "text" && (
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                  className="space-y-8"
                >
                  <div className="relative group">
                    {/* Enhanced Glassmorphism Textarea */}
                    <div className="relative">
                      <textarea
                        value={textInput}
                        onChange={(e) => setTextInput(e.target.value)}
                        placeholder="Tell me how you're feeling... What's your vibe right now? "
                        className={`w-full h-48 p-8 bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl text-white placeholder-white/50 resize-none focus:outline-none focus:ring-2 focus:ring-${theme.accent}/50 focus:border-${theme.accent}/50 transition-all duration-500 text-lg leading-relaxed shadow-2xl shadow-black/10`}
                        rows={6}
                      />
                      
                      {/* Character count and mood indicators */}
                      <div className="absolute bottom-4 right-6 flex items-center space-x-4">
                        <motion.div
                          className="text-white/40 text-sm font-mono"
                          animate={{ opacity: textInput.length > 0 ? 1 : 0.3 }}
                        >
                          {textInput.length}/500
                        </motion.div>
                        {textInput.length > 10 && (
                          <motion.div
                            initial={{ opacity: 0, scale: 0 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="flex space-x-1"
                          >
                            <div className={`w-2 h-2 bg-${theme.accent} rounded-full animate-pulse`} />
                            <div className={`w-2 h-2 bg-${theme.accent} rounded-full animate-pulse delay-100`} />
                            <div className={`w-2 h-2 bg-${theme.accent} rounded-full animate-pulse delay-200`} />
                          </motion.div>
                        )}
                      </div>

                      {/* Glow effect */}
                      <div className={`absolute inset-0 bg-gradient-to-r ${theme.primary} rounded-3xl blur-2xl opacity-10 -z-10 group-focus-within:opacity-20 transition-opacity duration-500`} />
                    </div>

                    {/* Animated placeholder suggestions - only show when completely empty */}
                    <AnimatePresence>
                      {textInput.length === 0 && (
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          transition={{ duration: 0.3 }}
                          className="absolute top-full mt-8 left-0 right-0 z-10"
                        >
                          {/* <div className="flex flex-wrap gap-3 justify-center max-w-2xl mx-auto px-4">
                            {[
                              "I'm feeling energetic! 🚀",
                              "Need some chill vibes 😌",
                              "Feeling contemplative today 🤔",
                              "Ready to dance! 💃"
                            ].map((suggestion, index) => (
                              <motion.button
                                key={suggestion}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.1 }}
                                onClick={() => setTextInput(suggestion)}
                                className="px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-full text-white/70 hover:text-white text-sm transition-all duration-300 backdrop-blur-sm whitespace-nowrap"
                              >
                                {suggestion}
                              </motion.button>
                            ))}
                          </div> */}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                  
                  <div className="mt-32">
                    <motion.button
                      onClick={handleTextSubmit}
                      disabled={!textInput.trim()}
                      whileHover={{ scale: 1.02, y: -2 }}
                      whileTap={{ scale: 0.98 }}
                      className={`relative w-full py-5 bg-gradient-to-r ${theme.primary} hover:shadow-2xl disabled:from-white/10 disabled:to-white/10 disabled:cursor-not-allowed text-white font-bold rounded-3xl transition-all duration-500 shadow-xl disabled:shadow-none text-lg overflow-hidden group`}
                    >
                      {/* Button glow effect */}
                      <div className={`absolute inset-0 bg-gradient-to-r ${theme.primary} blur-xl opacity-50 group-hover:opacity-70 transition-opacity duration-300`} />
                      
                      {/* Button content */}
                      <span className="relative z-10 flex items-center justify-center space-x-2">
                        {textInput.trim() ? (
                          <>
                            <span>Analyze My Vibe</span>
                            <motion.div
                              animate={{ rotate: 360 }}
                              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                            >
                              
                            </motion.div>
                          </>
                        ) : (
                          "Share Your Mood First"
                        )}
                      </span>

                      {/* Animated background particles */}
                      {textInput.trim() && (
                        <div className="absolute inset-0 overflow-hidden">
                          {[...Array(3)].map((_, i) => (
                            <motion.div
                              key={i}
                              className="absolute w-1 h-1 bg-white/30 rounded-full"
                              animate={{
                                x: [0, 100, 200],
                                y: [20, 10, 20],
                                opacity: [0, 1, 0],
                              }}
                              transition={{
                                duration: 2,
                                repeat: Infinity,
                                delay: i * 0.5,
                                ease: "easeInOut"
                              }}
                              style={{
                                left: `${20 + i * 30}%`,
                                top: `${40 + i * 10}%`,
                              }}
                            />
                          ))}
                        </div>
                      )}
                    </motion.button>
                  </div>
                </motion.div>
              )}

              {inputMode === "file" && (
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.5 }}
                  className="relative"
                >
                  {/* File Upload Component */}
                  <FileUpload 
                    onFileSelect={handleFileUpload}
                    isProcessing={isProcessing}
                  />

                  {/* Glow effect */}
                  <div className={`absolute inset-0 bg-gradient-to-r ${theme.primary} rounded-3xl blur-2xl opacity-10 -z-10`} />
                </motion.div>
              )}

            </div>
          </motion.div>
        )}
        {appState === "playlist" && playlist && (
          <motion.div
            key="playlist"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="container mx-auto px-4 py-8 min-h-screen relative"
          >
            {/* Enhanced Background for Playlist */}
            <div className="absolute inset-0 opacity-20">
              <motion.div
                className={`absolute inset-0 bg-gradient-to-br ${theme.bg}`}
                animate={{
                  background: [
                    `linear-gradient(45deg, ${theme.bg.split(' ')[1]}, ${theme.bg.split(' ')[3]})`,
                    `linear-gradient(135deg, ${theme.bg.split(' ')[3]}, ${theme.bg.split(' ')[1]})`,
                    `linear-gradient(225deg, ${theme.bg.split(' ')[1]}, ${theme.bg.split(' ')[3]})`,
                  ]
                }}
                transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
              />
            </div>

            {/* Floating Music Notes for Playlist */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
              {[...Array(8)].map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute text-white/20 text-lg"
                  style={{ 
                    left: `${10 + i * 12}%`, 
                    top: `${15 + (i % 3) * 25}%` 
                  }}
                  animate={{
                    y: [-10, -30, -10],
                    x: [0, 15, 0],
                    opacity: [0.1, 0.3, 0.1],
                    rotate: [0, 360, 0],
                  }}
                  transition={{
                    duration: 8 + i,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: i * 0.5,
                  }}
                >
                  {['♪', '♫', '♬', '♩'][i % 4]}
                </motion.div>
              ))}
            </div>

            {/* Enhanced Back Button */}
            <motion.button
              onClick={resetApp}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              whileHover={{ scale: 1.05, x: 5 }}
              whileTap={{ scale: 0.95 }}
              className="flex items-center space-x-3 mb-8 px-6 py-3 bg-white/10 hover:bg-white/20 backdrop-blur-xl border border-white/20 rounded-2xl text-white/80 hover:text-white transition-all duration-300 shadow-lg hover:shadow-xl group"
            >
              <motion.div
                animate={{ x: [-2, 2, -2] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              >
                <ArrowLeft className="w-5 h-5" />
              </motion.div>
              <span className="font-medium">Create New Playlist</span>
              <div className={`w-2 h-2 bg-${theme.accent} rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />
            </motion.button>

            {/* Mood Analysis Display */}
            {moodAnalysis && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="mb-8 p-6 bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl shadow-2xl"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-2">Detected Mood</h3>
                    <div className="flex items-center space-x-4">
                      <span className={`px-4 py-2 bg-gradient-to-r ${theme.primary} rounded-full text-white font-medium text-sm`}>
                        {moodAnalysis.mood}
                      </span>
                      <div className="text-white/70 text-sm">
                        Energy: {Math.round(moodAnalysis.energy)}% • 
                        Valence: {Math.round(moodAnalysis.valence)}%
                      </div>
                    </div>
                  </div>
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                    className="text-3xl"
                  >
                    🎵
                  </motion.div>
                </div>
              </motion.div>
            )}

            {/* Enhanced Playlist Display */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.5, duration: 0.5 }}
            >
              <PlaylistDisplay 
                playlist={playlist} 
                onShare={handleShare}
                onSurpriseRemix={handleSurpriseRemix}
              />
            </motion.div>

            {/* Success Celebration Animation */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1 }}
              className="fixed bottom-8 right-8 pointer-events-none"
            >
              {[...Array(5)].map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute text-2xl"
                  animate={{
                    y: [0, -100, -200],
                    x: [0, Math.random() * 100 - 50, Math.random() * 200 - 100],
                    opacity: [1, 0.8, 0],
                    rotate: [0, 360, 720],
                  }}
                  transition={{
                    duration: 3,
                    delay: i * 0.2,
                    ease: "easeOut"
                  }}
                >
                  {['🎉', '✨', '🎵', '🎶', '💫'][i]}
                </motion.div>
              ))}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
