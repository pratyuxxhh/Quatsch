import os
import json
import numpy as np
import rasterio
from PIL import Image, ImageDraw
from datetime import datetime
from scipy.ndimage import label

# ================================
# CONFIG
# ================================
# UPDATE THIS TO YOUR CLEAED FOLDER
CLEAN_DIR = "/home/nakshtra/Desktop/whackiest/Quatsch/backend/data/cleaned/NightLights_Bright_Tamil Nadu_cleaned"
ANOMALY_DIR = "/home/nakshtra/Desktop/whackiest/Quatsch/backend/data/anomalies"
os.makedirs(ANOMALY_DIR, exist_ok=True)

# SMART PARAMETERS
BASELINE_YEARS = [2016, 2017, 2018]
Z_SCORE_THRESHOLD = 3.0       # Higher threshold (was 2.5) to reduce noise
MIN_BRIGHTNESS_DIFF = 10.0    # Pixel must be at least +10 units brighter (The "Real World" check)
MIN_CLUSTER_SIZE = 3          # Ignore tiny 1-2 pixel dots

# ================================
# STEP 1: ROBUST BASELINE (Median, not Mean)
# ================================
def build_baseline(clean_dir, baseline_years):
    print("\n🔧 Building Baseline (Using Median for robustness)...")
    
    baseline_images = []
    tif_files = [f for f in os.listdir(clean_dir) if f.endswith("_clean.tif")]
    
    for tif_file in tif_files:
        try:
            # Extract year safely
            year_str = ''.join(filter(str.isdigit, tif_file))[:4]
            if not year_str: continue
            
            year = int(year_str)
            if year in baseline_years:
                path = os.path.join(clean_dir, tif_file)
                with rasterio.open(path) as src:
                    img = src.read(1).astype(np.float32)
                    baseline_images.append(img)
                    print(f"  ✓ Added Year: {year}")
        except Exception as e:
            print(f"  ⚠️ Error reading {tif_file}: {e}")
    
    if not baseline_images:
        raise ValueError("No baseline images found!")

    stack = np.stack(baseline_images, axis=0)
    
    # USE MEDIAN: It ignores outliers (like a one-time fire in 2017)
    baseline_median = np.median(stack, axis=0)
    baseline_std = np.std(stack, axis=0)
    
    # Prevent division by zero
    baseline_std[baseline_std < 0.5] = 0.5
    
    return baseline_median, baseline_std

# ================================
# STEP 2: THE "DOUBLE LOCK" DETECTION
# ================================
def detect_anomalies(img, baseline_median, baseline_std):
    """
    Flags anomalies ONLY if they pass both Statistical AND Physical checks.
    """
    # 1. Calculate Absolute Difference (Physics)
    # "How much brighter is it in NanoWatts?"
    diff = img - baseline_median
    
    # 2. Calculate Z-Score (Statistics)
    # "How rare is this change?"
    z_scores = diff / baseline_std
    
    # 3. THE DOUBLE LOCK LOGIC
    # It must be a rare spike (Z > 3) AND a physically bright change (Diff > 10)
    # This ignores "background noise" where 0.1 becomes 0.2 (high Z, low Diff)
    anomaly_mask = (z_scores > Z_SCORE_THRESHOLD) & (diff > MIN_BRIGHTNESS_DIFF)
    
    # 4. Cluster Filtering (Remove Speckles)
    labeled_array, num_features = label(anomaly_mask)
    for i in range(1, num_features + 1):
        if np.sum(labeled_array == i) < MIN_CLUSTER_SIZE:
            anomaly_mask[labeled_array == i] = False
            
    return anomaly_mask, z_scores, diff

# ================================
# STEP 3: VISUALIZATION
# ================================
def save_visualization(tif_img, anomaly_mask, output_path):
    # Base Image: Scaled for visibility (Divide by 60)
    norm = np.clip(tif_img / 60.0, 0, 1)
    base_rgb = (np.dstack([norm]*3) * 255).astype(np.uint8)
    
    # Create Red Overlay
    overlay = np.zeros_like(base_rgb)
    overlay[anomaly_mask] = [255, 0, 0] # Red
    
    # Blend: 70% Base + 30% Red
    # But make anomalies 100% Red so they POP
    final_img = Image.fromarray(base_rgb)
    final_draw = ImageDraw.Draw(final_img)
    
    rows, cols = np.where(anomaly_mask)
    for r, c in zip(rows, cols):
        # Draw a slightly larger red dot for visibility
        final_draw.point((c, r), fill=(255, 30, 30))
        
        # Optional: Draw circles around big clusters
        # (omitted for speed)

    final_img.save(output_path)
    print(f"  🎨 Saved Visual → {os.path.basename(output_path)}")

# ================================
# MAIN
# ================================
if __name__ == "__main__":
    print("\n🚀 Starting calibrated anomaly detection...")
    
    # 1. Build Baseline
    base_med, base_std = build_baseline(CLEAN_DIR, BASELINE_YEARS)
    
    files = [f for f in os.listdir(CLEAN_DIR) if f.endswith("_clean.tif")]
    
    for f in files:
        # Skip baseline years for detection (optional)
        if any(str(y) in f for y in BASELINE_YEARS):
            continue
            
        print(f"\n🔍 Analyzing {f}...")
        path = os.path.join(CLEAN_DIR, f)
        
        with rasterio.open(path) as src:
            curr_img = src.read(1).astype(np.float32)
            
        # Detect
        mask, z, diff = detect_anomalies(curr_img, base_med, base_std)
        count = np.sum(mask)
        
        print(f"  🚨 Anomalies Found: {count} pixels")
        
        # Save output
        out_name = f.replace("_clean.tif", "_anomaly.png")
        save_visualization(curr_img, mask, os.path.join(ANOMALY_DIR, out_name))