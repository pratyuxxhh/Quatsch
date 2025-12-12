"""
TIF Data Extractor Module
Extracts data from TIF files and converts to JSON format for frontend consumption
"""
import rasterio
import numpy as np
import os
import json
from typing import Dict, List, Optional, Tuple


def extract_tif_to_json(filepath: str, sample_rate: int = 10) -> Dict:
    """
    Extract TIF data and convert to JSON format suitable for map visualization
    
    Args:
        filepath: Path to the TIF file
        sample_rate: Sample every Nth pixel to reduce data size (default: 10)
                    Set to 1 for full resolution
    
    Returns:
        Dictionary containing metadata and data points
    """
    if not os.path.exists(filepath):
        raise FileNotFoundError(f"TIF file not found: {filepath}")
    
    with rasterio.open(filepath) as src:
        # Read the data
        data = src.read(1).astype(np.float32)
        
        # Get metadata
        bounds = src.bounds
        transform = src.transform
        width = src.width
        height = src.height
        crs = str(src.crs) if src.crs else None
        
        # Extract data points (sampled to reduce size)
        data_points = []
        
        # Sample pixels based on sample_rate
        for row in range(0, height, sample_rate):
            for col in range(0, width, sample_rate):
                # Convert pixel coordinates to lat/lon
                lon, lat = src.xy(row, col)
                value = float(data[row, col])
                
                # Only include non-zero values (lit areas)
                if value > 0:
                    data_points.append({
                        'lat': round(lat, 6),
                        'lon': round(lon, 6),
                        'value': round(value, 4)
                    })
        
        # Calculate statistics
        lit_data = data[data > 0]
        
        result = {
            'metadata': {
                'filename': os.path.basename(filepath),
                'width': width,
                'height': height,
                'crs': crs,
                'bounds': {
                    'west': round(bounds.left, 6),
                    'south': round(bounds.bottom, 6),
                    'east': round(bounds.right, 6),
                    'north': round(bounds.top, 6)
                },
                'transform': {
                    'pixel_width': round(transform[0], 6),
                    'pixel_height': round(transform[4], 6),
                    'origin_x': round(transform[2], 6),
                    'origin_y': round(transform[5], 6)
                },
                'statistics': {
                    'min': round(float(np.min(data)), 4),
                    'max': round(float(np.max(data)), 4),
                    'mean_all': round(float(np.mean(data)), 4),
                    'mean_lit': round(float(np.mean(lit_data)), 4) if len(lit_data) > 0 else 0,
                    'std_dev': round(float(np.std(data)), 4),
                    'total_pixels': int(width * height),
                    'lit_pixels': int(len(lit_data)),
                    'dark_pixels': int(np.sum(data == 0))
                }
            },
            'data_points': data_points,
            'center': {
                'lat': round((bounds.top + bounds.bottom) / 2, 6),
                'lon': round((bounds.left + bounds.right) / 2, 6)
            }
        }
        
        return result


def get_available_years(data_dir: str) -> List[int]:
    """
    Get list of available years from TIF files in the data directory
    
    Args:
        data_dir: Path to directory containing TIF files
    
    Returns:
        List of years found in the directory
    """
    import re
    
    if not os.path.exists(data_dir):
        return []
    
    years = []
    year_pattern = re.compile(r'(\d{4})')
    
    for filename in os.listdir(data_dir):
        if filename.endswith('.tif'):
            match = year_pattern.search(filename)
            if match:
                year = int(match.group(1))
                if year not in years:
                    years.append(year)
    
    return sorted(years)


def get_tif_file_path(year: int, data_dir: str) -> Optional[str]:
    """
    Get the TIF file path for a given year
    
    Args:
        year: Year to get data for
        data_dir: Path to directory containing TIF files
    
    Returns:
        Full path to TIF file or None if not found
    """
    if not os.path.exists(data_dir):
        return None
    
    # Look for files matching the year pattern
    import re
    year_pattern = re.compile(rf'(\d{{4}}).*\.tif$')
    
    for filename in os.listdir(data_dir):
        match = year_pattern.search(filename)
        if match and int(match.group(1)) == year:
            return os.path.join(data_dir, filename)
    
    return None



