import React from 'react';
import { motion } from 'framer-motion';

const Dashboard = () => {
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
              Dashboard
            </h1>
            <p className="text-lg md:text-xl text-gray-300 max-w-2xl">
              Monitor and explore Earth's data in real-time. Track climate patterns, geographic changes, and environmental metrics.
            </p>
          </motion.div>

          {/* Dashboard Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-12">
            {[
              { title: 'Climate Data', description: 'Real-time temperature and weather patterns', icon: '🌡️' },
              { title: 'Geographic Maps', description: 'Interactive maps and terrain visualization', icon: '🗺️' },
              { title: 'Environmental Metrics', description: 'Air quality, pollution levels, and more', icon: '🌍' },
              { title: 'Historical Trends', description: 'Compare data across different time periods', icon: '📊' },
              { title: 'Satellite Imagery', description: 'Latest satellite views of Earth', icon: '🛰️' },
              { title: 'Data Analytics', description: 'Advanced insights and predictions', icon: '📈' },
            ].map((card, index) => (
              <motion.div
                key={index}
                variants={itemVariants}
                className="bg-gray-900/60 backdrop-blur-sm rounded-lg p-6 border border-gray-800 hover:border-cyan-500 transition-all duration-300 hover:shadow-lg hover:shadow-cyan-500/20"
              >
                <div className="text-4xl mb-4">{card.icon}</div>
                <h3 className="text-xl font-semibold text-white mb-2">{card.title}</h3>
                <p className="text-gray-400">{card.description}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Dashboard;

