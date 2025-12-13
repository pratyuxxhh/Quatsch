import React, { useState, useEffect, useRef } from 'react';
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
  const [comparisonData, setComparisonData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // Pan and zoom state
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const imageContainerRef = useRef(null);

  const API_BASE_URL = 'http://localhost:5000';

  // Fetch comparison data when years are selected
  useEffect(() => {
    const fetchComparison = async () => {
      if (!showBlender || !region || !year1 || !year2) {
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const response = await fetch(
          `${API_BASE_URL}/api/compare?region=${encodeURIComponent(region)}&year1=${year1}&year2=${year2}`,
          {
            credentials: 'include',
          }
        );

        if (!response.ok) {
          throw new Error(`Failed to fetch comparison: ${response.status}`);
        }

        const result = await response.json();

        if (result.success) {
          setComparisonData(result);
        } else {
          throw new Error(result.message || 'Failed to load comparison data');
        }
      } catch (err) {
        console.error('Error fetching comparison:', err);
        setError(err.message);
        setComparisonData(null);
      } finally {
        setLoading(false);
      }
    };

    fetchComparison();
  }, [showBlender, region, year1, year2]);

  const handleCompare = (e) => {
    e.preventDefault();
    if (region.trim() && year1 && year2) {
      setShowBlender(true);
      setShowHeatmap(false);
      setComparisonData(null);
    }
  };

  const handleGenerateHeatmap = () => {
    setShowHeatmap(true);
  };

  const handleDownloadHeatmap = () => {
    // Placeholder for heatmap download
    alert('Heatmap download feature coming soon');
  };

  // Pan and zoom handlers
  const handleWheel = (e) => {
    e.preventDefault();
    const delta = e.deltaY * -0.001;
    const newZoom = Math.min(Math.max(0.5, zoom + delta), 3);
    setZoom(newZoom);
  };

  const handleMouseDown = (e) => {
    if (e.button !== 0) return; // Only handle left mouse button
    setIsDragging(true);
    setDragStart({
      x: e.clientX - pan.x,
      y: e.clientY - pan.y,
    });
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;
    setPan({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y,
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleResetView = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  };

  // Touch handlers for mobile
  const handleTouchStart = (e) => {
    if (e.touches.length === 1) {
      setIsDragging(true);
      setDragStart({
        x: e.touches[0].clientX - pan.x,
        y: e.touches[0].clientY - pan.y,
      });
    }
  };

  const handleTouchMove = (e) => {
    if (!isDragging || e.touches.length !== 1) return;
    e.preventDefault();
    setPan({
      x: e.touches[0].clientX - dragStart.x,
      y: e.touches[0].clientY - dragStart.y,
    });
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
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
                      placeholder="e.g., Tamil Nadu, Maharashtra, Jharkhand, Uttar Pradesh, California"
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

                {/* Loading State */}
                {loading && (
                  <div className="flex items-center justify-center py-12">
                    <div className="text-center">
                      <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-500 mb-2"></div>
                      <p className="text-gray-400 text-sm">Comparing data...</p>
                    </div>
                  </div>
                )}

                {/* Error State */}
                {error && (
                  <div className="p-4 bg-red-900/30 rounded-lg border border-red-700">
                    <p className="text-red-300 text-sm">Error: {error}</p>
                  </div>
                )}

                {/* Image Blender - Display actual PNG images */}
                {!loading && !error && comparisonData && comparisonData.images && (
                  <div className="space-y-4">
                    <div 
                      ref={imageContainerRef}
                      className="relative w-full aspect-video bg-gray-800 rounded-lg overflow-hidden border border-gray-700 cursor-move"
                      onWheel={handleWheel}
                      onMouseDown={handleMouseDown}
                      onMouseMove={handleMouseMove}
                      onMouseUp={handleMouseUp}
                      onMouseLeave={handleMouseUp}
                      onTouchStart={handleTouchStart}
                      onTouchMove={handleTouchMove}
                      onTouchEnd={handleTouchEnd}
                      style={{ touchAction: 'none' }}
                    >
                      <div
                        className="absolute inset-0 w-full h-full"
                        style={{
                          transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
                          transformOrigin: 'center center',
                          transition: isDragging ? 'none' : 'transform 0.1s ease-out',
                        }}
                      >
                    {/* Base Image (Year 1) */}
                    {comparisonData.images.year1_png ? (
                      <img
                        src={`${API_BASE_URL}/api/images/${comparisonData.images.year1_png}`}
                        alt={`Night Lights ${year1}`}
                            className="absolute inset-0 w-full h-full object-contain"
                            draggable={false}
                        onError={(e) => {
                          e.target.style.display = 'none';
                          e.target.nextElementSibling.style.display = 'flex';
                        }}
                      />
                    ) : null}
                    <div 
                      className="absolute inset-0 w-full h-full bg-gradient-to-br from-cyan-900/50 to-gray-900 flex items-center justify-center"
                      style={{ display: comparisonData.images.year1_png ? 'none' : 'flex' }}
                    >
                      <p className="text-gray-500 text-lg">{year1} Data</p>
                    </div>
                    
                    {/* Overlay Image (Year 2) with transparency */}
                    {comparisonData.images.year2_png ? (
                      <div
                            className="absolute inset-0 w-full h-full transition-opacity duration-150 ease-out"
                        style={{
                          opacity: transparency / 100,
                        }}
                      >
                        <img
                          src={`${API_BASE_URL}/api/images/${comparisonData.images.year2_png}`}
                          alt={`Night Lights ${year2}`}
                              className="w-full h-full object-contain"
                              draggable={false}
                          onError={(e) => {
                            e.target.parentElement.style.display = 'none';
                          }}
                        />
                      </div>
                    ) : (
                      <div
                            className="absolute inset-0 w-full h-full transition-opacity duration-150 ease-out"
                        style={{
                          opacity: transparency / 100,
                        }}
                      >
                        <div className="w-full h-full bg-gradient-to-br from-green-900/50 to-gray-900 flex items-center justify-center">
                          <p className="text-gray-500 text-lg">{year2} Data</p>
                        </div>
                      </div>
                    )}
                      </div>
                    
                    {/* Year Labels */}
                      <div className="absolute top-4 left-4 bg-black/70 backdrop-blur-sm px-3 py-1.5 rounded-lg border border-gray-600 z-10">
                      <p className="text-white text-sm font-medium">
                        {year1}
                      </p>
                    </div>
                      <div className="absolute top-4 right-4 bg-black/70 backdrop-blur-sm px-3 py-1.5 rounded-lg border border-gray-600 z-10">
                      <p className="text-white text-sm font-medium">
                        {year2}
                        </p>
                      </div>
                      
                      {/* Reset View Button */}
                      {(zoom !== 1 || pan.x !== 0 || pan.y !== 0) && (
                        <button
                          onClick={handleResetView}
                          className="absolute bottom-4 right-4 bg-black/70 backdrop-blur-sm px-3 py-1.5 rounded-lg border border-gray-600 text-white text-sm font-medium hover:bg-black/90 transition-colors z-10"
                        >
                          Reset View
                        </button>
                      )}
                    </div>

                    {/* Transparency Slider - Moved here, just below image */}
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
                  </div>
                )}

                {/* Fallback if no images available */}
                {!loading && !error && (!comparisonData || !comparisonData.images || (!comparisonData.images.year1_png && !comparisonData.images.year2_png)) && (
                  <div className="relative w-full aspect-video bg-gray-800 rounded-lg overflow-hidden border border-gray-700 flex items-center justify-center">
                    <p className="text-gray-500 text-lg">Image visualization coming soon</p>
                  </div>
                )}

                {/* Comparison Metrics */}
                {!loading && !error && comparisonData && (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-gray-800/70 border border-gray-700 rounded-lg p-4">
                      <p className="text-gray-400 text-xs mb-1">Economic Growth</p>
                      <p className={`text-2xl font-bold ${-comparisonData.changes.gdp_proxy_change >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                        {-comparisonData.changes.gdp_proxy_change >= 0 ? '+' : ''}{-comparisonData.changes.gdp_proxy_change}%
                      </p>
                    </div>
                    <div className="bg-gray-800/70 border border-gray-700 rounded-lg p-4">
                      <p className="text-gray-400 text-xs mb-1">Urban Area Change</p>
                      <p className={`text-2xl font-bold ${-comparisonData.changes.urban_area_change >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                        {-comparisonData.changes.urban_area_change >= 0 ? '+' : ''}{-comparisonData.changes.urban_area_change}%
                      </p>
                    </div>
                    <div className="bg-gray-800/70 border border-gray-700 rounded-lg p-4">
                      <p className="text-gray-400 text-xs mb-1">Mean Intensity</p>
                      <p className={`text-2xl font-bold ${-comparisonData.changes.mean_intensity_change >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                        {-comparisonData.changes.mean_intensity_change >= 0 ? '+' : ''}{-comparisonData.changes.mean_intensity_change}%
                      </p>
                    </div>
                    <div className="bg-gray-800/70 border border-gray-700 rounded-lg p-4">
                      <p className="text-gray-400 text-xs mb-1">Fastest Sector</p>
                      <p className="text-2xl font-bold text-purple-400 capitalize">
                        {comparisonData.insights.fastest_growing_sector}
                      </p>
                    </div>
                  </div>
                )}

                {/* Side-by-Side Comparison Chart */}
                {!loading && !error && comparisonData && (
                  <div className="bg-gray-800/70 border border-gray-700 rounded-lg p-4">
                    <h3 className="text-white font-semibold mb-4">GDP Proxy Comparison (Sum of Lights)</h3>
                    <div className="w-full h-64 bg-gradient-to-b from-cyan-500/10 to-gray-800 rounded-lg relative overflow-hidden">
                      <svg viewBox="0 0 400 200" className="w-full h-full">
                        {/* Year 1 bar */}
                        <rect
                          x="50"
                          y={200 - (comparisonData.year1.gdp_proxy_sol / Math.max(comparisonData.year1.gdp_proxy_sol, comparisonData.year2.gdp_proxy_sol)) * 180}
                          width="120"
                          height={(comparisonData.year1.gdp_proxy_sol / Math.max(comparisonData.year1.gdp_proxy_sol, comparisonData.year2.gdp_proxy_sol)) * 180}
                          fill="#06b6d4"
                          opacity="0.8"
                        />
                        {/* Year 2 bar */}
                        <rect
                          x="230"
                          y={200 - (comparisonData.year2.gdp_proxy_sol / Math.max(comparisonData.year1.gdp_proxy_sol, comparisonData.year2.gdp_proxy_sol)) * 180}
                          width="120"
                          height={(comparisonData.year2.gdp_proxy_sol / Math.max(comparisonData.year1.gdp_proxy_sol, comparisonData.year2.gdp_proxy_sol)) * 180}
                          fill="#10b981"
                          opacity="0.8"
                        />
                        {/* Labels */}
                        <text x="110" y="195" textAnchor="middle" fill="#06b6d4" fontSize="14" fontWeight="bold">
                          {year1}
                        </text>
                        <text x="290" y="195" textAnchor="middle" fill="#10b981" fontSize="14" fontWeight="bold">
                          {year2}
                        </text>
                        {/* Values */}
                        <text x="110" y="15" textAnchor="middle" fill="#fff" fontSize="12">
                          {(comparisonData.year1.gdp_proxy_sol / 1000000).toFixed(1)}M
                        </text>
                        <text x="290" y="15" textAnchor="middle" fill="#fff" fontSize="12">
                          {(comparisonData.year2.gdp_proxy_sol / 1000000).toFixed(1)}M
                        </text>
                      </svg>
                    </div>
                  </div>
                )}

                {/* Sector Breakdown Comparison */}
                {!loading && !error && comparisonData && (
                  <div className="bg-gray-800/70 border border-gray-700 rounded-lg p-4">
                    <h3 className="text-white font-semibold mb-4">Sector Breakdown Comparison</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-gray-400 text-sm mb-2">{year1}</p>
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-amber-500 text-xs">Rural</span>
                            <span className="text-white text-sm">{comparisonData.year1.sector_breakdown.rural.toLocaleString()}</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-blue-500 text-xs">Urban</span>
                            <span className="text-white text-sm">{comparisonData.year1.sector_breakdown.urban.toLocaleString()}</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-purple-500 text-xs">Industrial</span>
                            <span className="text-white text-sm">{comparisonData.year1.sector_breakdown.industrial.toLocaleString()}</span>
                          </div>
                        </div>
                      </div>
                      <div>
                        <p className="text-gray-400 text-sm mb-2">{year2}</p>
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-amber-500 text-xs">Rural</span>
                            <span className="text-white text-sm">{comparisonData.year2.sector_breakdown.rural.toLocaleString()}</span>
                            <span className={`text-xs ${-comparisonData.changes.sector_changes.rural >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                              ({-comparisonData.changes.sector_changes.rural >= 0 ? '+' : ''}{-comparisonData.changes.sector_changes.rural}%)
                            </span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-blue-500 text-xs">Urban</span>
                            <span className="text-white text-sm">{comparisonData.year2.sector_breakdown.urban.toLocaleString()}</span>
                            <span className={`text-xs ${-comparisonData.changes.sector_changes.urban >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                              ({-comparisonData.changes.sector_changes.urban >= 0 ? '+' : ''}{-comparisonData.changes.sector_changes.urban}%)
                            </span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-purple-500 text-xs">Industrial</span>
                            <span className="text-white text-sm">{comparisonData.year2.sector_breakdown.industrial.toLocaleString()}</span>
                            <span className={`text-xs ${-comparisonData.changes.sector_changes.industrial >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                              ({-comparisonData.changes.sector_changes.industrial >= 0 ? '+' : ''}{-comparisonData.changes.sector_changes.industrial}%)
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Detailed Comparison Table */}
                {!loading && !error && comparisonData && (
                  <div className="bg-gray-800/70 border border-gray-700 rounded-lg p-4">
                    <h3 className="text-white font-semibold mb-4">Detailed Metrics Comparison</h3>
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b border-gray-700">
                            <th className="text-left text-gray-400 py-2">Metric</th>
                            <th className="text-right text-gray-400 py-2">{year1}</th>
                            <th className="text-right text-gray-400 py-2">{year2}</th>
                            <th className="text-right text-gray-400 py-2">Change</th>
                          </tr>
                        </thead>
                        <tbody className="text-white">
                          <tr className="border-b border-gray-700/50">
                            <td className="py-2">GDP Proxy (Sum of Lights)</td>
                            <td className="text-right py-2">{(comparisonData.year1.gdp_proxy_sol / 1000000).toFixed(2)}M</td>
                            <td className="text-right py-2">{(comparisonData.year2.gdp_proxy_sol / 1000000).toFixed(2)}M</td>
                            <td className={`text-right py-2 ${-comparisonData.changes.gdp_proxy_change >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                              {-comparisonData.changes.gdp_proxy_change >= 0 ? '+' : ''}{-comparisonData.changes.gdp_proxy_change}%
                            </td>
                          </tr>
                          <tr className="border-b border-gray-700/50">
                            <td className="py-2">Urban Area (km²)</td>
                            <td className="text-right py-2">{comparisonData.year1.urban_area_sqkm.toLocaleString()}</td>
                            <td className="text-right py-2">{comparisonData.year2.urban_area_sqkm.toLocaleString()}</td>
                            <td className={`text-right py-2 ${-comparisonData.changes.urban_area_change >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                              {-comparisonData.changes.urban_area_change >= 0 ? '+' : ''}{-comparisonData.changes.urban_area_change}%
                            </td>
                          </tr>
                          <tr className="border-b border-gray-700/50">
                            <td className="py-2">Mean Intensity (nW)</td>
                            <td className="text-right py-2">{comparisonData.year1.mean_intensity.toFixed(2)}</td>
                            <td className="text-right py-2">{comparisonData.year2.mean_intensity.toFixed(2)}</td>
                            <td className={`text-right py-2 ${-comparisonData.changes.mean_intensity_change >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                              {-comparisonData.changes.mean_intensity_change >= 0 ? '+' : ''}{-comparisonData.changes.mean_intensity_change}%
                            </td>
                          </tr>
                          <tr className="border-b border-gray-700/50">
                            <td className="py-2">Max Intensity (nW)</td>
                            <td className="text-right py-2">{comparisonData.year1.max_intensity.toFixed(2)}</td>
                            <td className="text-right py-2">{comparisonData.year2.max_intensity.toFixed(2)}</td>
                            <td className={`text-right py-2 ${-comparisonData.changes.max_intensity_change >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                              {-comparisonData.changes.max_intensity_change >= 0 ? '+' : ''}{-comparisonData.changes.max_intensity_change}%
                            </td>
                          </tr>
                          <tr className="border-b border-gray-700/50">
                            <td className="py-2">Lit Pixels</td>
                            <td className="text-right py-2">{comparisonData.year1.lit_pixels.toLocaleString()}</td>
                            <td className="text-right py-2">{comparisonData.year2.lit_pixels.toLocaleString()}</td>
                            <td className={`text-right py-2 ${-comparisonData.changes.lit_pixels_change >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                              {-comparisonData.changes.lit_pixels_change >= 0 ? '+' : ''}{-comparisonData.changes.lit_pixels_change}%
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* Insights */}
                {!loading && !error && comparisonData && (
                  <div className="space-y-3">
                    <div className="p-4 bg-gray-800/60 rounded-lg border border-gray-700">
                      <p className="text-gray-200 text-sm">
                        <span className="text-cyan-400 font-semibold">Overall Trend:</span> {(-comparisonData.insights.economic_growth_rate > 0) ? 'Growth' : 'Decline'} - 
                        Economic activity {(-comparisonData.insights.economic_growth_rate > 0) ? 'increased' : 'decreased'} by {Math.abs(-comparisonData.insights.economic_growth_rate)}% 
                        from {year1} to {year2}.
                      </p>
                    </div>
                    <div className="p-4 bg-gray-800/60 rounded-lg border border-gray-700">
                      <p className="text-gray-200 text-sm">
                        <span className="text-green-400 font-semibold">Fastest Growing Sector:</span> {comparisonData.insights.fastest_growing_sector} sector 
                        grew by {Math.abs(-comparisonData.insights.fastest_sector_growth)}%, indicating significant development in this area.
                      </p>
                    </div>
                    <div className="p-4 bg-gray-800/60 rounded-lg border border-gray-700">
                      <p className="text-gray-200 text-sm">
                        <span className="text-yellow-400 font-semibold">Urbanization:</span> Urban area {(-comparisonData.insights.urbanization_rate >= 0) ? 'expanded' : 'contracted'} by 
                        {Math.abs(-comparisonData.insights.urbanization_rate)}%, representing {Math.abs(-comparisonData.absolute_changes.urban_area_diff).toFixed(0)} km² of change.
                      </p>
                    </div>
                    {comparisonData.difference_stats && (
                      <div className="p-4 bg-gray-800/60 rounded-lg border border-gray-700">
                        <p className="text-gray-200 text-sm">
                          <span className="text-purple-400 font-semibold">Spatial Changes:</span> {comparisonData.difference_stats.brightened_pixels.toLocaleString()} pixels brightened, 
                          {comparisonData.difference_stats.darkened_pixels.toLocaleString()} pixels darkened, indicating {comparisonData.difference_stats.brightened_pixels > comparisonData.difference_stats.darkened_pixels ? 'net growth' : 'net decline'} in lighting activity.
                        </p>
                      </div>
                    )}
                  </div>
                )}

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
        .slider {
          transition: background 0.1s ease;
        }

        .slider::-webkit-slider-thumb {
          appearance: none;
          width: 18px;
          height: 18px;
          border-radius: 50%;
          background: #06b6d4;
          cursor: pointer;
          border: 2px solid #fff;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
          transition: transform 0.1s ease, box-shadow 0.1s ease;
        }

        .slider::-webkit-slider-thumb:hover {
          transform: scale(1.1);
          box-shadow: 0 3px 6px rgba(0, 0, 0, 0.4);
        }

        .slider::-webkit-slider-thumb:active {
          transform: scale(1.05);
        }

        .slider::-moz-range-thumb {
          width: 18px;
          height: 18px;
          border-radius: 50%;
          background: #06b6d4;
          cursor: pointer;
          border: 2px solid #fff;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
          transition: transform 0.1s ease, box-shadow 0.1s ease;
        }

        .slider::-moz-range-thumb:hover {
          transform: scale(1.1);
          box-shadow: 0 3px 6px rgba(0, 0, 0, 0.4);
        }

        .slider::-moz-range-thumb:active {
          transform: scale(1.05);
        }
      `}</style>
    </div>
  );
};

export default Compare;

