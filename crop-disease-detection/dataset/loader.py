"""
Dataset pipeline for plant disease detection using the PlantVillage dataset.

Features:
- Loads images from folder-per-class directory structure
- Automatic 70/15/15 train/validation/test split
- Preprocessing: resize to 224×224, normalize pixel values, convert to RGB
- Farm-condition augmentation for training (rotation, flip, brightness,
  zoom, Gaussian blur) to simulate real field conditions
- Comprehensive dataset statistics after loading

Expects data organized as:
    dataset/data/
    ├── Apple___Apple_scab/
    │   ├── img001.jpg
    │   └── ...
    ├── Apple___Black_rot/
    │   ├── img001.jpg
    │   └── ...
    └── ...
"""

import os
import sys
from typing import Tuple, Optional, Dict, List
from collections import Counter

import torch
from torch.utils.data import Dataset, DataLoader, random_split, Subset
from torchvision import transforms
from PIL import Image
import numpy as np

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
import config
from dataset.augmentation import get_farm_augmentation_transforms


# ═════════════════════════════════════════════════════════════════════════════
#  Preprocessing & Augmentation Transforms
# ═════════════════════════════════════════════════════════════════════════════

def get_transforms(mode: str = "train") -> transforms.Compose:
    """
    Build an image preprocessing and augmentation pipeline.

    All modes apply:
      1. Convert to RGB (handled in Dataset.__getitem__)
      2. Resize to 224×224
      3. Normalize pixel values with ImageNet mean/std

    Training mode additionally applies:
      - Random resized crop, horizontal/vertical flip
      - Color jitter, random rotation

    Args:
        mode: One of "train", "val", or "test".

    Returns:
        A torchvision.transforms.Compose pipeline.
    """
    if mode == "train":
        # Farm-condition augmentations (rotation, flip, brightness,
        # zoom, blur) followed by standard preprocessing
        farm_augments = get_farm_augmentation_transforms()
        return transforms.Compose(
            farm_augments.transforms + [
                # ── Preprocessing ──
                transforms.ToTensor(),
                transforms.Normalize(mean=config.IMAGE_MEAN, std=config.IMAGE_STD),
            ]
        )
    else:
        # val / test — deterministic preprocessing only
        return transforms.Compose([
            transforms.Resize((config.IMAGE_SIZE, config.IMAGE_SIZE)),
            transforms.ToTensor(),
            transforms.Normalize(mean=config.IMAGE_MEAN, std=config.IMAGE_STD),
        ])


# ═════════════════════════════════════════════════════════════════════════════
#  CropDiseaseDataset
# ═════════════════════════════════════════════════════════════════════════════

class CropDiseaseDataset(Dataset):
    """
    Custom dataset for crop disease images organized in class-folder structure.

    Each subdirectory in `root_dir` is treated as a class label. Images are
    loaded as RGB and preprocessed to 224×224 with ImageNet normalization.

    Supports: .jpg, .jpeg, .png, .bmp, .webp
    """

    VALID_EXTENSIONS = {".jpg", ".jpeg", ".png", ".bmp", ".webp"}

    def __init__(
        self,
        root_dir: str,
        transform: Optional[transforms.Compose] = None,
    ):
        """
        Args:
            root_dir:  Path to the data directory containing class subfolders.
            transform: Torchvision transform pipeline. If None, uses val/test
                       preprocessing (resize + normalize, no augmentation).
        """
        self.root_dir = root_dir
        self.transform = transform or get_transforms(mode="val")
        self.samples: List[Tuple[str, int]] = []
        self.class_to_idx: Dict[str, int] = {}

        # Discover classes from subdirectories
        classes = sorted([
            d for d in os.listdir(root_dir)
            if os.path.isdir(os.path.join(root_dir, d))
        ])

        if not classes:
            raise ValueError(
                f"No class subdirectories found in '{root_dir}'.\n"
                "Expected structure: root_dir/ClassName/image.jpg"
            )

        self.class_to_idx = {cls_name: idx for idx, cls_name in enumerate(classes)}
        self.idx_to_class = {idx: cls_name for cls_name, idx in self.class_to_idx.items()}
        self.classes = classes

        # Collect all valid image paths
        for cls_name in classes:
            cls_dir = os.path.join(root_dir, cls_name)
            for fname in sorted(os.listdir(cls_dir)):
                ext = os.path.splitext(fname)[1].lower()
                if ext in self.VALID_EXTENSIONS:
                    self.samples.append((
                        os.path.join(cls_dir, fname),
                        self.class_to_idx[cls_name],
                    ))

    def __len__(self) -> int:
        return len(self.samples)

    def __getitem__(self, idx: int) -> Tuple[torch.Tensor, int]:
        img_path, label = self.samples[idx]

        # Load and convert to RGB
        image = Image.open(img_path).convert("RGB")

        # Apply preprocessing / augmentation
        image = self.transform(image)

        return image, label

    def get_labels(self) -> List[int]:
        """Return all labels (useful for stratified splitting)."""
        return [label for _, label in self.samples]


