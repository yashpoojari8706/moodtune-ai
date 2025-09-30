"use client";
import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { Mic, MicOff, Square, Play } from "lucide-react";

interface VoiceRecorderProps {
  onRecordingComplete: (audioBlob: Blob) => void;
  maxDuration?: number;
}

export default function VoiceRecorder({ 
  onRecordingComplete, 
  maxDuration = 10 
}: VoiceRecorderProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (audioUrl) URL.revokeObjectURL(audioUrl);
    };
  }, [audioUrl]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: "audio/webm" });
        setAudioBlob(blob);
        const url = URL.createObjectURL(blob);
        setAudioUrl(url);
        onRecordingComplete(blob);
        
        // Stop all tracks
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingTime(0);

      // Start timer
      timerRef.current = setInterval(() => {
        setRecordingTime(prev => {
          if (prev >= maxDuration - 1) {
            stopRecording();
            return maxDuration;
          }
          return prev + 1;
        });
      }, 1000);

    } catch (error) {
      console.error("Error accessing microphone:", error);
      alert("Could not access microphone. Please check permissions.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }
  };

  const playRecording = () => {
    if (audioUrl && audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
        setIsPlaying(false);
      } else {
        audioRef.current.play();
        setIsPlaying(true);
      }
    }
  };

  const resetRecording = () => {
    setAudioBlob(null);
    if (audioUrl) {
      URL.revokeObjectURL(audioUrl);
      setAudioUrl(null);
    }
    setRecordingTime(0);
    setIsPlaying(false);
  };

  return (
    <div className="flex flex-col items-center space-y-4">
      {/* Recording Button */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={isRecording ? stopRecording : startRecording}
        disabled={audioBlob !== null}
        className={`
          relative w-20 h-20 rounded-full flex items-center justify-center
          transition-all duration-300 shadow-lg
          ${isRecording 
            ? "bg-red-500 hover:bg-red-600" 
            : audioBlob 
            ? "bg-gray-400 cursor-not-allowed" 
            : "bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
          }
        `}
      >
        {isRecording ? (
          <Square className="w-8 h-8 text-white" />
        ) : audioBlob ? (
          <MicOff className="w-8 h-8 text-white" />
        ) : (
          <Mic className="w-8 h-8 text-white" />
        )}
        
        {/* Pulsing animation while recording */}
        {isRecording && (
          <motion.div
            className="absolute inset-0 rounded-full bg-red-400"
            animate={{ scale: [1, 1.2, 1], opacity: [0.7, 0.3, 0.7] }}
            transition={{ duration: 1, repeat: Infinity }}
          />
        )}
      </motion.button>

      {/* Timer */}
      {(isRecording || recordingTime > 0) && (
        <div className="text-lg font-mono">
          {Math.floor(recordingTime / 60)}:{(recordingTime % 60).toString().padStart(2, '0')} / {maxDuration}s
        </div>
      )}

      {/* Recording Status */}
      <div className="text-center">
        {isRecording ? (
          <p className="text-red-500 font-medium">Recording your vibe...</p>
        ) : audioBlob ? (
          <p className="text-green-500 font-medium">Recording captured!</p>
        ) : (
          <p className="text-gray-600">Tap to record your 10-second mood rant</p>
        )}
      </div>

      {/* Playback Controls */}
      {audioBlob && audioUrl && (
        <div className="flex items-center space-x-4">
          <button
            onClick={playRecording}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
          >
            <Play className="w-4 h-4" />
            <span>{isPlaying ? "Pause" : "Play"}</span>
          </button>
          
          <button
            onClick={resetRecording}
            className="px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg transition-colors"
          >
            Record Again
          </button>
        </div>
      )}

      {/* Hidden audio element for playback */}
      {audioUrl && (
        <audio
          ref={audioRef}
          src={audioUrl}
          onEnded={() => setIsPlaying(false)}
          className="hidden"
        />
      )}
    </div>
  );
}
