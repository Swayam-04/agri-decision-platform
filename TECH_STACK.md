# 🌾 Agri Decision Platform - Tech Stack

This document outlines the technologies, frameworks, and libraries used to build the Agri Decision Platform, including both the web application and the AI crop disease detection module.

---

## 🎨 Frontend (Web Application)
The user interface is built for high performance, responsiveness, and accessibility across devices.

- **Framework:** [Next.js 15+](https://nextjs.org/) (App Router)
- **Language:** [TypeScript](https://www.typescriptlang.org/)
- **UI Library:** [React](https://react.dev/)
- **Styling:** [Tailwind CSS](https://tailwindcss.com/)
- **Component Library:** Custom components based on [shadcn/ui](https://ui.shadcn.com/)
- **Icons:** [Lucide React](https://lucide.dev/)
- **State Management:** React Hooks (`useState`, `useCallback`, Context API)
- **Localization:** Custom i18n implementation (`useTranslation` hook with JSON dictionaries for English, Hindi, Odia, etc.)

---

## ⚙️ Backend (Node.js / Next.js API)
The intermediary layer handling client requests, internationalization formatting, and proxying requests to the AI engine.

- **Runtime:** Node.js (via Next.js API Routes / App Router handlers)
- **Language:** [TypeScript](https://www.typescriptlang.org/)
- **Package Manager:** [Bun](https://bun.sh/) (indicated by `bun.lock`)

---

## 🧠 AI Engine & Machine Learning (Crop Disease Detection)
A dedicated microservice for running deep learning inferences on crop leaf images.

- **API Framework:** [FastAPI](https://fastapi.tiangolo.com/) (Python)
- **Machine Learning Framework:** [PyTorch](https://pytorch.org/)
- **Core Models:** [EfficientNet-B0](https://arxiv.org/abs/1905.11946) & [ResNet50](https://arxiv.org/abs/1512.03385) (Transfer Learning)
- **Dataset Focus:** [PlantVillage Dataset](https://www.kaggle.com/datasets/emmarex/plantdisease) (38 classes, specializing in Indian crops like Tomato, Potato, Pepper, etc.)
- **Image Processing:** [Pillow (PIL)](https://pillow.readthedocs.io/)
- **Server:** [Uvicorn](https://www.uvicorn.org/) (ASGI server for FastAPI)

### ML Architecture Features:
- **Client-Side Pre-validation:** Fast RGB/HSV heuristics to verify images are actual "leaves" before heavy backend processing.
- **Dynamic Augmentations:** Gaussian Noise, Blur, Mixup, and CutMix for improving robustness against real-world mobile photos.
- **Confidence Guardrails:** Top-2 prediction confidence margins to filter out ambiguous imagery and "Healthy" overrides.

---

## 🚀 Deployment & Build Tools
- **Build System:** Next.js Compiler / SWC
- **Linting & Formatting:** ESLint
- **Version Control:** Git

---

## 📂 Project Structure Overview
- `src/app/` - Next.js App Router pages and API routes (Frontend & Node Backend).
- `src/components/` - Reusable UI components (Tailwind + shadcn).
- `src/lib/` - Shared utilities, types, and the `ai-engine.ts` API orchestrator.
- `src/translations/` - Localization JSON strings.
- `crop-disease-detection/` - The dedicated PyTorch and FastAPI workspace for model training and inference.
