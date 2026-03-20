"""
Central configuration for the Crop Disease Detection project.
All hyperparameters, paths, and settings are managed here.
"""

import os

# ─── Paths ────────────────────────────────────────────────────────────────────
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATA_DIR = os.path.join(BASE_DIR, "dataset", "PlantVillage")
CHECKPOINT_DIR = os.path.join(BASE_DIR, "models", "checkpoints")
LOG_DIR = os.path.join(BASE_DIR, "training", "logs")

# ─── Model Settings ──────────────────────────────────────────────────────────
MODEL_NAME = "efficientnet_b0"          # Options: "efficientnet_b0", "resnet50"
NUM_CLASSES = 15                         # PlantVillage dataset classes (auto-detected from folders)
PRETRAINED = True
FREEZE_BACKBONE = True                   # Freeze early conv layers (transfer learning)
FREEZE_RATIO = 0.6                       # Fraction of backbone layers to freeze (0.0–1.0)

# ─── Image Settings ──────────────────────────────────────────────────────────
IMAGE_SIZE = 224
IMAGE_MEAN = [0.485, 0.456, 0.406]      # ImageNet normalization
IMAGE_STD = [0.229, 0.224, 0.225]

# ─── Training Hyperparameters ─────────────────────────────────────────────────
BATCH_SIZE = 32
LEARNING_RATE = 1e-4
WEIGHT_DECAY = 1e-4
NUM_EPOCHS = 25
EARLY_STOPPING_PATIENCE = 5
TRAIN_SPLIT = 0.70                       # 70/15/15 train/val/test split
VAL_SPLIT = 0.15
TEST_SPLIT = 0.15

# ─── Scheduler ────────────────────────────────────────────────────────────────
SCHEDULER = "cosine"                     # Options: "cosine", "step"
STEP_SIZE = 7                            # Only used if SCHEDULER == "step"
GAMMA = 0.1

# ─── Data Augmentation ───────────────────────────────────────────────────────
# Farm-condition augmentations to improve model robustness.
# Designed to simulate real field conditions: sunlight variation,
# different leaf orientations, camera distance / focus issues.
AUGMENTATION = {
    # Leaf orientation — simulates viewing angle / wind movement
    "random_rotation_degrees": 30,

    # Mirrored views — leaves can face either direction
    "horizontal_flip_prob": 0.5,

    # Sunlight variation — overcast to harsh direct sunlight
    "brightness_range": (0.7, 1.3),
    "contrast_range": (0.8, 1.2),
    "saturation_range": (0.7, 1.3),
    "hue_range": 0.08,

    # Camera distance / zoom variation
    "zoom_scale": (0.75, 1.0),

    # Slight blur — wind, camera shake, focus issues in the field
    "gaussian_blur_kernel": (3, 7),
    "gaussian_blur_prob": 0.3,
}

# Mixup / CutMix (batch-level augmentation)
USE_MIXUP = False
MIXUP_ALPHA = 0.2

# ─── Device ───────────────────────────────────────────────────────────────────
import torch
DEVICE = "cuda" if torch.cuda.is_available() else "cpu"

# ─── Disease Class Labels (PlantVillage) ──────────────────────────────────────
# NOTE: These are auto-detected from folder names at runtime by the dataset
# loader. This list is only used as a fallback when loading a checkpoint
# that doesn't store class names.
CLASS_NAMES = [
    "Pepper__bell___Bacterial_spot",
    "Pepper__bell___healthy",
    "Potato___Early_blight",
    "Potato___Late_blight",
    "Potato___healthy",
    "Tomato_Bacterial_spot",
    "Tomato_Early_blight",
    "Tomato_Late_blight",
    "Tomato_Leaf_Mold",
    "Tomato_Septoria_leaf_spot",
    "Tomato_Spider_mites_Two_spotted_spider_mite",
    "Tomato__Target_Spot",
    "Tomato__Tomato_YellowLeaf__Curl_Virus",
    "Tomato__Tomato_mosaic_virus",
    "Tomato_healthy",
]

# ─── Severity Estimation ──────────────────────────────────────────────────────
# Thresholds based on % of leaf area infected
SEVERITY_THRESHOLDS = {
    "Low": 5.0,     # < 5% area
    "Medium": 15.0, # 5-15% area
    "High": 100.0,  # > 15% area
}

