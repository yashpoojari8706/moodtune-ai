"use client";
import { useState } from "react";
import { motion } from "framer-motion";

interface MoodState {
  energy: number;
  valence: number; // positive/negative
  intensity: number;
}

interface MoodSlidersProps {
  onMoodChange: (mood: MoodState) => void;
  initialMood?: MoodState;
}

export default function MoodSliders({ 
  onMoodChange, 
  initialMood = { energy: 50, valence: 50, intensity: 50 } 
}: MoodSlidersProps) {
  const [mood, setMood] = useState<MoodState>(initialMood);

  const handleSliderChange = (key: keyof MoodState, value: number) => {
    const newMood = { ...mood, [key]: value };
    setMood(newMood);
    onMoodChange(newMood);
  };

  const getMoodDescription = () => {
    const { energy, valence, intensity } = mood;
    
    let energyDesc = energy > 70 ? "high-energy" : energy > 30 ? "moderate" : "chill";
    let valenceDesc = valence > 70 ? "upbeat" : valence > 30 ? "neutral" : "melancholic";
    let intensityDesc = intensity > 70 ? "intense" : intensity > 30 ? "balanced" : "subtle";
    
    return `${energyDesc}, ${valenceDesc}, ${intensityDesc}`;
  };

  const getMoodIndicator = () => {
    const { energy, valence } = mood;
    
    if (valence > 70 && energy > 70) return "High Energy";
    if (valence > 70 && energy < 30) return "Peaceful";
    if (valence < 30 && energy > 70) return "Intense";
    if (valence < 30 && energy < 30) return "Low Energy";
    if (valence > 50 && energy > 50) return "Positive";
    if (valence < 50 && energy > 50) return "Energetic";
    if (valence > 50 && energy < 50) return "Calm";
    return "Neutral";
  };

  return (
    <div className="w-full max-w-md mx-auto space-y-6 p-6 bg-white/10 backdrop-blur-sm rounded-xl border border-white/20">
      <div className="text-center">
        <div className="text-lg font-semibold text-white mb-2 px-4 py-2 bg-white/10 rounded-lg border border-white/20">
          {getMoodIndicator()}
        </div>
        <h3 className="text-lg font-semibold text-white mb-1">Manual Mood Tuning</h3>
        <p className="text-sm text-white/80 capitalize">{getMoodDescription()}</p>
      </div>

      <div className="space-y-4">
        {/* Energy Slider */}
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <label className="text-sm font-medium text-white">Energy Level</label>
            <span className="text-xs text-white/70">{mood.energy}%</span>
          </div>
          <div className="relative">
            <input
              type="range"
              min="0"
              max="100"
              value={mood.energy}
              onChange={(e) => handleSliderChange('energy', parseInt(e.target.value))}
              className="w-full h-2 bg-white/20 rounded-lg appearance-none cursor-pointer slider-energy"
            />
            <div className="flex justify-between text-xs text-white/60 mt-1">
              <span>Chill</span>
              <span>Energetic</span>
            </div>
          </div>
        </div>

        {/* Valence Slider */}
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <label className="text-sm font-medium text-white">Mood Tone</label>
            <span className="text-xs text-white/70">{mood.valence}%</span>
          </div>
          <div className="relative">
            <input
              type="range"
              min="0"
              max="100"
              value={mood.valence}
              onChange={(e) => handleSliderChange('valence', parseInt(e.target.value))}
              className="w-full h-2 bg-white/20 rounded-lg appearance-none cursor-pointer slider-valence"
            />
            <div className="flex justify-between text-xs text-white/60 mt-1">
              <span>Sad</span>
              <span>Happy</span>
            </div>
          </div>
        </div>

        {/* Intensity Slider */}
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <label className="text-sm font-medium text-white">Intensity</label>
            <span className="text-xs text-white/70">{mood.intensity}%</span>
          </div>
          <div className="relative">
            <input
              type="range"
              min="0"
              max="100"
              value={mood.intensity}
              onChange={(e) => handleSliderChange('intensity', parseInt(e.target.value))}
              className="w-full h-2 bg-white/20 rounded-lg appearance-none cursor-pointer slider-intensity"
            />
            <div className="flex justify-between text-xs text-white/60 mt-1">
              <span>Subtle</span>
              <span>Intense</span>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .slider-energy::-webkit-slider-thumb {
          appearance: none;
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: linear-gradient(45deg, #f59e0b, #ef4444);
          cursor: pointer;
          box-shadow: 0 2px 6px rgba(0,0,0,0.3);
        }
        
        .slider-valence::-webkit-slider-thumb {
          appearance: none;
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: linear-gradient(45deg, #3b82f6, #10b981);
          cursor: pointer;
          box-shadow: 0 2px 6px rgba(0,0,0,0.3);
        }
        
        .slider-intensity::-webkit-slider-thumb {
          appearance: none;
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: linear-gradient(45deg, #8b5cf6, #ec4899);
          cursor: pointer;
          box-shadow: 0 2px 6px rgba(0,0,0,0.3);
        }

        .slider-energy::-moz-range-thumb,
        .slider-valence::-moz-range-thumb,
        .slider-intensity::-moz-range-thumb {
          width: 20px;
          height: 20px;
          border-radius: 50%;
          border: none;
          cursor: pointer;
          box-shadow: 0 2px 6px rgba(0,0,0,0.3);
        }
      `}</style>
    </div>
  );
}
