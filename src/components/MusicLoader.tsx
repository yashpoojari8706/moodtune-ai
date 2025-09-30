"use client";
import { motion } from "framer-motion";

interface MusicLoaderProps {
  headline?: string;
  subcopy?: string;
  stage?: "listening" | "analyzing" | "generating" | "complete";
}

export default function MusicLoader({
  headline = "MoodTune AI is tuning your vibe...",
  subcopy = "Analyzing your mood. Crafting a 5–track vibe set just for you.",
  stage = "analyzing"
}: MusicLoaderProps) {
  const getStageText = () => {
    switch (stage) {
      case "listening":
        return "Listening to your voice input...";
      case "analyzing":
        return "Analyzing your emotional state...";
      case "generating":
        return "Generating your personalized playlist...";
      case "complete":
        return "Your vibe playlist is ready!";
      default:
        return "Processing your mood...";
    }
  };

  return (
    <div
      className="relative flex min-h-[70vh] flex-col items-center justify-center overflow-hidden bg-black"
    >
      <div 
        className="absolute inset-0 opacity-15 pointer-events-none"
        style={{
          backgroundImage:
            "repeating-linear-gradient(90deg, rgba(255,255,255,.06) 0px, rgba(255,255,255,.06) 1px, transparent 1px, transparent 8px)",
        }}
      />
      
      <div className="text-center text-white px-6 z-10">
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight mb-6">
          {headline}
        </h1>

        <div className="mx-auto flex h-24 items-end justify-center space-x-2 md:space-x-3 mb-6">
          {[0, 1, 2, 3, 4, 5, 6].map((i) => (
            <motion.div
              key={i}
              animate={{
                scaleY: [0.4, 1.4, 0.6, 1.2, 0.5],
              }}
              transition={{
                duration: 1.2,
                repeat: Infinity,
                repeatType: "loop",
                ease: "easeInOut",
                delay: i * 0.08,
              }}
              className="w-2 md:w-3 rounded-md shadow-lg"
              style={{
                height: "60px",
                boxShadow: "0 8px 20px rgba(139, 92, 246, 0.3)",
                background:
                  "linear-gradient(180deg, #8b5cf6 0%, #ec4899 70%, #6366f1 100%)",
              }}
            />
          ))}
        </div>

        <div className="mb-4 text-lg font-medium text-white/95">
          {getStageText()}
        </div>

        <div className="text-white/90 text-sm md:text-base mb-3">
          {subcopy}
        </div>

        <div className="text-white/70 text-xs">
          Tip: Try a 10s voice rant or use the mood sliders as fallback.
        </div>
      </div>

      {/* Floating musical notes */}
    </div>
  );
}
