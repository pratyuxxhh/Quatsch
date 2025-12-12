import React, { useState, useMemo, useEffect } from "react";
// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from "framer-motion";
import { MapContainer, TileLayer, Marker } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import ParticlesBackground from "../../components/ParticlesBackground";

const years = Array.from({ length: 10 }, (_, i) => 2016 + i);

// eslint-disable-next-line no-unused-vars
const generateMockGrowth = (startYear, endYear) => {
  const data = [];
  let value = 100;
  for (let y = startYear; y <= endYear; y++) {
    const delta = (Math.sin(y) + 1) * 4 + Math.random() * 2;
    value += delta;
    data.push({ year: y, value: Math.round(value) });
  }
  return data;
};

// eslint-disable-next-line no-unused-vars
const buildGrowthInsights = (region, data) => {
  if (!region || !data.length) return [];
  const growth = data[data.length - 1].value - data[0].value;
  const avg = data.reduce((a, b) => a + b.value, 0) / data.length;
  return [
    `${region} shows an overall growth of ${growth.toFixed(0)} units across the selected period.`,
    `Average index during the period: ${avg.toFixed(1)} units.`,
    `Peak growth year: ${data.reduce((max, d) => (d.value > max.value ? d : max), data[0]).year}.`,
  ];
};

const centerLookup = {
  california: [36.7783, -119.4179],
  texas: [31.9686, -99.9018],
  florida: [27.6648, -81.5158],
  "new york": [43.0, -75.0],
  "united states": [39.8283, -98.5795],
  usa: [39.8283, -98.5795],
  india: [20.5937, 78.9629],
  maharashtra: [19.7515, 75.7139],
  kerala: [10.8505, 76.2711],
  delhi: [28.7041, 77.1025],
  europe: [54.526, 15.2551],
  asia: [34.0479, 100.6197],
};

const getRegionCenter = (name) => {
  if (!name) return [20, 0];
  const key = name.toLowerCase().trim();
  return centerLookup[key] || [20, 0];
};

const buildAnomalyInsights = (anomalyData) => {
  if (!anomalyData || !anomalyData.anomalies || anomalyData.anomalies.length === 0) return [];
  
  const insights = [
    `${anomalyData.results.total_anomalies} anomalies detected in ${anomalyData.region} (${anomalyData.target_year}).`,
    `Overall lighting growth: ${anomalyData.results.overall_lighting_growth}%`,
    `Total anomalous pixels: ${anomalyData.results.total_anomalous_pixels}`,
  ];
  
  if (anomalyData.anomalies.length > 0) {
    const topAnomaly = anomalyData.anomalies[0];
    insights.push(`Top anomaly: Intensity gain of ${topAnomaly.intensity_gain} nW at (${topAnomaly.lat.toFixed(4)}, ${topAnomaly.lon.toFixed(4)})`);
  }
  
  return insights;
};

const anomalyIcon = L.divIcon({
  className: "anomaly-dot",
  iconSize: [12, 12],
});

