"""
Anomaly Detection Service Module
Detects dark zone emergence anomalies using cleaned TIF data.
Isolated module to keep anomaly detection logic separate.
"""
import os
import numpy as np
import rasterio
from scipy.ndimage import label
from typing import Dict, List, Optional, Tuple
import re

# Configuration
BASE_CLEAN_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'data', 'cleaned')

# DARK ZONE EMERGENCE DETECTION PARAMETERS (from anomaly.py)
MIN_NEW_INTENSITY = 15.0      # Must be at least 15 nW bright (Real activity, not noise)
MAX_BASELINE_INTENSITY = 5.0  # Was dark before (< 5 nW = forest/rural)
MIN_CLUSTER_SIZE = 3          # Must be 3+ connected pixels (filters sensor glitches)


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
    
    # Normalize region name for matching
    region_normalized = region.replace(' ', '_').replace('-', '_').lower()
    
    # Look for matching directories
    for folder_name in os.listdir(BASE_CLEAN_DIR):
        folder_path = os.path.join(BASE_CLEAN_DIR, folder_name)
        
        if not os.path.isdir(folder_path):
            continue
        
        # Check if folder matches the pattern
        folder_lower = folder_name.lower()
        if 'nightlights_bright' in folder_lower and 'cleaned' in folder_lower:
            # Check if region name is in folder name
            if region_normalized in folder_lower or any(
                word in folder_lower for word in region_normalized.split('_')
            ):
                return folder_path
    
    return None


def get_available_years_from_dir(data_dir: str) -> List[int]:
    """
    Get list of available years from TIF files in the directory
    
    Args:
        data_dir: Path to directory containing cleaned TIF files
    
    Returns:
        List of years found
    """
    if not os.path.exists(data_dir):
        return []
    
    years = []
    year_pattern = re.compile(r'(\d{4})')
    
    for filename in os.listdir(data_dir):
        if filename.endswith('_clean.tif'):
            match = year_pattern.search(filename)
            if match:
                year = int(match.group(1))
                if year not in years:
                    years.append(year)
    
    return sorted(years)


def detect_anomalies(region: str) -> Dict:
    """
    Detect dark zone emergence anomalies for a region.
    Uses the last available year as target year.
    
    Args:
        region: Region name
    
    Returns:
        Dictionary with anomaly detection results
    """
    # Find cleaned data directory
    clean_dir = find_cleaned_data_dir(region)
    
    if not clean_dir:
        return {
            'success': False,
            'message': f'No cleaned data found for region: {region}',
            'anomalies': []
        }
    
    # Get available years
    available_years = get_available_years_from_dir(clean_dir)
    
    if len(available_years) < 2:
        return {
            'success': False,
            'message': f'Insufficient data: Need at least 2 years, found {len(available_years)}',
            'anomalies': []
        }
    
    # Use the last year as target year
    target_year = available_years[-1]
    target_year_str = str(target_year)
    
    # Find all cleaned TIF files
    all_files = sorted([f for f in os.listdir(clean_dir) if f.endswith('_clean.tif')])
    baseline_files = [f for f in all_files if target_year_str not in f]
    target_file = next((f for f in all_files if target_year_str in f), None)
    
    if not target_file:
        return {
            'success': False,
            'message': f'Target year {target_year} file not found',
            'anomalies': []
        }
    
    if len(baseline_files) == 0:
        return {
            'success': False,
            'message': 'No baseline files found for comparison',
            'anomalies': []
        }
    
    try:
        # Build baseline from historical data
        baseline_stack = []
        metadata = None
        
        for f in baseline_files:
            path = os.path.join(clean_dir, f)
            with rasterio.open(path) as src:
                img = src.read(1).astype(np.float32)
                baseline_stack.append(img)
                if metadata is None:
                    metadata = src.profile
        
        baseline_img = np.median(np.array(baseline_stack), axis=0)
        
        # Load target year data
        target_path = os.path.join(clean_dir, target_file)
        with rasterio.open(target_path) as src:
            target_img = src.read(1).astype(np.float32)
            transform = src.transform
        
        # Match sizes
        rows = min(baseline_img.shape[0], target_img.shape[0])
        cols = min(baseline_img.shape[1], target_img.shape[1])
        baseline_img = baseline_img[:rows, :cols]
        target_img = target_img[:rows, :cols]
        
        # DARK ZONE EMERGENCE DETECTION
        # Core logic: Light appeared where darkness was
        anomaly_mask = (
            (target_img > MIN_NEW_INTENSITY) &        # NOW: Bright enough to be real activity
            (baseline_img < MAX_BASELINE_INTENSITY)   # BEFORE: Was dark (forest/rural)
        )
        
        absolute_diff = target_img - baseline_img
        
        # Cluster filtering (Remove Noise)
        labeled_array, num_features = label(anomaly_mask)
        final_mask = np.zeros_like(anomaly_mask, dtype=bool)
        
        anomaly_stats = []
        
        for i in range(1, num_features + 1):
            cluster = labeled_array == i
            cluster_size = np.sum(cluster)
            
            if cluster_size >= MIN_CLUSTER_SIZE:
                final_mask[cluster] = True
                
                # Extract metadata
                rows_idx, cols_idx = np.where(cluster)
                center_row = int(np.mean(rows_idx))
                center_col = int(np.mean(cols_idx))
                
                lon, lat = rasterio.transform.xy(transform, center_row, center_col)
                
                anomaly_stats.append({
                    "id": len(anomaly_stats) + 1,
                    "lat": round(float(lat), 6),
                    "lon": round(float(lon), 6),
                    "pixel_count": int(cluster_size),
                    "current_intensity": round(float(np.mean(target_img[cluster])), 2),
                    "baseline_intensity": round(float(np.mean(baseline_img[cluster])), 2),
                    "intensity_gain": round(float(np.mean(absolute_diff[cluster])), 2),
                    "max_brightness": round(float(np.max(target_img[cluster])), 2)
                })
        
        # Calculate overall growth
        total_baseline = np.sum(baseline_img)
        total_target = np.sum(target_img)
        overall_growth = ((total_target - total_baseline) / total_baseline) * 100 if total_baseline > 0 else 0
        
        # Sort anomalies by intensity gain (highest first)
        anomaly_stats_sorted = sorted(anomaly_stats, key=lambda x: x['intensity_gain'], reverse=True)
        
        return {
            'success': True,
            'region': region,
            'target_year': target_year,
            'baseline_years': len(baseline_files),
            'detection_method': 'Dark Zone Emergence (Absolute Threshold)',
            'parameters': {
                'min_new_intensity': f'{MIN_NEW_INTENSITY} nW',
                'max_baseline_intensity': f'{MAX_BASELINE_INTENSITY} nW',
                'min_cluster_size': MIN_CLUSTER_SIZE
            },
            'results': {
                'total_anomalies': len(anomaly_stats_sorted),
                'total_anomalous_pixels': int(np.sum(final_mask)),
                'overall_lighting_growth': round(overall_growth, 2)
            },
            'anomalies': anomaly_stats_sorted
        }
        
    except Exception as e:
        return {
            'success': False,
            'message': f'Error during anomaly detection: {str(e)}',
            'anomalies': []
        }