# ═════════════════════════════════════════════════════════════════════════════
#  Dataset Splitting (70 / 15 / 15)
# ═════════════════════════════════════════════════════════════════════════════

def _split_dataset(
    dataset: CropDiseaseDataset,
    train_ratio: float = 0.70,
    val_ratio: float = 0.15,
    test_ratio: float = 0.15,
    seed: int = 42,
) -> Tuple[Subset, Subset, Subset]:
    """
    Split a dataset into train, validation, and test subsets.

    Args:
        dataset:     The full CropDiseaseDataset instance.
        train_ratio: Fraction for training (default 0.70).
        val_ratio:   Fraction for validation (default 0.15).
        test_ratio:  Fraction for testing (default 0.15).
        seed:        Random seed for reproducibility.

    Returns:
        Tuple of (train_subset, val_subset, test_subset).
    """
    assert abs(train_ratio + val_ratio + test_ratio - 1.0) < 1e-6, \
        f"Split ratios must sum to 1.0, got {train_ratio + val_ratio + test_ratio:.4f}"

    total = len(dataset)
    val_size = int(total * val_ratio)
    test_size = int(total * test_ratio)
    train_size = total - val_size - test_size  # Remainder goes to train

    train_subset, val_subset, test_subset = random_split(
        dataset,
        [train_size, val_size, test_size],
        generator=torch.Generator().manual_seed(seed),
    )

    return train_subset, val_subset, test_subset


# ═════════════════════════════════════════════════════════════════════════════
#  Dataset Statistics
# ═════════════════════════════════════════════════════════════════════════════

