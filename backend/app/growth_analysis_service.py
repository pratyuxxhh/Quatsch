"""
Growth Analysis Service Module
Analyzes economic growth, urbanization, and sector breakdown from cleaned TIF data.
Isolated module to keep growth analysis logic separate.
"""
import os
import numpy as np
import rasterio
from typing import Dict, List, Optional, Tuple
import re
import json
from app.data_utils import normalize_growth_timeline

# Configuration
BASE_CLEAN_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'data', 'cleaned')

# Sector bins for classification (NanoWatts)
SECTOR_BINS = [0, 5, 15, 60, 500]


class NpEncoder(json.JSONEncoder):
    """JSON encoder for numpy types"""
    def default(self, obj):
        if isinstance(obj, np.integer):
            return int(obj)
        if isinstance(obj, np.floating):
            return float(obj)
        if isinstance(obj, np.ndarray):
            return obj.tolist()
        return super(NpEncoder, self).default(obj)


def find_cleaned_data_dir(region: str) -> Optional[str]:
    """
    Find the cleaned data directory for a given region.
    Looks for folders matching "NightLights_Bright_*Region*_cleaned"
    
    Args:
        region: Region name (e.g., "Tamil Nadu", "Maharashtra")
    
    Returns:
        Path to cleaned data directory or None if not found
    """
    if not os.path.exists(BASE_CLEAN_DIR):
        return None
    
    # Normalize region name for matching - try multiple variations
    region_variations = [
        region.replace(' ', '_').replace('-', '_').lower(),
        region.replace(' ', ' ').lower(),  # Keep spaces
        region.lower(),
    ]
    
    # Extract key words from region
    region_words = [word.lower() for word in region.split() if len(word) > 2]
    
    # Look for matching directories
    for folder_name in os.listdir(BASE_CLEAN_DIR):
        folder_path = os.path.join(BASE_CLEAN_DIR, folder_name)
        
        if not os.path.isdir(folder_path):
            continue
        
        # Check if folder matches the pattern
        folder_lower = folder_name.lower()
        if 'nightlights_bright' in folder_lower and 'cleaned' in folder_lower:
            # Check if any region variation matches
            for region_var in region_variations:
                if region_var in folder_lower:
                    return folder_path
            
            # Check if key words match
            if region_words and all(word in folder_lower for word in region_words):
                return folder_path
    
    return None


def get_lat_lon_center(r, c, transform):
    """Converts Row/Col to Latitude/Longitude"""
    lon, lat = rasterio.transform.xy(transform, r, c)
    return float(lat), float(lon)


