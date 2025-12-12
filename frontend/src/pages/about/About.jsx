import React from 'react';
// eslint-disable-next-line no-unused-vars
import { motion } from 'framer-motion';

const About = () => {
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
          className="space-y-12"
        >
          {/* Page Header */}
          <motion.div variants={itemVariants}>
            <h1 className="text-5xl md:text-6xl font-bold text-white mb-4">
              About Quatsch
            </h1>
            <p className="text-lg md:text-xl text-gray-300 max-w-3xl">
              Quatsch is an interactive platform for exploring Earth's data through maps, real-time streams, and educational content.
            </p>
          </motion.div>

          {/* Mission Section */}
          <motion.div variants={itemVariants} className="bg-gray-900/60 backdrop-blur-sm rounded-lg p-8 border border-gray-800">
            <h2 className="text-3xl font-semibold text-white mb-4">Our Mission</h2>
            <p className="text-gray-300 leading-relaxed">
              To make Earth's climate and geographic data accessible, understandable, and actionable. We believe that 
              understanding our planet is the first step toward protecting it. Through interactive visualizations, 
              comprehensive analysis tools, and educational resources, we empower users to explore and understand 
              the complex systems that shape our world.
            </p>
          </motion.div>

          {/* Features Section */}
          <motion.div variants={itemVariants}>
            <h2 className="text-3xl font-semibold text-white mb-6">What We Offer</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[
                {
                  title: 'Interactive Maps',
                  description: 'Explore Earth through interactive 3D globes and detailed maps with real-time data overlays.',
                },
                {
                  title: 'Data Analysis',
                  description: 'Deep dive into climate patterns, geographic changes, and environmental metrics with advanced analytical tools.',
                },
                {
                  title: 'Comparison Tools',
                  description: 'Compare data across time periods, regions, and metrics to understand changes and trends.',
                },
                {
                  title: 'Educational Resources',
                  description: 'Learn about Earth\'s systems, climate science, and geography through comprehensive courses and guides.',
                },
              ].map((feature, index) => (
                <div
                  key={index}
                  className="bg-gray-900/60 backdrop-blur-sm rounded-lg p-6 border border-gray-800 hover:border-cyan-500 transition-all duration-300"
                >
                  <h3 className="text-xl font-semibold text-white mb-2">{feature.title}</h3>
                  <p className="text-gray-400">{feature.description}</p>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Contact Section */}
          <motion.div variants={itemVariants} className="bg-gradient-to-r from-cyan-500/20 to-blue-600/20 backdrop-blur-sm rounded-lg p-8 border border-cyan-500/30">
            <h2 className="text-3xl font-semibold text-white mb-4">Get in Touch</h2>
            <p className="text-gray-300 mb-6">
              Have questions, suggestions, or want to collaborate? We'd love to hear from you.
            </p>
            <button className="px-8 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-semibold rounded-lg hover:shadow-lg hover:shadow-cyan-500/50 transition-all duration-300">
              Contact Us
            </button>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};

export default About;

