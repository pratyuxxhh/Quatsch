import os
import numpy as np
import rasterio
from scipy.ndimage import median_filter
from PIL import Image

# ================================
# CONFIGURATION
# ================================
# Exact paths based on your setup
RAW_DIR = "/home/nakshtra/Desktop/whackiest/Quatsch/backend/data/raw/NightLights_Bright_Jharkhand"
CLEAN_DIR = "/home/nakshtra/Desktop/whackiest/Quatsch/backend/data/cleaned/NightLights_Bright_Jharkhand_cleaned"

# Create output folder if it doesn't exist
os.makedirs(CLEAN_DIR, exist_ok=True)

# ================================
# LOGIC: BACKGROUND FOG REMOVAL
# ================================
def remove_background_fog(img):
    """
    Detects 'sensor drift' (gray fog) in later years and subtracts it.
    This ensures 2025 looks as sharp as 2016.
    """
    # 1. Estimate Background: We look at the 20th percentile (dark areas)
    # If the image is truly dark (like 2016), this will be ~0.
    # If the image has 'fog' (like 2025), this might be ~25.
    background_estimate = np.percentile(img, 20) 
    
    # 2. Safety Check: If background is already clean (< 1.0), do nothing.
    if background_estimate < 1.0:
        return img
    
    print(f"    - 🌫️ Fog Detected! Removing sensor offset of {background_estimate:.2f} nW")
    
    # 3. Subtract the offset
    corrected_img = img - background_estimate
    
    # 4. Physics Check: Light cannot be negative
    corrected_img[corrected_img < 0] = 0
    
    return corrected_img

# ================================
# MAIN CLEANING PIPELINE
# ================================
def clean_raster(input_path, cleaned_tif_path, cleaned_png_path):
    with rasterio.open(input_path) as src:
        # Read as float32 to preserve scientific decimals
        raw_img = src.read(1).astype(np.float32)
        img = raw_img.copy()
        profile = src.profile

        # --- STEP 1: SANITIZATION ---
        # Remove NaNs and negative values (Physics Floor)
        img[np.isnan(img)] = 0
        img[img < 0] = 0
        
        # --- STEP 2: FOG REMOVAL (The Fix for 2022-2025) ---
        img = remove_background_fog(img)

        # --- STEP 3: SPATIAL DENOISING ---
        # Median filter removes "salt & pepper" static without blurring cities
        img = median_filter(img, size=3)

        # --- STEP 4: OUTLIER CLIPPING (The Ceiling) ---
        # Cap flares/reflections at 300 nW (standard for cities)
        img = np.clip(img, 0, 300)

        # --- STEP 5: SAVE SCIENTIFIC DATA (TIF) ---
        # This is what your Anomaly Detector will read
        profile.update(dtype=rasterio.float32, nodata=0)
        with rasterio.open(cleaned_tif_path, "w", **profile) as dst:
            dst.write(img, 1)

        # --- STEP 6: SAVE VISUAL DATA (PNG) ---
        # FIXED SCALE: Divide by 60.0 so 2024 looks brighter than 2016
        visual_norm = np.clip(img / 60.0, 0, 1) 
        png = (visual_norm * 255).astype(np.uint8)
        
        # Save as grayscale PNG for frontend
        Image.fromarray(png).save(cleaned_png_path)
        
        print(f"  ✨ Cleaned → {os.path.basename(cleaned_png_path)}")

# ================================
# EXECUTION LOOP
# ================================
print("\n🚀 Starting FOG-CORRECTED Cleaning Pipeline...\n")

if not os.path.exists(RAW_DIR):
    print(f"❌ Error: Raw directory not found at {RAW_DIR}")
else:
    files = [f for f in os.listdir(RAW_DIR) if f.endswith(".tif")]
    
    if len(files) == 0:
        print("❌ No .tif files found.")
    else:
        for i, filename in enumerate(files, start=1):
            input_full_path = os.path.join(RAW_DIR, filename)
            
            # Keep original filename structure
            base_name = os.path.splitext(filename)[0]
            clean_tif = os.path.join(CLEAN_DIR, f"{base_name}_clean.tif")
            clean_png = os.path.join(CLEAN_DIR, f"{base_name}_view.png")
            
            print(f"📄 Processing {filename} ({i}/{len(files)})")
            clean_raster(input_full_path, clean_tif, clean_png)

