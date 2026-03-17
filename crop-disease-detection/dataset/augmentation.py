"""
Data augmentation utilities for crop disease detection.

Provides two categories of augmentation:

1. **Farm-condition transforms** (applied per-image during training):
   - Random rotation      → different leaf orientations
   - Horizontal flip      → mirrored leaf views
   - Brightness / jitter  → sunlight variation (overcast ↔ harsh sun)
   - Zoom (crop+resize)   → camera distance variation
   - Gaussian blur         → wind movement, camera shake, focus issues

2. **Batch-level mixing** (Mixup / CutMix):
   - Creates synthetic training samples via interpolation of images + labels
"""

import os
import sys
from typing import Tuple

import numpy as np
import torch
from torchvision import transforms

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
import config


# ═════════════════════════════════════════════════════════════════════════════
#  Farm-Condition Augmentation Pipeline
# ═════════════════════════════════════════════════════════════════════════════

def get_farm_augmentation_transforms() -> transforms.Compose:
    """
    Build a training augmentation pipeline that simulates real farm conditions.

    The transforms are designed to reflect scenarios encountered during
    in-field crop photography:

    ┌──────────────────────┬──────────────────────────────────────────┐
    │ Augmentation         │ Farm Scenario                            │
    ├──────────────────────┼──────────────────────────────────────────┤
    │ Random Rotation ±30° │ Different leaf orientations / angles     │
    │ Horizontal Flip      │ Leaves facing either direction           │
    │ Brightness Jitter    │ Overcast sky vs direct sunlight          │
    │ Contrast Jitter      │ Shadows under canopy vs open field      │
    │ Saturation Jitter    │ Chlorophyll variation, lighting color    │
    │ Hue Shift            │ Subtle spectral shifts in natural light │
    │ Zoom (crop + resize) │ Camera distance, phone vs DSLR zoom     │
    │ Gaussian Blur        │ Wind, camera shake, focus issues         │
    └──────────────────────┴──────────────────────────────────────────┘

    All parameters are read from ``config.AUGMENTATION``.

    Returns:
        A ``transforms.Compose`` pipeline (does NOT include ToTensor or
        Normalize — those are appended by the dataset loader).
    """
    aug = config.AUGMENTATION

    return transforms.Compose([
        # ── 1. Zoom: random crop then resize back to target size ──
        # Simulates varying camera distances in the field
        transforms.RandomResizedCrop(
            config.IMAGE_SIZE,
            scale=aug["zoom_scale"],
            ratio=(0.9, 1.1),
        ),

        # ── 2. Rotation: different leaf orientations ──
        transforms.RandomRotation(
            degrees=aug["random_rotation_degrees"],
            fill=0,
        ),

        # ── 3. Horizontal flip: mirrored leaf views ──
        transforms.RandomHorizontalFlip(p=aug["horizontal_flip_prob"]),

        # ── 4. Sunlight / color variation ──
        # Brightness, contrast, saturation simulate lighting conditions;
        # hue shift simulates subtle spectral differences.
        transforms.ColorJitter(
            brightness=_range_to_jitter(aug["brightness_range"]),
            contrast=_range_to_jitter(aug["contrast_range"]),
            saturation=_range_to_jitter(aug["saturation_range"]),
            hue=aug["hue_range"],
        ),

        # ── 5. Slight blur: wind, focus, camera shake ──
        transforms.RandomApply(
            [transforms.GaussianBlur(
                kernel_size=aug["gaussian_blur_kernel"],
                sigma=(0.1, 2.0),
            )],
            p=aug["gaussian_blur_prob"],
        ),
    ])


def _range_to_jitter(value_range: Tuple[float, float]) -> float:
    """
    Convert a (min, max) range centred on 1.0 to the single float
    expected by ``transforms.ColorJitter``.

    Example: (0.7, 1.3) → 0.3
    """
    return max(abs(1.0 - value_range[0]), abs(1.0 - value_range[1]))


def mixup_data(
    x: torch.Tensor,
    y: torch.Tensor,
    alpha: float = 0.2,
) -> tuple:
    """
    Apply Mixup augmentation to a batch.

    Creates new training samples by linearly interpolating pairs of
    images and their labels.

    Args:
        x:     Input batch tensor of shape (B, C, H, W).
        y:     Label tensor of shape (B,).
        alpha: Beta distribution parameter controlling interpolation
               strength. Higher = more mixing.

    Returns:
        Tuple of (mixed_x, y_a, y_b, lam) where:
        - mixed_x: interpolated images
        - y_a, y_b: original label pairs
        - lam: mixing coefficient (for loss computation)
    """
    if alpha > 0:
        lam = np.random.beta(alpha, alpha)
    else:
        lam = 1.0

    batch_size = x.size(0)
    index = torch.randperm(batch_size, device=x.device)

    mixed_x = lam * x + (1 - lam) * x[index]
    y_a, y_b = y, y[index]

    return mixed_x, y_a, y_b, lam


def cutmix_data(
    x: torch.Tensor,
    y: torch.Tensor,
    alpha: float = 1.0,
) -> tuple:
    """
    Apply CutMix augmentation to a batch.

    Replaces a random rectangular region of one image with a patch
    from another, and mixes labels proportionally to the area.

    Args:
        x:     Input batch tensor of shape (B, C, H, W).
        y:     Label tensor of shape (B,).
        alpha: Beta distribution parameter.

    Returns:
        Tuple of (cutmixed_x, y_a, y_b, lam).
    """
    if alpha > 0:
        lam = np.random.beta(alpha, alpha)
    else:
        lam = 1.0

    batch_size = x.size(0)
    index = torch.randperm(batch_size, device=x.device)

    _, _, h, w = x.shape

    # Sample bounding box
    cut_ratio = np.sqrt(1.0 - lam)
    cut_h = int(h * cut_ratio)
    cut_w = int(w * cut_ratio)

    cy = np.random.randint(h)
    cx = np.random.randint(w)

    y1 = np.clip(cy - cut_h // 2, 0, h)
    y2 = np.clip(cy + cut_h // 2, 0, h)
    x1 = np.clip(cx - cut_w // 2, 0, w)
    x2 = np.clip(cx + cut_w // 2, 0, w)

    mixed_x = x.clone()
    mixed_x[:, :, y1:y2, x1:x2] = x[index, :, y1:y2, x1:x2]

    # Adjust lambda based on the actual area replaced
    lam = 1 - ((y2 - y1) * (x2 - x1)) / (h * w)
    y_a, y_b = y, y[index]

    return mixed_x, y_a, y_b, lam


def mixup_criterion(
    criterion: torch.nn.Module,
    pred: torch.Tensor,
    y_a: torch.Tensor,
    y_b: torch.Tensor,
    lam: float,
) -> torch.Tensor:
    """
    Compute mixed loss for Mixup / CutMix training.

    Args:
        criterion: Loss function (e.g. CrossEntropyLoss).
        pred:      Model predictions.
        y_a, y_b:  Original label pairs from mixup/cutmix.
        lam:       Mixing coefficient.

    Returns:
        Weighted combination of losses.
    """
    return lam * criterion(pred, y_a) + (1 - lam) * criterion(pred, y_b)
