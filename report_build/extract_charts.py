import sys, os, base64
sys.path.insert(0, r'D:\Iris Flower Classification\backend')

from model.analysis import IrisAnalysis
import joblib
import numpy as np
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
import seaborn as sns

charts_dir = r'D:\Iris Flower Classification\report_build\charts'
os.makedirs(charts_dir, exist_ok=True)

analysis = IrisAnalysis()

def save_b64(b64_str, filename):
    data = base64.b64decode(b64_str)
    filepath = os.path.join(charts_dir, filename)
    with open(filepath, 'wb') as f:
        f.write(data)
    print(f"Saved {filename} ({len(data)} bytes)")

# 1. EDA charts
save_b64(analysis.get_correlation_heatmap(), 'eda_heatmap.png')
save_b64(analysis.get_pairplot(), 'eda_pairplot.png')
save_b64(analysis.get_distribution_plots(), 'eda_distributions.png')
save_b64(analysis.get_boxplots(), 'eda_boxplots.png')

# 2. PCA charts
save_b64(analysis.get_pca_2d(), 'pca_2d.png')
save_b64(analysis.get_pca_3d(), 'pca_3d.png')
save_b64(analysis.get_scree_plot(), 'pca_scree.png')
save_b64(analysis.get_pca_loadings(), 'pca_loadings.png')

# 3. Model Report charts
PALETTE = ['#6366f1', '#ec4899', '#10b981']
CLASS_NAMES = ['setosa', 'versicolor', 'virginica']
history_path = r'D:\Iris Flower Classification\backend\model\training_history.joblib'
cm_path = r'D:\Iris Flower Classification\backend\model\confusion_matrix.joblib'

history = joblib.load(history_path)
cm_data = joblib.load(cm_path)

# Confusion Matrix
plt.style.use('dark_background')
fig, ax = plt.subplots(figsize=(6, 5))
fig.patch.set_facecolor('#1a1a2e')
ax.set_facecolor('#1a1a2e')
sns.heatmap(
    np.array(cm_data['confusion_matrix']), annot=True, fmt='d', cmap='Blues',
    xticklabels=cm_data['class_names'], yticklabels=cm_data['class_names'],
    ax=ax, linewidths=0.5, linecolor='#333',
    annot_kws={'color': 'white', 'fontsize': 13}
)
ax.set_xlabel('Predicted Label', color='white', fontsize=11)
ax.set_ylabel('Actual True Label', color='white', fontsize=11)
ax.set_title('Test Set Confusion Matrix (Accuracy: 95.65%)', color='white', fontsize=12)
plt.tight_layout()
fig.savefig(os.path.join(charts_dir, 'model_confusion_matrix.png'), dpi=200, facecolor='#1a1a2e')
plt.close(fig)
print("Saved model_confusion_matrix.png")

# Loss Curve
fig, ax = plt.subplots(figsize=(7, 4))
fig.patch.set_facecolor('#1a1a2e')
ax.set_facecolor('#16213e')
epochs = range(1, len(history['train_loss']) + 1)
ax.plot(epochs, history['train_loss'], color=PALETTE[0], label='Training Loss', linewidth=2)
ax.plot(epochs, history['val_loss'], color=PALETTE[1], label='Validation Loss', linewidth=2, linestyle='--')
ax.set_xlabel('Training Epoch', color='white')
ax.set_ylabel('Cross-Entropy Loss', color='white')
ax.set_title('Neural Network Training & Validation Loss', color='white', fontsize=12)
ax.legend(facecolor='#1a1a2e', edgecolor='#444', labelcolor='white')
plt.tight_layout()
fig.savefig(os.path.join(charts_dir, 'model_loss_curve.png'), dpi=200, facecolor='#1a1a2e')
plt.close(fig)
print("Saved model_loss_curve.png")

# Accuracy Curve
fig, ax = plt.subplots(figsize=(7, 4))
fig.patch.set_facecolor('#1a1a2e')
ax.set_facecolor('#16213e')
ax.plot(epochs, [a * 100 for a in history['train_acc']], color=PALETTE[0], label='Training Accuracy', linewidth=2)
ax.plot(epochs, [a * 100 for a in history['val_acc']], color=PALETTE[2], label='Validation Accuracy', linewidth=2, linestyle='--')
ax.set_xlabel('Training Epoch', color='white')
ax.set_ylabel('Accuracy (%)', color='white')
ax.set_title('Neural Network Training & Validation Accuracy', color='white', fontsize=12)
ax.legend(facecolor='#1a1a2e', edgecolor='#444', labelcolor='white')
plt.tight_layout()
fig.savefig(os.path.join(charts_dir, 'model_accuracy_curve.png'), dpi=200, facecolor='#1a1a2e')
plt.close(fig)
print("Saved model_accuracy_curve.png")

print("All charts extracted successfully!")
