"""
Prediction logging for AI Crop Intelligence Platform.

Logs prediction metadata (timestamp, result, latency) to a JSONL file
for future performance analysis and model retuning.
"""

import os
import json
import time
from datetime import datetime
from typing import Dict, Any

import config

class PredictionLogger:
    """
    Asynchronous-ready logger for model predictions.
    """
    def __init__(self, log_file: str = config.PREDICTION_LOG_FILE):
        self.log_file = log_file
        os.makedirs(os.path.dirname(self.log_file), exist_ok=True)

    def log_prediction(
        self, 
        result: Dict[str, Any], 
        latency_ms: float, 
        metadata: Dict[str, Any] = None
    ):
        """
        Record a single prediction result.
        """
        entry = {
            "timestamp": datetime.now().isoformat(),
            "predicted_disease": result.get("predicted_disease"),
            "confidence": result.get("confidence"),
            "severity": result.get("severity"),
            "latency_ms": round(latency_ms, 2),
            "metadata": metadata or {}
        }

        try:
            with open(self.log_file, "a", encoding="utf-8") as f:
                f.write(json.dumps(entry) + "\n")
        except Exception as e:
            print(f"[Logger] ⚠ Failed to write log: {e}")

    def log_batch(self, results: list, total_latency_ms: float):
        """
        Record a batch prediction.
        """
        avg_latency = total_latency_ms / len(results) if results else 0
        for res in results:
            self.log_prediction(res, avg_latency, metadata={"batch": True})
