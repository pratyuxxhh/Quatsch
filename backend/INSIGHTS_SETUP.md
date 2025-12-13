# Insights Service Setup Guide

## Overview
The insights service provides contextual information about regions and years that may correlate with nightlights growth. It fetches news, events, and general information from multiple sources.

## API Key Setup

### Option 1: NewsAPI (Recommended)
NewsAPI provides news articles for regions and years.

1. **Get a free API key:**
   - Visit: https://newsapi.org/
   - Sign up for a free account
   - Get your API key from the dashboard

2. **Set the environment variable:**
   ```bash
   export NEWS_API_KEY="your-api-key-here"
   ```
   
   Or add to your `.env` file in the backend directory:
   ```
   NEWS_API_KEY=your-api-key-here
   ```

3. **Free tier limits:**
   - 100 requests per day
   - Development/testing only
   - For production, upgrade to a paid plan

### Option 2: No API Key (Fallback Mode)
If no API key is provided, the service will:
- Use Wikipedia for general region information
- Generate contextual insights based on region and year
- Still provide useful information, just without real-time news

## How It Works

The insights service tries multiple sources in order:

1. **NewsAPI** (if API key is available)
   - Fetches real news articles for the region and year
   - Provides most relevant and up-to-date information

2. **Wikipedia** (fallback)
   - Gets general information about the region
   - Provides context about the area

3. **General Analysis** (final fallback)
   - Generates contextual insights about economic growth
   - Explains nightlights patterns in general terms

## API Endpoint

```
GET /api/insights?region=<region_name>&year=<year>&max_results=<number>
```

**Parameters:**
- `region` (required): Region name (e.g., "Tamil Nadu", "United States")
- `year` (required): Year (e.g., 2024)
- `max_results` (optional): Maximum number of insights (default: 5, max: 10)

**Example:**
```
GET /api/insights?region=Tamil%20Nadu&year=2024&max_results=5
```

**Response:**
```json
{
  "success": true,
  "region": "Tamil Nadu",
  "year": 2024,
  "insights": [
    {
      "type": "news",
      "text": "Article title and description...",
      "source": "News Source Name",
      "url": "https://..."
    }
  ],
  "sources": ["NewsAPI"],
  "count": 5
}
```

## Installation

Make sure you have the required dependencies:

```bash
cd backend
pip install -r app/requirements.txt
```

The `requests` library is required for API calls.

## Testing

Test the insights service:

```bash
# With API key
curl "http://localhost:5000/api/insights?region=Tamil%20Nadu&year=2024"

# Without API key (will use fallback)
curl "http://localhost:5000/api/insights?region=United%20States&year=2020"
```

## Troubleshooting

### No insights returned
- Check if the API key is set correctly
- Verify the region name is valid
- Check backend logs for errors

### Rate limiting
- NewsAPI free tier has 100 requests/day limit
- Service will automatically fall back to Wikipedia/general insights

### API errors
- Check your internet connection
- Verify API key is valid
- Service will gracefully fall back to other sources

## Code Structure

The insights service is isolated in:
- `backend/app/insights_service.py` - Main service logic
- `backend/app/routes.py` - API endpoint (insights_bp blueprint)

This keeps insights functionality separate from other features.




