import os
import numpy as np
import rasterio
from scipy.ndimage import median_filter
from PIL import Image

# ================================
# CONFIG
# ================================
# UPDATE THIS PATH TO YOUR ACTUAL RAW FOLDER
RAW_DIR = "/home/nakshtra/Desktop/whackiest/Quatsch/backend/data/raw/NightLights_Bright_Tamil Nadu"
CLEAN_DIR = "/home/nakshtra/Desktop/whackiest/Quatsch/backend/data/cleaned/NightLights_Bright_Tamil Nadu_cleaned"

os.makedirs(CLEAN_DIR, exist_ok=True)

# ================================
# CLEANING FUNCTION (FINAL)
# ================================
def clean_raster(input_path, cleaned_tif_path, cleaned_png_path):
    with rasterio.open(input_path) as src:
        # Read as float32 to preserve scientific accuracy
        raw_img = src.read(1).astype(np.float32)
        img = raw_img.copy()
        profile = src.profile
        
        # Step 1 — Remove invalid values (Physics correction)
        img[img < 0] = 0
        img[np.isnan(img)] = 0
        
        # Step 2 — Noise removal (Smoothing sensor grain)
        img = median_filter(img, size=3)
        
        # Step 3 — Hard Cap for Outliers (Gas flares/Reflections)
        img = np.clip(img, 0, 300)
        
        # Step 4 — Save SCIENTIFIC DATA (TIFF)
        # This file is for the math/anomaly detection engine
        profile.update(dtype=rasterio.float32, nodata=0)
        with rasterio.open(cleaned_tif_path, "w", **profile) as dst:
            dst.write(img, 1)
        
        # Step 5 — Save VISUAL DATA (PNG)
        # ⚠️ FIXED SCALE: We divide by 60.0 to ensure 2024 looks brighter than 2016.
        # If we used adaptive scaling, the "growth" would disappear visually.
        visual_norm = np.clip(img / 60.0, 0, 1) 
        png = (visual_norm * 255).astype(np.uint8)
        
        Image.fromarray(png).save(cleaned_png_path)
        print(f"  ✨ Cleaned → {os.path.basename(cleaned_png_path)}")

# ================================
# MAIN PROGRAM
# ================================
print("\n🚀 Starting Production Cleaning Pipeline...\n")

if not os.path.exists(RAW_DIR):
    print(f"❌ Error: {RAW_DIR} does not exist.")
else:
    files = [f for f in os.listdir(RAW_DIR) if f.endswith(".tif")]
    
    if len(files) == 0:
        print(f"❌ No .tif files found in {RAW_DIR}")
    else:
        for i, filename in enumerate(files, start=1):
            input_path = os.path.join(RAW_DIR, filename)
            base_name = os.path.splitext(filename)[0]
            
            clean_tif = os.path.join(CLEAN_DIR, f"{base_name}_clean.tif")
            clean_png = os.path.join(CLEAN_DIR, f"{base_name}_view.png")
            
            print(f"📄 Processing {filename} ({i}/{len(files)})")
            clean_raster(input_path, clean_tif, clean_png)

print("\n🎉 PIPELINE COMPLETE! Cleaned files are ready for Anomaly Detection.\n")