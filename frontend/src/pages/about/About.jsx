import React from 'react';
import { motion } from 'framer-motion';
import ParticlesBackground from '../../components/ParticlesBackground';

const About = () => {
  const API_BASE_URL = 'http://localhost:5000';
  
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
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: 'easeOut',
      },
    },
  };

  return (
    <div className="relative min-h-screen w-full bg-gradient-to-br from-black-900/80 via-black/80 to-gray-900/80 pt-20">
      <ParticlesBackground />
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="space-y-16"
        >
          {/* Name of Website Section */}
          <motion.section variants={itemVariants} className="text-center">
            <h1 className="text-6xl md:text-7xl font-display font-bold mb-4 bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 bg-clip-text text-transparent">
              Quatsch
            </h1>
            <p className="text-xl md:text-2xl text-gray-300 max-w-3xl mx-auto">
              Advanced Earth Data Analytics Platform
            </p>
          </motion.section>

          {/* What Are We Section */}
          <motion.section variants={itemVariants} className="bg-gray-900/60 backdrop-blur-sm rounded-2xl p-8 md:p-12 border border-gray-800">
            <h2 className="text-4xl md:text-5xl font-display font-bold text-white mb-6">
              What Are We?
            </h2>
            <div className="space-y-4 text-gray-300 text-lg leading-relaxed">
              <p>
                Quatsch is a cutting-edge platform designed to explore, analyze, and visualize Earth's data through 
                interactive maps, real-time satellite streams, and comprehensive analytical tools. We transform complex 
                geospatial and climate data into actionable insights.
              </p>
              <p>
                Our mission is to make Earth's data accessible, understandable, and actionable for researchers, 
                policymakers, and curious minds alike. Through advanced visualization techniques and powerful analytics, 
                we empower users to understand the complex systems that shape our planet.
              </p>
            </div>
          </motion.section>

          {/* Application Section */}
          <motion.section variants={itemVariants}>
            <h2 className="text-4xl md:text-5xl font-display font-bold text-white mb-8">Application</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                {
                  title: 'Interactive Mapping',
                  description: 'Explore Earth through interactive 3D globes and detailed maps with real-time data overlays and satellite imagery.',
                  icon: '🌍',
                },
                {
                  title: 'Data Analysis',
                  description: 'Deep dive into climate patterns, geographic changes, and environmental metrics with advanced analytical tools.',
                  icon: '📊',
                },
                {
                  title: 'Regional Comparison',
                  description: 'Compare data across different time periods, regions, and metrics to understand changes and trends.',
                  icon: '🔄',
                },
                {
                  title: 'Anomaly Detection',
                  description: 'AI-powered detection of unusual patterns and anomalies in geographic and climate data.',
                  icon: '🔍',
                },
                {
                  title: 'Real-time Monitoring',
                  description: 'Monitor Earth\'s changes in real-time with live satellite data streams and updates.',
                  icon: '📡',
                },
                {
                  title: 'Report Generation',
                  description: 'Generate comprehensive PDF reports with visualizations, insights, and recommendations.',
                  icon: '📄',
                },
              ].map((app, index) => (
                <div
                  key={index}
                  className="bg-gray-900/60 backdrop-blur-sm rounded-xl p-6 border border-gray-800 hover:border-cyan-500 transition-all duration-300 hover:shadow-lg hover:shadow-cyan-500/20"
                >
                  <div className="text-4xl mb-4">{app.icon}</div>
                  <h3 className="text-xl font-semibold text-white mb-2">{app.title}</h3>
                  <p className="text-gray-400 text-sm leading-relaxed">{app.description}</p>
                </div>
              ))}
            </div>
          </motion.section>

          {/* Database Section */}
          <motion.section variants={itemVariants} className="bg-gray-900/60 backdrop-blur-sm rounded-2xl p-8 md:p-12 border border-gray-800">
            <h2 className="text-4xl md:text-5xl font-display font-bold text-white mb-8">Data Sources</h2>
            <p className="text-gray-300 mb-8 text-lg">
              We aggregate data from trusted sources to provide comprehensive Earth analytics:
            </p>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {[
                {
                  name: 'NASA',
                  logo: '🚀',
                  description: 'Satellite imagery & climate data',
                },
                {
                  name: 'VIIRS',
                  logo: '🛰️',
                  description: 'Night light data',
                },
                {
                  name: 'USGS',
                  logo: '🗺️',
                  description: 'Geological surveys',
                },
                {
                  name: 'NOAA',
                  logo: '🌊',
                  description: 'Ocean & atmosphere data',
                },
                {
                  name: 'ESA',
                  logo: '🌌',
                  description: 'European space data',
                },
                {
                  name: 'OpenStreetMap',
                  logo: '📍',
                  description: 'Geographic mapping',
                },
                {
                  name: 'World Bank',
                  logo: '🌐',
                  description: 'Economic indicators',
                },
                {
                  name: 'UN Data',
                  logo: '🏛️',
                  description: 'Global statistics',
                },
              ].map((source, index) => (
                <div
                  key={index}
                  className="bg-gray-800/50 backdrop-blur-sm rounded-lg p-6 border border-gray-700 hover:border-cyan-500 transition-all duration-300 text-center"
                >
                  <div className="text-5xl mb-3">{source.logo}</div>
                  <h3 className="text-lg font-semibold text-white mb-2">{source.name}</h3>
                  <p className="text-gray-400 text-xs">{source.description}</p>
                </div>
              ))}
            </div>
          </motion.section>

          {/* Tech Stack Section */}
          <motion.section variants={itemVariants}>
            <h2 className="text-4xl md:text-5xl font-display font-bold text-white mb-8">Tech Stack</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {[
                { name: 'React', color: 'bg-blue-500' },
                { name: 'Three.js', color: 'bg-green-500' },
                { name: 'React Three Fiber', color: 'bg-purple-500' },
                { name: 'Leaflet', color: 'bg-green-600' },
                { name: 'Framer Motion', color: 'bg-pink-500' },
                { name: 'Tailwind CSS', color: 'bg-cyan-500' },
                { name: 'Python', color: 'bg-yellow-500' },
                { name: 'Node.js', color: 'bg-emerald-500' },
                { name: 'PostgreSQL', color: 'bg-blue-600' },
                { name: 'MongoDB', color: 'bg-green-700' },
                { name: 'Express.js', color: 'bg-gray-500' },
                { name: 'Vite', color: 'bg-purple-600' },
              ].map((tech, index) => (
                <div
                  key={index}
                  className={`${tech.color} rounded-lg p-4 text-center text-white font-semibold shadow-lg hover:scale-105 transition-transform duration-200`}
                >
                  {tech.name}
                </div>
              ))}
            </div>
          </motion.section>

          {/* Applications Section */}
          <motion.section variants={itemVariants} className="bg-gray-900/60 backdrop-blur-sm rounded-2xl p-8 md:p-12 border border-gray-800">
            <h2 className="text-4xl md:text-5xl font-display font-bold text-white mb-8">Applications</h2>
            <div className="space-y-6">
              {[
                {
                  title: 'Climate Research',
                  description: 'Scientists and researchers use our platform to study climate patterns, track environmental changes, and analyze long-term trends.',
                },
                {
                  title: 'Urban Planning',
                  description: 'City planners and architects leverage our data visualization tools to understand urban growth patterns and plan sustainable development.',
                },
                {
                  title: 'Disaster Management',
                  description: 'Emergency response teams utilize real-time data to assess disaster impact, plan relief efforts, and monitor recovery progress.',
                },
                {
                  title: 'Environmental Monitoring',
                  description: 'Environmental agencies track deforestation, pollution levels, and ecosystem health using our comprehensive analytics.',
                },
                {
                  title: 'Economic Analysis',
                  description: 'Economists and policy makers analyze regional economic growth through night light data and urbanization patterns.',
                },
                {
                  title: 'Education',
                  description: 'Educational institutions use our interactive visualizations to teach geography, climate science, and data analysis.',
                },
              ].map((application, index) => (
                <div
                  key={index}
                  className="bg-gray-800/50 backdrop-blur-sm rounded-lg p-6 border border-gray-700 hover:border-cyan-500 transition-all duration-300"
                >
                  <h3 className="text-2xl font-semibold text-white mb-3">{application.title}</h3>
                  <p className="text-gray-300 leading-relaxed">{application.description}</p>
                </div>
              ))}
            </div>
          </motion.section>

          {/* Data Cleaning Section */}
          <motion.section variants={itemVariants}>
            <h2 className="text-4xl md:text-5xl font-display font-bold text-white mb-8">Data Processing Pipeline</h2>
            <div className="bg-gray-900/60 backdrop-blur-sm rounded-2xl p-8 md:p-12 border border-gray-800">
              <p className="text-gray-300 mb-6 text-lg leading-relaxed">
                Our data undergoes rigorous cleaning and processing to ensure accuracy and reliability. 
                We employ advanced algorithms to filter noise, validate sources, and transform raw satellite 
                data into actionable insights.
              </p>
              <div className="bg-gray-800/50 rounded-lg p-8 border border-gray-700 flex items-center justify-center">
                <img
                  src={`${API_BASE_URL}/api/images/cleaned/diagnostics/VIIRS_RAD_Tamil Nadu_2025_01_diagnostic.png`}
                  alt="Data Cleaning Diagnostic Visualization"
                  className="max-w-full h-auto object-contain"
                  style={{ maxHeight: '600px' }}
                />
              </div>
            </div>
          </motion.section>

          {/* Contact Section */}
          <motion.section variants={itemVariants} className="bg-gradient-to-r from-cyan-500/20 via-blue-600/20 to-purple-600/20 backdrop-blur-sm rounded-2xl p-8 md:p-12 border border-cyan-500/30">
            <h2 className="text-4xl md:text-5xl font-display font-bold text-white mb-8 text-center">Get in Touch</h2>
            <div className="max-w-2xl mx-auto space-y-6">
              <div className="bg-gray-900/60 backdrop-blur-sm rounded-lg p-6 border border-gray-700">
                <div className="flex items-center gap-4">
                  <div className="text-3xl">📧</div>
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-1">Email</h3>
                    <a href="mailto:contact@quatsch.com" className="text-cyan-400 hover:text-cyan-300 transition-colors">
                      contact@quatsch.com
                    </a>
                  </div>
                </div>
              </div>
              <div className="bg-gray-900/60 backdrop-blur-sm rounded-lg p-6 border border-gray-700">
                <div className="flex items-center gap-4">
                  <div className="text-3xl">📞</div>
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-1">Phone</h3>
                    <a href="tel:+1234567890" className="text-cyan-400 hover:text-cyan-300 transition-colors">
                      +1 (234) 567-890
                    </a>
                  </div>
                </div>
              </div>
              <p className="text-gray-300 text-center text-sm mt-8">
                Have questions, suggestions, or want to collaborate? We'd love to hear from you!
              </p>
            </div>
          </motion.section>
        </motion.div>
      </div>
    </div>
  );
};

export default About;
