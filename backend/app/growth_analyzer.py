import os
import numpy as np
import rasterio
from rasterio.windows import from_bounds
import json
from datetime import datetime
import re

# ================================
# CONFIG
# ================================
# UPDATED PATH as requested
CLEAN_DIR = "/home/nakshtra/Desktop/whackiest/Quatsch/backend/data/cleaned/NightLights_Bright_Tamil Nadu_cleaned"
OUTPUT_DIR = "/home/nakshtra/Desktop/whackiest/Quatsch/backend/data/growth_analysis"
os.makedirs(OUTPUT_DIR, exist_ok=True)

# Bins for Sector Analysis (NanoWatts)
SECTOR_BINS = [0, 5, 15, 60, 500] 

# ================================
# HELPERS
# ================================

# --- 1. JSON ENCODER FIX (Prevents the Crash) ---
class NpEncoder(json.JSONEncoder):
    def default(self, obj):
        if isinstance(obj, np.integer):
            return int(obj)
        if isinstance(obj, np.floating):
            return float(obj)
        if isinstance(obj, np.ndarray):
            return obj.tolist()
        return super(NpEncoder, self).default(obj)

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
            if start_val < 100: continue
            
            growth_pct = ((end_val - start_val) / start_val) * 100
            
            # Get Coordinates of the center of this grid cell
            center_r = r_start + (cell_h // 2)
            center_c = c_start + (cell_w // 2)
            lat, lon = get_lat_lon_center(center_r, center_c, transform)
            
            # Classify the type based on intensity
            avg_intensity = np.mean(img_end[r_start:r_end, c_start:c_end])
            zone_type = "Industrial" if avg_intensity > 40 else "Urban"

            hotspots.append({
                "lat": lat,
                "lon": lon,
                "growth_pct": round(growth_pct, 1),
                "intensity": round(avg_intensity, 1),
                "type": zone_type
            })

    # Return Top 10 sorted by growth
    return sorted(hotspots, key=lambda x: x['growth_pct'], reverse=True)[:10]

# ================================
# MAIN
# ================================
def generate_full_report():
    print("🚀 Generating Economic Intelligence Report...")
    
    # 1. FIND FILES
    year_pattern = re.compile(r"(\d{4})")
    
    if not os.path.exists(CLEAN_DIR):
        print(f"❌ Error: Directory not found: {CLEAN_DIR}")
        return

    all_files = [f for f in os.listdir(CLEAN_DIR) if f.endswith(".tif")]
    year_map = {}
    
    for f in all_files:
        match = year_pattern.search(f)
        if match:
            year = int(match.group(1))
            year_map[year] = os.path.join(CLEAN_DIR, f)
            
    years = sorted(year_map.keys())
    if len(years) < 2: 
        print(f"❌ Not enough data found in {CLEAN_DIR}. Found years: {years}")
        return

    timeline = []
    
    # 2. BUILD TIMELINE
    for year in years:
        with rasterio.open(year_map[year]) as src:
            img = src.read(1).astype(np.float32)
            if year == years[0]: transform = src.transform 

            # A. Sum of Lights (GDP)
            sol = float(np.sum(img))
            
            # B. Lit Area (Urbanization)
            lit_pixels = int(np.sum(img > 5))
            urban_area = lit_pixels * 0.25 
            
            # C. Sector Breakdown
            rural = int(np.sum((img > 5) & (img <= 15)))
            urban = int(np.sum((img > 15) & (img <= 60)))
            industrial = int(np.sum(img > 60))
            
            timeline.append({
                "year": int(year),
                "gdp_proxy_sol": float(round(sol, 2)),
                "urban_area_sqkm": float(round(urban_area, 2)),
                "sector_breakdown": {
                    "rural": int(rural),
                    "urban": int(urban),
                    "industrial": int(industrial)
                }
            })
            print(f"  -> Processed {year}")

    # 3. CALCULATE INSIGHTS
    start_data = timeline[0]
    end_data = timeline[-1]
    
    # 4. HOTSPOT ANALYSIS
    with rasterio.open(year_map[years[0]]) as src_start, rasterio.open(year_map[years[-1]]) as src_end:
        img_start = src_start.read(1)
        img_end = src_end.read(1)
        hotspots = analyze_hotspots(img_start, img_end, src_start.transform)

    # 5. FINAL JSON ASSEMBLY
    # Calculate % changes safely
    try:
        total_growth = ((end_data['gdp_proxy_sol'] - start_data['gdp_proxy_sol'])/start_data['gdp_proxy_sol']*100)
    except ZeroDivisionError:
        total_growth = 0.0

    try:
        industrial_growth = ((end_data['sector_breakdown']['industrial'] - start_data['sector_breakdown']['industrial'])/start_data['sector_breakdown']['industrial']*100)
    except ZeroDivisionError:
        industrial_growth = 0.0

    final_output = {
        "metadata": {
            "region": "Tamil Nadu",
            "range": f"{years[0]}-{years[-1]}"
        },
        "insights": {
            "total_economic_growth": f"{total_growth:.1f}%",
            "industrial_expansion": f"{industrial_growth:.1f}%",
            "urban_sprawl_sqkm": f"+{end_data['urban_area_sqkm'] - start_data['urban_area_sqkm']:.0f} km²",
            "fastest_growing_sector": "Industrial" if end_data['sector_breakdown']['industrial'] > start_data['sector_breakdown']['industrial'] else "Urban"
        },
        "timeline": timeline,
        "hotspots": hotspots
    }

    # Save with Custom Encoder
    out_path = os.path.join(OUTPUT_DIR, "growth_analysis_final.json")
    with open(out_path, "w") as f:
        # cls=NpEncoder fixes the float32 error
        json.dump(final_output, f, indent=2, cls=NpEncoder)
    
    print(f"✅ Success! Report saved to: {out_path}")

if __name__ == "__main__":
    generate_full_report()