const Analysis = () => {
  const [region, setRegion] = useState("");
  const [startYear, setStartYear] = useState(2018);
  const [endYear, setEndYear] = useState(2024);
  const [growthAnalysis, setGrowthAnalysis] = useState(true);
  const [anomalyDetection, setAnomalyDetection] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [anomalyData, setAnomalyData] = useState(null);
  const [anomalyLoading, setAnomalyLoading] = useState(false);
  const [anomalyError, setAnomalyError] = useState(null);
  const [growthData, setGrowthData] = useState(null);
  const [growthLoading, setGrowthLoading] = useState(false);
  const [growthError, setGrowthError] = useState(null);

  const API_BASE_URL = 'http://localhost:5000';

  // Fetch growth data when growth analysis is enabled
  useEffect(() => {
    const fetchGrowthData = async () => {
      if (!growthAnalysis || !region || !showResults) {
        setGrowthData(null);
        return;
      }

      setGrowthLoading(true);
      setGrowthError(null);

      try {
        const response = await fetch(
          `${API_BASE_URL}/api/analysis/growth?region=${encodeURIComponent(region)}&start_year=${startYear}&end_year=${endYear}`,
          {
            credentials: 'include',
          }
        );

        if (!response.ok) {
          throw new Error(`Failed to fetch growth data: ${response.status}`);
        }

        const result = await response.json();

        if (result.success) {
          setGrowthData(result);
        } else {
          throw new Error(result.message || 'Failed to load growth data');
        }
      } catch (err) {
        console.error('Error fetching growth data:', err);
        setGrowthError(err.message);
        setGrowthData(null);
      } finally {
        setGrowthLoading(false);
      }
    };

    fetchGrowthData();
  }, [growthAnalysis, region, startYear, endYear, showResults]);

  // Fetch anomalies when anomaly detection is enabled and region is set
  useEffect(() => {
    const fetchAnomalies = async () => {
      if (!anomalyDetection || !region || !showResults) {
        setAnomalyData(null);
        return;
      }

      setAnomalyLoading(true);
      setAnomalyError(null);

      try {
        const response = await fetch(
          `${API_BASE_URL}/api/analysis/anomalies?region=${encodeURIComponent(region)}`,
          {
            credentials: 'include',
          }
        );

        if (!response.ok) {
          throw new Error(`Failed to fetch anomalies: ${response.status}`);
        }

        const result = await response.json();

        if (result.success) {
          setAnomalyData(result);
        } else {
          throw new Error(result.message || 'Failed to load anomalies');
        }
      } catch (err) {
        console.error('Error fetching anomalies:', err);
        setAnomalyError(err.message);
        setAnomalyData(null);
      } finally {
        setAnomalyLoading(false);
      }
    };

    fetchAnomalies();
  }, [anomalyDetection, region, showResults]);

  const anomalyInsights = useMemo(
    () => buildAnomalyInsights(anomalyData),
    [anomalyData],
  );

  const handleSubmit = (e) => {
    e.preventDefault();
    setShowResults(true);
  };

  const handleDownload = () => {
    // Placeholder: integrate real PDF generation later
    window.print();
  };

  const showGrowth = showResults && growthAnalysis;
  const showAnomaly = showResults && anomalyDetection;

  return (
    <div className="relative min-h-screen w-full bg-black pt-20 flex justify-center px-4 pb-10">
      <ParticlesBackground />
      <div className="relative z-10 w-full max-w-5xl">
        <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2">Analysis</h1>
        <p className="text-gray-300 mb-6 text-sm sm:text-base">
          Select a region, set a year range (2016–2025), choose analysis types, and click Analyze.
        </p>

        <div className="space-y-4">
          <AnimatePresence mode="wait">
            {!showResults && (
              <motion.form
                key="form"
                onSubmit={handleSubmit}
                className="space-y-4 bg-gray-900/80 border border-gray-800 rounded-2xl shadow-2xl backdrop-blur-sm p-6 sm:p-8"
                initial={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.35 }}
              >
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-gray-400 mb-2">Region</label>
                    <input
                      type="text"
                      value={region}
                      onChange={(e) => setRegion(e.target.value)}
                      placeholder="e.g., California, Maharashtra, Europe"
                      className="w-full px-3 py-2 rounded-lg bg-gray-800/80 border border-gray-700 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm text-gray-400 mb-2">Start Year</label>
                      <select
                        value={startYear}
                        onChange={(e) => setStartYear(Number(e.target.value))}
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
                      <label className="block text-sm text-gray-400 mb-2">End Year</label>
                      <select
                        value={endYear}
                        onChange={(e) => setEndYear(Number(e.target.value))}
                        className="w-full px-3 py-2 rounded-lg bg-gray-800/80 border border-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                      >
                        {years
                          .filter((y) => y >= startYear)
                          .map((y) => (
                            <option key={y} value={y}>
                              {y}
                            </option>
                          ))}
                      </select>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex items-center justify-between rounded-lg border border-gray-700 bg-gray-800/70 px-4 py-3">
                    <div>
                      <p className="text-white font-semibold">Growth Analysis</p>
                      <p className="text-gray-400 text-xs">Track growth trends over the selected years.</p>
                    </div>
                    <label className="inline-flex items-center cursor-pointer relative">
                      <input
                        type="checkbox"
                        checked={growthAnalysis}
                        onChange={(e) => setGrowthAnalysis(e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-600 rounded-full peer peer-checked:after:translate-x-full peer-checked:bg-cyan-500 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all" />
                    </label>
                  </div>

                  <div className="flex items-center justify-between rounded-lg border border-gray-700 bg-gray-800/70 px-4 py-3">
                    <div>
                      <p className="text-white font-semibold">Anomaly Detection</p>
                      <p className="text-gray-400 text-xs">Highlight anomalies on the region map.</p>
                    </div>
                    <label className="inline-flex items-center cursor-pointer relative">
                      <input
                        type="checkbox"
                        checked={anomalyDetection}
                        onChange={(e) => setAnomalyDetection(e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-600 rounded-full peer peer-checked:after:translate-x-full peer-checked:bg-cyan-500 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all" />
                    </label>
                  </div>
                </div>

                <div className="flex justify-end">
                  <button
                    type="submit"
                    className="px-5 py-2.5 rounded-lg bg-cyan-500 hover:bg-cyan-600 text-white font-semibold shadow-lg shadow-cyan-500/30 transition-colors"
                  >
                    Analyze
                  </button>
                </div>
              </motion.form>
            )}
          </AnimatePresence>

          <AnimatePresence mode="wait">
            {showResults && (
              <motion.div
                key="results"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.35 }}
                className="space-y-6"
              >
                {showGrowth && (
                  <div className="bg-gray-900/80 border border-gray-800 rounded-2xl shadow-2xl backdrop-blur-sm p-6 sm:p-8 space-y-6">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                      <div>
                        <p className="text-sm text-gray-400">Growth Analysis</p>
                        <h2 className="text-2xl font-bold text-white">{region || "Selected region"}</h2>
                        <p className="text-gray-400 text-sm">
                          {startYear} – {endYear}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={handleDownload}
                        className="px-4 py-2 rounded-lg border border-cyan-500 text-cyan-300 hover:bg-cyan-500/10 transition-colors text-sm font-semibold"
                      >
                        Download PDF
                      </button>
                    </div>

                    {growthLoading && (
                      <div className="flex items-center justify-center py-12">
                        <div className="text-center">
                          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-500 mb-2"></div>
                          <p className="text-gray-400 text-sm">Analyzing growth data...</p>
                        </div>
                      </div>
                    )}

                    {growthError && (
                      <div className="p-4 bg-red-900/30 rounded-lg border border-red-700">
                        <p className="text-red-300 text-sm">Error: {growthError}</p>
                      </div>
                    )}

                    {!growthLoading && !growthError && growthData && (
                      <>
                        {/* Key Metrics Cards */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          <div className="bg-gray-800/70 border border-gray-700 rounded-lg p-4">
                            <p className="text-gray-400 text-xs mb-1">Economic Growth</p>
                            <p className="text-2xl font-bold text-cyan-400">{growthData.insights.total_economic_growth}%</p>
                          </div>
                          <div className="bg-gray-800/70 border border-gray-700 rounded-lg p-4">
                            <p className="text-gray-400 text-xs mb-1">Industrial Expansion</p>
                            <p className="text-2xl font-bold text-green-400">{growthData.insights.industrial_expansion}%</p>
                          </div>
                          <div className="bg-gray-800/70 border border-gray-700 rounded-lg p-4">
                            <p className="text-gray-400 text-xs mb-1">Urban Sprawl</p>
                            <p className="text-2xl font-bold text-yellow-400">+{growthData.insights.urban_sprawl_sqkm.toFixed(0)} km²</p>
                          </div>
                          <div className="bg-gray-800/70 border border-gray-700 rounded-lg p-4">
                            <p className="text-gray-400 text-xs mb-1">Fastest Sector</p>
                            <p className="text-2xl font-bold text-purple-400">{growthData.insights.fastest_growing_sector}</p>
                          </div>
                        </div>

                        {/* GDP Proxy (Sum of Lights) Chart */}
                        <div className="bg-gray-800/70 border border-gray-700 rounded-lg p-4">
                          <h3 className="text-white font-semibold mb-4">GDP Proxy - Sum of Lights (nW)</h3>
                          <div className="w-full h-64 bg-gradient-to-b from-cyan-500/10 to-gray-800 rounded-lg relative overflow-hidden">
                            <svg viewBox="0 0 400 200" className="w-full h-full">
                              {growthData.timeline.map((d, i) => {
                                if (i === 0) return null;
                                const prev = growthData.timeline[i - 1];
                                const x1 = (i - 1) * (400 / (growthData.timeline.length - 1));
                                const x2 = i * (400 / (growthData.timeline.length - 1));
                                const maxVal = Math.max(...growthData.timeline.map((g) => g.gdp_proxy_sol));
                                const minVal = Math.min(...growthData.timeline.map((g) => g.gdp_proxy_sol));
                                const range = maxVal - minVal || 1;
                                const y1 = 200 - ((prev.gdp_proxy_sol - minVal) / range) * 180;
                                const y2 = 200 - ((d.gdp_proxy_sol - minVal) / range) * 180;
                                return (
                                  <g key={d.year}>
                                    <line
                                      x1={x1}
                                      y1={y1}
                                      x2={x2}
                                      y2={y2}
                                      stroke="#06b6d4"
                                      strokeWidth={3}
                                      strokeLinecap="round"
                                    />
                                    <circle cx={x2} cy={y2} r={4} fill="#06b6d4" />
                                  </g>
                                );
                              })}
                            </svg>
                          </div>
                          <div className="flex justify-between mt-2 text-xs text-gray-400">
                            {growthData.timeline.map((d) => (
                              <span key={d.year}>{d.year}</span>
                            ))}
                          </div>
                        </div>

                        {/* Urban Area Growth Chart */}
                        <div className="bg-gray-800/70 border border-gray-700 rounded-lg p-4">
                          <h3 className="text-white font-semibold mb-4">Urban Area Growth (km²)</h3>
                          <div className="w-full h-64 bg-gradient-to-b from-green-500/10 to-gray-800 rounded-lg relative overflow-hidden">
                            <svg viewBox="0 0 400 200" className="w-full h-full">
                              {growthData.timeline.map((d, i) => {
                                if (i === 0) return null;
                                const prev = growthData.timeline[i - 1];
                                const x1 = (i - 1) * (400 / (growthData.timeline.length - 1));
                                const x2 = i * (400 / (growthData.timeline.length - 1));
                                const maxVal = Math.max(...growthData.timeline.map((g) => g.urban_area_sqkm));
                                const minVal = Math.min(...growthData.timeline.map((g) => g.urban_area_sqkm));
                                const range = maxVal - minVal || 1;
                                const y1 = 200 - ((prev.urban_area_sqkm - minVal) / range) * 180;
                                const y2 = 200 - ((d.urban_area_sqkm - minVal) / range) * 180;
                                return (
                                  <g key={d.year}>
                                    <line
                                      x1={x1}
                                      y1={y1}
                                      x2={x2}
                                      y2={y2}
                                      stroke="#10b981"
                                      strokeWidth={3}
                                      strokeLinecap="round"
                                    />
                                    <circle cx={x2} cy={y2} r={4} fill="#10b981" />
                                  </g>
                                );
                              })}
                            </svg>
                          </div>
                        </div>

                        {/* Sector Breakdown Chart */}
                        <div className="bg-gray-800/70 border border-gray-700 rounded-lg p-4">
                          <h3 className="text-white font-semibold mb-4">Sector Breakdown (Pixels)</h3>
                          <div className="w-full h-64 bg-gradient-to-b from-purple-500/10 to-gray-800 rounded-lg relative overflow-hidden">
                            <svg viewBox="0 0 400 200" className="w-full h-full">
                              {growthData.timeline.map((d, i) => {
                                const x = i * (400 / (growthData.timeline.length - 1));
                                const maxVal = Math.max(...growthData.timeline.map((g) => 
                                  g.sector_breakdown.rural + g.sector_breakdown.urban + g.sector_breakdown.industrial
                                ));
                                const ruralH = (d.sector_breakdown.rural / maxVal) * 180;
                                const urbanH = (d.sector_breakdown.urban / maxVal) * 180;
                                const industrialH = (d.sector_breakdown.industrial / maxVal) * 180;
                                
                                return (
                                  <g key={d.year}>
                                    <rect x={x - 8} y={200 - ruralH} width={16} height={ruralH} fill="#f59e0b" />
                                    <rect x={x - 8} y={200 - ruralH - urbanH} width={16} height={urbanH} fill="#3b82f6" />
                                    <rect x={x - 8} y={200 - ruralH - urbanH - industrialH} width={16} height={industrialH} fill="#8b5cf6" />
                                  </g>
                                );
                              })}
                            </svg>
                          </div>
                          <div className="flex gap-4 mt-4 text-xs">
                            <div className="flex items-center gap-2">
                              <div className="w-3 h-3 bg-amber-500 rounded"></div>
                              <span className="text-gray-400">Rural</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <div className="w-3 h-3 bg-blue-500 rounded"></div>
                              <span className="text-gray-400">Urban</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <div className="w-3 h-3 bg-purple-500 rounded"></div>
                              <span className="text-gray-400">Industrial</span>
                            </div>
                          </div>
                        </div>

                        {/* Year-over-Year Growth Rate */}
                        {growthData.yoy_growth && growthData.yoy_growth.length > 0 && (
                          <div className="bg-gray-800/70 border border-gray-700 rounded-lg p-4">
                            <h3 className="text-white font-semibold mb-4">Year-over-Year Growth Rate (%)</h3>
                            <div className="w-full h-64 bg-gradient-to-b from-yellow-500/10 to-gray-800 rounded-lg relative overflow-hidden">
                              <svg viewBox="0 0 400 200" className="w-full h-full">
                                <line x1="0" y1="100" x2="400" y2="100" stroke="#666" strokeWidth="1" strokeDasharray="4,4" />
                                {growthData.yoy_growth.map((d, i) => {
                                  if (i === 0) return null;
                                  const prev = growthData.yoy_growth[i - 1];
                                  const x1 = (i - 1) * (400 / (growthData.yoy_growth.length - 1));
                                  const x2 = i * (400 / (growthData.yoy_growth.length - 1));
                                  const y1 = 100 - (prev.growth_rate * 2);
                                  const y2 = 100 - (d.growth_rate * 2);
                                  const color = d.growth_rate >= 0 ? "#10b981" : "#ef4444";
                                  return (
                                    <g key={d.year}>
                                      <line
                                        x1={x1}
                                        y1={y1}
                                        x2={x2}
                                        y2={y2}
                                        stroke={color}
                                        strokeWidth={3}
                                        strokeLinecap="round"
                                      />
                                      <circle cx={x2} cy={y2} r={4} fill={color} />
                                    </g>
                                  );
                                })}
                              </svg>
                            </div>
                          </div>
                        )}

                        {/* Hotspots Map */}
                        {growthData.hotspots && growthData.hotspots.length > 0 && (
                          <div className="bg-gray-800/70 border border-gray-700 rounded-lg p-4">
                            <h3 className="text-white font-semibold mb-4">Top Growth Hotspots</h3>
                            <div className="relative w-full h-72 bg-gray-900 rounded-lg overflow-hidden border border-gray-700">
                              <MapContainer
                                center={[growthData.hotspots[0].lat, growthData.hotspots[0].lon]}
                                zoom={7}
                                className="w-full h-full"
                                scrollWheelZoom={false}
                              >
                                <TileLayer
                                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                />
                                {growthData.hotspots.map((hotspot, idx) => (
                                  <Marker
                                    key={idx}
                                    position={[hotspot.lat, hotspot.lon]}
                                    icon={L.divIcon({
                                      className: "hotspot-marker",
                                      html: `<div style="background: ${hotspot.type === 'Industrial' ? '#8b5cf6' : '#3b82f6'}; width: 12px; height: 12px; border-radius: 50%; border: 2px solid white;"></div>`,
                                      iconSize: [12, 12],
                                    })}
                                  >
                                    <Popup>
                                      <div className="text-sm">
                                        <p className="font-semibold">{hotspot.type} Hotspot</p>
                                        <p>Growth: {hotspot.growth_pct}%</p>
                                        <p>Intensity: {hotspot.intensity} nW</p>
                                      </div>
                                    </Popup>
                                  </Marker>
                                ))}
                              </MapContainer>
                            </div>
                          </div>
                        )}

                        {/* Insights */}
                        <div className="space-y-3">
                          <div className="p-4 bg-gray-800/60 rounded-lg border border-gray-700">
                            <p className="text-gray-200 text-sm">
                              <span className="text-cyan-400 font-semibold">Economic Growth:</span> {growthData.insights.total_economic_growth}% increase in Sum of Lights (GDP proxy) from {startYear} to {endYear}.
                            </p>
                          </div>
                          <div className="p-4 bg-gray-800/60 rounded-lg border border-gray-700">
                            <p className="text-gray-200 text-sm">
                              <span className="text-green-400 font-semibold">Industrial Expansion:</span> {growthData.insights.industrial_expansion}% growth in industrial zones, indicating significant infrastructure development.
                            </p>
                          </div>
                          <div className="p-4 bg-gray-800/60 rounded-lg border border-gray-700">
                            <p className="text-gray-200 text-sm">
                              <span className="text-yellow-400 font-semibold">Urbanization:</span> {growthData.insights.urban_sprawl_sqkm > 0 ? '+' : ''}{growthData.insights.urban_sprawl_sqkm.toFixed(0)} km² of new urban area, representing {((growthData.insights.urban_sprawl_sqkm / (growthData.timeline[0]?.urban_area_sqkm || 1)) * 100).toFixed(1)}% expansion.
                            </p>
                          </div>
                          <div className="p-4 bg-gray-800/60 rounded-lg border border-gray-700">
                            <p className="text-gray-200 text-sm">
                              <span className="text-purple-400 font-semibold">Fastest Growing Sector:</span> {growthData.insights.fastest_growing_sector} sector shows the highest growth rate, driving regional economic development.
                            </p>
                          </div>
                        </div>
                      </>
                    )}

                    {!growthLoading && !growthError && !growthData && (
                      <div className="p-4 bg-gray-800/60 rounded-lg border border-gray-700 text-center">
                        <p className="text-gray-400 text-sm">No growth data available</p>
                      </div>
                    )}
                  </div>
                )}

                {showAnomaly && (
                  <div className="bg-gray-900/80 border border-gray-800 rounded-2xl shadow-2xl backdrop-blur-sm p-6 sm:p-8 space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                      <div>
                        <p className="text-sm text-gray-400">Anomaly Detection</p>
                        <h2 className="text-2xl font-bold text-white">{region || "Selected region"}</h2>
                        {anomalyData && (
                          <p className="text-gray-400 text-sm">
                            Target Year: {anomalyData.target_year} (Latest available)
                          </p>
                        )}
                      </div>
                      <button
                        type="button"
                        onClick={handleDownload}
                        className="px-4 py-2 rounded-lg border border-cyan-500 text-cyan-300 hover:bg-cyan-500/10 transition-colors text-sm font-semibold"
                      >
                        Download PDF
                      </button>
                    </div>

                    {anomalyLoading && (
                      <div className="relative w-full h-72 bg-gray-900 rounded-lg overflow-hidden border border-gray-700 shadow-lg flex items-center justify-center">
                        <div className="text-center">
                          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-500 mb-2"></div>
                          <p className="text-gray-400 text-sm">Detecting anomalies...</p>
                        </div>
                      </div>
                    )}

                    {anomalyError && (
                      <div className="p-4 bg-red-900/30 rounded-lg border border-red-700">
                        <p className="text-red-300 text-sm">Error: {anomalyError}</p>
                      </div>
                    )}

                    {!anomalyLoading && !anomalyError && anomalyData && (
                      <>
                        <div className="relative w-full h-72 bg-gray-900 rounded-lg overflow-hidden border border-gray-700 shadow-lg">
                          <MapContainer
                            center={
                              anomalyData.anomalies && anomalyData.anomalies.length > 0
                                ? [anomalyData.anomalies[0].lat, anomalyData.anomalies[0].lon]
                                : getRegionCenter(region)
                            }
                            zoom={7}
                            className="w-full h-full"
                            scrollWheelZoom={false}
                          >
                            <TileLayer
                              attribution='&copy; <a href=\"https://www.openstreetmap.org/copyright\">OpenStreetMap</a> contributors'
                              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                            />
                            {anomalyData.anomalies && anomalyData.anomalies.map((anomaly) => (
                              <Marker
                                key={anomaly.id}
                                position={[anomaly.lat, anomaly.lon]}
                                icon={anomalyIcon}
                              >
                                <Popup>
                                  <div className="text-sm">
                                    <p className="font-semibold">Anomaly #{anomaly.id}</p>
                                    <p>Location: ({anomaly.lat.toFixed(4)}, {anomaly.lon.toFixed(4)})</p>
                                    <p>Intensity Gain: {anomaly.intensity_gain} nW</p>
                                    <p>Current: {anomaly.current_intensity} nW</p>
                                    <p>Baseline: {anomaly.baseline_intensity} nW</p>
                                    <p>Max Brightness: {anomaly.max_brightness} nW</p>
                                    <p>Pixels: {anomaly.pixel_count}</p>
                                  </div>
                                </Popup>
                              </Marker>
                            ))}
                          </MapContainer>
                        </div>

                        <div className="space-y-3">
                          {anomalyInsights.length > 0 ? (
                            anomalyInsights.map((insight, idx) => (
                              <div key={idx} className="p-3 bg-gray-800/60 rounded-lg border border-gray-700">
                                <p className="text-gray-200 text-sm">{insight}</p>
                              </div>
                            ))
                          ) : (
                            <div className="p-3 bg-gray-800/60 rounded-lg border border-gray-700">
                              <p className="text-gray-400 text-sm">No insights available</p>
                            </div>
                          )}
                        </div>
                      </>
                    )}

                    {!anomalyLoading && !anomalyError && !anomalyData && (
                      <div className="p-4 bg-gray-800/60 rounded-lg border border-gray-700 text-center">
                        <p className="text-gray-400 text-sm">No anomaly data available</p>
                      </div>
                    )}
                  </div>
                )}
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

        .anomaly-dot {
          width: 12px;
          height: 12px;
          background: #f87171;
          border-radius: 9999px;
          box-shadow: 0 0 0 0 rgba(248, 113, 113, 0.6);
          animation: pulse 1.5s ease-out infinite;
        }

        @keyframes pulse {
          0% {
            box-shadow: 0 0 0 0 rgba(248, 113, 113, 0.6);
          }
          70% {
            box-shadow: 0 0 0 12px rgba(248, 113, 113, 0);
          }
          100% {
            box-shadow: 0 0 0 0 rgba(248, 113, 113, 0);
          }
        }
      `}</style>
    </div>
  );
};

export default Analysis;
