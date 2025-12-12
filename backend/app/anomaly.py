import os
import numpy as np
import rasterio
from scipy.ndimage import label
from PIL import Image
import json

# ================================
# CONFIGURATION
# ================================
CLEAN_DIR = "/home/nakshtra/Desktop/whackiest/Quatsch/backend/data/cleaned/fogfix"
OUTPUT_DIR = "/home/nakshtra/Desktop/whackiest/Quatsch/backend/data/anomalies/crazy"
os.makedirs(OUTPUT_DIR, exist_ok=True)

TARGET_YEAR = "2024"

# DARK ZONE EMERGENCE DETECTION (Absolute Physics)
MIN_NEW_INTENSITY = 15.0      # Must be at least 15 nW bright (Real activity, not noise)
MAX_BASELINE_INTENSITY = 5.0  # Was dark before (< 5 nW = forest/rural)
MIN_CLUSTER_SIZE = 3          # Must be 3+ connected pixels (filters sensor glitches)

# ================================
# MAIN LOGIC
# ================================
def detect_dark_zone_emergence():
    print(f"🚀 Starting Dark Zone Emergence Detection...")
    print(f"🎯 Logic: Flag NEW light (>{MIN_NEW_INTENSITY} nW) where it was dark (<{MAX_BASELINE_INTENSITY} nW)\n")
    
    # 1. FIND FILES
    all_files = sorted([f for f in os.listdir(CLEAN_DIR) if "_clean.tif" in f])
    baseline_files = [f for f in all_files if TARGET_YEAR not in f]
    target_file = next((f for f in all_files if TARGET_YEAR in f), None)
    
    if not target_file:
        print(f"❌ Error: Could not find target year {TARGET_YEAR}")
        return
    
    print(f"📊 Baseline: {len(baseline_files)} historic images")
    print(f"🎯 Target: {target_file}\n")
    
    # 2. BUILD BASELINE
    baseline_stack = []
    metadata = None
    
    for f in baseline_files:
        path = os.path.join(CLEAN_DIR, f)
        with rasterio.open(path) as src:
            img = src.read(1).astype(np.float32)
            baseline_stack.append(img)
            if metadata is None: 
                metadata = src.profile
    
    baseline_img = np.median(np.array(baseline_stack), axis=0)
    
    # 3. LOAD TARGET
    with rasterio.open(os.path.join(CLEAN_DIR, target_file)) as src:
        target_img = src.read(1).astype(np.float32)
        transform = src.transform
    
    # 4. MATCH SIZES
    rows = min(baseline_img.shape[0], target_img.shape[0])
    cols = min(baseline_img.shape[1], target_img.shape[1])
    baseline_img = baseline_img[:rows, :cols]
    target_img = target_img[:rows, :cols]
    
    # 5. DARK ZONE EMERGENCE DETECTION
    # THE CORE LOGIC: Light appeared where darkness was
    anomaly_mask = (
        (target_img > MIN_NEW_INTENSITY) &        # NOW: Bright enough to be real activity
        (baseline_img < MAX_BASELINE_INTENSITY)   # BEFORE: Was dark (forest/rural)
    )
    
    absolute_diff = target_img - baseline_img
    
    print(f"🔍 Before Clustering: {np.sum(anomaly_mask)} pixels flagged")
    
    # 6. CLUSTER FILTERING (Remove Noise)
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
                "lat": float(lat),
                "lon": float(lon),
                "pixel_count": int(cluster_size),
                "current_intensity": float(np.mean(target_img[cluster])),
                "baseline_intensity": float(np.mean(baseline_img[cluster])),
                "intensity_gain": float(np.mean(absolute_diff[cluster])),
                "max_brightness": float(np.max(target_img[cluster]))
            })
    
    print(f"🚨 After Clustering: {len(anomaly_stats)} valid anomalies detected\n")
    
    # 7. CREATE VISUALIZATIONS
    
    # A) CONTEXT MAP (Grayscale base + Red anomalies)
    base_visual = np.clip(target_img / 60.0, 0, 1)
    base_rgb = (base_visual * 255).astype(np.uint8)
    context_img = np.stack([base_rgb, base_rgb, base_rgb], axis=-1)
    
    # Overlay red anomalies
    context_img[final_mask] = [255, 0, 50]
    
    Image.fromarray(context_img).save(
        os.path.join(OUTPUT_DIR, f"Anomaly_Context_{TARGET_YEAR}.png")
    )
    print(f"✨ Saved: Anomaly_Context_{TARGET_YEAR}.png (Red dots on map)")
    
    # B) OVERLAY (Transparent PNG for GIS)
    overlay = np.zeros((rows, cols, 4), dtype=np.uint8)
    overlay[final_mask] = [255, 0, 50, 255]
    
    Image.fromarray(overlay).save(
        os.path.join(OUTPUT_DIR, f"Anomaly_Overlay_{TARGET_YEAR}.png")
    )
    print(f"✨ Saved: Anomaly_Overlay_{TARGET_YEAR}.png (Transparent layer)")
    
    # C) HEATMAP (Intensity of change)
    heatmap = np.zeros((rows, cols, 4), dtype=np.uint8)
    diff_visual = np.clip(absolute_diff / 30.0, 0, 1)  # Scale 0-30 nW to 0-1
    
    heatmap[:, :, 0] = (diff_visual * 255).astype(np.uint8)  # Red
    heatmap[:, :, 3] = (diff_visual * 200).astype(np.uint8)  # Alpha
    
    Image.fromarray(heatmap).save(
        os.path.join(OUTPUT_DIR, f"Anomaly_Heatmap_{TARGET_YEAR}.png")
    )
    print(f"✨ Saved: Anomaly_Heatmap_{TARGET_YEAR}.png (Intensity gradient)\n")
    
    # 8. ANALYTICS (Relative Change for Dashboard)
    total_baseline = np.sum(baseline_img)
    total_target = np.sum(target_img)
    overall_growth = ((total_target - total_baseline) / total_baseline) * 100
    
    # 9. SAVE JSON REPORT
    summary = {
        "target_year": TARGET_YEAR,
        "baseline_years": len(baseline_files),
        "detection_method": "Dark Zone Emergence (Absolute Threshold)",
        "parameters": {
            "min_new_intensity": f"{MIN_NEW_INTENSITY} nW",
            "max_baseline_intensity": f"{MAX_BASELINE_INTENSITY} nW",
            "min_cluster_size": MIN_CLUSTER_SIZE
        },
        "results": {
            "total_anomalies": len(anomaly_stats),
            "total_anomalous_pixels": int(np.sum(final_mask)),
            "overall_lighting_growth": f"{overall_growth:.2f}%"
        },
        "anomalies": sorted(anomaly_stats, key=lambda x: x['intensity_gain'], reverse=True)
    }
    
    with open(os.path.join(OUTPUT_DIR, f"anomaly_report_{TARGET_YEAR}.json"), 'w') as f:
        json.dump(summary, f, indent=2)
    
    print(f"📄 Saved: anomaly_report_{TARGET_YEAR}.json\n")
    
    # 10. PRINT TOP ANOMALIES
    print("=" * 60)
    print("🏆 TOP 10 DARK ZONE EMERGENCES (Sorted by Intensity Gain)")
    print("=" * 60)
    
    for i, a in enumerate(summary['anomalies'][:10], 1):
        print(f"\n{i}. Location: ({a['lat']:.4f}, {a['lon']:.4f})")
        print(f"   Baseline (Historic): {a['baseline_intensity']:.2f} nW (Dark)")
        print(f"   Current ({TARGET_YEAR}):  {a['current_intensity']:.2f} nW (Bright)")
        print(f"   Intensity Gain: +{a['intensity_gain']:.2f} nW")
        print(f"   Cluster Size: {a['pixel_count']} pixels")
    
    print("\n" + "=" * 60)
    print(f"📊 Overall Region Growth: {overall_growth:.2f}%")
    print("=" * 60)

if __name__ == "__main__":
    detect_dark_zone_emergence()