"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// Modern Minimalistic Audio Visualizer
function AudioVisualizer() {
  return (
    <div className="flex items-end justify-center space-x-1 h-16">
      {[...Array(5)].map((_, i) => (
        <motion.div
          key={i}
          className="bg-gradient-to-t from-purple-600 to-pink-500 rounded-full"
          style={{ width: '4px' }}
          animate={{
            height: [16, 32, 24, 40, 20, 32, 16],
            opacity: [0.4, 1, 0.7, 1, 0.6, 1, 0.4],
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            delay: i * 0.1,
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  );
}

// Floating Musical Notes
function FloatingNotes() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {/* Subtle floating dots for visual interest without emojis */}
      {[...Array(4)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-2 h-2 bg-purple-400/20 rounded-full"
          style={{
            left: `${20 + i * 20}%`,
            top: `${30 + i * 15}%`,
          }}
          animate={{
            y: [-20, -40, -20],
            opacity: [0.2, 0.6, 0.2],
            scale: [0.8, 1.2, 0.8],
          }}
          transition={{
            duration: 3 + i * 0.5,
            repeat: Infinity,
            delay: i * 0.8,
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  );
}

// Modern Progress Ring
function ProgressRing({ progress }: { progress: number }) {
  const circumference = 2 * Math.PI * 45;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <div className="relative w-32 h-32">
      <svg className="w-32 h-32 transform -rotate-90" viewBox="0 0 100 100">
        {/* Background circle */}
        <circle
          cx="50"
          cy="50"
          r="45"
          stroke="rgba(139, 92, 246, 0.1)"
          strokeWidth="2"
          fill="none"
        />
        {/* Progress circle */}
        <motion.circle
          cx="50"
          cy="50"
          r="45"
          stroke="url(#gradient)"
          strokeWidth="2"
          fill="none"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        />
        <defs>
          <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#8b5cf6" />
            <stop offset="100%" stopColor="#ec4899" />
          </linearGradient>
        </defs>
      </svg>
      
      {/* Progress percentage */}
      <div className="absolute inset-0 flex items-center justify-center">
        <motion.span
          className="text-2xl font-light text-white"
          animate={{ scale: [1, 1.05, 1] }}
          transition={{ duration: 0.5 }}
        >
          {progress}%
        </motion.span>
      </div>
    </div>
  );
}

interface Music3DLoaderProps {
  onComplete: () => void;
}

export default function Music3DLoader({ onComplete }: Music3DLoaderProps) {
  const [progress, setProgress] = useState(0);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(() => {
            setIsVisible(false);
            setTimeout(onComplete, 500);
          }, 1000);
          return 100;
        }
        return prev + 2;
      });
    }, 100);

    return () => clearInterval(interval);
  }, [onComplete]);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.8, ease: [0.4, 0, 0.2, 1] }}
          className="fixed inset-0 z-50 bg-black"
        >
          {/* Floating Musical Notes */}
          <FloatingNotes />
          
          {/* Subtle Grid Pattern */}
          <div 
            className="absolute inset-0 opacity-[0.02]"
            style={{
              backgroundImage: `
                linear-gradient(rgba(139, 92, 246, 0.1) 1px, transparent 1px),
                linear-gradient(90deg, rgba(139, 92, 246, 0.1) 1px, transparent 1px)
              `,
              backgroundSize: '50px 50px'
            }}
          />

          {/* Main Content */}
          <div className="relative z-10 flex flex-col items-center justify-center min-h-screen p-8">
            {/* Brand */}
            <motion.div
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 1, delay: 0.2, ease: [0.4, 0, 0.2, 1] }}
              className="text-center mb-16"
            >
              <motion.h1 
                className="text-5xl md:text-6xl font-extralight text-white mb-3 tracking-tight"
                animate={{ 
                  backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
                }}
                transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                style={{
                  background: 'linear-gradient(90deg, #ffffff, #8b5cf6, #ec4899, #ffffff)',
                  backgroundSize: '200% 100%',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                }}
              >
                MoodTune AI
              </motion.h1>
              <motion.p 
                className="text-xl text-white/90 font-light tracking-wide"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8, duration: 0.8 }}
              >
                Voice-to-Vibe Emotional Music Companion
              </motion.p>
            </motion.div>

            {/* Audio Visualizer */}
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.5, ease: [0.4, 0, 0.2, 1] }}
              className="mb-12"
            >
              <AudioVisualizer />
            </motion.div>

            {/* Progress Ring */}
            <motion.div
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 1, delay: 0.8, ease: [0.4, 0, 0.2, 1] }}
              className="mb-8"
            >
              <ProgressRing progress={progress} />
            </motion.div>

            {/* Status Text */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.8, delay: 1, ease: [0.4, 0, 0.2, 1] }}
              className="text-center"
            >
              <motion.p 
                className="text-white/70 font-light tracking-wide"
                animate={{ opacity: [0.6, 1, 0.6] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              >
                {progress < 25 && "Initializing audio engine..."}
                {progress >= 25 && progress < 50 && "Loading AI models..."}
                {progress >= 50 && progress < 75 && "Preparing voice analysis..."}
                {progress >= 75 && progress < 95 && "Finalizing setup..."}
                {progress >= 95 && "Ready to launch!"}
              </motion.p>
            </motion.div>
          </div>

          {/* Ambient Effects */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {/* Subtle radial gradient */}
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-radial from-purple-500/5 via-transparent to-transparent rounded-full" />
            
            {/* Animated orbs */}
            <motion.div
              className="absolute top-1/4 left-1/4 w-2 h-2 bg-purple-400/20 rounded-full blur-sm"
              animate={{
                x: [0, 100, 0],
                y: [0, -50, 0],
                opacity: [0.2, 0.8, 0.2],
              }}
              transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
            />
            <motion.div
              className="absolute top-3/4 right-1/4 w-1 h-1 bg-pink-400/30 rounded-full blur-sm"
              animate={{
                x: [0, -80, 0],
                y: [0, 60, 0],
                opacity: [0.3, 0.7, 0.3],
              }}
              transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 2 }}
            />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
