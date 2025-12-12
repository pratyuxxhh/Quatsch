import React, { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import Navbar from './components/Navbar';
import HeroSection from './components/HeroSection';
import EarthGlobe from './components/EarthGlobe';
import './App.css';

function App() {
  // Earth texture URL - using a high-quality equirectangular Earth texture
  // This is a reliable public Earth texture URL
  //const earthTextureUrl = 'https://threejs.org/examples/textures/planets/earth_atmos_2048.jpg';
  const earthTextureUrl = '/brighter25.png';

  return (
    <div className="relative w-full h-screen overflow-hidden">
      {/* Navbar */}
      <Navbar />

      {/* 3D Canvas - Full screen, positioned behind UI */}
      <div className="absolute inset-0 z-0 bg-transparent pointer-events-none">
        <Canvas
          camera={{ position: [0, 0, 6.1], fov: 50 }}
          gl={{ antialias: true }}
        >
          <ambientLight intensity={1.9} />
          <directionalLight position={[5, 15, 5]} intensity={1.5} />
          <pointLight position={[-5, -5, -5]} intensity={1.5} />
          <Suspense fallback={null}>
            <EarthGlobe earthTextureUrl={earthTextureUrl} />
          </Suspense>
        </Canvas>
      </div>

      {/* Hero Section with 2D UI overlay */}
      <div className="relative z-20">
        <HeroSection />
      </div>
    </div>
  );
}

export default App;
