import React, { Suspense, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import HeroSection from '../components/HeroSection';
import EarthGlobe from '../components/EarthGlobe';
import ParticlesBackground from '../components/ParticlesBackground';

const Home = () => {
  const earthTextureUrl = '/brighter25.png';
  const [chaosMode, setChaosMode] = useState(false);

  return (
    <div className="relative w-full h-screen overflow-hidden">
      {/* Chaos Mode Button - Top Left */}
      <button
        onClick={() => setChaosMode(!chaosMode)}
        className={`absolute top-4 left-4 z-50 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-300 ${
          chaosMode
            ? 'bg-red-600 hover:bg-red-700 text-white shadow-lg shadow-red-500/50 animate-pulse'
            : 'bg-gray-800/80 hover:bg-gray-700/80 text-gray-300 border border-gray-600'
        }`}
        title={chaosMode ? 'Disable Chaos Mode' : 'Enable Chaos Mode'}
      >
        {chaosMode ? '🌪️ CHAOS' : '⚡ Chaos'}
      </button>

      {/* Particles Background - Behind everything */}
      <ParticlesBackground chaosMode={chaosMode} />
      
      {/* 3D Canvas - Full screen, positioned behind UI */}
      <div className="absolute inset-0 z-0 bg-transparent pointer-events-none">
        <Canvas
          camera={{ position: [0, 0, 6.1], fov: 50 }}
          gl={{ antialias: true }}
        >
          <ambientLight intensity={chaosMode ? 2.5 : 1.9} />
          <directionalLight position={chaosMode ? [Math.random() * 10, Math.random() * 10, Math.random() * 10] : [5, 15, 5]} intensity={chaosMode ? 2.0 : 1.5} />
          <pointLight position={chaosMode ? [Math.random() * 10 - 5, Math.random() * 10 - 5, Math.random() * 10 - 5] : [-5, -5, -5]} intensity={chaosMode ? 2.0 : 1.5} />
          <Suspense fallback={null}>
            <EarthGlobe earthTextureUrl={earthTextureUrl} chaosMode={chaosMode} />
          </Suspense>
        </Canvas>
      </div>

      {/* Hero Section with 2D UI overlay */}
      <div className={`relative z-20 transition-all duration-500 ${chaosMode ? 'animate-pulse' : ''}`}>
        <HeroSection chaosMode={chaosMode} />
      </div>
    </div>
  );
};

export default Home;

