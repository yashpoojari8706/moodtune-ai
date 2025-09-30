"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import { Play, Pause, Share2, Heart, ExternalLink, Shuffle } from "lucide-react";

export interface Track {
  id: string;
  title: string;
  artist: string;
  album?: string;
  duration?: string;
  preview_url?: string;
  external_url?: string;
  vibe_note: string;
  mood_match: number; // 0-100
}

export interface Playlist {
  id: string;
  name: string;
  description: string;
  mood_detected: string;
  tracks: Track[];
  created_at: string;
}

interface PlaylistDisplayProps {
  playlist: Playlist;
  onShare?: (playlist: Playlist) => void;
  onSurpriseRemix?: () => void;
}

export default function PlaylistDisplay({ 
  playlist, 
  onShare, 
  onSurpriseRemix 
}: PlaylistDisplayProps) {
  const [currentlyPlaying, setCurrentlyPlaying] = useState<string | null>(null);
  const [likedTracks, setLikedTracks] = useState<Set<string>>(new Set());

  const togglePlay = (trackId: string, previewUrl?: string) => {
    if (!previewUrl) return;
    
    if (currentlyPlaying === trackId) {
      setCurrentlyPlaying(null);
      // In a real app, pause the audio here
    } else {
      setCurrentlyPlaying(trackId);
      // In a real app, play the audio here
    }
  };

  const toggleLike = (trackId: string) => {
    const newLiked = new Set(likedTracks);
    if (newLiked.has(trackId)) {
      newLiked.delete(trackId);
    } else {
      newLiked.add(trackId);
    }
    setLikedTracks(newLiked);
  };

  const getMoodColor = (moodMatch: number) => {
    if (moodMatch >= 90) return "text-green-400";
    if (moodMatch >= 70) return "text-blue-400";
    if (moodMatch >= 50) return "text-yellow-400";
    return "text-orange-400";
  };

  const getMoodLabel = (moodMatch: number) => {
    if (moodMatch >= 90) return "Perfect Match";
    if (moodMatch >= 70) return "Great Match";
    if (moodMatch >= 50) return "Good Match";
    return "Decent Match";
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="w-full max-w-2xl mx-auto bg-white/10 backdrop-blur-sm rounded-xl border border-white/20 overflow-hidden"
    >
      {/* Playlist Header */}
      <div className="p-6 bg-gradient-to-r from-purple-600/20 to-pink-600/20">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold text-white mb-2">{playlist.name}</h2>
            <p className="text-white/80 text-sm mb-2">{playlist.description}</p>
            <div className="flex items-center space-x-2 text-sm">
              <span className="px-2 py-1 bg-white/20 rounded-full text-white/90">
                Mood: {playlist.mood_detected}
              </span>
              <span className="text-white/60">
                {playlist.tracks.length} tracks
              </span>
            </div>
          </div>
          
          <div className="flex space-x-2">
            {onSurpriseRemix && (
              <button
                onClick={onSurpriseRemix}
                className="p-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors"
                title="Surprise Remix"
              >
                <Shuffle className="w-5 h-5 text-white" />
              </button>
            )}
            
            {onShare && (
              <button
                onClick={() => onShare(playlist)}
                className="p-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors"
                title="Share Playlist"
              >
                <Share2 className="w-5 h-5 text-white" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Track List */}
      <div className="p-6 space-y-4">
        {playlist.tracks.map((track, index) => (
          <motion.div
            key={track.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className="group p-4 bg-white/5 hover:bg-white/10 rounded-lg transition-all duration-200"
          >
            <div className="flex items-center space-x-4">
              {/* Track Number & Play Button */}
              <div className="flex-shrink-0 w-10 h-10 flex items-center justify-center">
                {track.preview_url ? (
                  <button
                    onClick={() => togglePlay(track.id, track.preview_url)}
                    className="w-8 h-8 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center transition-colors"
                  >
                    {currentlyPlaying === track.id ? (
                      <Pause className="w-4 h-4 text-white" />
                    ) : (
                      <Play className="w-4 h-4 text-white ml-0.5" />
                    )}
                  </button>
                ) : (
                  <span className="text-white/60 font-mono text-sm">
                    {(index + 1).toString().padStart(2, '0')}
                  </span>
                )}
              </div>

              {/* Track Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-2 mb-1">
                  <h3 className="font-medium text-white truncate">{track.title}</h3>
                  <span className={`text-sm ${getMoodColor(track.mood_match)}`}>
                    {track.mood_match}%
                  </span>
                </div>
                <p className="text-white/70 text-sm truncate">{track.artist}</p>
                {track.album && (
                  <p className="text-white/50 text-xs truncate">{track.album}</p>
                )}
              </div>

              {/* Duration */}
              {track.duration && (
                <div className="text-white/60 text-sm font-mono">
                  {track.duration}
                </div>
              )}

              {/* Actions */}
              <div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={() => toggleLike(track.id)}
                  className={`p-1.5 rounded-full transition-colors ${
                    likedTracks.has(track.id)
                      ? "text-red-400 hover:text-red-300"
                      : "text-white/40 hover:text-white/60"
                  }`}
                >
                  <Heart className="w-4 h-4" fill={likedTracks.has(track.id) ? "currentColor" : "none"} />
                </button>
                
                {track.external_url && (
                  <a
                    href={track.external_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-1.5 text-white/40 hover:text-white/60 transition-colors"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>
                )}
              </div>
            </div>

            {/* Vibe Note */}
            <div className="mt-3 p-3 bg-white/5 rounded-lg">
              <p className="text-white/80 text-sm italic">
                {track.vibe_note}
              </p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Footer */}
      <div className="p-4 bg-white/5 text-center">
        <p className="text-white/60 text-xs">
          Generated on {new Date(playlist.created_at).toLocaleDateString()} • 
          Powered by MoodTune AI
        </p>
      </div>
    </motion.div>
  );
}