def print_dataset_statistics(
    dataset: CropDiseaseDataset,
    train_subset: Subset,
    val_subset: Subset,
    test_subset: Subset,
) -> None:
    """
    Print comprehensive dataset statistics after loading.

    Displays:
      - Total images, number of classes
      - Split sizes (train/val/test) with percentages
      - Per-class sample counts
      - Min/max/mean images per class
      - Image format and preprocessing info
    """
    total = len(dataset)
    n_train = len(train_subset)
    n_val = len(val_subset)
    n_test = len(test_subset)

    # Count samples per class
    all_labels = dataset.get_labels()
    class_counts = Counter(all_labels)

    counts_list = [class_counts[i] for i in range(len(dataset.classes))]
    min_count = min(counts_list)
    max_count = max(counts_list)
    mean_count = np.mean(counts_list)

    # Find which classes have min/max
    min_class = dataset.classes[counts_list.index(min_count)]
    max_class = dataset.classes[counts_list.index(max_count)]

    # Per-split class distributions
    train_labels = [dataset.samples[i][1] for i in train_subset.indices]
    val_labels = [dataset.samples[i][1] for i in val_subset.indices]
    test_labels = [dataset.samples[i][1] for i in test_subset.indices]

    train_dist = Counter(train_labels)
    val_dist = Counter(val_labels)
    test_dist = Counter(test_labels)

    # Print
    print(f"\n{'═'*70}")
    print(f"  📊 DATASET STATISTICS — PlantVillage Crop Disease")
    print(f"{'═'*70}")

    print(f"\n  ┌─────────────────────────────────────────────────────────────┐")
    print(f"  │  Total Images:     {total:>8,}                                │")
    print(f"  │  Number of Classes:{len(dataset.classes):>8}                                │")
    print(f"  │  Image Size:       {config.IMAGE_SIZE}×{config.IMAGE_SIZE} RGB                          │")
    print(f"  │  Normalization:    ImageNet (μ={config.IMAGE_MEAN}, σ={config.IMAGE_STD})│")
    print(f"  └─────────────────────────────────────────────────────────────┘")

    print(f"\n  ── Dataset Split ──────────────────────────────────────────────")
    print(f"  {'Split':<12} {'Samples':>10} {'Percentage':>12}")
    print(f"  {'─'*36}")
    print(f"  {'Training':<12} {n_train:>10,} {n_train/total*100:>11.1f}%")
    print(f"  {'Validation':<12} {n_val:>10,} {n_val/total*100:>11.1f}%")
    print(f"  {'Testing':<12} {n_test:>10,} {n_test/total*100:>11.1f}%")
    print(f"  {'─'*36}")
    print(f"  {'TOTAL':<12} {total:>10,} {100.0:>11.1f}%")

    print(f"\n  ── Per-Class Statistics ────────────────────────────────────────")
    print(f"  Min samples/class:  {min_count:>6,}  ({min_class})")
    print(f"  Max samples/class:  {max_count:>6,}  ({max_class})")
    print(f"  Mean samples/class: {mean_count:>9.1f}")

    print(f"\n  ── Class Distribution ─────────────────────────────────────────")
    print(f"  {'#':<4} {'Class Name':<50} {'Total':>6} {'Train':>6} {'Val':>5} {'Test':>5}")
    print(f"  {'─'*76}")

    for idx, cls_name in enumerate(dataset.classes):
        c_total = class_counts[idx]
        c_train = train_dist.get(idx, 0)
        c_val = val_dist.get(idx, 0)
        c_test = test_dist.get(idx, 0)

        # Shorten class name for display
        display_name = cls_name.replace("___", " → ").replace("_", " ")
        if len(display_name) > 48:
            display_name = display_name[:45] + "..."

        print(f"  {idx+1:<4} {display_name:<50} {c_total:>6} {c_train:>6} {c_val:>5} {c_test:>5}")

    aug = config.AUGMENTATION
    print(f"\n  ── Preprocessing Pipeline (Farm-Condition Augmentation) ────────")
    print(f"  Training:   Zoom({aug['zoom_scale']}) → Rotation(±{aug['random_rotation_degrees']}°)")
    print(f"              → HFlip(p={aug['horizontal_flip_prob']}) → ColorJitter(B={aug['brightness_range']},")
    print(f"              C={aug['contrast_range']}, S={aug['saturation_range']}, H={aug['hue_range']})")
    print(f"              → GaussianBlur(k={aug['gaussian_blur_kernel']}, p={aug['gaussian_blur_prob']})")
    print(f"              → ToTensor → Normalize(ImageNet)")
    print(f"  Val / Test: Resize(224×224) → ToTensor → Normalize(ImageNet)")

    print(f"\n{'═'*70}\n")


# ═════════════════════════════════════════════════════════════════════════════
#  Main Pipeline — get_dataloaders()
# ═════════════════════════════════════════════════════════════════════════════

