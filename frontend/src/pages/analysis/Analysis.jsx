import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MapContainer, TileLayer, Marker, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

const years = Array.from({ length: 10 }, (_, i) => 2016 + i);

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

const generateAnomalies = (region, startYear, endYear) => {
  const center = getRegionCenter(region);
  const count = 6;
  const anomalies = [];
  // deterministic-ish jitter based on year span and region length
  const seed = (startYear + endYear + (region?.length || 5)) % 11;
  for (let i = 0; i < count; i++) {
    const jitterLat = (Math.sin(seed + i) * 0.8) / 2;
    const jitterLng = (Math.cos(seed + i * 1.3) * 0.8) / 2;
    anomalies.push({
      lat: center[0] + jitterLat,
      lng: center[1] + jitterLng,
      label: `Anomaly ${i + 1}`,
    });
  }
  return anomalies;
};

const buildAnomalyInsights = (region, anomalies, startYear, endYear) => {
  if (!region || !anomalies.length) return [];
  return [
    `${anomalies.length} anomalies detected in ${region} (${startYear}–${endYear}).`,
    `Most recent anomaly: ${anomalies[anomalies.length - 1].label}.`,
    `Follow-up recommended on highlighted hotspots.`,
  ];
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

  const growthData = useMemo(() => generateMockGrowth(startYear, endYear), [startYear, endYear]);
  const growthInsights = useMemo(
    () => buildGrowthInsights(region || "Selected region", growthData),
    [region, growthData],
  );

  const anomalies = useMemo(() => generateAnomalies(region || "Selected region", startYear, endYear), [
    region,
    startYear,
    endYear,
  ]);
  const anomalyInsights = useMemo(
    () => buildAnomalyInsights(region || "Selected region", anomalies, startYear, endYear),
    [region, anomalies, startYear, endYear],
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
    <div className="min-h-screen w-full bg-black pt-20 flex justify-center px-4 pb-10">
      <div className="w-full max-w-5xl">
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
                  <div className="bg-gray-900/80 border border-gray-800 rounded-2xl shadow-2xl backdrop-blur-sm p-6 sm:p-8 space-y-4">
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

                    <div className="bg-gray-800/70 border border-gray-700 rounded-lg p-4">
                      <div className="flex justify-between text-gray-400 text-xs mb-2">
                        <span>Growth Index</span>
                        <span>{growthData[growthData.length - 1]?.value}</span>
                      </div>
                      <div className="w-full h-48 bg-gradient-to-b from-cyan-500/30 to-gray-800 rounded-lg relative overflow-hidden">
                        <svg viewBox="0 0 400 200" className="w-full h-full">
                          {growthData.map((d, i) => {
                            if (i === 0) return null;
                            const prev = growthData[i - 1];
                            const x1 = (i - 1) * (400 / (growthData.length - 1));
                            const x2 = i * (400 / (growthData.length - 1));
                            const maxVal = Math.max(...growthData.map((g) => g.value));
                            const y1 = 200 - (prev.value / maxVal) * 180;
                            const y2 = 200 - (d.value / maxVal) * 180;
                            return (
                              <line
                                key={d.year}
                                x1={x1}
                                y1={y1}
                                x2={x2}
                                y2={y2}
                                stroke="#06b6d4"
                                strokeWidth={3}
                                strokeLinecap="round"
                              />
                            );
                          })}
                        </svg>
                      </div>
                    </div>

                    <div className="space-y-3">
                      {growthInsights.map((insight, idx) => (
                        <div key={idx} className="p-3 bg-gray-800/60 rounded-lg border border-gray-700">
                          <p className="text-gray-200 text-sm">{insight}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {showAnomaly && (
                  <div className="bg-gray-900/80 border border-gray-800 rounded-2xl shadow-2xl backdrop-blur-sm p-6 sm:p-8 space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                      <div>
                        <p className="text-sm text-gray-400">Anomaly Detection</p>
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

                    <div className="relative w-full h-72 bg-gray-900 rounded-lg overflow-hidden border border-gray-700 shadow-lg">
                      <MapContainer
                        center={getRegionCenter(region)}
                        zoom={6}
                        className="w-full h-full"
                        scrollWheelZoom={false}
                      >
                        <TileLayer
                          attribution='&copy; <a href=\"https://www.openstreetmap.org/copyright\">OpenStreetMap</a> contributors'
                          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        />
                        {anomalies.map((a, idx) => (
                          <Marker key={idx} position={[a.lat, a.lng]} icon={anomalyIcon} />
                        ))}
                      </MapContainer>
                    </div>

                    <div className="space-y-3">
                      {anomalyInsights.map((insight, idx) => (
                        <div key={idx} className="p-3 bg-gray-800/60 rounded-lg border border-gray-700">
                          <p className="text-gray-200 text-sm">{insight}</p>
                        </div>
                      ))}
                    </div>
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
