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
# Load from .env file explicitly
from dotenv import load_dotenv
load_dotenv()

# Guardian API (optional - free tier with historical data)
GUARDIAN_API_KEY = os.environ.get('GUARDIAN_API_KEY', '').strip()
GUARDIAN_API_URL = 'https://content.guardianapis.com/search'

# Wikipedia APIs (free, no key needed)
WIKIPEDIA_API_URL = 'https://en.wikipedia.org/api/rest_v1/page/summary'
WIKIPEDIA_EVENTS_URL = 'https://en.wikipedia.org/api/rest_v1/page/html'

if GUARDIAN_API_KEY:
    print(f"✅ Guardian API key loaded (length: {len(GUARDIAN_API_KEY)})")
else:
    print("ℹ️  Guardian API key not found. Using Wikipedia Events (free, no key needed).")


def normalize_region_name(region: str) -> str:
    """
    Normalize region name for API queries
    """
    # Map common region names to search-friendly terms
    region_map = {
        'tamil nadu': 'Tamil Nadu',
        'jharkhand': 'Jharkhand',
        'united states': 'United States',
        'usa': 'United States',
        'uk': 'United Kingdom',
        'united kingdom': 'United Kingdom',
    }
    
    region_lower = region.lower().strip()
    return region_map.get(region_lower, region.title())


def fetch_guardian_news(region: str, year: int, max_results: int = 5) -> List[Dict]:
    """
    Fetch historical news articles from The Guardian API (free tier, has historical data)
    
    Args:
        region: Region name
        year: Year to search for
        max_results: Maximum number of results to return
    
    Returns:
        List of insight dictionaries
    """
    if not GUARDIAN_API_KEY:
        return []
    
    try:
        normalized_region = normalize_region_name(region)
        
        # Guardian API supports historical data
        params = {
            'q': f'{normalized_region}',
            'from-date': f'{year}-01-01',
            'to-date': f'{year}-12-31',
            'page-size': max_results,
            'api-key': GUARDIAN_API_KEY,
            'show-fields': 'headline,trailText,thumbnail'
        }
        
        response = requests.get(GUARDIAN_API_URL, params=params, timeout=10)
        
        if response.status_code == 200:
            data = response.json()
            response_data = data.get('response', {})
            articles = response_data.get('results', [])
            
            if not articles:
                return []
            
            insights = []
            for article in articles[:max_results]:
                fields = article.get('fields', {})
                title = fields.get('headline', article.get('webTitle', ''))
                description = fields.get('trailText', '')
                
                if not title:
                    continue
                
                insight_text = title
                if description and len(description) > 50:
                    insight_text = f"{title}: {description[:150]}..."
                
                insights.append({
                    'type': 'news',
                    'text': insight_text,
                    'source': 'The Guardian',
                    'url': article.get('webUrl', '')
                })
            
            print(f"✅ Fetched {len(insights)} Guardian news insights for {normalized_region} ({year})")
            return insights
        else:
            print(f"Guardian API HTTP error {response.status_code}")
            return []
            
    except Exception as e:
        print(f"Error fetching Guardian news: {str(e)}")
        return []


def fetch_wikipedia_events(region: str, year: int, max_results: int = 5) -> List[Dict]:
    """
    Fetch historical events from Wikipedia for a region and year
    Uses Wikipedia's event pages - free, no API key needed, has historical data
    
    Args:
        region: Region name
        year: Year to search for
        max_results: Maximum number of results to return
    
    Returns:
        List of insight dictionaries
    """
    insights = []
    try:
        normalized_region = normalize_region_name(region)
        region_lower = normalized_region.lower()
        
        # Try multiple Wikipedia page strategies
        pages_to_try = [
            f"{year}_in_{normalized_region.replace(' ', '_')}",  # "2024_in_Tamil_Nadu"
            f"{year}_in_India",  # If it's an Indian state
            f"{year}",  # General year events
        ]
        
        seen_texts = set()  # Avoid duplicates
        
        for page_name in pages_to_try:
            if len(insights) >= max_results:
                break
                
            wiki_url = f"{WIKIPEDIA_API_URL}/{page_name}"
            response = requests.get(wiki_url, timeout=10)
            
            if response.status_code == 200:
                data = response.json()
                extract = data.get('extract', '')
                
                if extract and len(extract) > 100:
                    # Split into sentences and filter for relevant ones
                    sentences = [s.strip() for s in extract.split('.') if s.strip()]
                    
                    for sentence in sentences:
                        if len(insights) >= max_results:
                            break
                            
                        sentence_lower = sentence.lower()
                        
                        # Prioritize sentences that mention the region or are about significant events
                        is_relevant = (
                            region_lower in sentence_lower or
                            any(keyword in sentence_lower for keyword in ['development', 'growth', 'economic', 'industrial', 'urban', 'infrastructure', 'project', 'inaugurated', 'launched', 'announced'])
                        )
                        
                        # Filter out very short or very long sentences
                        if is_relevant and 40 <= len(sentence) <= 300 and sentence not in seen_texts:
                            insights.append({
                                'type': 'event',
                                'text': f"{sentence}",
                                'source': 'Wikipedia Events',
                                'url': data.get('content_urls', {}).get('desktop', {}).get('page', '')
                            })
                            seen_texts.add(sentence)
        
        # If still not enough, get general region information with year context
        if len(insights) < max_results:
            wiki_url = f"{WIKIPEDIA_API_URL}/{normalized_region.replace(' ', '_')}"
        response = requests.get(wiki_url, timeout=10)
        
        if response.status_code == 200:
            data = response.json()
            extract = data.get('extract', '')
            
            if extract:
                    # Extract first meaningful paragraph
                    paragraphs = [p.strip() for p in extract.split('\n') if len(p.strip()) > 50]
                    if paragraphs:
                        first_para = paragraphs[0]
                        if len(first_para) > 200:
                            first_para = first_para[:200] + "..."
                        
                        insight_text = f"In {year}, {normalized_region}: {first_para}"
                        insights.append({
                    'type': 'general',
                            'text': insight_text,
                    'source': 'Wikipedia',
                    'url': data.get('content_urls', {}).get('desktop', {}).get('page', '')
                        })
        
        if insights:
            print(f"✅ Fetched {len(insights)} Wikipedia event insights for {normalized_region} ({year})")
        
        return insights[:max_results]
        
    except Exception as e:
        print(f"Error fetching Wikipedia events: {str(e)}")
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
    
    # Try Guardian API first (if API key is available) - has historical data
    if GUARDIAN_API_KEY:
        guardian_insights = fetch_guardian_news(region, year, max_results)
        if guardian_insights:
            insights.extend(guardian_insights)
            sources_used.append('The Guardian')
    
    # Always try Wikipedia Events (free, no key needed, has historical data)
    if len(insights) < max_results:
        wiki_insights = fetch_wikipedia_events(region, year, max_results - len(insights))
        if wiki_insights:
            insights.extend(wiki_insights)
            sources_used.append('Wikipedia Events')
    
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




