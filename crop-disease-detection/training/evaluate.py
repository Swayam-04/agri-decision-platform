"""
Model evaluation on the held-out test dataset.

Generates:
  1. Overall accuracy score
  2. Confusion matrix (heatmap saved as PNG)
  3. Full classification report (precision, recall, F1 per class)
  4. Per-class accuracy breakdown
  5. Most commonly misclassified disease pairs
"""

import os
import sys
from typing import Optional, List, Tuple
from collections import Counter

import torch
import numpy as np
import matplotlib
matplotlib.use("Agg")  # Non-interactive backend
import matplotlib.pyplot as plt
from sklearn.metrics import (
    classification_report,
    confusion_matrix,
    accuracy_score,
    precision_score,
    recall_score,
    f1_score,
)

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
import config
from models.classifier import build_model
from dataset.loader import get_dataloaders


# ═════════════════════════════════════════════════════════════════════════════
#  Main Evaluation Function
# ═════════════════════════════════════════════════════════════════════════════

@torch.no_grad()
def evaluate_model(
    checkpoint_path: Optional[str] = None,
    data_dir: Optional[str] = None,
    save_dir: Optional[str] = None,
    top_k_misclassified: int = 10,
) -> dict:
    """
    Evaluate a trained model on the held-out test split.

    Args:
        checkpoint_path: Path to the model checkpoint (.pth).
                         Defaults to best_model.pth in CHECKPOINT_DIR.
        data_dir:        Path to the dataset directory.
        save_dir:        Directory to save evaluation artifacts.
                         Defaults to LOG_DIR.
        top_k_misclassified: Number of top misclassified pairs to display.

    Returns:
        Dictionary containing all evaluation metrics and artifacts.
    """
    checkpoint_path = checkpoint_path or os.path.join(
        config.CHECKPOINT_DIR, "best_model.pth"
    )
    save_dir = save_dir or config.LOG_DIR
    os.makedirs(save_dir, exist_ok=True)

    # ── Load checkpoint ──
    print(f"\n{'═'*70}")
    print(f"  📊 MODEL EVALUATION — Test Dataset")
    print(f"{'═'*70}")
    print(f"\n  Loading checkpoint: {checkpoint_path}")

    checkpoint = torch.load(checkpoint_path, map_location=config.DEVICE)

    class_names = checkpoint.get("class_names", config.CLASS_NAMES)
    model_name = checkpoint.get("model_name", config.MODEL_NAME)
    num_classes = checkpoint.get("num_classes", config.NUM_CLASSES)
    best_epoch = checkpoint.get("epoch", "N/A")
    train_val_loss = checkpoint.get("val_loss", "N/A")

    print(f"  Model:      {model_name}")
    print(f"  Classes:    {num_classes}")
    print(f"  Best epoch: {best_epoch}")

    # ── Build model and load weights ──
    model = build_model(
        model_name=model_name,
        num_classes=num_classes,
        pretrained=False,
        freeze_backbone=False,
    ).to(config.DEVICE)
    model.load_state_dict(checkpoint["model_state_dict"])
    model.eval()

    # ── Get test data (held-out 15% split) ──
    _, _, test_loader, _ = get_dataloaders(data_dir=data_dir, print_stats=False)

    all_preds: List[int] = []
    all_labels: List[int] = []

    for images, labels in test_loader:
        images = images.to(config.DEVICE)
        outputs = model(images)
        _, predicted = outputs.max(1)

        all_preds.extend(predicted.cpu().numpy().tolist())
        all_labels.extend(labels.numpy().tolist())

    all_preds_arr = np.array(all_preds)
    all_labels_arr = np.array(all_labels)

    # ── 1. Overall Accuracy ──
    overall_acc = 100.0 * accuracy_score(all_labels_arr, all_preds_arr)
    overall_precision = 100.0 * precision_score(
        all_labels_arr, all_preds_arr, average="macro", zero_division=0
    )
    overall_recall = 100.0 * recall_score(
        all_labels_arr, all_preds_arr, average="macro", zero_division=0
    )
    overall_f1 = 100.0 * f1_score(
        all_labels_arr, all_preds_arr, average="macro", zero_division=0
    )

    print(f"\n  ┌─ Overall Metrics ─────────────────────────────────────────┐")
    print(f"  │  Accuracy:   {overall_acc:>8.2f}%                               │")
    print(f"  │  Precision:  {overall_precision:>8.2f}%  (macro-averaged)           │")
    print(f"  │  Recall:     {overall_recall:>8.2f}%  (macro-averaged)           │")
    print(f"  │  F1-Score:   {overall_f1:>8.2f}%  (macro-averaged)           │")
    print(f"  └─────────────────────────────────────────────────────────┘")

    # ── 2. Classification Report ──
    report_str = classification_report(
        all_labels_arr,
        all_preds_arr,
        target_names=class_names,
        digits=3,
    )

    print(f"\n  ── Classification Report ──────────────────────────────────")
    print(report_str)

    # ── 3. Per-Class Accuracy ──
    per_class_acc = _compute_per_class_accuracy(
        all_labels_arr, all_preds_arr, class_names
    )

    print(f"  ── Per-Class Accuracy ─────────────────────────────────────")
    print(f"  {'#':<4} {'Disease Class':<50} {'Acc':<8} {'Correct':<8} {'Total':<6}")
    print(f"  {'─'*78}")

    for i, (cls_name, acc, correct, total) in enumerate(per_class_acc):
        display_name = cls_name.replace("___", " → ").replace("_", " ")
        if len(display_name) > 48:
            display_name = display_name[:45] + "..."

        # Color-code: highlight low accuracy classes
        marker = "  " if acc >= 80.0 else "⚠ "
        print(
            f"  {marker}{i+1:<3} {display_name:<50} "
            f"{acc:>5.1f}%  {correct:>5}/{total:<5}"
        )

    # ── 4. Confusion Matrix ──
    cm = confusion_matrix(all_labels_arr, all_preds_arr)
    _plot_confusion_matrix(cm, class_names, save_dir)

    # ── 5. Most Commonly Misclassified Diseases ──
    misclassified_pairs = _find_misclassified_pairs(
        all_labels_arr, all_preds_arr, class_names, top_k=top_k_misclassified
    )

    print(f"\n  ── Most Commonly Misclassified Pairs ──────────────────────")
    print(
        f"  {'#':<4} {'True Disease':<30} {'Predicted As':<30} "
        f"{'Count':<6} {'% of Class':<10}"
    )
    print(f"  {'─'*82}")

    for rank, (true_cls, pred_cls, count, pct) in enumerate(misclassified_pairs, 1):
        true_short = true_cls.replace("___", "→").replace("_", " ")
        pred_short = pred_cls.replace("___", "→").replace("_", " ")
        if len(true_short) > 28:
            true_short = true_short[:25] + "..."
        if len(pred_short) > 28:
            pred_short = pred_short[:25] + "..."

        print(f"  {rank:<4} {true_short:<30} {pred_short:<30} {count:<6} {pct:>5.1f}%")

    print(f"\n{'═'*70}\n")

    # ── Save evaluation report ──
    _save_evaluation_report(
        save_dir=save_dir,
        overall_acc=overall_acc,
        overall_precision=overall_precision,
        overall_recall=overall_recall,
        overall_f1=overall_f1,
        report_str=report_str,
        per_class_acc=per_class_acc,
        misclassified_pairs=misclassified_pairs,
    )

    return {
        "accuracy": overall_acc,
        "precision": overall_precision,
        "recall": overall_recall,
        "f1_score": overall_f1,
        "classification_report": report_str,
        "confusion_matrix": cm,
        "per_class_accuracy": per_class_acc,
        "misclassified_pairs": misclassified_pairs,
    }


