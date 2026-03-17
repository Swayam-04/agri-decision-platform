"""
Training loop for the crop disease classification model.

Features:
- Cross-entropy loss with optional label smoothing
- Adam optimizer with weight decay
- Cosine annealing or step LR scheduler
- Metrics: accuracy, precision, recall (per-epoch)
- Best-model checkpointing based on validation loss
- Early stopping when validation loss stops improving
- Training history logging (JSON)
"""

import os
import sys
import time
import json
from typing import Optional, Dict, List

import torch
import torch.nn as nn
from torch.optim import Adam
from torch.optim.lr_scheduler import CosineAnnealingLR, StepLR
from sklearn.metrics import precision_score, recall_score
from tqdm import tqdm
import numpy as np

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
import config
from models.classifier import build_model
from dataset.loader import get_dataloaders


class Trainer:
    """
    Encapsulates the full training pipeline for crop disease classification.

    Tracks accuracy, precision, and recall per epoch. Saves the best
    model checkpoint based on validation loss and stops early if
    validation loss plateaus.

    Usage:
        trainer = Trainer()
        trainer.train()
    """

    def __init__(
        self,
        model_name: Optional[str] = None,
        num_classes: Optional[int] = None,
        data_dir: Optional[str] = None,
        batch_size: Optional[int] = None,
        learning_rate: Optional[float] = None,
        num_epochs: Optional[int] = None,
        device: Optional[str] = None,
        freeze_backbone: Optional[bool] = None,
        freeze_ratio: Optional[float] = None,
    ):
        self.device = device or config.DEVICE
        self.num_epochs = num_epochs or config.NUM_EPOCHS
        self.learning_rate = learning_rate or config.LEARNING_RATE

        print(f"\n{'='*60}")
        print(f"  Crop Disease Detection — Training")
        print(f"{'='*60}")
        print(f"  Device:        {self.device}")
        print(f"  Model:         {model_name or config.MODEL_NAME}")
        print(f"  Epochs:        {self.num_epochs}")
        print(f"  Batch size:    {batch_size or config.BATCH_SIZE}")
        print(f"  Learning rate: {self.learning_rate}")
        print(f"  Optimizer:     Adam (weight_decay={config.WEIGHT_DECAY})")
        print(f"  Loss:          CrossEntropyLoss (label_smoothing=0.1)")
        print(f"  Metrics:       Accuracy, Precision, Recall")
        print(f"  Early stop:    patience={config.EARLY_STOPPING_PATIENCE} (monitor=val_loss)")
        print(f"{'='*60}\n")

        # ── Data (70/15/15 split) ──
        self.train_loader, self.val_loader, _, self.class_names = get_dataloaders(
            data_dir=data_dir,
            batch_size=batch_size,
            print_stats=True,
        )

        # ── Model — freeze early conv layers for transfer learning ──
        _freeze = freeze_backbone if freeze_backbone is not None else config.FREEZE_BACKBONE
        _ratio = freeze_ratio if freeze_ratio is not None else config.FREEZE_RATIO
        self.model = build_model(
            model_name=model_name,
            num_classes=num_classes or len(self.class_names),
            freeze_backbone=_freeze,
            freeze_ratio=_ratio,
        ).to(self.device)

        # ── Loss function (categorical cross-entropy) ──
        self.criterion = nn.CrossEntropyLoss(label_smoothing=0.1)

        # ── Optimizer: Adam ──
        self.optimizer = Adam(
            self.model.parameters(),
            lr=self.learning_rate,
            weight_decay=config.WEIGHT_DECAY,
        )

        # ── LR Scheduler ──
        if config.SCHEDULER == "cosine":
            self.scheduler = CosineAnnealingLR(
                self.optimizer, T_max=self.num_epochs
            )
        else:
            self.scheduler = StepLR(
                self.optimizer,
                step_size=config.STEP_SIZE,
                gamma=config.GAMMA,
            )

        # ── Tracking ──
        self.best_val_loss = float("inf")
        self.patience_counter = 0
        self.history: Dict[str, List[float]] = {
            "train_loss": [],
            "train_acc": [],
            "train_precision": [],
            "train_recall": [],
            "val_loss": [],
            "val_acc": [],
            "val_precision": [],
            "val_recall": [],
            "lr": [],
        }

    # ─────────────────────────────────────────────────────────────────────────
    #  Training epoch
    # ─────────────────────────────────────────────────────────────────────────

    def train_one_epoch(self, epoch: int) -> dict:
        """
        Run one training epoch.

        Returns:
            Dict with keys: loss, accuracy, precision, recall.
        """
        self.model.train()
        running_loss = 0.0
        correct = 0
        total = 0
        all_preds: List[int] = []
        all_labels: List[int] = []

        pbar = tqdm(
            self.train_loader,
            desc=f"Epoch {epoch+1}/{self.num_epochs} [Train]",
            leave=False,
        )

        for images, labels in pbar:
            images = images.to(self.device)
            labels = labels.to(self.device)

            # Forward pass
            outputs = self.model(images)
            loss = self.criterion(outputs, labels)

            # Backward pass
            self.optimizer.zero_grad()
            loss.backward()
            torch.nn.utils.clip_grad_norm_(self.model.parameters(), max_norm=1.0)
            self.optimizer.step()

            # Accumulate metrics
            running_loss += loss.item() * images.size(0)
            _, predicted = outputs.max(1)
            total += labels.size(0)
            correct += predicted.eq(labels).sum().item()

            all_preds.extend(predicted.cpu().numpy())
            all_labels.extend(labels.cpu().numpy())

            pbar.set_postfix({
                "loss": f"{loss.item():.4f}",
                "acc": f"{100.0 * correct / total:.1f}%",
            })

        avg_loss = running_loss / total
        accuracy = 100.0 * correct / total
        precision = 100.0 * precision_score(
            all_labels, all_preds, average="macro", zero_division=0
        )
        recall = 100.0 * recall_score(
            all_labels, all_preds, average="macro", zero_division=0
        )

        return {
            "loss": avg_loss,
            "accuracy": accuracy,
            "precision": precision,
            "recall": recall,
        }

    # ─────────────────────────────────────────────────────────────────────────
    #  Validation
    # ─────────────────────────────────────────────────────────────────────────

    @torch.no_grad()
    def validate(self) -> dict:
        """
        Run validation.

        Returns:
            Dict with keys: loss, accuracy, precision, recall.
        """
        self.model.eval()
        running_loss = 0.0
        correct = 0
        total = 0
        all_preds: List[int] = []
        all_labels: List[int] = []

        for images, labels in self.val_loader:
            images = images.to(self.device)
            labels = labels.to(self.device)

            outputs = self.model(images)
            loss = self.criterion(outputs, labels)

            running_loss += loss.item() * images.size(0)
            _, predicted = outputs.max(1)
            total += labels.size(0)
            correct += predicted.eq(labels).sum().item()

            all_preds.extend(predicted.cpu().numpy())
            all_labels.extend(labels.cpu().numpy())

        avg_loss = running_loss / total
        accuracy = 100.0 * correct / total
        precision = 100.0 * precision_score(
            all_labels, all_preds, average="macro", zero_division=0
        )
        recall = 100.0 * recall_score(
            all_labels, all_preds, average="macro", zero_division=0
        )

        return {
            "loss": avg_loss,
            "accuracy": accuracy,
            "precision": precision,
            "recall": recall,
        }

    # ─────────────────────────────────────────────────────────────────────────
    #  Checkpoint & history
    # ─────────────────────────────────────────────────────────────────────────

    def save_checkpoint(self, epoch: int, val_metrics: dict):
        """Save best model checkpoint when validation loss improves."""
        checkpoint = {
            "epoch": epoch,
            "model_state_dict": self.model.state_dict(),
            "optimizer_state_dict": self.optimizer.state_dict(),
            "scheduler_state_dict": self.scheduler.state_dict(),
            "val_loss": val_metrics["loss"],
            "val_acc": val_metrics["accuracy"],
            "val_precision": val_metrics["precision"],
            "val_recall": val_metrics["recall"],
            "class_names": self.class_names,
            "model_name": config.MODEL_NAME,
            "num_classes": len(self.class_names),
        }
        path = os.path.join(config.CHECKPOINT_DIR, "best_model.pth")
        torch.save(checkpoint, path)
        print(f"  ✓ Best model saved → {path} (val_loss={val_metrics['loss']:.4f})")

    def save_history(self):
        """Save training history to JSON."""
        path = os.path.join(config.LOG_DIR, "training_history.json")
        with open(path, "w") as f:
            json.dump(self.history, f, indent=2)
        print(f"  ✓ History saved → {path}")

    # ─────────────────────────────────────────────────────────────────────────
    #  Main training loop
    # ─────────────────────────────────────────────────────────────────────────

    def train(self):
        """
        Execute the full training loop.

        - Monitors validation loss for early stopping
        - Automatically saves the best model checkpoint
        - Tracks accuracy, precision, recall per epoch
        """
        start_time = time.time()

        for epoch in range(self.num_epochs):
            # ── Train ──
            train_metrics = self.train_one_epoch(epoch)

            # ── Validate ──
            val_metrics = self.validate()

            # ── Update LR scheduler ──
            self.scheduler.step()
            current_lr = self.optimizer.param_groups[0]["lr"]

            # ── Log to history ──
            self.history["train_loss"].append(train_metrics["loss"])
            self.history["train_acc"].append(train_metrics["accuracy"])
            self.history["train_precision"].append(train_metrics["precision"])
            self.history["train_recall"].append(train_metrics["recall"])
            self.history["val_loss"].append(val_metrics["loss"])
            self.history["val_acc"].append(val_metrics["accuracy"])
            self.history["val_precision"].append(val_metrics["precision"])
            self.history["val_recall"].append(val_metrics["recall"])
            self.history["lr"].append(current_lr)

            # ── Console output ──
            print(
                f"Epoch {epoch+1:3d}/{self.num_epochs} │ "
                f"Train Loss: {train_metrics['loss']:.4f}  "
                f"Acc: {train_metrics['accuracy']:.1f}%  "
                f"P: {train_metrics['precision']:.1f}%  "
                f"R: {train_metrics['recall']:.1f}% │ "
                f"Val Loss: {val_metrics['loss']:.4f}  "
                f"Acc: {val_metrics['accuracy']:.1f}%  "
                f"P: {val_metrics['precision']:.1f}%  "
                f"R: {val_metrics['recall']:.1f}% │ "
                f"LR: {current_lr:.6f}"
            )

            # ── Best-model checkpointing (monitor val_loss) ──
            if val_metrics["loss"] < self.best_val_loss:
                self.best_val_loss = val_metrics["loss"]
                self.save_checkpoint(epoch, val_metrics)
                self.patience_counter = 0
            else:
                self.patience_counter += 1

            # ── Early stopping ──
            if self.patience_counter >= config.EARLY_STOPPING_PATIENCE:
                print(
                    f"\n⚠ Early stopping at epoch {epoch+1} — "
                    f"val_loss has not improved for "
                    f"{config.EARLY_STOPPING_PATIENCE} epochs"
                )
                break

        # ── Training summary ──
        elapsed = time.time() - start_time
        best_epoch_idx = int(np.argmin(self.history["val_loss"]))

        print(f"\n{'='*60}")
        print(f"  Training complete in {elapsed/60:.1f} minutes")
        print(f"  Best epoch: {best_epoch_idx + 1}")
        print(f"  Best val_loss:      {self.history['val_loss'][best_epoch_idx]:.4f}")
        print(f"  Best val_accuracy:  {self.history['val_acc'][best_epoch_idx]:.2f}%")
        print(f"  Best val_precision: {self.history['val_precision'][best_epoch_idx]:.2f}%")
        print(f"  Best val_recall:    {self.history['val_recall'][best_epoch_idx]:.2f}%")
        print(f"{'='*60}\n")

        self.save_history()
        return self.history


