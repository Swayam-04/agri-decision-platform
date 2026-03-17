# 🌿 Crop Disease Detection

Deep learning image classification for detecting plant diseases from leaf images. Built with **PyTorch** and **EfficientNet-B0** (swappable to ResNet50).

## Project Structure

```
crop-disease-detection/
├── config.py                 # Central configuration
├── requirements.txt          # Python dependencies
├── dataset/
│   ├── data/                 # Place your dataset here (folder-per-class)
│   ├── loader.py             # Data loading & preprocessing
│   └── augmentation.py       # Mixup, CutMix utilities
├── models/
│   ├── classifier.py         # EfficientNet/ResNet50 classifier
│   └── checkpoints/          # Saved model weights
├── training/
│   ├── train.py              # Training loop
│   ├── evaluate.py           # Evaluation & confusion matrix
│   └── logs/                 # Training history & reports
├── inference/
│   └── predict.py            # Single-image prediction
└── api/
    ├── app.py                # FastAPI REST server
    └── schemas.py            # Request/response models
```

## Quick Start

### 1. Install Dependencies

```bash
cd crop-disease-detection
pip install -r requirements.txt
```

### 2. Prepare Dataset

Download the [PlantVillage dataset](https://www.kaggle.com/datasets/emmarex/plantdisease) and extract it into `dataset/data/`:

```
dataset/data/
├── Apple___Apple_scab/
│   ├── img001.jpg
│   └── ...
├── Apple___Black_rot/
│   └── ...
└── ... (38 class folders)
```

### 3. Train the Model

```bash
python -m training.train

# With custom options:
python -m training.train --model resnet50 --epochs 30 --batch-size 16 --lr 0.0005
```

### 4. Evaluate

```bash
python -m training.evaluate
```

Generates a classification report and confusion matrix in `training/logs/`.

### 5. Run Inference

```bash
# Single image prediction
python -m inference.predict path/to/leaf_image.jpg
```

Output:
```
  🌿 Prediction: Tomato___Late_blight
  📊 Confidence: 94.2%

  Top 5 predictions:
  1. Tomato___Late_blight                          94.2% ████████████████████████████
  2. Tomato___Early_blight                          3.1% █
  3. Tomato___Septoria_leaf_spot                    1.2%
  ...
```

### 6. Start the API Server

```bash
python -m api.app
```

The server starts at `http://localhost:8000`. API docs at `/docs`.

**Endpoints:**

| Method | Endpoint     | Description                         |
|--------|-------------|-------------------------------------|
| POST   | `/predict`  | Upload image → disease prediction    |
| GET    | `/health`   | Model status & device info          |
| GET    | `/classes`  | List all disease class labels       |

**Example API call:**

```bash
curl -X POST "http://localhost:8000/predict" \
  -F "file=@leaf_image.jpg"
```

Response:
```json
{
  "success": true,
  "label": "Tomato___Late_blight",
  "confidence": 0.9423,
  "top_predictions": [
    {"label": "Tomato___Late_blight", "confidence": 0.9423},
    {"label": "Tomato___Early_blight", "confidence": 0.0312}
  ]
}
```

## Configuration

Edit `config.py` to change:

| Setting           | Default            | Description                    |
|-------------------|--------------------|--------------------------------|
| `MODEL_NAME`      | `efficientnet_b0`  | Backbone (`resnet50` also)     |
| `IMAGE_SIZE`      | `224`              | Input image dimensions         |
| `NUM_CLASSES`     | `38`               | PlantVillage class count       |
| `BATCH_SIZE`      | `32`               | Training batch size            |
| `LEARNING_RATE`   | `1e-3`             | Initial learning rate          |
| `NUM_EPOCHS`      | `25`               | Max training epochs            |

## Supported Diseases

38 classes from the PlantVillage dataset covering:
Apple, Blueberry, Cherry, Corn, Grape, Orange, Peach, Pepper, Potato, Raspberry, Soybean, Squash, Strawberry, and Tomato — with healthy and diseased variants.
