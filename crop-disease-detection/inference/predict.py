"""
Single-image inference pipeline for crop disease prediction.

Loads a trained checkpoint and classifies a plant leaf image, returning:
  - Predicted disease label
  - Confidence score
  - Probability distribution for top-3 predictions

Image preprocessing matches the training validation pipeline exactly:
  Resize(224×224) → ToTensor → Normalize(ImageNet mean/std)
"""

import os
import sys
import time
from typing import Optional, List, Dict, Union

import torch
import torch.nn.functional as F
from torchvision import transforms
from PIL import Image
import numpy as np

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
import config
from models.classifier import build_model
from .severity import SeverityEstimator
from .logger import PredictionLogger


class Predictor:
    """
    Inference engine for crop disease classification.

    Loads a model checkpoint and provides a simple predict() interface
    for single-image classification.

    Usage:
        predictor = Predictor("models/checkpoints/best_model.pth")
        result = predictor.predict("path/to/leaf_image.jpg")
        print(result)
        # {
        #   "label": "Tomato___Late_blight",
        #   "confidence": 0.9423,
        #   "top_predictions": [
        #       {"label": "Tomato___Late_blight", "confidence": 0.9423},
        #       {"label": "Tomato___Early_blight", "confidence": 0.0312},
        #       ...
        #   ]
        # }
    """

    def __init__(
        self,
        checkpoint_path: Optional[str] = None,
        device: Optional[str] = None,
        top_k: int = 3,
    ):
        """
        Args:
            checkpoint_path: Path to the .pth checkpoint file.
                             Defaults to best_model.pth in CHECKPOINT_DIR.
            device:          Device to run inference on.
            top_k:           Number of top predictions to return.
        """
        self.device = device or config.DEVICE
        self.top_k = top_k
        self.severity_estimator = SeverityEstimator()
        self.logger = PredictionLogger()

        checkpoint_path = checkpoint_path or os.path.join(
            config.CHECKPOINT_DIR, "best_model.pth"
        )

        if not os.path.exists(checkpoint_path):
            raise FileNotFoundError(
                f"Checkpoint not found: {checkpoint_path}\n"
                "Train a model first using: python -m training.train"
            )

        # Load checkpoint
        print(f"[Predictor] Loading checkpoint: {checkpoint_path}")
        checkpoint = torch.load(checkpoint_path, map_location=self.device)

        self.class_names = checkpoint.get("class_names", config.CLASS_NAMES)
        model_name = checkpoint.get("model_name", config.MODEL_NAME)
        num_classes = checkpoint.get("num_classes", config.NUM_CLASSES)

        # Build model and load weights
        self.model = build_model(
            model_name=model_name,
            num_classes=num_classes,
            pretrained=False,
            freeze_backbone=False,
        ).to(self.device)
        self.model.load_state_dict(checkpoint["model_state_dict"])
        self.model.eval()

        # Preprocessing pipeline — MUST match training val/test transforms
        # exactly: Resize(224×224) → ToTensor → Normalize(ImageNet)
        self.transform = transforms.Compose([
            transforms.Resize((config.IMAGE_SIZE, config.IMAGE_SIZE)),
            transforms.ToTensor(),
            transforms.Normalize(mean=config.IMAGE_MEAN, std=config.IMAGE_STD),
        ])

        print(f"[Predictor] Ready — {num_classes} classes, device: {self.device}")

    def _get_recommendation(
        self, disease_class: str, severity: str
    ) -> str:
        """
        Get treatment recommendation based on disease and severity.
        """
        # Handle healthy plant
        if "healthy" in disease_class.lower():
            return config.RECOMMENDED_ACTIONS.get("healthy", config.DEFAULT_ACTION)

        # Simplify disease name to match recommendations keys (e.g., Potato___Early_blight -> Early_blight)
        disease_key = None
        for key in config.RECOMMENDED_ACTIONS.keys():
            if key in disease_class:
                disease_key = key
                break
        
        if not disease_key or disease_key == "healthy":
            return config.DEFAULT_ACTION
        
        # Get recommendation for specific severity
        disease_rec = config.RECOMMENDED_ACTIONS.get(disease_key, {})
        if isinstance(disease_rec, dict):
            return disease_rec.get(severity, config.DEFAULT_ACTION)
        
        return config.DEFAULT_ACTION

    @torch.no_grad()
    def predict(self, image_input: Union[str, Image.Image]) -> Dict:
        """
        Classify a single plant leaf image and estimate severity.

        Args:
            image_input: Either a file path (str) or a PIL.Image.Image object.

        Returns:
            Dictionary with:
            - predicted_disease: Top predicted disease label
            - confidence:        Confidence score (0.0–1.0)
            - severity:          Estimated Severity (Low, Medium, High)
            - infected_area_pct: Percentage of leaf area showing symptoms
            - recommended_action: Treatment recommendation
            - top_predictions:   Top-k probability distribution
        """
        # Load image
        if isinstance(image_input, str):
            if not os.path.exists(image_input):
                raise FileNotFoundError(f"Image not found: {image_input}")
            pil_image = Image.open(image_input).convert("RGB")
        elif isinstance(image_input, Image.Image):
            pil_image = image_input.convert("RGB")
        else:
            raise TypeError(
                f"Expected file path or PIL Image, got {type(image_input)}"
            )

        # ── 1. Severity Estimation (using original size/color) ──
        cv2_image = self.severity_estimator.pil_to_cv2(pil_image)
        severity_metrics = self.severity_estimator.estimate(cv2_image)

        # ── 2. Disease Classification ──
        # Preprocess — matches training val/test pipeline exactly
        tensor = self.transform(pil_image).unsqueeze(0).to(self.device)

        # Forward pass
        logits = self.model(tensor)
        probabilities = F.softmax(logits, dim=1).squeeze(0)

        # Top-k probability distribution
        top_probs, top_indices = probabilities.topk(min(self.top_k, len(self.class_names)))

        top_predictions: List[Dict] = []
        for prob, idx in zip(top_probs.cpu().numpy(), top_indices.cpu().numpy()):
            top_predictions.append({
                "label": self.class_names[idx],
                "confidence": round(float(prob), 4),
                "probability_pct": round(float(prob) * 100, 2),
            })

        predicted_disease = top_predictions[0]["label"]
        confidence = top_predictions[0]["confidence"]
        
        # Apply Confidence Threshold
        if confidence < config.CONFIDENCE_THRESHOLD:
            # If uncertain, mark as such but keep top_predictions for review
            return {
                "predicted_disease": "Uncertain / Requires Review",
                "confidence": confidence,
                "severity": "Unknown",
                "infected_area_pct": severity_metrics["infected_area_pct"],
                "recommended_action": "Confidence too low for automated diagnosis. Please capture a clearer image or consult an expert.",
                "top_predictions": top_predictions,
                "low_confidence_flag": True
            }

        # Override severity for healthy plants
        if "healthy" in predicted_disease.lower():
            severity = "None"
            recommended_action = self._get_recommendation("healthy", "Low")
        else:
            severity = severity_metrics["severity"]
            recommended_action = self._get_recommendation(predicted_disease, severity)

        return {
            "predicted_disease": predicted_disease,
            "confidence": top_predictions[0]["confidence"],
            "severity": severity,
            "infected_area_pct": severity_metrics["infected_area_pct"],
            "recommended_action": recommended_action,
            "top_predictions": top_predictions,
        }

    @torch.no_grad()
    def predict_batch(self, image_inputs: List[Union[str, Image.Image]]) -> List[Dict]:
        """
        Efficiently classify multiple images in a single batch.
        """
        if not image_inputs:
            return []

        start_batch_time = time.time()
        
        # 1. Preprocess all images
        tensors = []
        pil_images = []
        for inp in image_inputs:
            if isinstance(inp, str):
                img = Image.open(inp).convert("RGB")
            else:
                img = inp.convert("RGB")
            pil_images.append(img)
            tensors.append(self.transform(img))
        
        batch_tensor = torch.stack(tensors).to(self.device)
        
        # 2. Batch Forward Pass
        logits = self.model(batch_tensor)
        probabilities = F.softmax(logits, dim=1)
        
        results = []
        for i, (prob_dist, pil_img) in enumerate(zip(probabilities, pil_images)):
            # Severity for this image
            cv2_img = self.severity_estimator.pil_to_cv2(pil_img)
            severity_metrics = self.severity_estimator.estimate(cv2_img)
            
            # Top-k for this image
            top_probs, top_indices = prob_dist.topk(min(self.top_k, len(self.class_names)))
            
            top_predictions = []
            for prob, idx in zip(top_probs.cpu().numpy(), top_indices.cpu().numpy()):
                top_predictions.append({
                    "label": self.class_names[idx],
                    "confidence": round(float(prob), 4),
                    "probability_pct": round(float(prob) * 100, 2),
                })
            
            pred_disease = top_predictions[0]["label"]
            conf = top_predictions[0]["confidence"]
            
            if conf < config.CONFIDENCE_THRESHOLD:
                res = {
                    "predicted_disease": "Uncertain / Requires Review",
                    "confidence": conf,
                    "severity": "Unknown",
                    "infected_area_pct": severity_metrics["infected_area_pct"],
                    "recommended_action": "Confidence too low for automated diagnosis.",
                    "top_predictions": top_predictions,
                    "low_confidence_flag": True
                }
            else:
                if "healthy" in pred_disease.lower():
                    sev = "None"
                    rec = self._get_recommendation("healthy", "Low")
                else:
                    sev = severity_metrics["severity"]
                    rec = self._get_recommendation(pred_disease, sev)
                
                res = {
                    "predicted_disease": pred_disease,
                    "confidence": conf,
                    "severity": sev,
                    "infected_area_pct": severity_metrics["infected_area_pct"],
                    "recommended_action": rec,
                    "top_predictions": top_predictions,
                }
            results.append(res)
            
        latency_ms = (time.time() - start_batch_time) * 1000
        self.logger.log_batch(results, latency_ms)
        
        return results


