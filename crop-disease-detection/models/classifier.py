"""
Neural network architecture for crop disease classification.

Uses EfficientNet-B0 (or ResNet50) pretrained on ImageNet via the `timm`
library as a feature extractor, with a custom classification head.

Transfer-learning strategy:
  1. Load pretrained backbone
  2. Freeze early convolution layers (keeps low-level feature detectors)
  3. Fine-tune later layers + custom classification head
"""

import torch
import torch.nn as nn
import timm

import os
import sys
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
import config


class CropDiseaseClassifier(nn.Module):
    """
    Transfer-learning classifier for plant disease detection.

    Architecture:
        ┌──────────────────────────────────────────────────────────┐
        │  EfficientNet-B0 backbone (ImageNet pretrained)          │
        │  ├── Stem + early conv blocks ── FROZEN                  │
        │  └── Later conv blocks ────────── Fine-tuned             │
        ├──────────────────────────────────────────────────────────┤
        │  Global Average Pooling (built into backbone)            │
        ├──────────────────────────────────────────────────────────┤
        │  Custom Classification Head:                             │
        │    Dropout(0.3)                                          │
        │    Linear(1280 → 512) + ReLU + BatchNorm                 │
        │    Dropout(0.2)                                          │
        │    Linear(512 → num_classes)                             │
        │    (Softmax applied via CrossEntropyLoss during training) │
        └──────────────────────────────────────────────────────────┘

    The backbone's `num_classes=0` setting removes its default head
    and returns globally-averaged-pooled feature vectors directly.
    """

    def __init__(
        self,
        model_name: str = "efficientnet_b0",
        num_classes: int = 38,
        pretrained: bool = True,
        freeze_backbone: bool = False,
        freeze_ratio: float = 0.6,
    ):
        """
        Args:
            model_name:      Backbone architecture name (timm model).
            num_classes:     Number of disease classes in the dataset.
            pretrained:      Load ImageNet pretrained weights.
            freeze_backbone: If True, freeze early layers of the backbone
                             to preserve pretrained low-level features.
            freeze_ratio:    Fraction of backbone layers to freeze (0.0–1.0).
                             Only used when freeze_backbone=True.
                             Default 0.6 freezes the first 60% of layers,
                             letting later layers fine-tune for domain-specific
                             features (disease textures, lesion patterns).
        """
        super().__init__()

        # ── 1. Pretrained backbone (without default classifier) ──
        # num_classes=0 → backbone returns GAP-pooled feature vector
        self.backbone = timm.create_model(
            model_name,
            pretrained=pretrained,
            num_classes=0,  # Removes head → returns pooled features
        )

        # Feature dimension from the backbone (e.g. 1280 for EfficientNet-B0)
        num_features = self.backbone.num_features

        # ── 2. Custom classification head ──
        # GlobalAveragePooling is already handled by the backbone (num_classes=0)
        self.classifier = nn.Sequential(
            nn.Dropout(0.3),
            nn.Linear(num_features, 512),
            nn.ReLU(inplace=True),
            nn.BatchNorm1d(512),
            nn.Dropout(0.2),
            nn.Linear(512, num_classes),
            # NOTE: No Softmax here — CrossEntropyLoss expects raw logits.
            # For inference, apply softmax externally: F.softmax(logits, dim=1)
        )

        # ── 3. Freeze early convolution layers ──
        if freeze_backbone:
            self._freeze_early_layers(freeze_ratio)

        # ── Parameter summary ──
        total_params = sum(p.numel() for p in self.parameters())
        trainable_params = sum(
            p.numel() for p in self.parameters() if p.requires_grad
        )
        frozen_params = total_params - trainable_params

        print(f"\n  ┌─ Model Summary ─────────────────────────────────────────┐")
        print(f"  │  Backbone:       {model_name:<40} │")
        print(f"  │  Pretrained:     {'ImageNet' if pretrained else 'No':<40} │")
        print(f"  │  Feature dim:    {num_features:<40} │")
        print(f"  │  Output classes: {num_classes:<40} │")
        print(f"  │  Total params:   {total_params:>12,}{'':<28}│")
        print(f"  │  Trainable:      {trainable_params:>12,}{'':<28}│")
        print(f"  │  Frozen:         {frozen_params:>12,}{'':<28}│")
        if freeze_backbone:
            print(f"  │  Freeze ratio:   {freeze_ratio:<40} │")
        print(f"  └─────────────────────────────────────────────────────────┘\n")

    def _freeze_early_layers(self, freeze_ratio: float = 0.6) -> None:
        """
        Freeze the first `freeze_ratio` fraction of backbone parameters.

        This preserves low-level pretrained features (edges, textures,
        color patterns) while allowing later layers to adapt to the
        crop disease domain (lesion shapes, specific color changes).

        For EfficientNet-B0 the backbone has ~4M parameters across 7
        MBConv blocks. With freeze_ratio=0.6, blocks 0–3 stay frozen
        and blocks 4–6 are fine-tuned alongside the classification head.
        """
        backbone_params = list(self.backbone.parameters())
        num_to_freeze = int(len(backbone_params) * freeze_ratio)

        for i, param in enumerate(backbone_params):
            if i < num_to_freeze:
                param.requires_grad = False

        print(
            f"  [Freeze] Froze {num_to_freeze}/{len(backbone_params)} "
            f"backbone parameters ({freeze_ratio:.0%} of layers)"
        )

    def forward(self, x: torch.Tensor) -> torch.Tensor:
        """
        Forward pass.

        Args:
            x: Input tensor of shape (B, 3, 224, 224).

        Returns:
            Logits tensor of shape (B, num_classes).
            Apply F.softmax(logits, dim=1) for probabilities during inference.
        """
        features = self.backbone(x)         # (B, num_features) — GAP already applied
        logits = self.classifier(features)  # (B, num_classes)
        return logits

    def get_features(self, x: torch.Tensor) -> torch.Tensor:
        """Extract feature embeddings without the classification head."""
        return self.backbone(x)

    def unfreeze_all(self) -> None:
        """Unfreeze all parameters (useful for full fine-tuning phase)."""
        for param in self.parameters():
            param.requires_grad = True
        print("  [Unfreeze] All parameters are now trainable.")


def build_model(
    model_name: str = None,
    num_classes: int = None,
    pretrained: bool = None,
    freeze_backbone: bool = True,
    freeze_ratio: float = 0.6,
) -> CropDiseaseClassifier:
    """
    Factory function to build a CropDiseaseClassifier.

    Args:
        model_name:      Backbone name (e.g. 'efficientnet_b0', 'resnet50').
                         Defaults to config.MODEL_NAME.
        num_classes:     Number of output classes. Defaults to config.NUM_CLASSES.
        pretrained:      Whether to load pretrained weights.
                         Defaults to config.PRETRAINED.
        freeze_backbone: If True, freeze early conv layers to keep
                         pretrained low-level features. Default True.
        freeze_ratio:    Fraction of backbone layers to freeze (0.0–1.0).

    Returns:
        A configured CropDiseaseClassifier instance.
    """
    model = CropDiseaseClassifier(
        model_name=model_name or config.MODEL_NAME,
        num_classes=num_classes or config.NUM_CLASSES,
        pretrained=pretrained if pretrained is not None else config.PRETRAINED,
        freeze_backbone=freeze_backbone,
        freeze_ratio=freeze_ratio,
    )
    return model
