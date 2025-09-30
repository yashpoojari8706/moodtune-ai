"use client";

import React, { useRef, useEffect, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Text, Float, Sphere, MeshDistortMaterial, Stars, OrbitControls } from '@react-three/drei';
import { motion, AnimatePresence } from 'framer-motion';
import * as THREE from 'three';

// Floating Music Note Component
function MusicNote({ position, scale = 1 }: { position: [number, number, number]; scale?: number }) {
  const meshRef = useRef<THREE.Mesh>(null);
  
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.01;
      meshRef.current.position.y += Math.sin(state.clock.elapsedTime * 2) * 0.01;
    }
  });

  return (
    <Float speed={1.5} rotationIntensity={0.5} floatIntensity={0.5}>
      <mesh ref={meshRef} position={position} scale={scale}>
        <sphereGeometry args={[0.1, 16, 16]} />
        <meshStandardMaterial color="#8b5cf6" emissive="#4c1d95" emissiveIntensity={0.2} />
      </mesh>
    </Float>
  );
}

// Sound Wave Rings
function SoundWave({ radius = 1, color = "#8b5cf6" }: { radius?: number; color?: string }) {
  const ringRef = useRef<THREE.Mesh>(null);
  
  useFrame((state) => {
    if (ringRef.current) {
      const scale = 1 + Math.sin(state.clock.elapsedTime * 3) * 0.1;
      ringRef.current.scale.setScalar(scale);
      const material = ringRef.current.material as THREE.MeshBasicMaterial;
      material.opacity = 0.3 + Math.sin(state.clock.elapsedTime * 2) * 0.2;
    }
  });

  return (
    <mesh ref={ringRef}>
      <torusGeometry args={[radius, 0.02, 8, 32]} />
      <meshBasicMaterial color={color} transparent opacity={0.3} />
    </mesh>
  );
}

// Particle System for Peace Effect
function PeacefulParticles() {
  const particlesRef = useRef<THREE.Points>(null);
  const particleCount = 100;
  
  const positions = new Float32Array(particleCount * 3);
  for (let i = 0; i < particleCount * 3; i++) {
    positions[i] = (Math.random() - 0.5) * 10;
  }

  useFrame((state) => {
    if (particlesRef.current) {
      particlesRef.current.rotation.y += 0.001;
      const positions = particlesRef.current.geometry.attributes.position.array as Float32Array;
      
      for (let i = 1; i < positions.length; i += 3) {
        positions[i] += Math.sin(state.clock.elapsedTime + i) * 0.001;
      }
      
      particlesRef.current.geometry.attributes.position.needsUpdate = true;
    }
  });

  return (
    <points ref={particlesRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[positions, 3]}
          count={particleCount}
        />
      </bufferGeometry>
      <pointsMaterial color="#a855f7" size={0.02} transparent opacity={0.6} />
    </points>
  );
}

// Central Orb with Distortion
function CentralOrb() {
  const orbRef = useRef<THREE.Mesh>(null);
  
  useFrame((state) => {
    if (orbRef.current) {
      orbRef.current.rotation.x += 0.005;
      orbRef.current.rotation.y += 0.01;
    }
  });

  return (
    <Float speed={2} rotationIntensity={0.3} floatIntensity={0.3}>
      <Sphere ref={orbRef} args={[0.8, 64, 64]}>
        <MeshDistortMaterial
          color="#6366f1"
          attach="material"
          distort={0.3}
          speed={2}
          roughness={0.1}
          metalness={0.8}
        />
      </Sphere>
    </Float>
  );
}