# ─── Recommendations ─────────────────────────────────────────────────────────
# Basic treatment recommendations based on disease and severity
RECOMMENDED_ACTIONS = {
    "healthy": "No action needed. Continue regular monitoring and irrigation.",
    "Bacterial_spot": {
        "Low": "Remove infected leaves and avoid overhead irrigation to reduce spread.",
        "Medium": "Apply copper-based fungicides. Prune affected branches to improve airflow.",
        "High": "Severe infection. Remove and destroy infected plants immediately to save the crop.",
    },
    "Early_blight": {
        "Low": "Improve air circulation. Mulch around the base to prevent soil splash.",
        "Medium": "Apply chlorothalonil or copper-based fungicide. Remove lower infected leaves.",
        "High": "Regular fungicide application required every 7-10 days. Avoid working in wet foliage.",
    },
    "Late_blight": {
        "Low": "Critical: Highly contagious. Remove infected parts immediately and apply protective fungicide.",
        "Medium": "Apply systemic fungicides. Monitor daily. Reduce humidity if in a greenhouse.",
        "High": "Outbreak level. Consider early harvest if possible, or destroy the crop to prevent regional spread.",
    },
    "Leaf_Mold": {
        "Low": "Increase ventilation and reduce humidity below 85%.",
        "Medium": "Thin out foliage. Apply calcium-based sprays if needed.",
        "High": "Apply labeled fungicides. Ensure proper spacing between plants.",
    },
    "Septoria_leaf_spot": {
        "Low": "Remove bottom leaves. Avoid wetting foliage during watering.",
        "Medium": "Apply organic or chemical fungicides. Rotate crops next season.",
        "High": "Intensive fungicide schedule. Clear all plant debris at the end of the season.",
    },
    "Spider_mites": {
        "Low": "Spray leaves with steady stream of water to knock off mites.",
        "Medium": "Apply insecticidal soap or neem oil. Increase humidity.",
        "High": "Use miticides specifically labeled for spider mites. Introduce predatory mites.",
    },
    "Target_Spot": {
        "Low": "Improve plant spacing for better drying of foliage.",
        "Medium": "Apply fungicides containing chlorothalonil or mancozeb.",
        "High": "Consistent fungicide treatment. Avoid excessive nitrogen fertilization.",
    },
    "YellowLeaf__Curl_Virus": {
        "Low": "Manage silverleaf whiteflies (vector). Use yellow sticky traps.",
        "Medium": "Remove infected plants immediately. Use reflective mulches.",
        "High": "Virus is systemic and incurable. Destroy infected crop. Use resistant varieties next season.",
    },
    "mosaic_virus": {
        "Low": "Sanitize tools with bleach solution (1:10). Avoid smoking near plants.",
        "Medium": "Remove and burn infected plants. Control aphid populations.",
        "High": "No cure. Remove entire plant including roots. Do not compost infected material.",
    },
}

# Default recommendation for unknown diseases
DEFAULT_ACTION = "Consult an agronomist for a detailed diagnosis and treatment plan."

# Minimum confidence required to return a specific disease (else returns 'Uncertain')
CONFIDENCE_THRESHOLD = 0.75  

# ─── Healthy Detection Refinement (Smarter Logic) ──────────────────────────────
# If top prediction is disease but "Healthy" exists, check this margin
HEALTHY_MARGIN_THRESHOLD = 0.25

# If infection area is below this % and disease confidence is below 85%, force Healthy
INFECTION_HEALTHY_OVERRIDE = 10.0
HEALTHY_OVERRIDE_CONFIDENCE = 0.85

# Performance targets (latency logging)
MAX_RESPONSE_TIME_MS = 2000

# Logging settings for future improvements
PREDICTION_LOG_FILE = os.path.join(LOG_DIR, "prediction_logs.jsonl")
ENABLE_IMAGE_LOGGING = False # Set to true to save local copies of sent images

# Ensure output directories exist
os.makedirs(CHECKPOINT_DIR, exist_ok=True)
os.makedirs(LOG_DIR, exist_ok=True)
