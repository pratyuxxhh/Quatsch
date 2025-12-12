import React, { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import HeroSection from '../components/HeroSection';
import EarthGlobe from '../components/EarthGlobe';

const Home = () => {
  const earthTextureUrl = '/brighter25.png';

  return (
    <div className="relative w-full h-screen overflow-hidden">
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
};

export default Home;

