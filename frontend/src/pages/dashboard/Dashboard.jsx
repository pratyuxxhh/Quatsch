import React, { useState, useEffect } from "react";
import { MapContainer, TileLayer, useMap, CircleMarker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import ParticlesBackground from "../../components/ParticlesBackground";

// Fix for default marker icons in react-leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

function MapController({ center, zoom }) {
  const map = useMap();
  useEffect(() => {
    if (center && zoom) {
      map.setView(center, zoom, { animate: true, duration: 1.5 });
    }
  }, [center, zoom, map]);
  return null;
}

const regionData = {
  // Countries / continents
  "united states": { center: [39.8283, -98.5795], zoom: 4 },
  usa: { center: [39.8283, -98.5795], zoom: 4 },
  "united kingdom": { center: [54.7024, -3.2766], zoom: 6 },
  uk: { center: [54.7024, -3.2766], zoom: 6 },
  france: { center: [46.2276, 2.2137], zoom: 6 },
  germany: { center: [51.1657, 10.4515], zoom: 6 },
  italy: { center: [41.8719, 12.5674], zoom: 6 },
  spain: { center: [40.4637, -3.7492], zoom: 6 },
  china: { center: [35.8617, 104.1954], zoom: 5 },
  india: { center: [20.5937, 78.9629], zoom: 5 },
  japan: { center: [36.2048, 138.2529], zoom: 6 },
  australia: { center: [-25.2744, 133.7751], zoom: 5 },
  brazil: { center: [-14.235, -51.9253], zoom: 5 },
  canada: { center: [56.1304, -106.3468], zoom: 4 },
  russia: { center: [61.524, 105.3188], zoom: 4 },
  africa: { center: [8.7832, 34.5085], zoom: 4 },
  europe: { center: [54.526, 15.2551], zoom: 4 },
  asia: { center: [34.0479, 100.6197], zoom: 4 },
  "south america": { center: [-14.235, -56.0095], zoom: 4 },
  "north america": { center: [54.526, -105.2551], zoom: 4 },

  // U.S. States
  california: { center: [36.7783, -119.4179], zoom: 6.5 },
  texas: { center: [31.9686, -99.9018], zoom: 6.4 },
  florida: { center: [27.6648, -81.5158], zoom: 6.7 },
  "new york": { center: [43.0, -75.0], zoom: 6.7 },
  illinois: { center: [40.0, -89.0], zoom: 6.7 },
  pennsylvania: { center: [41.2033, -77.1945], zoom: 6.7 },
  ohio: { center: [40.4173, -82.9071], zoom: 6.8 },
  georgia: { center: [32.1656, -82.9001], zoom: 6.8 },
  "north carolina": { center: [35.7596, -79.0193], zoom: 6.8 },
  michigan: { center: [44.3148, -85.6024], zoom: 6.6 },
  arizona: { center: [34.0489, -111.0937], zoom: 6.7 },
  washington: { center: [47.7511, -120.7401], zoom: 6.6 },
  colorado: { center: [39.5501, -105.7821], zoom: 6.7 },
  massachusetts: { center: [42.4072, -71.3824], zoom: 7.1 },
  tennessee: { center: [35.5175, -86.5804], zoom: 6.8 },
  indiana: { center: [40.2672, -86.1349], zoom: 6.9 },
  missouri: { center: [37.9643, -91.8318], zoom: 6.8 },
  maryland: { center: [39.0458, -76.6413], zoom: 7.2 },
  wisconsin: { center: [44.5, -89.5], zoom: 6.7 },
  minnesota: { center: [46.7296, -94.6859], zoom: 6.6 },
  alabama: { center: [32.8067, -86.7911], zoom: 6.9 },
  "south carolina": { center: [33.8361, -81.1637], zoom: 7.0 },
  kentucky: { center: [37.8393, -84.27], zoom: 6.9 },
  oregon: { center: [43.8041, -120.5542], zoom: 6.6 },
  oklahoma: { center: [35.4676, -97.5164], zoom: 6.8 },
  connecticut: { center: [41.6032, -73.0877], zoom: 7.3 },
  iowa: { center: [41.878, -93.0977], zoom: 6.9 },
  utah: { center: [39.321, -111.0937], zoom: 6.7 },
  nevada: { center: [38.8026, -116.4194], zoom: 6.6 },
  kansas: { center: [39.0119, -98.4842], zoom: 6.9 },
  arkansas: { center: [35.201, -91.8318], zoom: 7.0 },
  "new mexico": { center: [34.5199, -105.8701], zoom: 6.7 },
  nebraska: { center: [41.4925, -99.9018], zoom: 6.9 },
  idaho: { center: [44.0682, -114.742], zoom: 6.6 },
  mississippi: { center: [32.3547, -89.3985], zoom: 7.0 },
  "west virginia": { center: [38.5976, -80.4549], zoom: 7.2 },
  hawaii: { center: [19.8968, -155.5828], zoom: 7.2 },
  alaska: { center: [64.2008, -149.4937], zoom: 4.7 },
  vermont: { center: [44.2664, -72.5805], zoom: 7.3 },
  "new hampshire": { center: [43.4525, -71.5639], zoom: 7.3 },
  maine: { center: [45.2538, -69.4455], zoom: 6.8 },
  "rhode island": { center: [41.58, -71.4774], zoom: 7.5 },
  delaware: { center: [39.3185, -75.5071], zoom: 7.4 },
  montana: { center: [46.9219, -110.4544], zoom: 6.4 },
  wyoming: { center: [41.1455, -107.5516], zoom: 6.5 },
  "north dakota": { center: [47.5515, -101.002], zoom: 6.7 },
  "south dakota": { center: [43.9695, -99.9018], zoom: 6.7 },
  louisiana: { center: [30.9843, -91.9623], zoom: 6.8 },
  "new jersey": { center: [40.2989, -74.521], zoom: 7.1 },

  // Indian States and Union Territories
  "andhra pradesh": { center: [15.9129, 79.74], zoom: 6.5 },
  "arunachal pradesh": { center: [28.218, 94.7278], zoom: 6.8 },
  assam: { center: [26.2006, 92.9376], zoom: 6.7 },
  bihar: { center: [25.0961, 85.3131], zoom: 6.8 },
  chhattisgarh: { center: [21.2787, 81.8661], zoom: 6.7 },
  goa: { center: [15.2993, 74.124], zoom: 7.4 },
  gujarat: { center: [22.2587, 71.1924], zoom: 6.7 },
  haryana: { center: [29.0588, 76.0856], zoom: 7.0 },
  "himachal pradesh": { center: [31.1048, 77.1734], zoom: 7.0 },
  jharkhand: { center: [23.6102, 85.2799], zoom: 6.9 },
  karnataka: { center: [15.3173, 75.7139], zoom: 6.6 },
  kerala: { center: [10.8505, 76.2711], zoom: 7.0 },
  "madhya pradesh": { center: [22.9734, 78.6569], zoom: 6.6 },
  maharashtra: { center: [19.7515, 75.7139], zoom: 6.6 },
  manipur: { center: [24.6637, 93.9063], zoom: 7.1 },
  meghalaya: { center: [25.467, 91.3662], zoom: 7.1 },
  mizoram: { center: [23.1645, 92.9376], zoom: 7.1 },
  nagaland: { center: [26.1584, 94.5624], zoom: 7.0 },
  odisha: { center: [20.9517, 85.0985], zoom: 6.7 },
  punjab: { center: [31.1471, 75.3412], zoom: 7.0 },
  rajasthan: { center: [27.0238, 74.2179], zoom: 6.5 },
  sikkim: { center: [27.533, 88.5122], zoom: 7.3 },
  "tamil nadu": { center: [11.1271, 78.6569], zoom: 6.8 },
  telangana: { center: [17.8749, 78.1], zoom: 6.8 },
  tripura: { center: [23.9408, 91.9882], zoom: 7.1 },
  uttarakhand: { center: [30.0668, 79.0193], zoom: 7.0 },
  "uttar pradesh": { center: [26.8467, 80.9462], zoom: 6.7 },
  "west bengal": { center: [22.9868, 87.855], zoom: 6.8 },
  "andaman and nicobar": { center: [11.7401, 92.6586], zoom: 6.8 },
  chandigarh: { center: [30.7333, 76.7794], zoom: 7.4 },
  delhi: { center: [28.7041, 77.1025], zoom: 7.2 },
  "jammu and kashmir": { center: [33.7782, 76.5762], zoom: 6.8 },
  ladakh: { center: [34.1526, 77.577], zoom: 6.8 },
  lakshadweep: { center: [10.5667, 72.6417], zoom: 7.4 },
  puducherry: { center: [11.9416, 79.8083], zoom: 7.2 },
};

const getInsights = (region, year) => {
  const insights = {
    "united states": {
      2016: [
        "Presidential Election: Donald Trump elected as 45th President",
        "Space Exploration: SpaceX successfully lands reusable rocket",
        "Technology: Apple releases iPhone 7",
      ],
      2017: [
        "Politics: Inauguration of President Trump",
        "Technology: Amazon acquires Whole Foods",
        "Entertainment: Wonder Woman breaks box office records",
      ],
      2018: [
        "Technology: Facebook faces data privacy concerns",
        "Sports: Philadelphia Eagles win Super Bowl LII",
        "Science: NASA launches Parker Solar Probe",
      ],
      2019: [
        "Technology: 5G networks begin rollout",
        "Entertainment: Avengers: Endgame breaks box office records",
        "Climate: Greta Thunberg leads climate strikes",
      ],
      2020: [
        "Health: COVID-19 pandemic begins",
        "Politics: Joe Biden elected as 46th President",
        "Technology: Remote work becomes mainstream",
      ],
      2021: [
        "Health: COVID-19 vaccine rollout begins",
        "Technology: Cryptocurrency reaches new heights",
        "Climate: COP26 climate summit held",
      ],
      2022: [
        "Technology: ChatGPT launches, AI revolution begins",
        "Sports: Argentina wins FIFA World Cup",
        "Space: James Webb Space Telescope sends first images",
      ],
      2023: [
        "Technology: AI tools become mainstream",
        "Climate: Record-breaking temperatures globally",
        "Entertainment: Barbie movie becomes cultural phenomenon",
      ],
      2024: [
        "Technology: AI continues rapid advancement",
        "Politics: Major elections worldwide",
        "Space: Private space missions increase",
      ],
      2025: [
        "Technology: Quantum computing advances",
        "Climate: Renewable energy adoption accelerates",
        "Science: Breakthrough medical discoveries",
      ],
    },
  };

  const defaultInsights = [
    `Exploring ${region || "the world"} in ${year}`,
    "Historical data and trends available",
    "Regional analysis and insights",
  ];

  return insights[region?.toLowerCase()]?.[year] || defaultInsights;
};

const Dashboard = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRegion, setSelectedRegion] = useState(null);
  const [mapCenter, setMapCenter] = useState([20, 0]);
  const [mapZoom, setMapZoom] = useState(2);
  const [selectedYear, setSelectedYear] = useState(2024);
  const [insights, setInsights] = useState([]);
  const [nightlightsData, setNightlightsData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [insightsLoading, setInsightsLoading] = useState(false);
  const [insightsError, setInsightsError] = useState(null);

  const API_BASE_URL = 'http://localhost:5000';

  // Fetch nightlights data when year changes
  useEffect(() => {
    const fetchNightlightsData = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(`${API_BASE_URL}/api/data/nightlights/${selectedYear}?sample_rate=15`, {
          credentials: 'include',
        });
        
        if (!response.ok) {
          throw new Error(`Failed to fetch data: ${response.status}`);
        }
        
        const result = await response.json();
        
        if (result.success && result.data) {
          setNightlightsData(result.data);
          // Update map center to data center if available
          if (result.data.center) {
            setMapCenter([result.data.center.lat, result.data.center.lon]);
            setMapZoom(7);
          }
        } else {
          throw new Error(result.message || 'Failed to load data');
        }
      } catch (err) {
        console.error('Error fetching nightlights data:', err);
        setError(err.message);
        setNightlightsData(null);
      } finally {
        setLoading(false);
      }
    };

    fetchNightlightsData();
  }, [selectedYear]);

  // Fetch insights from API when region or year changes
  useEffect(() => {
    const fetchInsights = async () => {
      if (!selectedRegion) {
        setInsights([]);
        return;
      }

      setInsightsLoading(true);
      setInsightsError(null);
      
      try {
        const response = await fetch(
          `${API_BASE_URL}/api/insights?region=${encodeURIComponent(selectedRegion)}&year=${selectedYear}&max_results=5`,
          {
            credentials: 'include',
          }
        );

        if (!response.ok) {
          throw new Error(`Failed to fetch insights: ${response.status}`);
        }

        const result = await response.json();

        if (result.success && result.insights) {
          setInsights(result.insights);
        } else {
          // Fallback to local insights if API fails
          const fallbackInsights = getInsights(selectedRegion, selectedYear);
          setInsights(fallbackInsights);
        }
      } catch (err) {
        console.error('Error fetching insights:', err);
        setInsightsError(err.message);
        // Fallback to local insights on error
        const fallbackInsights = getInsights(selectedRegion, selectedYear);
        setInsights(fallbackInsights);
      } finally {
        setInsightsLoading(false);
      }
    };

    fetchInsights();
  }, [selectedRegion, selectedYear]);

  const handleSearch = (e) => {
    e.preventDefault();
    const query = searchQuery.toLowerCase().trim();
    const regionKey = Object.keys(regionData).find((key) => key.includes(query) || query.includes(key));
    if (regionKey) {
      const regionInfo = regionData[regionKey];
      setSelectedRegion(regionKey);
      setMapCenter(regionInfo.center);
      setMapZoom(regionInfo.zoom);
    } else {
      setSelectedRegion(null);
      setMapCenter([20, 0]);
      setMapZoom(2);
    }
  };

  const handleYearChange = (e) => setSelectedYear(parseInt(e.target.value, 10));

  return (
    <div className="relative min-h-screen w-full bg-black pt-20">
      <ParticlesBackground />
      <div className="relative z-10 max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-8 pb-6 flex flex-col gap-4 h-[calc(100vh-5rem)]">
        <form onSubmit={handleSearch} className="max-w-2xl w-full">
          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search for a region (e.g., United States, Europe, Asia...)"
              className="w-full px-4 py-3 pl-12 bg-gray-900/80 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent backdrop-blur-sm"
            />
            <svg
              className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
            <button
              type="submit"
              className="absolute right-2 top-1/2 transform -translate-y-1/2 px-4 py-1.5 bg-cyan-500 hover:bg-cyan-600 text-white rounded-md text-sm font-medium transition-colors"
            >
              Search
            </button>
          </div>
        </form>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 flex-1 min-h-0">
          <div className="lg:col-span-2 flex flex-col gap-4 min-h-0">
            <div className="relative flex-1 min-h-0 bg-gray-900 rounded-lg overflow-hidden border border-gray-700 shadow-2xl">
              <MapContainer center={mapCenter} zoom={mapZoom} className="w-full h-full">
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
                  url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                />
                <MapController center={mapCenter} zoom={mapZoom} />
                
                {/* Display nightlights data points */}
                {nightlightsData && nightlightsData.data_points && nightlightsData.data_points.map((point, index) => {
                  // Calculate color based on brightness value (cyan scale)
                  const maxValue = nightlightsData.metadata?.statistics?.max || 100;
                  const normalizedValue = Math.min(point.value / maxValue, 1);
                  const opacity = Math.max(normalizedValue * 0.8, 0.3);
                  const radius = Math.max(normalizedValue * 8, 2);
                  
                  return (
                    <CircleMarker
                      key={index}
                      center={[point.lat, point.lon]}
                      radius={radius}
                      pathOptions={{
                        color: '#06b6d4',
                        fillColor: '#06b6d4',
                        fillOpacity: opacity,
                        weight: 0.5,
                      }}
                    >
                      <Popup>
                        <div className="text-sm">
                          <p className="font-semibold">Nightlights Data</p>
                          <p>Lat: {point.lat.toFixed(4)}</p>
                          <p>Lon: {point.lon.toFixed(4)}</p>
                          <p>Radiance: {point.value.toFixed(2)} nW</p>
                        </div>
                      </Popup>
                    </CircleMarker>
                  );
                })}
              </MapContainer>
              {loading && (
                <div className="absolute top-4 left-4 bg-black/70 backdrop-blur-sm px-4 py-2 rounded-lg border border-gray-600">
                  <p className="text-white text-sm font-medium">
                    Loading nightlights data...
                  </p>
                </div>
              )}
              {error && (
                <div className="absolute top-4 left-4 bg-red-900/70 backdrop-blur-sm px-4 py-2 rounded-lg border border-red-600">
                  <p className="text-red-300 text-sm font-medium">
                    Error: {error}
                  </p>
                </div>
              )}
              {nightlightsData && !loading && (
                <div className="absolute top-4 left-4 bg-black/70 backdrop-blur-sm px-4 py-2 rounded-lg border border-gray-600">
                  <p className="text-white text-sm font-medium">
                    Year: <span className="text-cyan-400">{selectedYear}</span>
                  </p>
                  <p className="text-gray-400 text-xs mt-1">
                    {nightlightsData.data_points?.length || 0} data points
                  </p>
                </div>
              )}
              {selectedRegion && (
                <div className="absolute top-4 right-4 bg-black/70 backdrop-blur-sm px-4 py-2 rounded-lg border border-gray-600">
                  <p className="text-white text-sm font-medium">
                    Region: <span className="text-cyan-400 capitalize">{selectedRegion}</span>
                  </p>
                </div>
              )}
            </div>

            <div className="bg-gray-900/80 backdrop-blur-sm rounded-lg p-4 border border-gray-700">
              <div className="flex items-center justify-between mb-3">
                <label className="text-white font-medium text-base">Year Selection</label>
                <span className="text-cyan-400 font-bold text-lg">{selectedYear}</span>
              </div>
              <input
                type="range"
                min="2016"
                max="2025"
                value={selectedYear}
                onChange={handleYearChange}
                className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
                style={{
                  background: `linear-gradient(to right, #06b6d4 0%, #06b6d4 ${((selectedYear - 2016) / 9) * 100}%, #374151 ${((selectedYear - 2016) / 9) * 100}%, #374151 100%)`,
                }}
              />
              <div className="flex justify-between mt-2 text-[10px] text-gray-400">
                <span>2016</span><span>2017</span><span>2018</span><span>2019</span><span>2020</span><span>2021</span><span>2022</span><span>2023</span><span>2024</span><span>2025</span>
              </div>
            </div>
          </div>

          <div className="lg:col-span-1 h-full min-h-0">
            <div className="bg-gray-900/80 backdrop-blur-sm rounded-lg p-6 border border-gray-700 h-full overflow-auto">
              <h2 className="text-2xl font-bold text-white mb-4">Insights</h2>

              {selectedRegion ? (
                <div>
                  <div className="mb-4 pb-4 border-b border-gray-700">
                    <p className="text-cyan-400 font-semibold capitalize">{selectedRegion}</p>
                    <p className="text-gray-400 text-sm">{selectedYear}</p>
                  </div>

                  {insightsLoading ? (
                    <div className="space-y-4">
                      {[1, 2, 3].map((i) => (
                        <div
                          key={i}
                          className="p-4 bg-gray-800/50 rounded-lg border border-gray-700 animate-pulse"
                        >
                          <div className="flex items-start">
                            <div className="flex-shrink-0 w-2 h-2 bg-gray-600 rounded-full mt-2 mr-3"></div>
                            <div className="flex-1 space-y-2">
                              <div className="h-4 bg-gray-700 rounded w-3/4"></div>
                              <div className="h-4 bg-gray-700 rounded w-1/2"></div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : insightsError ? (
                    <div className="p-4 bg-red-900/30 rounded-lg border border-red-700">
                      <p className="text-red-300 text-sm">
                        Error loading insights: {insightsError}
                      </p>
                      <p className="text-gray-400 text-xs mt-2">
                        Showing fallback insights
                      </p>
                    </div>
                  ) : insights.length > 0 ? (
                    <div className="space-y-4">
                      {insights.map((insight, index) => {
                        // Handle both string and object formats
                        const insightText = typeof insight === 'string' ? insight : insight.text || insight;
                        const insightSource = typeof insight === 'object' ? insight.source : null;
                        const insightUrl = typeof insight === 'object' ? insight.url : null;
                        
                        return (
                          <div
                            key={index}
                            className="p-4 bg-gray-800/50 rounded-lg border border-gray-700 hover:border-cyan-500/50 transition-colors"
                          >
                            <div className="flex items-start">
                              <div className="flex-shrink-0 w-2 h-2 bg-cyan-400 rounded-full mt-2 mr-3"></div>
                              <div className="flex-1">
                                <p className="text-gray-300 text-sm leading-relaxed">{insightText}</p>
                                {insightSource && (
                                  <p className="text-gray-500 text-xs mt-2">
                                    Source: {insightSource}
                                  </p>
                                )}
                                {insightUrl && (
                                  <a
                                    href={insightUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-cyan-400 text-xs mt-1 hover:underline inline-block"
                                  >
                                    Read more →
                                  </a>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <p className="text-gray-400 text-sm">
                        No insights available for this region and year.
                      </p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-12">
                  <svg
                    className="mx-auto h-12 w-12 text-gray-600 mb-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                    />
                  </svg>
                  <p className="text-gray-400 text-sm">
                    Search for a region to view insights and events for the selected year.
                  </p>
                </div>
              )}
            </div>
          </div>
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

export default Dashboard;
