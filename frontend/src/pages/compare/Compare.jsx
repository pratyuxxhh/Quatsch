import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ParticlesBackground from '../../components/ParticlesBackground';

const years = Array.from({ length: 10 }, (_, i) => 2016 + i);

const Compare = () => {
  const [region, setRegion] = useState('');
  const [year1, setYear1] = useState(2020);
  const [year2, setYear2] = useState(2024);
  const [showBlender, setShowBlender] = useState(false);
  const [showHeatmap, setShowHeatmap] = useState(false);
  const [transparency, setTransparency] = useState(50);

  // Dummy image URLs - replace with actual backend URLs later
  const dummyImage1 = 'https://via.placeholder.com/800x600/1a1a2e/00d4ff?text=Night+Lights+' + year1;
  const dummyImage2 = 'https://via.placeholder.com/800x600/16213e/00d4ff?text=Night+Lights+' + year2;
  const dummyHeatmap = 'https://via.placeholder.com/800x600/ff6b6b/ffffff?text=Heatmap+Comparison';

  const handleCompare = (e) => {
    e.preventDefault();
    if (region.trim() && year1 && year2) {
      setShowBlender(true);
      setShowHeatmap(false); // Reset heatmap when new comparison is made
    }
  };

  const handleGenerateHeatmap = () => {
    setShowHeatmap(true);
  };

  const handleDownloadHeatmap = () => {
    // Create a temporary link to download the heatmap
    const link = document.createElement('a');
    link.href = dummyHeatmap;
    link.download = `heatmap_${region}_${year1}_vs_${year2}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="relative min-h-screen w-full bg-black pt-20 flex justify-center px-4 pb-10">
      <ParticlesBackground />
      <div className="relative z-10 w-full max-w-6xl">
        <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2">Compare</h1>
        <p className="text-gray-300 mb-6 text-sm sm:text-base">
          Select a region and two years to compare night lights data. Blend images and generate heatmaps to analyze brightness changes.
        </p>

        <div className="space-y-6">
          {/* Selection Form */}
          <AnimatePresence mode="wait">
            {!showBlender && (
              <motion.form
                key="form"
                onSubmit={handleCompare}
                className="space-y-4 bg-gray-900/80 border border-gray-800 rounded-2xl shadow-2xl backdrop-blur-sm p-6 sm:p-8"
                initial={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.35 }}
              >
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm text-gray-400 mb-2">Region</label>
                    <input
                      type="text"
                      value={region}
                      onChange={(e) => setRegion(e.target.value)}
                      placeholder="e.g., Tamil Nadu, California"
                      className="w-full px-3 py-2 rounded-lg bg-gray-800/80 border border-gray-700 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm text-gray-400 mb-2">Year 1</label>
                    <select
                      value={year1}
                      onChange={(e) => setYear1(Number(e.target.value))}
                      className="w-full px-3 py-2 rounded-lg bg-gray-800/80 border border-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                    >
                      {years.map((y) => (
                        <option key={y} value={y}>
                          {y}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm text-gray-400 mb-2">Year 2</label>
                    <select
                      value={year2}
                      onChange={(e) => setYear2(Number(e.target.value))}
                      className="w-full px-3 py-2 rounded-lg bg-gray-800/80 border border-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                    >
                      {years
                        .filter((y) => y !== year1)
                        .map((y) => (
                          <option key={y} value={y}>
                            {y}
                          </option>
                        ))}
                    </select>
                  </div>
                </div>

                <div className="flex justify-end">
                  <button
                    type="submit"
                    className="px-6 py-2.5 rounded-lg bg-cyan-500 hover:bg-cyan-600 text-white font-semibold shadow-lg shadow-cyan-500/30 transition-colors"
                  >
                    Compare
                  </button>
                </div>
              </motion.form>
            )}
          </AnimatePresence>

          {/* Blender Section */}
          <AnimatePresence>
            {showBlender && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.35 }}
                className="bg-gray-900/80 border border-gray-800 rounded-2xl shadow-2xl backdrop-blur-sm p-6 sm:p-8 space-y-6"
              >
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div>
                    <h2 className="text-2xl font-bold text-white">
                      {region || 'Selected Region'}
                    </h2>
                    <p className="text-gray-400 text-sm">
                      Comparing {year1} vs {year2}
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      setShowBlender(false);
                      setShowHeatmap(false);
                    }}
                    className="px-4 py-2 rounded-lg border border-gray-600 text-gray-300 hover:bg-gray-800 transition-colors text-sm font-semibold"
                  >
                    New Comparison
                  </button>
                </div>

                {/* Image Blender */}
                <div className="relative w-full aspect-video bg-gray-800 rounded-lg overflow-hidden border border-gray-700">
                  {/* Base Image (Year 1) */}
                  <img
                    src={dummyImage1}
                    alt={`Night Lights ${year1}`}
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                  {/* Overlay Image (Year 2) with transparency */}
                  <div
                    className="absolute inset-0 w-full h-full"
                    style={{
                      opacity: transparency / 100,
                    }}
                  >
                    <img
                      src={dummyImage2}
                      alt={`Night Lights ${year2}`}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  
                  {/* Year Labels */}
                  <div className="absolute top-4 left-4 bg-black/70 backdrop-blur-sm px-3 py-1.5 rounded-lg border border-gray-600">
                    <p className="text-white text-sm font-medium">
                      {year1}
                    </p>
                  </div>
                  <div className="absolute top-4 right-4 bg-black/70 backdrop-blur-sm px-3 py-1.5 rounded-lg border border-gray-600">
                    <p className="text-white text-sm font-medium">
                      {year2}
                    </p>
                  </div>
                </div>

                {/* Transparency Slider */}
                <div className="bg-gray-800/70 border border-gray-700 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <label className="text-white font-medium text-base">Blend Transparency</label>
                    <span className="text-cyan-400 font-bold text-lg">{transparency}%</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-gray-400 text-sm">{year1}</span>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={transparency}
                      onChange={(e) => setTransparency(Number(e.target.value))}
                      className="flex-1 h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
                      style={{
                        background: `linear-gradient(to right, #06b6d4 0%, #06b6d4 ${transparency}%, #374151 ${transparency}%, #374151 100%)`,
                      }}
                    />
                    <span className="text-gray-400 text-sm">{year2}</span>
                  </div>
                  <p className="text-gray-500 text-xs mt-2 text-center">
                    Adjust slider to blend between the two years
                  </p>
                </div>

                {/* Generate Heatmap Button */}
                {!showHeatmap && (
                  <div className="flex justify-center">
                    <button
                      onClick={handleGenerateHeatmap}
                      className="px-6 py-3 rounded-lg bg-cyan-500 hover:bg-cyan-600 text-white font-semibold shadow-lg shadow-cyan-500/30 transition-colors"
                    >
                      Generate Heatmap
                    </button>
                  </div>
                )}

                {/* Heatmap Section */}
                <AnimatePresence>
                  {showHeatmap && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.35 }}
                      className="space-y-4"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <div>
                          <h3 className="text-xl font-bold text-white">Brightness Comparison Heatmap</h3>
                          <p className="text-gray-400 text-sm">
                            Heatmap showing brightness spikes between {year1} and {year2}
                          </p>
                        </div>
                        <button
                          onClick={handleDownloadHeatmap}
                          className="px-4 py-2 rounded-lg border border-cyan-500 text-cyan-300 hover:bg-cyan-500/10 transition-colors text-sm font-semibold"
                        >
                          Download Heatmap
                        </button>
                      </div>

                      <div className="relative w-full aspect-video bg-gray-800 rounded-lg overflow-hidden border border-gray-700">
                        <img
                          src={dummyHeatmap}
                          alt="Heatmap Comparison"
                          className="w-full h-full object-cover"
                        />
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <style jsx>{`
        .slider::-webkit-slider-thumb {
          appearance: none;
          width: 18px;
          height: 18px;
          border-radius: 50%;
          background: #06b6d4;
          cursor: pointer;
          border: 2px solid #fff;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
        }

        .slider::-moz-range-thumb {
          width: 18px;
          height: 18px;
          border-radius: 50%;
          background: #06b6d4;
          cursor: pointer;
          border: 2px solid #fff;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
        }
      `}</style>
    </div>
  );
};

export default Compare;

