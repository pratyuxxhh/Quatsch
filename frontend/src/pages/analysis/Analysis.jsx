import React from 'react';
import { motion } from 'framer-motion';

const Analysis = () => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, x: -50 },
    visible: {
      opacity: 1,
      x: 0,
      transition: {
        duration: 0.6,
        ease: 'easeOut',
      },
    },
  };

  return (
    <div className="relative min-h-screen w-full bg-gradient-to-br from-black-900/80 via-black/80 to-gray-900/80 pt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="space-y-8"
        >
          {/* Page Header */}
          <motion.div variants={itemVariants}>
            <h1 className="text-5xl md:text-6xl font-bold text-white mb-4">
              Analysis
            </h1>
            <p className="text-lg md:text-xl text-gray-300 max-w-2xl">
              Deep dive into Earth's data with advanced analytical tools and insights. Understand patterns, trends, and correlations.
            </p>
          </motion.div>

          {/* Analysis Sections */}
          <div className="space-y-8 mt-12">
            {[
              {
                title: 'Climate Analysis',
                description: 'Comprehensive analysis of climate patterns, temperature trends, and weather anomalies across different regions.',
                features: ['Temperature trends', 'Precipitation analysis', 'Weather pattern recognition', 'Climate predictions'],
              },
              {
                title: 'Geographic Analysis',
                description: 'Study geographic changes, terrain analysis, and spatial data visualization.',
                features: ['Terrain mapping', 'Elevation analysis', 'Geographic changes', 'Spatial correlations'],
              },
              {
                title: 'Environmental Analysis',
                description: 'Analyze environmental factors including air quality, pollution levels, and ecosystem health.',
                features: ['Air quality metrics', 'Pollution tracking', 'Ecosystem health', 'Environmental impact'],
              },
            ].map((section, index) => (
              <motion.div
                key={index}
                variants={itemVariants}
                className="bg-gray-900/60 backdrop-blur-sm rounded-lg p-8 border border-gray-800 hover:border-cyan-500 transition-all duration-300"
              >
                <h2 className="text-2xl font-semibold text-white mb-3">{section.title}</h2>
                <p className="text-gray-400 mb-4">{section.description}</p>
                <ul className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {section.features.map((feature, idx) => (
                    <li key={idx} className="text-gray-300 flex items-center">
                      <span className="text-cyan-400 mr-2">→</span>
                      {feature}
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Analysis;

