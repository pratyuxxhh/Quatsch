"""
Comparison Service Module
Compares two specific years of nightlights data.
Isolated module to keep comparison logic separate.
"""
import os
import numpy as np
import rasterio
from typing import Dict, List, Optional
import re

# Configuration
BASE_CLEAN_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'data', 'cleaned')


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


def get_tif_file_for_year(clean_dir: str, year: int) -> Optional[str]:
    """
    Get the TIF file path for a specific year
    
    Args:
        clean_dir: Path to cleaned data directory
        year: Year to get data for
    
    Returns:
        Full path to TIF file or None if not found
    """
    if not os.path.exists(clean_dir):
        return None
    
    year_pattern = re.compile(rf'(\d{{4}})')
    year_str = str(year)
    
    for filename in os.listdir(clean_dir):
        if filename.endswith('_clean.tif') and year_str in filename:
            match = year_pattern.search(filename)
            if match and int(match.group(1)) == year:
                return os.path.join(clean_dir, filename)
    
    return None


def get_png_file_for_year(clean_dir: str, year: int) -> Optional[str]:
    """
    Get the PNG view file path for a specific year
    
    Args:
        clean_dir: Path to cleaned data directory
        year: Year to get data for
    
    Returns:
        Full path to PNG file or None if not found
    """
    if not os.path.exists(clean_dir):
        return None
    
    year_pattern = re.compile(rf'(\d{{4}})')
    year_str = str(year)
    
    for filename in os.listdir(clean_dir):
        if filename.endswith('_view.png') and year_str in filename:
            match = year_pattern.search(filename)
            if match and int(match.group(1)) == year:
                return os.path.join(clean_dir, filename)
    
    return None