# ═════════════════════════════════════════════════════════════════════════════
#  Per-Class Accuracy
# ═════════════════════════════════════════════════════════════════════════════

def _compute_per_class_accuracy(
    labels: np.ndarray,
    preds: np.ndarray,
    class_names: List[str],
) -> List[Tuple[str, float, int, int]]:
    """
    Compute accuracy for each individual class.

    Returns:
        List of (class_name, accuracy_%, correct_count, total_count)
        sorted by accuracy ascending (worst classes first).
    """
    results = []
    for idx, cls_name in enumerate(class_names):
        mask = labels == idx
        total = mask.sum()
        if total == 0:
            results.append((cls_name, 0.0, 0, 0))
            continue
        correct = (preds[mask] == idx).sum()
        acc = 100.0 * correct / total
        results.append((cls_name, float(acc), int(correct), int(total)))

    # Sort by accuracy ascending — worst performing classes first
    results.sort(key=lambda x: x[1])
    return results


# ═════════════════════════════════════════════════════════════════════════════
#  Most Commonly Misclassified Disease Pairs
# ═════════════════════════════════════════════════════════════════════════════

def _find_misclassified_pairs(
    labels: np.ndarray,
    preds: np.ndarray,
    class_names: List[str],
    top_k: int = 10,
) -> List[Tuple[str, str, int, float]]:
    """
    Find the most common misclassification pairs.

    For each wrong prediction, records (true_class → predicted_class).
    Returns the top-K most frequent error pairs.

    Returns:
        List of (true_class_name, predicted_class_name, error_count,
                 percentage_of_true_class) sorted by count descending.
    """
    # Count all misclassification pairs
    error_pairs: Counter = Counter()
    class_totals: Counter = Counter()

    for true_label, pred_label in zip(labels, preds):
        class_totals[true_label] += 1
        if true_label != pred_label:
            error_pairs[(true_label, pred_label)] += 1

    # Build result list
    results = []
    for (true_idx, pred_idx), count in error_pairs.most_common(top_k):
        true_name = class_names[true_idx]
        pred_name = class_names[pred_idx]
        pct = 100.0 * count / class_totals[true_idx] if class_totals[true_idx] > 0 else 0.0
        results.append((true_name, pred_name, count, pct))

    return results


