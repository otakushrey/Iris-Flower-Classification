import matplotlib
matplotlib.use('Agg')

import os
import sys
import numpy as np
import joblib
import torch
import torch.nn as nn
from torch.utils.data import DataLoader, TensorDataset
from sklearn.datasets import load_iris
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
from sklearn.metrics import accuracy_score, classification_report, confusion_matrix

# Add backend/ to sys.path so we can import model/ and utils/
BACKEND_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if BACKEND_DIR not in sys.path:
    sys.path.insert(0, BACKEND_DIR)

from model.nn_model import IrisNet

# ------------------------------------------------------------------
# Paths
# ------------------------------------------------------------------
MODEL_DIR = os.path.join(BACKEND_DIR, 'model')
SCALER_PATH = os.path.join(MODEL_DIR, 'scaler.joblib')
TEST_DATA_PATH = os.path.join(MODEL_DIR, 'test_data.joblib')
HISTORY_PATH = os.path.join(MODEL_DIR, 'training_history.joblib')
CM_PATH = os.path.join(MODEL_DIR, 'confusion_matrix.joblib')
MODEL_PATH = os.path.join(MODEL_DIR, 'iris_nn.pth')

CLASS_NAMES = ['setosa', 'versicolor', 'virginica']

# ------------------------------------------------------------------
# 1. Load & split data
# ------------------------------------------------------------------
print("Loading Iris dataset...")
iris = load_iris()
X, y = iris.data.astype(np.float32), iris.target

# 70 / 15 / 15 stratified split
X_train, X_temp, y_train, y_temp = train_test_split(
    X, y, test_size=0.30, random_state=42, stratify=y
)
X_val, X_test, y_val, y_test = train_test_split(
    X_temp, y_temp, test_size=0.50, random_state=42, stratify=y_temp
)

print(f"Train: {len(X_train)}, Val: {len(X_val)}, Test: {len(X_test)}")

# ------------------------------------------------------------------
# 2. Scale
# ------------------------------------------------------------------
scaler = StandardScaler()
X_train = scaler.fit_transform(X_train).astype(np.float32)
X_val = scaler.transform(X_val).astype(np.float32)
X_test = scaler.transform(X_test).astype(np.float32)

joblib.dump(scaler, SCALER_PATH)
print(f"Scaler saved to {SCALER_PATH}")

joblib.dump({'X_test': X_test, 'y_test': y_test}, TEST_DATA_PATH)
print(f"Test data saved to {TEST_DATA_PATH}")

# ------------------------------------------------------------------
# 3. DataLoaders
# ------------------------------------------------------------------
def make_loader(X, y, batch_size=32, shuffle=False):
    tx = torch.from_numpy(X)
    ty = torch.from_numpy(y).long()
    ds = TensorDataset(tx, ty)
    return DataLoader(ds, batch_size=batch_size, shuffle=shuffle)


train_loader = make_loader(X_train, y_train, batch_size=32, shuffle=True)
val_loader = make_loader(X_val, y_val)
test_loader = make_loader(X_test, y_test)

# ------------------------------------------------------------------
# 4. Model, optimizer, scheduler
# ------------------------------------------------------------------
device = torch.device('cpu')
model = IrisNet().to(device)

criterion = nn.CrossEntropyLoss()
optimizer = torch.optim.Adam(model.parameters(), lr=0.001, weight_decay=1e-4)
scheduler = torch.optim.lr_scheduler.ReduceLROnPlateau(
    optimizer, mode='min', patience=10, factor=0.5
)

# ------------------------------------------------------------------
# 5. Training loop with early stopping
# ------------------------------------------------------------------
MAX_EPOCHS = 300
ES_PATIENCE = 20

history = {'train_loss': [], 'val_loss': [], 'train_acc': [], 'val_acc': []}
best_val_loss = float('inf')
best_model_state = None
es_counter = 0


def evaluate(loader):
    model.eval()
    total_loss, correct, total = 0.0, 0, 0
    with torch.no_grad():
        for Xb, yb in loader:
            Xb, yb = Xb.to(device), yb.to(device)
            logits = model(Xb)
            loss = criterion(logits, yb)
            total_loss += loss.item() * len(yb)
            preds = logits.argmax(dim=1)
            correct += (preds == yb).sum().item()
            total += len(yb)
    return total_loss / total, correct / total


print("\nStarting training...")
for epoch in range(1, MAX_EPOCHS + 1):
    model.train()
    train_loss_sum, train_correct, train_total = 0.0, 0, 0

    for Xb, yb in train_loader:
        Xb, yb = Xb.to(device), yb.to(device)
        optimizer.zero_grad()
        logits = model(Xb)
        loss = criterion(logits, yb)
        loss.backward()
        optimizer.step()

        train_loss_sum += loss.item() * len(yb)
        preds = logits.argmax(dim=1)
        train_correct += (preds == yb).sum().item()
        train_total += len(yb)

    train_loss = train_loss_sum / train_total
    train_acc = train_correct / train_total
    val_loss, val_acc = evaluate(val_loader)

    history['train_loss'].append(train_loss)
    history['val_loss'].append(val_loss)
    history['train_acc'].append(train_acc)
    history['val_acc'].append(val_acc)

    scheduler.step(val_loss)

    if val_loss < best_val_loss:
        best_val_loss = val_loss
        best_model_state = {k: v.clone() for k, v in model.state_dict().items()}
        es_counter = 0
    else:
        es_counter += 1

    if epoch % 20 == 0 or epoch == 1:
        print(f"Epoch {epoch:3d} | train_loss={train_loss:.4f} train_acc={train_acc:.4f} "
              f"| val_loss={val_loss:.4f} val_acc={val_acc:.4f}")

    if es_counter >= ES_PATIENCE:
        print(f"\nEarly stopping at epoch {epoch} (no improvement for {ES_PATIENCE} epochs)")
        break

# ------------------------------------------------------------------
# 6. Restore best weights & evaluate on test set
# ------------------------------------------------------------------
if best_model_state is not None:
    model.load_state_dict(best_model_state)

torch.save(model.state_dict(), MODEL_PATH)
print(f"\nModel weights saved to {MODEL_PATH}")

# Test evaluation
model.eval()
all_preds, all_true = [], []
with torch.no_grad():
    for Xb, yb in test_loader:
        logits = model(Xb.to(device))
        preds = logits.argmax(dim=1).cpu().numpy()
        all_preds.extend(preds)
        all_true.extend(yb.numpy())

test_acc = accuracy_score(all_true, all_preds)
report = classification_report(all_true, all_preds, target_names=CLASS_NAMES)
cm = confusion_matrix(all_true, all_preds).tolist()

print(f"\nTest Accuracy: {test_acc * 100:.2f}%")
print("\nClassification Report:")
print(report)

# ------------------------------------------------------------------
# 7. Save artifacts
# ------------------------------------------------------------------
joblib.dump(history, HISTORY_PATH)
print(f"Training history saved to {HISTORY_PATH}")

joblib.dump({'confusion_matrix': cm, 'class_names': CLASS_NAMES}, CM_PATH)
print(f"Confusion matrix saved to {CM_PATH}")

print("\nTraining complete!")
