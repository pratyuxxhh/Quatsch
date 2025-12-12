import React from 'react';
import { motion } from 'framer-motion';

const Compare = () => {
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
              Compare
            </h1>
            <p className="text-lg md:text-xl text-gray-300 max-w-2xl">
              Compare Earth's data across different time periods, regions, and metrics. Visualize changes and differences.
            </p>
          </motion.div>

          {/* Comparison Tools */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-12">
            {[
              {
                title: 'Time Comparison',
                description: 'Compare data from different time periods to see how Earth has changed over time.',
                icon: '⏱️',
                comparisons: ['Year-over-year', 'Decade comparison', 'Historical trends', 'Future projections'],
              },
              {
                title: 'Regional Comparison',
                description: 'Compare data across different regions, countries, and continents.',
                icon: '🌎',
                comparisons: ['Country comparison', 'Continent analysis', 'Regional patterns', 'Geographic differences'],
              },
              {
                title: 'Metric Comparison',
                description: 'Compare different metrics side-by-side to understand correlations and relationships.',
                icon: '📊',
                comparisons: ['Temperature vs Precipitation', 'Elevation vs Climate', 'Population vs Environment', 'Custom metrics'],
              },
              {
                title: 'Visual Comparison',
                description: 'Side-by-side visual comparisons with interactive maps and charts.',
                icon: '👁️',
                comparisons: ['Map overlays', 'Chart comparisons', 'Visual diff', 'Interactive sliders'],
              },
            ].map((tool, index) => (
              <motion.div
                key={index}
                variants={itemVariants}
                className="bg-gray-900/60 backdrop-blur-sm rounded-lg p-6 border border-gray-800 hover:border-cyan-500 transition-all duration-300 hover:shadow-lg hover:shadow-cyan-500/20"
              >
                <div className="flex items-start mb-4">
                  <div className="text-4xl mr-4">{tool.icon}</div>
                  <div>
                    <h3 className="text-xl font-semibold text-white mb-2">{tool.title}</h3>
                    <p className="text-gray-400 text-sm mb-3">{tool.description}</p>
                  </div>
                </div>
                <ul className="space-y-1">
                  {tool.comparisons.map((comp, idx) => (
                    <li key={idx} className="text-gray-300 text-sm flex items-center">
                      <span className="text-cyan-400 mr-2">•</span>
                      {comp}
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

export default Compare;

