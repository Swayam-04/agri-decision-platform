"""
Disease severity estimation based on image processing.

Calculates:
  - Infected area percentage
  - Lesion density
  - Severity classification (Low, Medium, High)

Uses HSV color-based segmentation to isolate the leaf and detect symptoms.
"""

import cv2
import numpy as np
from PIL import Image
from typing import Dict, Tuple, Optional

import config

class SeverityEstimator:
    """
    Estimates the severity of plant disease symptoms from an image.
    """

    def __init__(self, thresholds: Optional[Dict[str, float]] = None):
        self.thresholds = thresholds or config.SEVERITY_THRESHOLDS

    def estimate(self, image_input: np.ndarray) -> Dict:
        """
        Estimate disease severity from an image.

        Args:
            image_input: BGR image (numpy array)

        Returns:
            Dictionary with severity metrics and classification.
        """
        # 1. Convert to HSV
        hsv = cv2.cvtColor(image_input, cv2.COLOR_BGR2HSV)

        # 2. Segment Leaf (Broad range for green, yellow, brown)
        # We define "leaf" as everything that isn't background (usually grey/black/white)
        # Lower bound: Hue 20 (yellowish), Saturation 20, Value 20
        # Upper bound: Hue 90 (greenish), Saturation 255, Value 255
        # This covers Healthy Green, Diseased Yellow, and some Brown.
        lower_leaf = np.array([10, 20, 20])
        upper_leaf = np.array([90, 255, 255])
        leaf_mask = cv2.inRange(hsv, lower_leaf, upper_leaf)

        leaf_area = cv2.countNonZero(leaf_mask)
        if leaf_area == 0:
            return {
                "severity": "Unknown",
                "infected_area_pct": 0.0,
                "lesion_density": 0,
                "status": "No leaf detected"
            }

        # 3. Segment Symptoms (Lesions) (Requirement Task 2)
        # We use multiple masks to detect different types of symptoms
        
        # Mask 1: Brown/Necrotic spots (Darker brown to lighter tan)
        mask_brown = cv2.inRange(hsv, np.array([5, 40, 20]), np.array([25, 255, 180]))
        
        # Mask 2: Black patches/fungal growth (Very low value)
        mask_black = cv2.inRange(hsv, np.array([0, 0, 0]), np.array([180, 255, 60]))
        
        # Mask 3: Yellow halos / early chlorosis (Bright yellow/green-yellow)
        mask_yellow = cv2.inRange(hsv, np.array([18, 100, 100]), np.array([35, 255, 255]))
        
        # Combine masks (OR operation)
        symptom_mask = cv2.bitwise_or(mask_brown, mask_black)
        symptom_mask = cv2.bitwise_or(symptom_mask, mask_yellow)
        
        # Ensure lesions are only detected within the leaf boundary
        symptom_mask = cv2.bitwise_and(symptom_mask, leaf_mask)

        symptom_area = cv2.countNonZero(symptom_mask)

        # 4. Calculate Metrics
        infected_area_pct = (symptom_area / leaf_area) * 100.0

        # Lesion density (number of separate clusters)
        num_labels, labels, stats, centroids = cv2.connectedComponentsWithStats(symptom_mask, connectivity=8)
        # num_labels includes the background as 0, so we subtract 1
        lesion_density = max(0, num_labels - 1)

        # 5. Classify Severity
        severity = "Low"
        if infected_area_pct > self.thresholds["Medium"]:
            severity = "High"
        elif infected_area_pct > self.thresholds["Low"]:
            severity = "Medium"

        return {
            "severity": severity,
            "infected_area_pct": round(infected_area_pct, 2),
            "lesion_density": lesion_density,
            "leaf_area_px": leaf_area,
            "symptom_area_px": symptom_area
        }

    @staticmethod
    def pil_to_cv2(pil_image: Image.Image) -> np.ndarray:
        """Convert PIL Image to BGR OpenCV format."""
        # Convert to RGB if not already
        if pil_image.mode != "RGB":
            pil_image = pil_image.convert("RGB")
        numpy_image = np.array(pil_image)
        # Convert RGB to BGR
        return cv2.cvtColor(numpy_image, cv2.COLOR_RGB2BGR)
