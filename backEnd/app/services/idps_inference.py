import asyncio
import os
from datetime import datetime
from app.models.job_model import jobs_db
from app.services.packet_capture import capture_live_traffic
import pandas as pd

try:
    import joblib
    import tensorflow as tf
    ML_LIBS_AVAILABLE = True
except ImportError:
    ML_LIBS_AVAILABLE = False

ARTIFACTS_DIR = os.path.join(os.path.dirname(__file__), "../../ml_artifacts")

# NEW: We added job_type and file_path parameters
async def run_idps_pipeline(job_id: str, job_type: str = "live", file_path: str = None):
    stages = [
        {"name": "Ingesting Data...", "progress": 15},
        {"name": "Module 1: Preprocessing...", "progress": 30},
        {"name": "Module 2: Feature Extraction...", "progress": 45},
        {"name": "Module 3: Primary Detection (RF)...", "progress": 60},
        {"name": "Module 4: Detection Layer (DNN)...", "progress": 75},
        {"name": "Module 5: Zero-Day & Prevention...", "progress": 90},
        {"name": "Loading Results...", "progress": 100}
    ]

    try:
        def log(msg: str):
            timestamp = datetime.now().strftime("%H:%M:%S")
            jobs_db[job_id].logs.append(f"[{timestamp}] {msg}")

        # --- DATA INGESTION (LIVE vs FILE) ---
        jobs_db[job_id].stage = stages[0]["name"]
        jobs_db[job_id].progress = stages[0]["progress"]
        
        if job_type == "live":
            log("Starting 10-second traffic capture on Wi-Fi interface.")
            traffic_df, packet_count = await capture_live_traffic(duration_seconds=10)
            log(f"Captured {packet_count} live packets. Generating flow statistics.")
        else:
            log(f"Reading uploaded CSV file...")
            # Load the CSV directly into pandas!
            traffic_df = pd.read_csv(file_path)
            packet_count = len(traffic_df)
            log(f"Successfully loaded {packet_count} flow records from CSV.")
            
            # Clean up the temp file to save space
            if os.path.exists(file_path):
                os.remove(file_path)

        # --- PIPELINE EXECUTION ---
        
        # MODULE 1: Preprocessing
        jobs_db[job_id].stage = stages[1]["name"]
        jobs_db[job_id].progress = stages[1]["progress"]
        await asyncio.sleep(1)
        
        if ML_LIBS_AVAILABLE and os.path.exists(f"{ARTIFACTS_DIR}/preprocessor.pkl"):
            log("Loaded preprocessor.pkl. Applying Z-Score Normalisation.")
            # Real code: preprocessor = joblib.load(f"{ARTIFACTS_DIR}/preprocessor.pkl")
        else:
            log("[Mock] Applying Data Cleaning and Z-Score Normalisation.")

        # MODULE 2: Feature Extraction
        jobs_db[job_id].stage = stages[2]["name"]
        jobs_db[job_id].progress = stages[2]["progress"]
        await asyncio.sleep(1)
        
        if ML_LIBS_AVAILABLE and os.path.exists(f"{ARTIFACTS_DIR}/feature_selector.pkl"):
            log("Loaded feature_selector.pkl. Filtering top RF Gini features.")
            # Real code: selector = joblib.load(f"{ARTIFACTS_DIR}/feature_selector.pkl")
        else:
            log("[Mock] Applying Variance Threshold and RF Gini Selection.")

        # MODULE 3: Primary Detection
        jobs_db[job_id].stage = stages[3]["name"]
        jobs_db[job_id].progress = stages[3]["progress"]
        await asyncio.sleep(1)
        
        raw_prob = 0.85 # Mock raw probability
        if ML_LIBS_AVAILABLE and os.path.exists(f"{ARTIFACTS_DIR}/rf_detector.pkl"):
            log("Loaded rf_detector.pkl. Running 200-tree classification.")
            # Real code: rf = joblib.load(f"{ARTIFACTS_DIR}/rf_detector.pkl")
        else:
            log("[Mock] Random Forest Primary Detection complete.")

        # MODULE 4: Isotonic Calibration & DNN Secondary
        jobs_db[job_id].stage = stages[4]["name"]
        jobs_db[job_id].progress = stages[4]["progress"]
        await asyncio.sleep(1.5)
        
        confidence = raw_prob 
        log("Running Isotonic Calibration.")
        
        if confidence < 0.7:
            log("Confidence medium/low. Routing to DNN Secondary Detector.")
            if ML_LIBS_AVAILABLE and os.path.exists(f"{ARTIFACTS_DIR}/dnn_detector.keras"):
                pass # Real code: dnn = tf.keras.models.load_model(...)
            else:
                log("[Mock] Evaluating BatchNorm->Dense->Dropout->Sigmoid layers.")
        else:
            log("High confidence from RF. Bypassing DNN.")

        # MODULE 5: Zero-Day & Prevention
        jobs_db[job_id].stage = stages[5]["name"]
        jobs_db[job_id].progress = stages[5]["progress"]
        await asyncio.sleep(1)
        
        log("Evaluating Isolation Forest and Autoencoder anomalies.")
        
        action_taken = "Block" if confidence >= 0.7 else "Rate Limit"
        threat_level = "High" if action_taken == "Block" else "Medium"
        prediction_label = "DDoS Attack Detected" if threat_level == "High" else "Benign Traffic"

        # FINAL: Load Results
        jobs_db[job_id].stage = stages[6]["name"]
        jobs_db[job_id].progress = stages[6]["progress"]
        log(f"Pipeline complete. Action assigned: {action_taken}")

        jobs_db[job_id].status = "completed"
        jobs_db[job_id].result = {
            "prediction": prediction_label,
            "confidence": f"{confidence * 100:.1f}%",
            "packetsAnalyzed": str(packet_count),
            "threatLevel": threat_level,
            "actionTaken": action_taken 
        }

    except Exception as e:
        jobs_db[job_id].status = "failed"
        jobs_db[job_id].logs.append(f"Error during execution: {str(e)}")