def compare_years(region: str, year1: int, year2: int) -> Dict:
    """
    Compare two specific years of nightlights data.
    
    Args:
        region: Region name
        year1: First year to compare
        year2: Second year to compare
    
    Returns:
        Dictionary with comprehensive comparison data
    """
    # Find cleaned data directory
    clean_dir = find_cleaned_data_dir(region)
    
    if not clean_dir:
        return {
            'success': False,
            'message': f'No cleaned data found for region: {region}',
            'data': None
        }
    
    # Get file paths for both years (TIF for data, PNG for visualization)
    file1 = get_tif_file_for_year(clean_dir, year1)
    file2 = get_tif_file_for_year(clean_dir, year2)
    png1 = get_png_file_for_year(clean_dir, year1)
    png2 = get_png_file_for_year(clean_dir, year2)
    
    if not file1:
        return {
            'success': False,
            'message': f'No data found for year {year1}',
            'data': None
        }
    
    if not file2:
        return {
            'success': False,
            'message': f'No data found for year {year2}',
            'data': None
        }
    
    try:
        # Load both years' data
        with rasterio.open(file1) as src1, rasterio.open(file2) as src2:
            img1 = src1.read(1).astype(np.float32)
            img2 = src2.read(1).astype(np.float32)
            transform = src1.transform
            
            # Match sizes
            rows = min(img1.shape[0], img2.shape[0])
            cols = min(img1.shape[1], img2.shape[1])
            img1 = img1[:rows, :cols]
            img2 = img2[:rows, :cols]
            
            # Calculate metrics for Year 1
            year1_data = {
                'year': int(year1),
                'gdp_proxy_sol': float(round(np.sum(img1), 2)),
                'urban_area_sqkm': float(round(np.sum(img1 > 5) * 0.25, 2)),
                'mean_intensity': float(round(np.mean(img1[img1 > 0]) if np.any(img1 > 0) else 0.0, 2)),
                'max_intensity': float(round(np.max(img1), 2)),
                'lit_pixels': int(np.sum(img1 > 5)),
                'dark_pixels': int(np.sum(img1 == 0)),
                'sector_breakdown': {
                    'rural': int(np.sum((img1 > 5) & (img1 <= 15))),
                    'urban': int(np.sum((img1 > 15) & (img1 <= 60))),
                    'industrial': int(np.sum(img1 > 60))
                }
            }
            
            # Calculate metrics for Year 2
            year2_data = {
                'year': int(year2),
                'gdp_proxy_sol': float(round(np.sum(img2), 2)),
                'urban_area_sqkm': float(round(np.sum(img2 > 5) * 0.25, 2)),
                'mean_intensity': float(round(np.mean(img2[img2 > 0]) if np.any(img2 > 0) else 0.0, 2)),
                'max_intensity': float(round(np.max(img2), 2)),
                'lit_pixels': int(np.sum(img2 > 5)),
                'dark_pixels': int(np.sum(img2 == 0)),
                'sector_breakdown': {
                    'rural': int(np.sum((img2 > 5) & (img2 <= 15))),
                    'urban': int(np.sum((img2 > 15) & (img2 <= 60))),
                    'industrial': int(np.sum(img2 > 60))
                }
            }
            
            # Calculate differences and changes
            diff_img = img2 - img1
            absolute_diff = np.abs(diff_img)
            
            # Calculate percentage changes
            def safe_percent_change(old_val, new_val):
                if old_val == 0:
                    return 0.0 if new_val == 0 else 100.0
                return ((new_val - old_val) / old_val) * 100
            
            changes = {
                'gdp_proxy_change': float(round(safe_percent_change(year1_data['gdp_proxy_sol'], year2_data['gdp_proxy_sol']), 2)),
                'urban_area_change': float(round(safe_percent_change(year1_data['urban_area_sqkm'], year2_data['urban_area_sqkm']), 2)),
                'mean_intensity_change': float(round(safe_percent_change(year1_data['mean_intensity'], year2_data['mean_intensity']), 2)),
                'max_intensity_change': float(round(safe_percent_change(year1_data['max_intensity'], year2_data['max_intensity']), 2)),
                'lit_pixels_change': float(round(safe_percent_change(year1_data['lit_pixels'], year2_data['lit_pixels']), 2)),
                'sector_changes': {
                    'rural': float(round(safe_percent_change(year1_data['sector_breakdown']['rural'], year2_data['sector_breakdown']['rural']), 2)),
                    'urban': float(round(safe_percent_change(year1_data['sector_breakdown']['urban'], year2_data['sector_breakdown']['urban']), 2)),
                    'industrial': float(round(safe_percent_change(year1_data['sector_breakdown']['industrial'], year2_data['sector_breakdown']['industrial']), 2))
                }
            }
            
            # Calculate absolute differences
            absolute_changes = {
                'gdp_proxy_diff': float(round(year2_data['gdp_proxy_sol'] - year1_data['gdp_proxy_sol'], 2)),
                'urban_area_diff': float(round(year2_data['urban_area_sqkm'] - year1_data['urban_area_sqkm'], 2)),
                'mean_intensity_diff': float(round(year2_data['mean_intensity'] - year1_data['mean_intensity'], 2)),
                'max_intensity_diff': float(round(year2_data['max_intensity'] - year1_data['max_intensity'], 2))
            }
            
            # Find areas of significant change (for visualization)
            # Areas that got brighter (positive change)
            brightened_mask = diff_img > 10  # Significant increase (> 10 nW)
            brightened_pixels = int(np.sum(brightened_mask))
            
            # Areas that got darker (negative change)
            darkened_mask = diff_img < -10  # Significant decrease (< -10 nW)
            darkened_pixels = int(np.sum(darkened_mask))
            
            # Calculate statistics on the difference
            diff_stats = {
                'mean_change': float(round(np.mean(diff_img), 2)),
                'max_increase': float(round(np.max(diff_img), 2)),
                'max_decrease': float(round(np.min(diff_img), 2)),
                'std_dev': float(round(np.std(diff_img), 2)),
                'brightened_pixels': brightened_pixels,
                'darkened_pixels': darkened_pixels,
                'unchanged_pixels': int(rows * cols - brightened_pixels - darkened_pixels)
            }
            
            # Determine which sector grew fastest
            sector_growths = changes['sector_changes']
            fastest_sector = max(sector_growths.items(), key=lambda x: abs(x[1]))
            
            # Get PNG filenames for API access
            png1_filename = None
            png2_filename = None
            if png1 and os.path.exists(png1):
                # Get just the filename and construct path relative to data directory
                png1_basename = os.path.basename(png1)
                # Construct path: cleaned/NightLights_Bright_Region_cleaned/filename.png
                folder_name = os.path.basename(clean_dir)
                png1_filename = f"cleaned/{folder_name}/{png1_basename}".replace('\\', '/')
            if png2 and os.path.exists(png2):
                png2_basename = os.path.basename(png2)
                folder_name = os.path.basename(clean_dir)
                png2_filename = f"cleaned/{folder_name}/{png2_basename}".replace('\\', '/')
            
            return {
                'success': True,
                'region': region,
                'year1': year1_data,
                'year2': year2_data,
                'changes': changes,
                'absolute_changes': absolute_changes,
                'difference_stats': diff_stats,
                'images': {
                    'year1_png': png1_filename,
                    'year2_png': png2_filename
                },
                'insights': {
                    'overall_trend': 'Growth' if changes['gdp_proxy_change'] > 0 else 'Decline',
                    'fastest_growing_sector': fastest_sector[0],
                    'fastest_sector_growth': float(round(fastest_sector[1], 2)),
                    'urbanization_rate': float(round(changes['urban_area_change'], 2)),
                    'economic_growth_rate': float(round(changes['gdp_proxy_change'], 2))
                }
            }
            
    except Exception as e:
        return {
            'success': False,
            'message': f'Error during comparison: {str(e)}',
            'data': None
        }


