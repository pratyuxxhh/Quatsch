import React from 'react';
import HeroSectionAnimationWrapper from './HeroSectionAnimationWrapper';


//form here we can change the background , foreground text on the dashboard 
const HeroSection = () => {
  return (
    <div className="relative h-screen w-full bg-gradient-to-br from-black-900/80 via-black/80 to-gray-900/80 overflow-hidden">
      {/* Radial gradient overlay for depth */}
      <div 
        className="absolute inset-0 opacity-40"
        style={{
          background: 'radial-gradient(circle at center, transparent 0%, rgba(17, 24, 39, 0.3) 50%, black 80%)'
        }}
      ></div>
      
      {/* Content container */}
      <div className="relative z-10 h-full flex items-center">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <div className="flex items-center justify-center lg:justify-start min-h-[80vh]">
            {/* Text content - centered on mobile, left-aligned on desktop */}
            <div className="text-center lg:text-left w-full lg:w-2/3">
              <HeroSectionAnimationWrapper />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeroSection;