def get_dataloaders(
    data_dir: Optional[str] = None,
    batch_size: Optional[int] = None,
    train_ratio: Optional[float] = None,
    val_ratio: Optional[float] = None,
    test_ratio: Optional[float] = None,
    num_workers: int = 4,
    print_stats: bool = True,
) -> Tuple[DataLoader, DataLoader, DataLoader, list]:
    """
    Build the complete dataset pipeline with train/val/test DataLoaders.

    Steps:
      1. Load all images from folder-per-class structure
      2. Apply preprocessing (resize 224×224, RGB, normalize)
      3. Split into 70% train / 15% val / 15% test
      4. Apply augmentation to training set only
      5. Print dataset statistics

    Args:
        data_dir:    Root directory with class subdirectories.
                     Defaults to config.DATA_DIR.
        batch_size:  Batch size. Defaults to config.BATCH_SIZE.
        train_ratio: Training fraction. Defaults to config.TRAIN_SPLIT (0.70).
        val_ratio:   Validation fraction. Defaults to config.VAL_SPLIT (0.15).
        test_ratio:  Test fraction. Defaults to config.TEST_SPLIT (0.15).
        num_workers: Number of dataloader workers.
        print_stats: Whether to print dataset statistics.

    Returns:
        Tuple of (train_loader, val_loader, test_loader, class_names).
    """
    data_dir = data_dir or config.DATA_DIR
    batch_size = batch_size or config.BATCH_SIZE
    train_ratio = train_ratio or config.TRAIN_SPLIT
    val_ratio = val_ratio or config.VAL_SPLIT
    test_ratio = test_ratio or config.TEST_SPLIT

    # ── Step 1: Load full dataset (with val/test preprocessing) ──
    full_dataset = CropDiseaseDataset(
        root_dir=data_dir,
        transform=get_transforms(mode="val"),  # Default preprocessing
    )

    # ── Step 2: Split into train / val / test ──
    train_subset, val_subset, test_subset = _split_dataset(
        full_dataset,
        train_ratio=train_ratio,
        val_ratio=val_ratio,
        test_ratio=test_ratio,
    )

    # ── Step 3: Create separate datasets with correct transforms ──
    # Training set uses augmentation transforms
    train_dataset = _TransformSubset(train_subset, get_transforms(mode="train"))

    # Val and test sets use only preprocessing (no augmentation)
    val_dataset = _TransformSubset(val_subset, get_transforms(mode="val"))
    test_dataset = _TransformSubset(test_subset, get_transforms(mode="test"))

    # ── Step 4: Print dataset statistics ──
    if print_stats:
        print_dataset_statistics(full_dataset, train_subset, val_subset, test_subset)

    # ── Step 5: Build DataLoaders ──
    train_loader = DataLoader(
        train_dataset,
        batch_size=batch_size,
        shuffle=True,
        num_workers=num_workers,
        pin_memory=True,
        drop_last=True,
    )

    val_loader = DataLoader(
        val_dataset,
        batch_size=batch_size,
        shuffle=False,
        num_workers=num_workers,
        pin_memory=True,
    )

    test_loader = DataLoader(
        test_dataset,
        batch_size=batch_size,
        shuffle=False,
        num_workers=num_workers,
        pin_memory=True,
    )

    return train_loader, val_loader, test_loader, full_dataset.classes


class _TransformSubset(Dataset):
    """
    Wraps a Subset so that each split can have its own transform pipeline.

    This avoids the problem of all splits sharing the same transform
    when using torch.utils.data.random_split().
    """

    def __init__(self, subset: Subset, transform: transforms.Compose):
        self.subset = subset
        self.transform = transform

    def __len__(self) -> int:
        return len(self.subset)

    def __getitem__(self, idx: int) -> Tuple[torch.Tensor, int]:
        # Get original image path and label from the parent dataset
        original_idx = self.subset.indices[idx]
        img_path, label = self.subset.dataset.samples[original_idx]

        # Load as RGB and apply this split's transform
        image = Image.open(img_path).convert("RGB")
        image = self.transform(image)

        return image, label


# ═════════════════════════════════════════════════════════════════════════════
#  Standalone execution — test the pipeline
# ═════════════════════════════════════════════════════════════════════════════

if __name__ == "__main__":
    """
    Run directly to test the pipeline:
        python -m dataset.loader
    """
    import argparse

    parser = argparse.ArgumentParser(description="Test the dataset pipeline")
    parser.add_argument(
        "--data-dir", type=str, default=None,
        help="Path to dataset directory (default: config.DATA_DIR)"
    )
    parser.add_argument(
        "--batch-size", type=int, default=8,
        help="Batch size for testing"
    )
    args = parser.parse_args()

    print("🌿 Loading PlantVillage dataset pipeline...\n")

    train_loader, val_loader, test_loader, class_names = get_dataloaders(
        data_dir=args.data_dir,
        batch_size=args.batch_size,
        print_stats=True,
    )

    # Verify a batch
    print("Verifying first training batch...")
    images, labels = next(iter(train_loader))
    print(f"  Batch shape:  {images.shape}")          # (B, 3, 224, 224)
    print(f"  Labels shape: {labels.shape}")           # (B,)
    print(f"  Pixel range:  [{images.min():.3f}, {images.max():.3f}]")
    print(f"  Dtype:        {images.dtype}")
    print(f"  Labels:       {[class_names[l] for l in labels.tolist()[:4]]}...")
    print("\n✅ Pipeline is working correctly!")