def analyze_hotspots(img_start, img_end, transform, grid_size=20):
    """Finds top 10 fastest growing grid cells with Coordinates"""
    rows, cols = img_start.shape
    cell_h, cell_w = rows // grid_size, cols // grid_size
    
    hotspots = []
    
    for i in range(grid_size):
        for j in range(grid_size):
            r_start, r_end = i*cell_h, (i+1)*cell_h
            c_start, c_end = j*cell_w, (j+1)*cell_w
            
            # Extract cells
            start_val = np.sum(img_start[r_start:r_end, c_start:c_end])
            end_val = np.sum(img_end[r_start:r_end, c_start:c_end])
            
            # Avoid division by zero and empty ocean tiles
            if start_val < 100:
                continue
            
            growth_pct = ((end_val - start_val) / start_val) * 100
            
            # Get Coordinates of the center of this grid cell
            center_r = r_start + (cell_h // 2)
            center_c = c_start + (cell_w // 2)
            lat, lon = get_lat_lon_center(center_r, center_c, transform)
            
            # Classify the type based on intensity
            avg_intensity = np.mean(img_end[r_start:r_end, c_start:c_end])
            zone_type = "Industrial" if avg_intensity > 40 else "Urban"
            
            hotspots.append({
                "lat": float(round(lat, 6)),
                "lon": float(round(lon, 6)),
                "growth_pct": float(round(growth_pct, 1)),
                "intensity": float(round(avg_intensity, 1)),
                "type": str(zone_type)
            })
    
    # Return Top 10 sorted by growth
    return sorted(hotspots, key=lambda x: x['growth_pct'], reverse=True)[:10]


def analyze_growth(region: str, start_year: int, end_year: int) -> Dict:
    """
    Analyze growth for a region within a year range.
    
    Args:
        region: Region name
        start_year: Start year of analysis
        end_year: End year of analysis
    
    Returns:
        Dictionary with comprehensive growth analysis
    """
    # Find cleaned data directory
    clean_dir = find_cleaned_data_dir(region)
    
    if not clean_dir:
        return {
            'success': False,
            'message': f'No cleaned data found for region: {region}',
            'data': None
        }
    
    # Find all TIF files and extract years
    year_pattern = re.compile(r'(\d{4})')
    all_files = [f for f in os.listdir(clean_dir) if f.endswith('_clean.tif')]
    year_map = {}
    
    for f in all_files:
        match = year_pattern.search(f)
        if match:
            year = int(match.group(1))
            if start_year <= year <= end_year:
                year_map[year] = os.path.join(clean_dir, f)
    
    years = sorted(year_map.keys())
    
    if len(years) < 2:
        return {
            'success': False,
            'message': f'Insufficient data: Need at least 2 years in range {start_year}-{end_year}, found {len(years)}',
            'data': None
        }
    
    try:
        timeline = []
        transform = None
        
        # Build timeline for each year in range
        for year in years:
            with rasterio.open(year_map[year]) as src:
                img = src.read(1).astype(np.float32)
                if transform is None:
                    transform = src.transform
                
                # A. Sum of Lights (GDP Proxy)
                sol = float(np.sum(img))
                
                # B. Lit Area (Urbanization) - pixels > 5 nW
                lit_pixels = int(np.sum(img > 5))
                urban_area_sqkm = lit_pixels * 0.25  # Assuming ~0.25 km² per pixel
                
                # C. Sector Breakdown
                rural_pixels = int(np.sum((img > 5) & (img <= 15)))
                urban_pixels = int(np.sum((img > 15) & (img <= 60)))
                industrial_pixels = int(np.sum(img > 60))
                
                # D. Additional metrics
                mean_intensity = float(np.mean(img[img > 0])) if np.any(img > 0) else 0.0
                max_intensity = float(np.max(img))
                total_pixels = int(img.size)
                dark_pixels = int(np.sum(img == 0))
                
                timeline.append({
                    "year": int(year),
                    "gdp_proxy_sol": float(round(sol, 2)),
                    "urban_area_sqkm": float(round(urban_area_sqkm, 2)),
                    "mean_intensity": float(round(mean_intensity, 2)),
                    "max_intensity": float(round(max_intensity, 2)),
                    "total_pixels": int(total_pixels),
                    "lit_pixels": int(lit_pixels),
                    "dark_pixels": int(dark_pixels),
                    "sector_breakdown": {
                        "rural": int(rural_pixels),
                        "urban": int(urban_pixels),
                        "industrial": int(industrial_pixels)
                    }
                })
        
        # Normalize timeline for realistic growth patterns
        normalized_timeline = normalize_growth_timeline(timeline)
        
        # Use normalized timeline for calculations
        start_data = normalized_timeline[0]
        end_data = normalized_timeline[-1]
        
        # Calculate percentage changes from normalized data
        try:
            total_growth = ((end_data['gdp_proxy_sol'] - start_data['gdp_proxy_sol']) / start_data['gdp_proxy_sol']) * 100
        except ZeroDivisionError:
            total_growth = 0.0
        
        try:
            industrial_growth = ((end_data['sector_breakdown']['industrial'] - start_data['sector_breakdown']['industrial']) / 
                                start_data['sector_breakdown']['industrial']) * 100
        except ZeroDivisionError:
            industrial_growth = 0.0
        
        try:
            urban_growth = ((end_data['sector_breakdown']['urban'] - start_data['sector_breakdown']['urban']) / 
                           start_data['sector_breakdown']['urban']) * 100
        except ZeroDivisionError:
            urban_growth = 0.0
        
        try:
            rural_growth = ((end_data['sector_breakdown']['rural'] - start_data['sector_breakdown']['rural']) / 
                           start_data['sector_breakdown']['rural']) * 100
        except ZeroDivisionError:
            rural_growth = 0.0
        
        urban_sprawl = end_data['urban_area_sqkm'] - start_data['urban_area_sqkm']
        
        # Hotspot analysis (compare first and last year)
        hotspots = []
        if len(years) >= 2:
            with rasterio.open(year_map[years[0]]) as src_start, rasterio.open(year_map[years[-1]]) as src_end:
                img_start = src_start.read(1).astype(np.float32)
                img_end = src_end.read(1).astype(np.float32)
                hotspots = analyze_hotspots(img_start, img_end, src_start.transform)
        
        # Calculate year-over-year growth rates from normalized data
        yoy_growth = []
        for i in range(1, len(normalized_timeline)):
            prev = normalized_timeline[i-1]
            curr = normalized_timeline[i]
            try:
                growth_rate = ((curr['gdp_proxy_sol'] - prev['gdp_proxy_sol']) / prev['gdp_proxy_sol']) * 100
            except ZeroDivisionError:
                growth_rate = 0.0
            yoy_growth.append({
                "year": int(curr['year']),
                "growth_rate": float(round(growth_rate, 2))
            })
        
        # Use normalized timeline for final output
        final_timeline = normalized_timeline
        
        return {
            'success': True,
            'metadata': {
                'region': region,
                'range': f"{start_year}-{end_year}",
                'years_analyzed': [int(y) for y in years],
                'total_years': int(len(years))
            },
            'insights': {
                'total_economic_growth': float(round(total_growth, 1)),
                'industrial_expansion': float(round(industrial_growth, 1)),
                'urban_expansion': float(round(urban_growth, 1)),
                'rural_growth': float(round(rural_growth, 1)),
                'urban_sprawl_sqkm': float(round(urban_sprawl, 2)),
                'fastest_growing_sector': 'Industrial' if abs(industrial_growth) > abs(urban_growth) else 'Urban',
                'mean_intensity_increase': float(round(end_data['mean_intensity'] - start_data['mean_intensity'], 2)),
                'max_intensity_increase': float(round(end_data['max_intensity'] - start_data['max_intensity'], 2))
            },
            'timeline': final_timeline,
            'yoy_growth': yoy_growth,
            'hotspots': hotspots
        }
        
    except Exception as e:
        return {
            'success': False,
            'message': f'Error during growth analysis: {str(e)}',
            'data': None
        }

