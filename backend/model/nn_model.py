import torch
import torch.nn as nn
import torch.nn.functional as F


class IrisNet(nn.Module):
    """Neural network for Iris flower classification."""

    def __init__(self):
        super(IrisNet, self).__init__()

        # Hidden Layer 1: 4 → 64
        self.fc1 = nn.Linear(4, 64)
        self.bn1 = nn.BatchNorm1d(64)
        self.dropout1 = nn.Dropout(0.3)

        # Hidden Layer 2: 64 → 32
        self.fc2 = nn.Linear(64, 32)
        self.bn2 = nn.BatchNorm1d(32)
        self.dropout2 = nn.Dropout(0.2)

        # Hidden Layer 3: 32 → 16
        self.fc3 = nn.Linear(32, 16)

        # Output Layer: 16 → 3
        self.fc4 = nn.Linear(16, 3)

        self.relu = nn.ReLU()

    def forward(self, x):
        # Layer 1
        x = self.fc1(x)
        x = self.bn1(x)
        x = self.relu(x)
        x = self.dropout1(x)

        # Layer 2
        x = self.fc2(x)
        x = self.bn2(x)
        x = self.relu(x)
        x = self.dropout2(x)

        # Layer 3
        x = self.fc3(x)
        x = self.relu(x)

        # Output (raw logits)
        x = self.fc4(x)
        return x


def get_probabilities(logits):
    """Convert raw logits to probabilities using softmax."""
    return F.softmax(logits, dim=-1)
