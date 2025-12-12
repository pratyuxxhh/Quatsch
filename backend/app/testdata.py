import rasterio
import numpy as np
import os
from rasterio.plot import show_hist

# ================================
# CONFIGURATION
# ================================
# Path to the file you want to inspect
FILE_PATH = "/home/nakshtra/Desktop/whackiest/Quatsch/backend/data/raw/NightLights_Bright_Tamil Nadu/VIIRS_RAD_Tamil Nadu_2016_01.tif"

def extract_tif_data(filepath):
    print(f"\n🔍 INSPECTING: {os.path.basename(filepath)}")
    print("=" * 60)

    if not os.path.exists(filepath):
        print(f"❌ Error: File not found at {filepath}")
        return

    with rasterio.open(filepath) as src:
        # 1. BASIC METADATA
        print(f"📄 Driver:      {src.driver}")
        print(f"📏 Dimensions:  {src.width} x {src.height} pixels")
        print(f"🔢 Bands:       {src.count}")
        print(f"🗺️  CRS:         {src.crs} (Coordinate System)")
        
        # 2. GEO-REFERENCING (The Lat/Lon Logic)
        print("\n📍 GEO-LOCATION DATA")
        print("-" * 30)
        bounds = src.bounds
        print(f"   • Left (West):   {bounds.left:.6f}")
        print(f"   • Bottom (South):{bounds.bottom:.6f}")
        print(f"   • Right (East):  {bounds.right:.6f}")
        print(f"   • Top (North):   {bounds.top:.6f}")
        
        transform = src.transform
        print(f"\n📐 AFFINE TRANSFORM (The 'Math Matrix')")
        print(f"   • Pixel Width:   {transform[0]:.6f} degrees")
        print(f"   • Pixel Height:  {transform[4]:.6f} degrees")
        print(f"   • Origin X (Lon):{transform[2]:.6f}")
        print(f"   • Origin Y (Lat):{transform[5]:.6f}")

        # 3. PIXEL STATISTICS (The Brightness Data)
        print("\n💡 RADIANCE DATA (Brightness Statistics)")
        print("-" * 30)
        
        # Read the first band (the actual data)
        data = src.read(1).astype(np.float32)
        
        # Mask out '0' values to see stats of actual lit areas
        lit_data = data[data > 0]
        
        print(f"   • Min Value:     {np.min(data):.4f} nW")
        print(f"   • Max Value:     {np.max(data):.4f} nW")
        print(f"   • Mean (All):    {np.mean(data):.4f} nW")
        print(f"   • Mean (Lit):    {np.mean(lit_data):.4f} nW (Ignoring zeros)")
        print(f"   • Std Dev:       {np.std(data):.4f}")
        
        # 4. SAMPLE PIXEL EXTRACTION
        print("\n🧪 SAMPLE PIXEL EXTRACTION")
        print("-" * 30)
        # Let's verify a specific pixel in the middle of the image
        center_y, center_x = src.height // 2, src.width // 2
        
        # Convert Row/Col -> Lat/Lon
        lon, lat = src.xy(center_y, center_x)
        val = data[center_y, center_x]
        
        print(f"   At Pixel ({center_x}, {center_y}):")
        print(f"   • Latitude:  {lat:.6f}")
        print(f"   • Longitude: {lon:.6f}")
        print(f"   • Radiance:  {val:.4f} nW")

        # 5. DATA DISTRIBUTION
        print("\n📊 DATA DISTRIBUTION (Buckets)")
        print("-" * 30)
        print(f"   • Dark (0 nW):        {np.sum(data == 0):,} pixels")
        print(f"   • Dim (< 5 nW):       {np.sum((data > 0) & (data < 5)):,} pixels")
        print(f"   • Bright (> 15 nW):   {np.sum(data > 15):,} pixels")
        print(f"   • Extreme (> 100 nW): {np.sum(data > 100):,} pixels")

if __name__ == "__main__":
    extract_tif_data(FILE_PATH)