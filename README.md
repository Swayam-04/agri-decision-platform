# 🌿 Agri-Decision Platform

A comprehensive AI-driven agriculture intelligence platform designed to empower farmers with data-driven insights, multi-crop analysis, and disease detection.

## 🚀 Key Features

### 1. 📂 Multi-Crop Intelligence
- **Profit Prediction**: Real-time profit volatility and spike analysis for multiple crops (Beans, Potato, Tomato, etc.).
- **Risk Advisory**: Transparent risk scoring based on regional and seasonal climate data.
- **Intercropping Recommendations**: Dynamic suggestions for maximizing farm yield.

### 2. 🔍 Advanced Disease Detection
- **Image Validation Layer**: Built-in browser-side "Fast Method" validation to reject non-leaf images and protect backend resources.
- **Deep Learning Inference**: High-accuracy disease classification using EfficientNet-B0.
- **Symptom-Aware Logic**: Multi-mask HSV detection for lesions (Brown/Black/Yellow) and balanced "Healthy" floor logic.
- **Uncertainty Handling**: Integrated Top-2 prediction checks and confidence thresholds to ensure reliable advice.

### 3. 📍 Location & Support Services
- **Nearby Agro Stores**: Find local fertilizer and plant medicine shops using Geolocation and OpenStreetMap (Overpass API).
- **Voice Assistant**: Integrated multilingual voice commands for hands-free interaction.
- **Multilingual Support**: Fully localized in English, Hindi (हिंदी), Odia (ଓଡ଼ିଆ), and Bengali (বাংলা).

## 🛠️ Tech Stack
- **Frontend**: Next.js 15, Tailwind CSS, Lucide React, Shadcn UI.
- **AI Core**: Python (PyTorch), FastAPI, Groq LPU (for Chatbot).
- **Mapping**: OpenStreetMap / Overpass API.

## 🏃 Getting Started

### Prerequisites
- Node.js 18+
- Python 3.9+
- [Groq API Key](https://console.groq.com/) (Required for AI features)

### Installation

1. **Clone the repo**
```bash
git clone https://github.com/Swayam-04/agri-decision-platform.git
cd agri-decision-platform
```

2. **Frontend Setup**
```bash
npm install
npm run dev
```

3. **AI Backend Setup**
```bash
cd crop-disease-detection
pip install -r requirements.txt
python -m api.app
```

## 📄 License
This project is licensed under the MIT License.

