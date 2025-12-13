# 🌍 Quatsch - Nightlights Data Analysis Platform

A comprehensive web application for analyzing satellite nightlights data to understand economic growth, urbanization patterns, and regional development. Built with React and Flask, Quatsch provides interactive visualizations, anomaly detection, growth analysis, and year-over-year comparisons of nightlights data.

![Quatsch](https://img.shields.io/badge/Quatsch-Nightlights%20Analysis-blue)
![React](https://img.shields.io/badge/React-19.2.0-61DAFB?logo=react)
![Flask](https://img.shields.io/badge/Flask-3.0.2-000000?logo=flask)
![Python](https://img.shields.io/badge/Python-3.8+-3776AB?logo=python)

## 📋 Table of Contents

- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Prerequisites](#-prerequisites)
- [Installation](#-installation)
- [Configuration](#-configuration)
- [Usage](#-usage)
- [Project Structure](#-project-structure)
- [API Documentation](#-api-documentation)
- [Features in Detail](#-features-in-detail)
- [Troubleshooting](#-troubleshooting)
- [Contributing](#-contributing)

## ✨ Features

### 🗺️ Interactive Dashboard
- **Real-time Nightlights Visualization**: Explore nightlights data on an interactive Leaflet map
- **Region Search**: Search and select from 100+ regions worldwide
- **Year Selection**: View data for any year from 2016-2025
- **Dynamic Heatmaps**: Visualize brightness intensity with color-coded markers
- **Contextual Insights**: Get region-specific news, events, and information

### 📊 Growth Analysis
- **Economic Growth Metrics**: Calculate GDP proxy, urban area expansion, and sector breakdown
- **Time Series Analysis**: Analyze growth trends over custom year ranges
- **Interactive Charts**: Visualize data with line graphs, bar charts, and sector breakdowns
- **Growth Hotspots**: Identify areas with the fastest development
- **Year-over-Year Growth Rates**: Track percentage changes across metrics

### 🔍 Anomaly Detection
- **Dark Zone Detection**: Identify emerging dark zones indicating economic decline
- **Anomaly Mapping**: Visualize anomalies on interactive maps with detailed popups
- **Latest Year Analysis**: Automatically detects anomalies for the most recent available year
- **Anomaly Context**: Get insights about detected anomalies and their implications

### 🔄 Year Comparison
- **Side-by-Side Comparison**: Compare nightlights data between any two years
- **Image Blending**: Interactive image blender with transparency control
- **Pan & Zoom**: Navigate and zoom into comparison images
- **Comprehensive Metrics**: View percentage changes, absolute differences, and sector breakdowns
- **Visual Charts**: Bar charts and stacked charts for easy comparison

### 🔐 Authentication
- **Email OTP Verification**: Secure login with one-time password via email
- **Session Management**: Persistent sessions with secure cookies
- **Protected Routes**: Dashboard, Analysis, and Compare pages require authentication
- **User-Friendly UI**: Beautiful, modern authentication interface

## 🛠️ Tech Stack

### Frontend
- **React 19.2.0** - UI framework
- **React Router DOM 7.10.1** - Client-side routing
- **Leaflet & React-Leaflet** - Interactive maps
- **Framer Motion** - Animations and transitions
- **Tailwind CSS** - Styling
- **Vite** - Build tool and dev server
- **Three.js & React Three Fiber** - 3D globe visualization

### Backend
- **Flask 3.0.2** - Web framework
- **Flask-CORS** - Cross-origin resource sharing
- **Flask-Session** - Session management
- **Rasterio** - Geospatial raster I/O
- **NumPy** - Numerical computing
- **SciPy** - Scientific computing (image processing)
- **Python-dotenv** - Environment variable management
- **Requests** - HTTP library for external APIs

### Data Processing
- **TIF/TIFF File Processing** - Satellite nightlights data
- **Geospatial Data Extraction** - Coordinate transformation
- **Image Processing** - Median filtering, anomaly detection
- **JSON Serialization** - Data format conversion

## 📦 Prerequisites

- **Node.js** (v18 or higher)
- **Python** (3.8 or higher)
- **pip** (Python package manager)
- **npm** or **yarn** (Node package manager)
- **Gmail Account** (for email OTP functionality)
- **NewsAPI Key** (optional, for enhanced insights)

## 🚀 Installation

### 1. Clone the Repository

```bash
git clone <repository-url>
cd Quatsch
```

### 2. Backend Setup

```bash
cd backend
pip install -r app/requirements.txt
```

### 3. Frontend Setup

```bash
cd frontend
npm install
```

## ⚙️ Configuration

### Backend Environment Variables

Create a `.env` file in the `backend` directory:

```env
# Email Configuration (Required for Authentication)
EMAIL_ADDRESS=your-email@gmail.com
EMAIL_PASSWORD=your-16-char-app-password

# Session Secret Key
SECRET_KEY=your-random-secret-key-here

# NewsAPI Key (Optional - for enhanced insights)
NEWS_API_KEY=your-newsapi-key-here
```

#### Getting Gmail App Password

1. Go to [Google Account Settings](https://myaccount.google.com/apppasswords)
2. Enable 2-Step Verification if not already enabled
3. Generate an App Password for "Mail"
4. Copy the 16-character password
5. Use it as `EMAIL_PASSWORD` in your `.env` file

#### Getting NewsAPI Key (Optional)

1. Visit [NewsAPI.org](https://newsapi.org/)
2. Sign up for a free account
3. Get your API key from the dashboard
4. Add it to your `.env` file

**Note**: Free tier allows 100 requests per day. For production, upgrade to a paid plan.

### Data Directory Structure

Ensure your data is organized as follows:

```
backend/data/
├── raw/
│   ├── NightLights_Bright_<Region>/
│   │   └── VIIRS_*_<Year>_01.tif
│   └── ...
├── cleaned/
│   ├── NightLights_Bright_<Region>_cleaned/
│   │   ├── VIIRS_*_<Year>_01_clean.tif
│   │   └── VIIRS_*_<Year>_01_view.png
│   └── ...
└── anomalies/
    └── ...
```

## 🎯 Usage

### Starting the Application

#### 1. Start Backend Server

```bash
cd backend
python app/main.py
```

The backend server will start on `http://localhost:5000`

#### 2. Start Frontend Development Server

```bash
cd frontend
npm run dev
```

The frontend will be available at `http://localhost:5173` or `http://localhost:5174`

### Using the Application

1. **Login**: Navigate to `/login` and enter your email
2. **Verify OTP**: Check your email for the OTP code and enter it
3. **Dashboard**: 
   - Search for a region (e.g., "Tamil Nadu", "Maharashtra", "California")
   - Select a year (2016-2025)
   - View nightlights data on the interactive map
   - Read contextual insights about the region
4. **Analysis**:
   - Select a region and year range
   - Enable "Growth Analysis" to see economic metrics and charts
   - Enable "Anomaly Detection" to identify dark zones
5. **Compare**:
   - Select a region and two years
   - Use the image blender to compare visualizations
   - View comprehensive comparison metrics

### Supported Regions

The application supports various regions including:

**Indian States**: Tamil Nadu, Maharashtra, Jharkhand, Uttar Pradesh, and more  
**US States**: California, Texas, Florida, New York, and more  
**Countries**: United States, India, China, and more  
**Continents**: Europe, Asia, Africa, and more

## 📁 Project Structure

```
Quatsch/
├── backend/
│   ├── app/
│   │   ├── main.py                 # Flask application entry point
│   │   ├── routes.py               # API route definitions
│   │   ├── auth.py                 # Authentication logic
│   │   ├── tif_extractor.py        # TIF file data extraction
│   │   ├── insights_service.py     # Insights fetching service
│   │   ├── anomaly_service.py      # Anomaly detection service
│   │   ├── growth_analysis_service.py  # Growth analysis service
│   │   ├── comparison_service.py   # Year comparison service
│   │   ├── cleaning.py            # Data cleaning utilities
│   │   └── requirements.txt        # Python dependencies
│   ├── data/
│   │   ├── raw/                    # Raw TIF files
│   │   ├── cleaned/                # Processed TIF files and PNGs
│   │   └── anomalies/              # Anomaly detection results
│   └── sessions/                    # Session storage
├── frontend/
│   ├── src/
│   │   ├── components/             # Reusable React components
│   │   ├── pages/                  # Page components
│   │   │   ├── dashboard/          # Dashboard page
│   │   │   ├── analysis/           # Analysis page
│   │   │   ├── compare/            # Compare page
│   │   │   ├── auth/               # Authentication pages
│   │   │   └── about/              # About page
│   │   ├── context/                # React context providers
│   │   └── App.jsx                 # Main app component
│   ├── package.json                # Node dependencies
│   └── vite.config.js              # Vite configuration
└── README.md                       # This file
```

## 📡 API Documentation

### Authentication Endpoints

#### Send OTP
```http
POST /api/auth/send-otp
Content-Type: application/json

{
  "email": "user@example.com"
}
```

#### Verify OTP
```http
POST /api/auth/verify-otp
Content-Type: application/json

{
  "email": "user@example.com",
  "otp": "123456"
}
```

#### Check Session
```http
GET /api/auth/check-session
```

### Data Endpoints

#### Get Nightlights Data
```http
GET /api/data/nightlights/<year>?region=<region_name>&sample_rate=<rate>
```

#### Get Available Years
```http
GET /api/data/available-years?region=<region_name>
```

### Insights Endpoint

```http
GET /api/insights?region=<region_name>&year=<year>&max_results=<number>
```

### Analysis Endpoints

#### Anomaly Detection
```http
GET /api/analysis/anomalies?region=<region_name>
```

#### Growth Analysis
```http
GET /api/analysis/growth?region=<region_name>&start_year=<year>&end_year=<year>
```

#### Available Regions
```http
GET /api/analysis/available-regions
```

### Comparison Endpoint

```http
GET /api/compare?region=<region_name>&year1=<year>&year2=<year>
```

### Image Serving

```http
GET /api/images/<path:filepath>
```

Serves PNG images from the `data/cleaned` directory.

## 🎨 Features in Detail

### Dashboard
- Interactive map with Leaflet
- Real-time data visualization
- Region search with autocomplete
- Year selection dropdown
- Loading states and error handling
- Contextual insights panel

### Growth Analysis
- GDP proxy calculation based on nightlights intensity
- Urban area estimation
- Sector breakdown (Rural, Urban, Industrial)
- Growth hotspots identification
- Multiple chart visualizations
- Year-over-year growth rate calculations

### Anomaly Detection
- Dark zone emergence detection algorithm
- Spatial anomaly identification
- Anomaly clustering and visualization
- Latest year automatic detection
- Detailed anomaly metadata

### Year Comparison
- Side-by-side image comparison
- Interactive transparency blending
- Pan and zoom functionality
- Comprehensive metrics comparison
- Visual chart representations
- Detailed comparison table

## 🐛 Troubleshooting

### Common Issues

#### CORS Errors
- Ensure backend is running before frontend
- Check that backend is on port 5000
- Verify CORS origins in `backend/app/main.py` match your frontend port

#### Email Not Sending
- Verify Gmail App Password (not regular password)
- Ensure 2-Step Verification is enabled
- Check environment variables are set correctly
- Check spam folder

#### Data Not Loading
- Verify data files exist in `backend/data/` directory
- Check folder naming matches expected patterns
- Ensure TIF files are valid and readable
- Check backend console for error messages

#### Session Not Persisting
- Ensure cookies are enabled in browser
- Check `backend/sessions/` directory exists
- Verify `SECRET_KEY` is set in environment variables

#### Region Not Found
- Check region name spelling
- Verify data folder exists for the region
- Ensure folder naming follows convention: `NightLights_Bright_<Region>` or `NightLights_Bright_<Region>_cleaned`

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

### Development Guidelines

- Follow existing code style
- Add comments for complex logic
- Update documentation for new features
- Test thoroughly before submitting PR
- Ensure no linter errors

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- NASA for VIIRS nightlights data
- Leaflet for mapping capabilities
- React and Flask communities
- All contributors and users

## 📞 Support

For issues, questions, or contributions, please open an issue on the GitHub repository.

---

**Built with ❤️ for analyzing Earth's nightlights and understanding economic growth patterns**