# ═════════════════════════════════════════════════════════════════════════════
#  Confusion Matrix Heatmap
# ═════════════════════════════════════════════════════════════════════════════

def _plot_confusion_matrix(
    cm: np.ndarray,
    class_names: List[str],
    save_dir: str,
):
    """Generate and save a confusion matrix heatmap as PNG."""
    # Format class names for display
    display_names = [
        n.replace("___", "→").replace("_", " ") for n in class_names
    ]
    # Truncate long names
    display_names = [n[:30] + "..." if len(n) > 30 else n for n in display_names]

    fig_size = max(10, len(class_names) * 0.6)
    fig, ax = plt.subplots(figsize=(fig_size, fig_size))

    im = ax.imshow(cm, interpolation="nearest", cmap="Blues")
    ax.figure.colorbar(im, ax=ax, fraction=0.046, pad=0.04)

    ax.set(
        xticks=np.arange(len(class_names)),
        yticks=np.arange(len(class_names)),
        xticklabels=display_names,
        yticklabels=display_names,
        ylabel="True Label",
        xlabel="Predicted Label",
        title="Confusion Matrix — Crop Disease Classification",
    )

    plt.setp(
        ax.get_xticklabels(),
        rotation=45,
        ha="right",
        rotation_mode="anchor",
        fontsize=8,
    )
    plt.setp(ax.get_yticklabels(), fontsize=8)

    # Add text annotations for small matrices (≤20 classes)
    if len(class_names) <= 20:
        thresh = cm.max() / 2.0
        for i in range(len(class_names)):
            for j in range(len(class_names)):
                ax.text(
                    j, i, format(cm[i, j], "d"),
                    ha="center", va="center",
                    color="white" if cm[i, j] > thresh else "black",
                    fontsize=7,
                )

    fig.tight_layout()
    path = os.path.join(save_dir, "confusion_matrix.png")
    fig.savefig(path, dpi=150, bbox_inches="tight")
    plt.close(fig)
    print(f"\n  ✓ Confusion matrix saved → {path}")


