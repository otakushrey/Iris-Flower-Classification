# 🌸 Iris Flower Classification — Full-Stack Deep Learning System

[![Python](https://img.shields.io/badge/Python-3.11%20%7C%203.12%20%7C%203.15-blue.svg)](https://www.python.org/)
[![PyTorch](https://img.shields.io/badge/PyTorch-2.x-EE4C2C.svg)](https://pytorch.org/)
[![React](https://img.shields.io/badge/React-18-61DAFB.svg)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-5-646CFF.svg)](https://vitejs.dev/)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3-38B2AC.svg)](https://tailwindcss.com/)
[![Flask](https://img.shields.io/badge/Flask-3-000000.svg)](https://flask.palletsprojects.com/)
[![Git LFS](https://img.shields.io/badge/Git%20LFS-Enabled-orange.svg)](https://git-lfs.com/)

[![Deploy to Render](https://render.com/images/deploy-to-render-button.svg)](https://render.com/deploy?repo=https://github.com/otakushrey/Iris-Flower-Classification)

A modern, full-stack machine learning application designed to classify Iris flower species using Exploratory Data Analysis (EDA), Principal Component Analysis (PCA), and a custom **PyTorch Supervised Neural Network** with regularized multi-layer perceptron architecture.

---

## 🏛️ System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                 React 18 Frontend (Vite)                    │
│   • Manual Measurements Form (with 1-click presets)         │
│   • Flower Image Upload & Morphological Classifier          │
│   • Batch Test Set Evaluator (CSV Upload / 30-sample test)   │
│   • Interactive EDA & PCA Dashboards                        │
│   • Model Report (Confusion Matrix, Loss & Acc Curves)      │
└──────────────────────────────▲──────────────────────────────┘
                               │ JSON / Base64 Visualizations
                               ▼
┌─────────────────────────────────────────────────────────────┐
│                    Flask REST API Backend                   │
│   • GET  /api/health            • GET  /api/eda             │
│   • GET  /api/pca               • GET  /api/model-report    │
│   • POST /api/predict           • POST /api/predict-image   │
│   • POST /api/evaluate-testset  • GET  /api/sample-testset  │
└──────────────────────────────▲──────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────┐
│             PyTorch Deep Learning & Analysis Engine         │
│   • IrisNet: 4 → 64 → 32 → 16 → 3 Architecture             │
│   • BatchNorm1d, Dropout Regularization, Adam Optimizer     │
│   • Early Stopping & ReduceLROnPlateau Scheduler            │
│   • Scikit-learn PCA (2D, 3D, Scree, Loadings Heatmap)      │
└─────────────────────────────────────────────────────────────┘
```

---

## 📁 Optimized Project Structure

```
Iris-Flower-Classification/
├── backend/
│   ├── app.py                     # Flask REST API with all endpoints
│   ├── requirements.txt           # Python backend dependencies
│   ├── model/
│   │   ├── __init__.py
│   │   ├── nn_model.py            # PyTorch IrisNet architecture
│   │   ├── analysis.py            # Comprehensive EDA & PCA engine
│   │   ├── train.py               # Training loop with validation & early stopping
│   │   ├── iris_nn.pth            # Trained PyTorch model weights (95.65% test acc)
│   │   ├── scaler.joblib          # Fitted StandardScaler
│   │   ├── test_data.joblib       # Held-out stratified test set
│   │   ├── training_history.joblib# Epoch-wise train/val loss & accuracy
│   │   └── confusion_matrix.joblib# Evaluated test confusion matrix
│   ├── utils/
│   │   ├── __init__.py
│   │   └── preprocess.py          # Input validation & data preprocessing
│   └── test_samples/
│       ├── iris_test_set.csv      # 30-sample benchmark test set
│       ├── sample_setosa.jpg      # Sample test flower image
│       ├── sample_versicolor.jpg  # Sample test flower image
│       └── sample_virginica.jpg   # Sample test flower image
│
├── frontend/
│   ├── index.html                 # HTML shell with Google Fonts Inter
│   ├── package.json               # Node dependencies (React 18, Vite, Tailwind)
│   ├── vite.config.js             # Vite configuration
│   ├── tailwind.config.js         # Theme design tokens
│   ├── postcss.config.js
│   └── src/
│       ├── main.jsx               # React entry point with BrowserRouter
│       ├── App.jsx                # Layout & page routing
│       ├── api.js                 # Axios API service client
│       ├── index.css              # Custom styling & animations
│       ├── components/
│       │   ├── Navbar.jsx         # Navigation bar with active link indicator
│       │   ├── ChartCard.jsx      # Base64 image chart card with skeleton loader
│       │   ├── ClassBadge.jsx     # Dynamic species badge with color accents
│       │   └── MetricsTable.jsx   # Styled Sklearn classification report parser
│       └── pages/
│           ├── Home.jsx           # Measurement form, image upload, test set evaluator
│           ├── EDA.jsx            # Correlation heatmaps, pairplots, violin & box plots
│           ├── PCA.jsx            # 2D & 3D PCA scatter, Scree plot & component loadings
│           └── Results.jsx        # Model report, confusion matrix, loss/acc curves
│
├── .gitignore
└── README.md
```

---

## 🧠 Neural Network Architecture (`IrisNet`)

```
Layer                   Input Shape    Output Shape   Activation / Regularization
─────────────────────────────────────────────────────────────────────────────────
Input Layer             (N, 4)         (N, 4)         StandardScaler normalized
Linear 1                (N, 4)         (N, 64)        BatchNorm1d + ReLU + Dropout(0.3)
Linear 2                (N, 64)        (N, 32)        BatchNorm1d + ReLU + Dropout(0.2)
Linear 3                (N, 32)        (N, 16)        ReLU
Output Linear           (N, 16)        (N, 3)         CrossEntropyLoss / Softmax
```

### Training Configuration
- **Dataset Split**: 70% Train, 15% Validation, 15% Test (Stratified)
- **Optimizer**: Adam ($\text{lr} = 0.001$, $\text{weight\_decay} = 1\times 10^{-4}$)
- **Loss Function**: Cross-Entropy Loss
- **Learning Rate Scheduler**: `ReduceLROnPlateau` (patience = 10, factor = 0.5)
- **Early Stopping**: Patience = 20 epochs monitoring validation loss
- **Results**: Achieved **95.65% Test Accuracy** with early stopping at epoch 77.

---

## 🚀 Quickstart Guide

### Prerequisites
- Python 3.10+ (or py launcher)
- Node.js 18+ and npm
- [Git LFS](https://git-lfs.com/) (`git lfs install`)

### Clone with Git LFS
```bash
git clone https://github.com/otakushrey/Iris-Flower-Classification.git
cd Iris-Flower-Classification
git lfs pull
```

---

### 1. Backend Setup & Run

```bash
# Navigate to backend directory
cd backend

# Install Python dependencies
pip install -r requirements.txt

# (Optional) Retrain the neural network
python model/train.py

# Start the Flask REST API (runs on http://localhost:5000)
python app.py
```

### 2. Frontend Setup & Run

```bash
# In a new terminal, navigate to frontend directory
cd frontend

# Install npm packages
npm install

# Start Vite development server (runs on http://localhost:3000)
npm run dev
```

Open your browser at `http://localhost:3000` to interact with the application.

---

## ☁️ Online Cloud Deployment Guide

The project is fully pre-configured for instant zero-configuration deployment on **Render**, **Railway**, **Hugging Face Spaces**, or **Vercel**:

### 🌟 Option 1: Render.com (Recommended — 100% Free Full-Stack)
Render serves both the built React UI and Flask PyTorch backend in a single free web service.

1. Go to [dashboard.render.com](https://dashboard.render.com/) and sign in with GitHub.
2. Click **New +** → **Web Service**.
3. Select your repository: `otakushrey/Iris-Flower-Classification`.
4. Configure settings:
   - **Environment**: `Python 3`
   - **Build Command**:
     ```bash
     cd frontend && npm install && npm run build && cd ../backend && pip install torch torchvision --index-url https://download.pytorch.org/whl/cpu && pip install -r requirements.txt
     ```
   - **Start Command**:
     ```bash
     gunicorn --chdir backend app:app --bind 0.0.0.0:$PORT --workers 2 --timeout 120
     ```
5. Click **Deploy Web Service**! Render will give you a live URL (e.g. `https://iris-flower-classification.onrender.com`).

---

### 🚂 Option 2: Railway.app (1-Click Deployment)
1. Go to [railway.app](https://railway.app/) and sign in with GitHub.
2. Click **New Project** → **Deploy from GitHub repo**.
3. Select `otakushrey/Iris-Flower-Classification`.
4. Railway will automatically detect the `Procfile` and `Dockerfile` and deploy the full-stack container.
5. In project settings, click **Generate Domain** to get your public live URL.

---

### 🤗 Option 3: Hugging Face Spaces (Docker Free Cloud ML)
1. Go to [huggingface.co/spaces](https://huggingface.co/spaces) and click **Create new Space**.
2. Space SDK: Select **Docker** (Blank).
3. Connect or push your GitHub repository:
   ```bash
   git remote add space https://huggingface.co/spaces/YOUR_USERNAME/iris-flower-classifier
   git push space main
   ```
4. Hugging Face builds the included multi-stage `Dockerfile` and runs your app publicly with zero maintenance!

---

### ⚡ Option 4: Split Hosting (Frontend on Vercel + Backend on Render)
- **Backend**: Deploy `/backend` on Render as Web Service (`https://your-api.onrender.com`).
- **Frontend**: Deploy `/frontend` on [Vercel](https://vercel.com):
  - Framework Preset: `Vite`
  - Root Directory: `frontend`
  - Environment Variable: `VITE_API_URL=https://your-api.onrender.com`

---

## 🌐 API Reference

| Endpoint | Method | Parameters / Body | Description |
|---|---|---|---|
| `/api/health` | `GET` | None | Health check & model status |
| `/api/eda` | `GET` | None | Returns EDA summary stats & base64 charts (heatmap, pairplot, distributions, boxplots) |
| `/api/pca` | `GET` | None | Returns PCA 2D/3D scatter plots, Scree plot, component loadings & explained variance ratios |
| `/api/model-report` | `GET` | None | Model performance metrics, classification report, confusion matrix, loss & accuracy curves |
| `/api/predict` | `POST` | `{"sepal_length": 5.1, "sepal_width": 3.5, "petal_length": 1.4, "petal_width": 0.2}` | Predicts flower species and confidence percentages |
| `/api/predict-image` | `POST` | `FormData` with `file` OR JSON `{ "image": "<base64>" }` | Classifies an uploaded flower image and returns predicted species & extracted features |
| `/api/evaluate-testset` | `POST` | `FormData` with `.csv` file OR JSON `{ "samples": [...] }` | Evaluates neural network on uploaded test set and generates live classification report & confusion matrix |
| `/api/sample-testset` | `GET` | None | Returns 30 balanced benchmark samples for instant 1-click evaluation |

---

## 📊 Features & Visualizations

1. **Exploratory Data Analysis (EDA)**
   - Correlation Heatmap with annotated Pearson coefficients
   - Seaborn Pairplot with species-colored distributions
   - 2x2 Violin plots showing feature density across classes
   - 2x2 Box plots capturing quartiles and outliers
2. **Principal Component Analysis (PCA)**
   - 2D PCA projection scatter with explained variance ratios
   - 3D PCA projection visualization
   - Scree Plot with individual and cumulative variance explained
   - PCA Loadings Heatmap highlighting feature importance
3. **Model Evaluation & Classification Reports**
   - Confusion Matrix heatmap with exact predictions vs actuals
   - Learning curves: Training & Validation Loss across epochs
   - Accuracy curves: Training & Validation Accuracy across epochs
   - Interactive Sklearn Classification Report (Precision, Recall, F1-Score, Support)
4. **Flexible Prediction Console**
   - **Form Mode**: Sliders and inputs with 1-click presets (`Setosa`, `Versicolor`, `Virginica`)
   - **Image Mode**: Drag-and-drop flower photo classification
   - **Test Set Mode**: Upload a CSV file or run against a 30-sample benchmark set

---

## 👤 Author

- **GitHub**: [@otakushrey](https://github.com/otakushrey)
- **Repository**: [Iris-Flower-Classification](https://github.com/otakushrey/Iris-Flower-Classification)
- **License**: MIT
