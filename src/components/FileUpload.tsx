"use client";

import React, { useRef, useState } from 'react';
import { motion } from 'framer-motion';

interface FileUploadProps {
  onFileSelect: (file: File) => void;
  isProcessing: boolean;
}

export default function FileUpload({ onFileSelect, isProcessing }: FileUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const handleFileSelect = (file: File) => {
    if (file && file.type.startsWith('audio/')) {
      setSelectedFile(file);
      onFileSelect(file);
    } else {
      alert('Please select an audio file (WAV, MP3, etc.)');
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      handleFileSelect(e.target.files[0]);
    }
  };

  const openFileDialog = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <motion.div
        className={`relative border-2 border-dashed rounded-2xl p-8 text-center transition-all duration-300 cursor-pointer
          ${dragActive 
            ? 'border-purple-400 bg-purple-500/10' 
            : 'border-white/30 hover:border-white/50 bg-white/5'
          }
          ${isProcessing ? 'opacity-50 pointer-events-none' : ''}
        `}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={openFileDialog}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="audio/*"
          onChange={handleChange}
          className="hidden"
        />
        
        <div className="flex flex-col items-center space-y-4">
          <motion.div
            className="w-16 h-16 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 flex items-center justify-center"
            animate={{ rotate: isProcessing ? 360 : 0 }}
            transition={{ duration: 2, repeat: isProcessing ? Infinity : 0, ease: "linear" }}
          >
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
          </motion.div>
          
          <div>
            <p className="text-white font-medium mb-2">
              {selectedFile ? selectedFile.name : 'Upload Audio File'}
            </p>
            <p className="text-white/60 text-sm">
              {selectedFile 
                ? `${(selectedFile.size / 1024 / 1024).toFixed(2)} MB` 
                : 'Drag & drop or click to select'
              }
            </p>
            <p className="text-white/40 text-xs mt-2">
              Supports WAV, MP3, M4A, OGG
            </p>
          </div>
        </div>

        {isProcessing && (
          <motion.div
            className="absolute inset-0 bg-black/20 rounded-2xl flex items-center justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <div className="text-white text-sm">Processing...</div>
          </motion.div>
        )}
      </motion.div>

      {selectedFile && !isProcessing && (
        <motion.button
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          onClick={() => onFileSelect(selectedFile)}
          className="w-full mt-4 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-medium hover:shadow-lg transition-all duration-300"
        >
          Analyze Audio Mood 🎵
        </motion.button>
      )}
    </div>
  );
}