def main():
    """CLI entry point for training."""
    import argparse

    parser = argparse.ArgumentParser(description="Train crop disease classifier")
    parser.add_argument("--data-dir", type=str, default=None, help="Path to dataset directory")
    parser.add_argument("--model", type=str, default=None, help="Model name (efficientnet_b0, resnet50)")
    parser.add_argument("--epochs", type=int, default=None, help="Number of epochs")
    parser.add_argument("--batch-size", type=int, default=None, help="Batch size")
    parser.add_argument("--lr", type=float, default=None, help="Learning rate")
    parser.add_argument("--freeze", dest="freeze", action="store_true", default=None,
                        help="Freeze early backbone layers (default from config)")
    parser.add_argument("--no-freeze", dest="freeze", action="store_false",
                        help="Train all layers from scratch")
    parser.add_argument("--freeze-ratio", type=float, default=None,
                        help="Fraction of backbone layers to freeze (0.0–1.0)")
    args = parser.parse_args()

    trainer = Trainer(
        model_name=args.model,
        data_dir=args.data_dir,
        num_epochs=args.epochs,
        batch_size=args.batch_size,
        learning_rate=args.lr,
        freeze_backbone=args.freeze,
        freeze_ratio=args.freeze_ratio,
    )
    trainer.train()


if __name__ == "__main__":
    main()
