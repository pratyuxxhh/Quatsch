import React from 'react';
// eslint-disable-next-line no-unused-vars
import { motion } from 'framer-motion';

const HeroSectionAnimationWrapper = () => {
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
        className="text-5xl md:text-6xl lg:text-7xl font-bold text-white leading-tight"
      >
        EXPLORE OUR PLANET'S DATA
      </motion.h1>

      {/* Subtext */}
      <motion.p
        variants={itemVariants}
        className="text-lg md:text-xl text-gray-300 max-w-2xl leading-relaxed"
      >
        Interactive maps, real-time data streams, and educational courses on Earth's climate and geography.
      </motion.p>

      {/* CTA Button */}
      <motion.div variants={itemVariants} className="flex lg:block justify-center lg:justify-start">
        <button className="group relative inline-flex items-center justify-center px-8 py-4 text-base font-semibold text-white bg-gradient-to-r from-cyan-500 to-blue-600 rounded-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 overflow-hidden">
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

