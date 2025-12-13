import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

const HeroSectionAnimationWrapper = ({ chaosMode = false }) => {
  const navigate = useNavigate();
  // Animation variants for staggered fade-in
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.3,
        delayChildren: 0.2,
      },
    },
  };

  // Slide content in from left to right with fade
  const itemVariants = {
    hidden: { opacity: 0, x: -40 },
    visible: {
      opacity: 1,
      x: 0,
      transition: {
        duration: 0.7,
        ease: 'easeOut',
      },
    },
  };

  // Chaos mode animation - intense random movements
  const chaosAnimation = chaosMode ? {
    x: [0, 15, -15, 10, -10, 8, -8, 0],
    y: [0, 10, -10, 8, -8, 5, -5, 0],
    rotate: [0, 5, -5, 3, -3, 2, -2, 0],
    scale: [1, 1.05, 0.95, 1.02, 0.98, 1],
    transition: {
      duration: 0.8,
      repeat: Infinity,
      ease: "easeInOut",
    },
  } : {};

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      {/* Headline */}
      <motion.h1
        variants={itemVariants}
        animate={chaosMode ? chaosAnimation : "visible"}
        className={`text-5xl md:text-6xl lg:text-7xl font-bold text-white leading-tight transition-all duration-300 ${
          chaosMode ? 'drop-shadow-[0_0_15px_rgba(255,100,100,0.6)]' : ''
        }`}
      >
        DECODING THE NIGHT ECONOMY
      </motion.h1>

      {/* Subtext */}
      <motion.p
        variants={itemVariants}
        animate={chaosMode ? chaosAnimation : "visible"}
        className="text-lg md:text-xl text-gray-300 max-w-2xl leading-relaxed"
      >
        Interactive maps, satellite analytics, and real-time insights on urbanization and economic growth trends.
      </motion.p>

      {/* CTA Button */}
      <motion.div 
        variants={itemVariants} 
        animate={chaosMode ? chaosAnimation : "visible"}
        className="flex lg:block justify-center lg:justify-start"
      >
        <button 
          onClick={() => navigate('/dashboard')}
          className="group relative inline-flex items-center justify-center px-8 py-4 text-base font-semibold text-white bg-gradient-to-r from-cyan-500 to-blue-600 rounded-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 overflow-hidden cursor-pointer"
        >
          <span className="relative z-10">Start Your Journey</span>
          <span className="relative z-10 ml-2 group-hover:translate-x-1 transition-transform duration-300">
            →
          </span>
          <div className="absolute inset-0 bg-gradient-to-r from-cyan-600 to-blue-700 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        </button>
      </motion.div>
    </motion.div>
  );
};

export default HeroSectionAnimationWrapper;