// 3D Scene Component
function Scene() {
  return (
    <>
      <ambientLight intensity={0.3} />
      <pointLight position={[10, 10, 10]} intensity={1} color="#8b5cf6" />
      <pointLight position={[-10, -10, -10]} intensity={0.5} color="#ec4899" />
      
      <Stars radius={100} depth={50} count={1000} factor={4} saturation={0} fade speed={1} />
      
      <CentralOrb />
      
      {/* Sound Wave Rings */}
      <SoundWave radius={1.5} color="#8b5cf6" />
      <SoundWave radius={2.2} color="#ec4899" />
      <SoundWave radius={3} color="#6366f1" />
      
      {/* Floating Music Notes */}
      <MusicNote position={[2, 1, 0]} scale={0.8} />
      <MusicNote position={[-2, -1, 1]} scale={1.2} />
      <MusicNote position={[1, -2, -1]} scale={0.6} />
      <MusicNote position={[-1.5, 2, 0.5]} scale={1} />
      <MusicNote position={[0, 1.5, -2]} scale={0.9} />
      
      <PeacefulParticles />
      
      <OrbitControls enableZoom={false} enablePan={false} autoRotate autoRotateSpeed={0.5} />
    </>
  );
}

// Onboarding Steps
const onboardingSteps = [
  {
    title: "Welcome to MoodTune AI",
    subtitle: "Your voice-powered music companion",
    description: "Discover music that matches your mood through the power of your voice"
  },
  {
    title: "Speak Your Mood",
    subtitle: "Express how you feel",
    description: "Tell us about your current mood, energy level, or what you're doing"
  },
  {
    title: "AI-Powered Curation",
    subtitle: "Intelligent music matching",
    description: "Our AI analyzes your voice and mood to curate the perfect playlist"
  },
  {
    title: "Discover & Enjoy",
    subtitle: "Your personalized experience",
    description: "Enjoy music that truly resonates with your current state of mind"
  }
];

interface OnboardingScreenProps {
  onComplete: () => void;
}

export default function OnboardingScreen({ onComplete }: OnboardingScreenProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [isVisible, setIsVisible] = useState(true);

  const nextStep = () => {
    if (currentStep < onboardingSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      setIsVisible(false);
      setTimeout(onComplete, 500);
    }
  };

  const skipOnboarding = () => {
    setIsVisible(false);
    setTimeout(onComplete, 500);
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
          className="fixed inset-0 z-50 bg-black"
        >
          {/* 3D Background */}
          <div className="absolute inset-0">
            <Canvas camera={{ position: [0, 0, 5], fov: 75 }}>
              <Scene />
            </Canvas>
          </div>

          {/* Content Overlay */}
          <div className="relative z-10 flex flex-col items-center justify-center min-h-screen p-8">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -50 }}
              transition={{ duration: 0.6 }}
              className="text-center max-w-2xl mx-auto"
            >
              <h1 className="text-4xl md:text-6xl font-bold text-white mb-4">
                {onboardingSteps[currentStep].title}
              </h1>
              
              <h2 className="text-xl text-white/90 mb-2 font-normal">
                {onboardingSteps[currentStep].subtitle}
              </h2>
              
              <p className="text-white/70 mb-12 leading-relaxed max-w-2xl mx-auto">
                {onboardingSteps[currentStep].description}
              </p>
            </motion.div>

            {/* Progress Indicators */}
            <div className="flex space-x-3 mb-8">
              {onboardingSteps.map((_, index) => (
                <motion.div
                  key={index}
                  className={`w-3 h-3 rounded-full ${
                    index === currentStep ? 'bg-white' : 'bg-white/30'
                  }`}
                  animate={{
                    scale: index === currentStep ? 1.2 : 1,
                    opacity: index === currentStep ? 1 : 0.5
                  }}
                  transition={{ duration: 0.3 }}
                />
              ))}
            </div>

            {/* Navigation Buttons */}
            <div className="flex space-x-4">
              <motion.button
                onClick={skipOnboarding}
                className="px-6 py-3 text-white/70 hover:text-white transition-colors duration-200"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Skip
              </motion.button>
              
              <motion.button
                onClick={nextStep}
                className="px-8 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-full font-semibold shadow-lg hover:shadow-xl transition-all duration-200"
                whileHover={{ scale: 1.05, boxShadow: "0 20px 40px rgba(139, 92, 246, 0.3)" }}
                whileTap={{ scale: 0.95 }}
              >
                {currentStep === onboardingSteps.length - 1 ? 'Get Started' : 'Next'}
              </motion.button>
            </div>
          </div>

        </motion.div>
      )}
    </AnimatePresence>
  );
}