def main():
    """CLI entry point for quick inference."""
    import argparse

    parser = argparse.ArgumentParser(
        description="Predict crop disease from a leaf image"
    )
    parser.add_argument("image", type=str, help="Path to leaf image")
    parser.add_argument(
        "--checkpoint", type=str, default=None,
        help="Path to checkpoint (.pth)"
    )
    parser.add_argument(
        "--top-k", type=int, default=3,
        help="Number of top predictions to show (default: 3)"
    )
    args = parser.parse_args()

    predictor = Predictor(
        checkpoint_path=args.checkpoint,
        top_k=args.top_k,
    )

    result = predictor.predict(args.image)

    # ── Display results ──
    print(f"\n{'═'*65}")
    print(f"  🌿 Predicted Disease:  {result['predicted_disease']}")
    print(f"  📊 Confidence:         {result['confidence']*100:.1f}%")
    print(f"  ⚠️  Severity:           {result['severity']}")
    print(f"  📉 Infected Area:      {result['infected_area_pct']:.1f}%")
    print(f"{'═'*65}")

    print(f"\n  💡 Recommended Action:")
    print(f"     {result['recommended_action']}")

    print(f"\n  Top {len(result['top_predictions'])} Probability Distribution:")
    print(f"  {'─'*50}")
    for i, pred in enumerate(result["top_predictions"], 1):
        bar_len = int(pred["confidence"] * 30)
        bar = "█" * bar_len + "░" * (30 - bar_len)
        display_name = pred['label'].replace('___', ' → ').replace('_', ' ')
        print(f"  {i}. {display_name}")
        print(f"     {bar}  {pred['probability_pct']:5.1f}%")
    print()


if __name__ == "__main__":
    main()
