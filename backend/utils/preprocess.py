import os
import joblib


FEATURES = ["sepal_length", "sepal_width", "petal_length", "petal_width"]
FEATURE_RANGE = (0.1, 30.0)

SCALER_PATH = os.path.join(
    os.path.dirname(os.path.dirname(os.path.abspath(__file__))),
    "model", "scaler.joblib"
)


def validate_features(data: dict):
    """
    Validate that the four iris features are present and numeric within range.

    Parameters
    ----------
    data : dict
        Request body containing the four feature keys.

    Returns
    -------
    (list[float], str | None)
        Tuple of (feature_values, error_message).
        error_message is None when validation passes.
    """
    features = []
    for key in FEATURES:
        if key not in data:
            return [], f"Missing required field: '{key}'"
        try:
            value = float(data[key])
        except (TypeError, ValueError):
            return [], f"Field '{key}' must be a numeric value"
        lo, hi = FEATURE_RANGE
        if not (lo <= value <= hi):
            return [], (
                f"Field '{key}' value {value} is out of range "
                f"[{lo}, {hi}]"
            )
        features.append(value)
    return features, None


def load_scaler():
    """Load the saved StandardScaler from disk."""
    if not os.path.exists(SCALER_PATH):
        raise FileNotFoundError(
            f"Scaler not found at {SCALER_PATH}. "
            "Please run model/train.py first."
        )
    return joblib.load(SCALER_PATH)
