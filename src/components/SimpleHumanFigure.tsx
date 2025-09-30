"use client";

import React from 'react';
import { motion } from 'framer-motion';

export default function SimpleHumanFigure() {
  return (
    <div className="relative flex items-center justify-center h-96 w-96">
      {/* Sound waves around the figure */}
      <motion.div
        className="absolute inset-0 border-2 border-purple-500/30 rounded-full"
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.3, 0.1, 0.3],
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
      <motion.div
        className="absolute inset-4 border-2 border-pink-500/30 rounded-full"
        animate={{
          scale: [1, 1.3, 1],
          opacity: [0.2, 0.05, 0.2],
        }}
        transition={{
          duration: 3.5,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 0.5,
        }}
      />
      <motion.div
        className="absolute inset-8 border-2 border-indigo-500/30 rounded-full"
        animate={{
          scale: [1, 1.4, 1],
          opacity: [0.1, 0.02, 0.1],
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 1,
        }}
      />

      {/* Human figure */}
      <motion.div
        className="relative z-10"
        animate={{
          y: [-5, 5, -5],
          rotateY: [-2, 2, -2],
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      >
        {/* Head */}
        <motion.div
          className="w-16 h-16 bg-gradient-to-b from-gray-700 to-gray-800 rounded-full mx-auto mb-2 relative shadow-lg"
          animate={{
            rotateX: [0, -5, 0, 5, 0],
          }}
          transition={{
            duration: 6,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        >
          {/* Eyes */}
          <div className="absolute top-5 left-4 w-2 h-2 bg-white/20 rounded-full"></div>
          <div className="absolute top-5 right-4 w-2 h-2 bg-white/20 rounded-full"></div>
        </motion.div>

        {/* Headphones */}
        <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-2">
          {/* Headphone band */}
          <div className="w-20 h-10 border-4 border-purple-500 rounded-t-full relative">
            {/* Left ear cup */}
            <motion.div
              className="absolute -left-2 top-6 w-8 h-8 bg-gradient-to-br from-purple-500 to-purple-700 rounded-full shadow-lg"
              animate={{
                boxShadow: [
                  "0 0 10px rgba(139, 92, 246, 0.5)",
                  "0 0 20px rgba(139, 92, 246, 0.8)",
                  "0 0 10px rgba(139, 92, 246, 0.5)",
                ],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            >
              <div className="absolute inset-1 bg-purple-400 rounded-full opacity-50"></div>
            </motion.div>
            
            {/* Right ear cup */}
            <motion.div
              className="absolute -right-2 top-6 w-8 h-8 bg-gradient-to-br from-purple-500 to-purple-700 rounded-full shadow-lg"
              animate={{
                boxShadow: [
                  "0 0 10px rgba(139, 92, 246, 0.5)",
                  "0 0 20px rgba(139, 92, 246, 0.8)",
                  "0 0 10px rgba(139, 92, 246, 0.5)",
                ],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut",
                delay: 0.3,
              }}
            >
              <div className="absolute inset-1 bg-purple-400 rounded-full opacity-50"></div>
            </motion.div>
          </div>
        </div>

        {/* Body */}
        <div className="w-12 h-20 bg-gradient-to-b from-gray-800 to-gray-900 rounded-lg mx-auto shadow-lg relative">
          {/* Arms */}
          <motion.div
            className="absolute -left-4 top-2 w-3 h-12 bg-gradient-to-b from-gray-800 to-gray-900 rounded-full transform -rotate-12 shadow-md"
            animate={{
              rotate: [-12, -8, -12],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          ></motion.div>
          <motion.div
            className="absolute -right-4 top-2 w-3 h-12 bg-gradient-to-b from-gray-800 to-gray-900 rounded-full transform rotate-12 shadow-md"
            animate={{
              rotate: [12, 8, 12],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 0.5,
            }}
          ></motion.div>
        </div>

        {/* Legs */}
        <div className="flex justify-center space-x-2 mt-1">
          <div className="w-3 h-16 bg-gradient-to-b from-gray-900 to-black rounded-full shadow-md"></div>
          <div className="w-3 h-16 bg-gradient-to-b from-gray-900 to-black rounded-full shadow-md"></div>
        </div>
      </motion.div>

    </div>
  );
}