# ═════════════════════════════════════════════════════════════════════════════
#  Save Full Report
# ═════════════════════════════════════════════════════════════════════════════

def _save_evaluation_report(
    save_dir: str,
    overall_acc: float,
    overall_precision: float,
    overall_recall: float,
    overall_f1: float,
    report_str: str,
    per_class_acc: List[Tuple[str, float, int, int]],
    misclassified_pairs: List[Tuple[str, str, int, float]],
):
    """Save the complete evaluation report as a text file."""
    path = os.path.join(save_dir, "evaluation_report.txt")

    with open(path, "w", encoding="utf-8") as f:
        f.write("=" * 70 + "\n")
        f.write("  CROP DISEASE DETECTION — EVALUATION REPORT\n")
        f.write("=" * 70 + "\n\n")

        # Overall metrics
        f.write("OVERALL METRICS\n")
        f.write("-" * 40 + "\n")
        f.write(f"  Accuracy:   {overall_acc:.2f}%\n")
        f.write(f"  Precision:  {overall_precision:.2f}% (macro)\n")
        f.write(f"  Recall:     {overall_recall:.2f}% (macro)\n")
        f.write(f"  F1-Score:   {overall_f1:.2f}% (macro)\n\n")

        # Classification report
        f.write("CLASSIFICATION REPORT\n")
        f.write("-" * 40 + "\n")
        f.write(report_str + "\n\n")

        # Per-class accuracy
        f.write("PER-CLASS ACCURACY (sorted by accuracy, worst first)\n")
        f.write("-" * 70 + "\n")
        f.write(f"{'Class':<50} {'Acc':<8} {'Correct/Total':<15}\n")
        f.write("-" * 70 + "\n")
        for cls_name, acc, correct, total in per_class_acc:
            display = cls_name.replace("___", " → ").replace("_", " ")
            f.write(f"{display:<50} {acc:>5.1f}%   {correct}/{total}\n")
        f.write("\n")

        # Misclassified pairs
        f.write("MOST COMMONLY MISCLASSIFIED PAIRS\n")
        f.write("-" * 80 + "\n")
        f.write(f"{'True Disease':<30} {'Predicted As':<30} {'Count':<6} {'% of Class':<10}\n")
        f.write("-" * 80 + "\n")
        for true_cls, pred_cls, count, pct in misclassified_pairs:
            true_short = true_cls.replace("___", "→").replace("_", " ")
            pred_short = pred_cls.replace("___", "→").replace("_", " ")
            f.write(f"{true_short:<30} {pred_short:<30} {count:<6} {pct:>5.1f}%\n")

    print(f"  ✓ Evaluation report saved → {path}")


# ═════════════════════════════════════════════════════════════════════════════
#  CLI Entry Point
# ═════════════════════════════════════════════════════════════════════════════

def main():
    """CLI entry point for evaluation."""
    import argparse

    parser = argparse.ArgumentParser(
        description="Evaluate trained crop disease classifier on the test set"
    )
    parser.add_argument(
        "--checkpoint", type=str, default=None,
        help="Path to model checkpoint (.pth)"
    )
    parser.add_argument(
        "--data-dir", type=str, default=None,
        help="Path to dataset directory"
    )
    parser.add_argument(
        "--top-k", type=int, default=10,
        help="Number of top misclassified pairs to display"
    )
    args = parser.parse_args()

    evaluate_model(
        checkpoint_path=args.checkpoint,
        data_dir=args.data_dir,
        top_k_misclassified=args.top_k,
    )


if __name__ == "__main__":
    main()
