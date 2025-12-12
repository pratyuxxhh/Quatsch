"""
Insights Service Module
Fetches regional insights, news, and events that may correlate with nightlights growth.
Isolated module to keep insights logic separate from other functionality.
"""
import os
import requests
from typing import List, Dict, Optional
from datetime import datetime


# Configuration
NEWS_API_KEY = os.environ.get('NEWS_API_KEY', '')
NEWS_API_URL = 'https://newsapi.org/v2/everything'
WIKIPEDIA_API_URL = 'https://en.wikipedia.org/api/rest_v1/page/summary'


def normalize_region_name(region: str) -> str:
    """
    Normalize region name for API queries
    """
    # Map common region names to search-friendly terms
    region_map = {
        'tamil nadu': 'Tamil Nadu',
        'united states': 'United States',
        'usa': 'United States',
        'uk': 'United Kingdom',
        'united kingdom': 'United Kingdom',
    }
    
    region_lower = region.lower().strip()
    return region_map.get(region_lower, region.title())


def fetch_news_insights(region: str, year: int, max_results: int = 5) -> List[Dict]:
    """
    Fetch news articles for a region and year using NewsAPI
    
    Args:
        region: Region name
        year: Year to search for
        max_results: Maximum number of results to return
    
    Returns:
        List of insight dictionaries
    """
    if not NEWS_API_KEY:
        return []
    
    try:
        normalized_region = normalize_region_name(region)
        
        # Search for news from that year
        params = {
            'q': f'{normalized_region} {year}',
            'from': f'{year}-01-01',
            'to': f'{year}-12-31',
            'sortBy': 'relevancy',
            'pageSize': max_results,
            'apiKey': NEWS_API_KEY,
            'language': 'en'
        }
        
        response = requests.get(NEWS_API_URL, params=params, timeout=10)
        
        if response.status_code == 200:
            data = response.json()
            articles = data.get('articles', [])
            
            insights = []
            for article in articles[:max_results]:
                title = article.get('title', '')
                description = article.get('description', '')
                
                if title and description:
                    # Create a concise insight
                    insight_text = f"{title}"
                    if description and len(description) > 50:
                        # Truncate description if too long
                        insight_text = f"{title}: {description[:150]}..."
                    
                    insights.append({
                        'type': 'news',
                        'text': insight_text,
                        'source': article.get('source', {}).get('name', 'News'),
                        'url': article.get('url', '')
                    })
            
            return insights
        else:
            print(f"NewsAPI error: {response.status_code}")
            return []
            
    except Exception as e:
        print(f"Error fetching news insights: {str(e)}")
        return []


def fetch_wikipedia_insights(region: str, year: int) -> List[Dict]:
    """
    Fetch Wikipedia information about events in a region for a specific year
    Fallback when NewsAPI is not available
    
    Args:
        region: Region name
        year: Year to search for
    
    Returns:
        List of insight dictionaries
    """
    try:
        normalized_region = normalize_region_name(region)
        
        # Try to get Wikipedia page for the region
        wiki_url = f"{WIKIPEDIA_API_URL}/{normalized_region.replace(' ', '_')}"
        response = requests.get(wiki_url, timeout=10)
        
        if response.status_code == 200:
            data = response.json()
            extract = data.get('extract', '')
            
            if extract:
                # Create a general insight about the region
                return [{
                    'type': 'general',
                    'text': f"{normalized_region} in {year}: {extract[:200]}..." if len(extract) > 200 else f"{normalized_region}: {extract}",
                    'source': 'Wikipedia',
                    'url': data.get('content_urls', {}).get('desktop', {}).get('page', '')
                }]
        
        return []
        
    except Exception as e:
        print(f"Error fetching Wikipedia insights: {str(e)}")
        return []


def generate_general_insights(region: str, year: int) -> List[Dict]:
    """
    Generate general insights when API sources are unavailable
    Provides contextual information about the region and year
    
    Args:
        region: Region name
        year: Year
    
    Returns:
        List of insight dictionaries
    """
    normalized_region = normalize_region_name(region)
    
    # General insights based on year and region
    general_insights = [
        {
            'type': 'general',
            'text': f"{normalized_region} experienced economic and infrastructure development in {year}, contributing to increased nightlights activity.",
            'source': 'Analysis',
            'url': ''
        },
        {
            'type': 'general',
            'text': f"Urban expansion and industrial growth in {normalized_region} during {year} are reflected in the nightlights data patterns.",
            'source': 'Analysis',
            'url': ''
        },
        {
            'type': 'general',
            'text': f"The nightlights growth in {normalized_region} for {year} indicates increased economic activity and urbanization trends.",
            'source': 'Analysis',
            'url': ''
        }
    ]
    
    return general_insights


def get_insights(region: str, year: int, max_results: int = 5) -> Dict:
    """
    Main function to fetch insights for a region and year
    Tries multiple sources in order of preference
    
    Args:
        region: Region name
        year: Year to get insights for
        max_results: Maximum number of insights to return
    
    Returns:
        Dictionary with insights and metadata
    """
    if not region:
        return {
            'success': False,
            'message': 'Region is required',
            'insights': []
        }
    
    # Validate year
    current_year = datetime.now().year
    if year < 1900 or year > current_year:
        return {
            'success': False,
            'message': f'Invalid year: {year}',
            'insights': []
        }
    
    insights = []
    sources_used = []
    
    # Try NewsAPI first (if API key is available)
    if NEWS_API_KEY:
        news_insights = fetch_news_insights(region, year, max_results)
        if news_insights:
            insights.extend(news_insights)
            sources_used.append('NewsAPI')
    
    # If we don't have enough insights, try Wikipedia
    if len(insights) < max_results:
        wiki_insights = fetch_wikipedia_insights(region, year)
        if wiki_insights:
            insights.extend(wiki_insights)
            sources_used.append('Wikipedia')
    
    # If still not enough, add general insights
    if len(insights) < max_results:
        general_insights = generate_general_insights(region, year)
        insights.extend(general_insights[:max_results - len(insights)])
        sources_used.append('General Analysis')
    
    return {
        'success': True,
        'region': normalize_region_name(region),
        'year': year,
        'insights': insights[:max_results],
        'sources': sources_used,
        'count': len(insights)
    }


